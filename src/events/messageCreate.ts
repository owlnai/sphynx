import type { Message } from "discord.js"
import { listDomains } from "stop-discord-phishing"
import { checkString as checkMessage, regexes } from "discord-osiris"
import { Guild } from "../db"
import * as handlers from "../handlers"

export default async (message: Message) => {
  if (message.author.bot) return
  const domains = await listDomains()

  const ocurrence = await checkMessage(message.content, [
    ...regexes,
    ...domains,
  ])
  if (!ocurrence) return

  const { shouldKick, shouldDelete, logChannelID, roleID } =
    await Guild.findOne({
      where: { guildID: message.guild.id },
    })

  if (shouldDelete) {
    await handlers.deleteMessage(message)
  }

  if (shouldKick) {
    await handlers.kickUser(message.member)
  }

  if (logChannelID) {
    await handlers.logChannel(message, logChannelID)
  }

  if (roleID) {
    await handlers.addRole(message, roleID)
  }
}
