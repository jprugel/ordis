import { Client } from "discord.js";

export interface IPlugin {
  setup(client: Client): void;
}
