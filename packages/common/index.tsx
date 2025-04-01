import { Client } from "discord.js";
import type { ReactNode } from "react";
import path from "path";
import fs from "fs/promises";

export interface IPluginUiData {
  name: string;
  metadata?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface IPlugin {
  name: string;
  version: string;
  id: string;

  init(client: Client): Promise<void>;
  getUiData?(): IPluginUiData;
  renderUi?(data: IPluginUiData): ReactNode;
}

export abstract class AbstractPlugin implements IPlugin {
  abstract name: string;
  abstract version: string;
  abstract id: string;

  init(client: Client): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export async function loadPlugins(pluginDir: string): Promise<IPlugin[]> {
  const files = await fs.readdir(pluginDir);
  const fileDirectory = path.join(pluginDir, `${files[0]}/index.tsx`);
  const module = await import(fileDirectory);
  const PluginClass = module.default || Object.values(module)[0];
  const plugins = [];
  if (PluginClass?.prototype?.init) {
    const plugin = new PluginClass() as IPlugin;
    plugins.push(plugin);
    console.log(`✓ Loaded plugin: ${plugin.name}`);
  } else {
    console.warn(`⚠ ${module} doesn't implement the Plugin interface`);
  }
  return plugins;
}
