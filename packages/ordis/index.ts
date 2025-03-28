import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  GuildMember,
  MessageReaction,
  type PartialMessageReaction,
  User,
  type PartialUser,
} from "discord.js";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { PluginManager } from "ordis/plugins";

const PLUGIN_FILE_EXTENSIONS = ['.ts', '.js'];
const PLUGINS_DIRECTORY = '/plugins';

// Load environment variables
config();
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("Error: Missing DISCORD_TOKEN. Please check your .env file.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction],
});

const pluginManager = new PluginManager(client);

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  try {
    await pluginManager.loadAllPlugins();
    pluginManager.startWatching();
  } catch (error) {
    console.error("Failed to initialize plugins: ", error);
  }
});

await client.login(token);

/*
export async function loadPlugins(client: Client) {
  const pluginsDir = path.join(import.meta.dir, PLUGINS_DIRECTORY);
  if (!fs.promises.exists(pluginsDir)) {
    throw new Error(`Plugins directory not found: ${pluginsDir}`);
  }

  try {
    const files = await fs.promises.readdir(pluginsDir);

    for (const file of files) {
      if (PLUGIN_FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
        try {
          const modulePath = path.join(pluginsDir, file);
          const module = await import(modulePath);
          // Get the plugin class that implements the Plugin interface
          const PluginClass = module.default || Object.values(module)[0];
          if (PluginClass?.prototype?.setup) {
            const plugin = new PluginClass() as IPlugin;
            plugin.setup(client);
            console.log(`✓ Loaded plugin: ${file}`);
          } else {
            console.warn(`⚠ ${file} doesn't implement the Plugin interface`);
          }
        } catch (error: unknown) {
          console.error(`✗ Error loading plugin ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('✗ Error reading plugins directory:', error);
  }
  }*/
