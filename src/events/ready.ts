import type { Client } from "discord.js"
import { Guild } from "../db"

export default async (client: Client) => {
  if (!client.user) {
    throw new Error("Couldn't login for some reason!")
  }
  console.log(
    `Logged in as ${client.user.tag} and patrolling ${client.guilds.cache.size} servers.`
  )
  Guild.sync()
  // add servers to the database that were added while bot was down
  for (const guild of client.guilds.cache.values()) {
    Guild.findOrCreate({ where: { guildID: guild.id } })
  }
}
