import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { config } from "dotenv";

// Load environment variables
config();

// Ensure the token exists before attempting to log in
const token = process.env.DISCORD_TOKEN;

// Define the role target message.
// This could be some target api.
const targetMessageId = "1353129912587911168";

// We can associate emoji names with role names
if (!token) {
  console.error("Error: Missing DISCORD_TOKEN. Please check your .env file.");
  process.exit(1); // Exit the process if the token is not found
}

// Create a new client instance with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction], // Enable partials for reactions and messages
});

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient: Client<true>) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handling reactions (partial reactions need to be fetched)
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.partial) {
    try {
      // If the reaction is partial, fetch the complete message and reaction
      await reaction.fetch();
    } catch (error) {
      console.error("Error fetching reaction:", error);
      return;
    }
  }

  if (reaction.message.id !== targetMessageId) {
    return; // Exit if the reaction is not on the target message
  }

  if (reaction.emoji.name === "platinum") {
    // Get the guild (server) and the member who reacted
    const guild = reaction.message.guild;
    if (!guild) return console.error("Guild not found.");

    const member = await guild.members.fetch(user.id);
    if (!member) return console.error("Member not found.");

    // Define the role name or ID you want to add
    const roleId = "1353019830273441913"; // Replace with your role's name or ID

    try {
      // Fetch the role by name (you can also use role ID if needed)
      const role = guild.roles.cache.find((role) => role.id === roleId);
      if (!role) {
        console.error(`Role "${roleId}" not found.`);
        return;
      }

      // Add the role to the member
      await member.roles.add(role);
      console.log(`Successfully added the "${role.name}" role to ${user.tag}`);
    } catch (error) {
      console.error("Error adding role:", error);
    }
  }

  console.log(
    `Emoji: ${reaction.emoji.name}, Total reactions: ${reaction.count}`,
  );
});

// Handling reactions removal and removing roles
client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (reaction.partial) {
    try {
      // If the reaction is partial, fetch the complete message and reaction
      await reaction.fetch();
    } catch (error) {
      console.error("Error fetching reaction:", error);
      return;
    }
  }

  if (reaction.message.id !== targetMessageId) {
    return; // Exit if the reaction is not on the target message
  }

  // Log the reaction removal and the user who removed it
  console.log(
    `Reaction removed by ${user.tag} from message: "${reaction.message.content}"`,
  );
  console.log(
    `Emoji: ${reaction.emoji.name}, Total reactions: ${reaction.count}`,
  );

  // Get the guild (server) and the member who removed the reaction
  const guild = reaction.message.guild;
  if (!guild) return console.error("Guild not found.");

  const member = await guild.members.fetch(user.id);
  if (!member) return console.error("Member not found.");

  // Define the role name or ID you want to remove
  const roleName = "Warframe"; // Replace with your role's name or ID

  try {
    // Fetch the role by name (you can also use role ID if needed)
    const role = guild.roles.cache.find((role) => role.name === roleName);
    if (!role) {
      console.error(`Role "${roleName}" not found.`);
      return;
    }

    // Remove the role from the member
    await member.roles.remove(role);
    console.log(`Successfully removed the "${roleName}" role from ${user.tag}`);
  } catch (error) {
    console.error("Error removing role:", error);
  }
});

// Log in to Discord with your bot token
client.login(token);
