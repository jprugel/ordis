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

const TARGET_MESSAGE_ID = "1353129912587911168";
const ROLE_MAP = new Map<string, string>([["platinum", "Warframe"]]);

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

async function handleReaction(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  addRole: boolean,
) {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.id !== TARGET_MESSAGE_ID) return;

    const guild = reaction.message.guild;
    if (!guild) return console.error("Guild not found.");

    const member = await guild.members.fetch(user.id);
    if (!member) return console.error("Member not found.");

    const emojiName = reaction.emoji.name;
    if (!emojiName) return;

    const roleName = ROLE_MAP.get(emojiName);
    if (!roleName) return;

    const role = guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      console.error(`Role "${roleName}" not found.`);
      return;
    }

    if (addRole) {
      await member.roles.add(role);
      console.log(`Added role "${role.name}" to ${user.tag}`);
    } else {
      await member.roles.remove(role);
      console.log(`Removed role "${role.name}" from ${user.tag}`);
    }
  } catch (error) {
    console.error(`Error handling reaction:`, error);
  }
}

client.on(Events.MessageReactionAdd, (reaction, user) =>
  handleReaction(reaction, user, true),
);
client.on(Events.MessageReactionRemove, (reaction, user) =>
  handleReaction(reaction, user, false),
);

client.login(token);
