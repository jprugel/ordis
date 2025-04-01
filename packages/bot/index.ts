import { loadPlugins, type IPlugin } from "common";
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
import { readdir } from "fs/promises";
import * as path from "path";

const PLUGIN_FILE_EXTENSIONS = [".ts", ".js"];
const PLUGINS_DIRECTORY = "../../plugins";

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

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  const plugins = await loadPlugins(path.join(import.meta.dir, "../plugins"));
  plugins.forEach((plugin) => plugin.init(client));
  /*const directory = path.join(import.meta.dir, "../plugins");
  const files = await readdir(directory);
  const fileDirectory = path.join(directory, `${files[0]}/index.ts`);
  const module = await import(fileDirectory);
  const PluginClass = module.default || Object.values(module)[0];
  if (PluginClass?.prototype?.init) {
    const plugin = new PluginClass() as IPlugin;
    plugin.init(client);
    console.log(`✓ Loaded plugin: ${plugin.name}`);
  } else {
    console.warn(`⚠ ${module} doesn't implement the Plugin interface`);
    }*/
});

await client.login(token);
