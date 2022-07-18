import {
  GuildMember,
  Message,
  PermissionsBitField,
  Role,
  Snowflake,
  TextChannel,
} from "discord.js"

/**
 * Deletes a candidate message.
 */
export async function deleteMessage(message: Message) {
  if (
    message.guild.members.me.permissions.has(
      PermissionsBitField.Flags.ManageMessages
    )
  ) {
    await message.delete()
  }
}

/**
 * Kicks the compromised account from the server
 */
export async function kickUser(member: GuildMember) {
  if (member.kickable) {
    await member.kick()
  }
}

/**
 * Logs the candidate message to a certain text channel
 */
export async function logChannel(message: Message, channelID: Snowflake) {
  const channel = message.guild.channels.cache.get(channelID) as TextChannel
  await channel.send(
    `**${message.author.tag}** (<@${message.author.id}>) triggered SPHINX rules:\n\`\`\`${message.content}\`\`\``
  )
}

/**
 * Adds a role to the compromised account
 */
export async function addRole(message: Message, roleID: Snowflake) {
  const role: Role = message.guild.roles.cache.get(roleID)
  if (message.member.manageable && role.editable) {
    message.member.roles.add(role)
  }
}
