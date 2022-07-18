import { initServer } from "../db"
import type { Guild } from "discord.js"

export default async (guild: Guild) => {
  await initServer(guild.id)
}
