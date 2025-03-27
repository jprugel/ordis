import { IPlugin } from "common";
import {
  Client,
  Events,
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from "discord.js";

export default class ReactionRolesPlugin implements IPlugin {
  setup(client: Client): void {
    async function handleReaction(
      reaction: MessageReaction | PartialMessageReaction,
      user: User | PartialUser,
      addRole: boolean,
    ) {
      try {
        if (reaction.partial) await reaction.fetch();
        // I need to check if database contains that message_id
        const response = await fetch(
          `api:33252/reaction-roles/${reaction.message.id}`,
        );
        if (response.ok) {
          const rawdata: any = await response.json();
          const data = rawdata.map((item: any) => ({
            emojiId: item.emojiid,
            roleId: item.roleid,
          }));

          const emojiId = reaction.emoji.id;
          if (!emojiId) return;
          const filteredData = data.find(
            (item: any) => item.emojiId === emojiId,
          );
          if (!filteredData) {
            console.log(
              `Failed to find an emoji associated with: ${reaction.message.id}`,
            );
            return;
          }
          const roleId = filteredData.roleId;
          const guild = reaction.message.guild;
          if (!guild) return console.error("Guild not found.");
          const member = await guild.members.fetch(user.id);
          if (!member) return console.error("Member not found.");
          const role = guild.roles.cache.find((r) => r.id === roleId);
          if (!role) {
            console.error(`Role "${role}" not found.`);
            return;
          }
          if (addRole) {
            await member.roles.add(role);
            console.log(`Added role "${role.name}" to ${user.tag}`);
          } else {
            await member.roles.remove(role);
            console.log(`Removed role "${role.name}" from ${user.tag}`);
          }
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
  }
}
