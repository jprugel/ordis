import { Client, type ClientEvents, Events } from "discord.js";
import { watch, promises } from "fs";
import path, { join } from "path";

const PLUGIN_FILE_EXTENSIONS = [".ts", ".js"];
const PLUGINS_DIR = "/plugins";

// Plugin developers will implement this interface.
export interface IPlugin {
  version: string,
  name: string,

  setup(client: Client): Promise<void>;
}

class PluginInfo {
  instance: IPlugin;
  // Track listeners with proper Discord.js event types
  listeners: Array<{
    event: keyof ClientEvents;
    handler: (...args: any[]) => void;
  }>;

  constructor(instance: IPlugin) {
    this.instance = instance;
    this.listeners = [];
  }

  addListener(event: keyof ClientEvents, handler: (...args: any[]) => void) {
    this.listeners.push({ event, handler });
  }
}

export class PluginManager {
  private client: Client;
  private pluginDir: string;
  private plugins: Map<string, PluginInfo> = new Map();

  constructor(client: Client) {
    this.client = client;
    this.pluginDir = path.join(import.meta.dir, PLUGINS_DIR);
  }

  private createEnhancedClient(pluginInfo: PluginInfo): Client {
    return new Proxy(this.client, {
      get: (target: Client, prop: string | symbol) => {
        if (prop === 'on') {
          return <K extends keyof ClientEvents>(
            event: K,
            handler: (...args: ClientEvents[K]) => void
          ) => {
            pluginInfo.addListener(event, handler);
            return target.on(event, handler);
          };
        }
        return Reflect.get(target, prop);
      }
    });
  }

  async unloadPlugin(filename: string) {
    const pluginInfo = this.plugins.get(filename);
    if (pluginInfo) {
      // Clean up all registered listeners with proper typing
      for (const { event, handler } of pluginInfo.listeners) {
        this.client.off(event, handler);
      }
      this.plugins.delete(filename);
      console.log(`✓ Unloaded plugin: ${filename}`);
    }
  }

  async loadPlugin(fileName: string) {
    const modulePath = path.join(this.pluginDir, fileName);
    const modulePathCacheBusted = `${modulePath}?update=${Date.now()}`;

    try {
      await this.unloadPlugin(fileName); // Clean up existing instance

      const module = await import(modulePathCacheBusted);
      const PluginClass = module.default || Object.values(module)[0];

      if (PluginClass?.prototype?.setup) {
        const plugin = new PluginClass() as IPlugin;
        const pluginInfo = new PluginInfo(plugin);

        // Store plugin info before setup to track listeners
        this.plugins.set(fileName, pluginInfo);

        // Use enhanced client that tracks listeners
        const enhancedClient = this.createEnhancedClient(pluginInfo);
        await plugin.setup(enhancedClient);

        console.log(`✓ Loaded plugin: ${fileName}`);
      } else {
        console.warn(`⚠ ${fileName} doesn't implement the Plugin interface`);
      }
    } catch (error: unknown) {
      console.error(`✗ Error loading plugin ${fileName}:`, error);
      // Clean up if setup failed
      await this.unloadPlugin(fileName);
    }
  }

  async loadAllPlugins() {
    if (!await promises.exists(this.pluginDir)) {
      throw new Error(`Plugins directory not found: ${this.pluginDir}`);
    }

    const files = await promises.readdir(this.pluginDir);

    for (const file of files) {
      if (PLUGIN_FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
        await this.loadPlugin(file);
      }
    }
  }

  startWatching() {
    if (process.env.NODE_ENV !== 'development') return;

    const watcher = watch(this.pluginDir, async (eventType, filename) => {
      if (!filename || !PLUGIN_FILE_EXTENSIONS.some(ext => filename.endsWith(ext))) return;

      if (eventType === 'change') {
        console.log(`🔄 Reloading plugin: ${filename}`);
        try {
          await this.loadPlugin(filename);
        } catch (error) {
          console.error(`Failed to reload plugin ${filename}:`, error);
        }
      }
    });

    process.on('SIGINT', () => {
      watcher.close();
      process.exit(0);
    });
  }
}
