import { Client, GatewayIntentBits } from "discord.js"
import ReadyEvent from "./events/ready"
import MessageCreateEvent from "./events/messageCreate"
import InteractionCreateEvent from "./events/interactionCreate"
import { loadConfig } from "c12"

const { config } = await loadConfig({})
if (!config.token) {
  throw new Error("Please, set a token following the SPHYNX config")
}

const bot: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

bot.once("ready", (...args) => ReadyEvent(...args))
bot.on("messageCreate", (...args) => MessageCreateEvent(...args))
bot.on("interactionCreate", (...args) => InteractionCreateEvent(...args))

bot.login(config.token)
