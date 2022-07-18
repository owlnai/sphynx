import { REST } from "@discordjs/rest"
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord.js"
import { Routes } from "discord-api-types/v10"
import { loadConfig } from "c12"

const { config } = await loadConfig({})

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  {
    name: "ping",
    description: "Replies with pong!",
  },
  {
    name: "config",
    description: "Sets the server configuration",
  },
]

const rest = new REST({ version: "9" }).setToken(config.token)

try {
  await rest.put(Routes.applicationCommands(config.clientID), {
    body: commands,
  })
} catch (e) {
  throw new Error(e)
}
