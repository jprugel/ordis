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
import type { IPlugin } from "common";

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

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

loadPlugins(client);

client.login(token);

export async function loadPlugins(client: Client) {
  const pluginsDir = path.join(__dirname, '/plugins');

  try {
    const files = fs.readdirSync(pluginsDir);

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        try {
          const modulePath = path.join(pluginsDir, file);
          const module = await import(modulePath);
          console.log('Module details for:', file);
                    console.log('Module exports:', Object.keys(module));
                    console.log('Module content:', {
                      default: module.default,
                      namedExports: Object.entries(module).filter(([key]) => key !== 'default'),
                      hasDefault: 'default' in module,
                      constructable: typeof module.default === 'function',
                      prototype: module.default?.prototype,
                    });
          // Get the plugin class that implements the Plugin interface
          const PluginClass = module.default || Object.values(module)[0];
          if (PluginClass?.prototype?.setup) {
            const plugin = new PluginClass() as IPlugin;
            plugin.setup(client);
            console.log(`✓ Loaded plugin: ${file}`);
          } else {
            console.warn(`⚠ ${file} doesn't implement the Plugin interface`);
          }
        } catch (error) {
          console.error(`✗ Error loading plugin ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('✗ Error reading plugins directory:', error);
  }
}
