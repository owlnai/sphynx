import {
  ActionRowBuilder,
  ChannelType,
  Interaction,
  InteractionType,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js"
import { ModalBuilder } from "discord.js"
import { Guild } from "../db"
export default async (interaction: Interaction) => {
  if (interaction.type == InteractionType.ApplicationCommand) {
    const { commandName, memberPermissions } = interaction

    if (commandName == "ping") {
      await interaction.reply("Pong!")
    } else if (commandName == "config") {
      if (!memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) {
        await interaction.reply("Error. You can't manage this server ❌")
        return
      }
      const currentConfig = await Guild.findOne({
        where: { guildID: interaction.guild.id },
      })

      const modal = new ModalBuilder({
        custom_id: "sphynxConfig",
        title: "Server Configuration",
      })

      modal.setComponents([
        new ActionRowBuilder().setComponents([
          new TextInputBuilder()
            .setCustomId("sphynxShouldDelete")
            .setLabel("Should the bot delete the message? (Y/N)")
            .setPlaceholder("Y/N")
            .setMaxLength(1)
            .setValue(currentConfig?.shouldDelete ? "Y" : "N")
            .setStyle(TextInputStyle.Short),
        ]) as ActionRowBuilder<TextInputBuilder>,
        new ActionRowBuilder().setComponents([
          new TextInputBuilder()
            .setCustomId("sphynxShouldKick")
            .setLabel("Should the bot kick the author? (Y/N)")
            .setPlaceholder("Y/N")
            .setMaxLength(1)
            .setValue(currentConfig?.shouldKick ? "Y" : "N")
            .setStyle(TextInputStyle.Short),
        ]) as ActionRowBuilder<TextInputBuilder>,
        new ActionRowBuilder().setComponents([
          new TextInputBuilder()
            .setCustomId("sphynxLogChannelID")
            .setLabel("What channel should it log to? (ID)")
            .setPlaceholder("Channel ID")
            .setMaxLength(18)
            .setValue(
              currentConfig?.logChannelID ? currentConfig.logChannelID : "0"
            )
            .setStyle(TextInputStyle.Short),
        ]) as ActionRowBuilder<TextInputBuilder>,
        new ActionRowBuilder().setComponents([
          new TextInputBuilder()
            .setCustomId("sphynxRoleID")
            .setLabel("What role should it add? (ID)")
            .setPlaceholder("Role ID")
            .setMaxLength(18)
            .setValue(currentConfig?.roleID ? currentConfig.roleID : "0")
            .setStyle(TextInputStyle.Short),
        ]) as ActionRowBuilder<TextInputBuilder>,
      ])

      await interaction.showModal(modal)
    }
  } else if (interaction.type == InteractionType.ModalSubmit) {
    const {
      customId,
      fields: { fields: data },
    } = interaction
    if (customId == "sphynxConfig") {
      const newConfig = {
        shouldKick: false,
        shouldDelete: false,
        logChannelID: "",
        roleID: "",
      }

      for (const [key, value] of data) {
        const actualValue = value.value.toLowerCase()
        if (!actualValue || actualValue === "0") continue
        if (key == "sphynxShouldKick") {
          if (actualValue == "y") {
            newConfig.shouldKick = true
          }
        } else if (key == "sphynxShouldDelete") {
          if (actualValue == "y") {
            newConfig.shouldDelete = true
          }
        } else if (key == "sphynxLogChannelID") {
          const { type } = await interaction.guild.channels.fetch(actualValue)
          if (type == ChannelType.GuildText) {
            newConfig.logChannelID = actualValue
          }
        } else if (key == "sphynxRoleID") {
          const { id } = await interaction.guild.roles.fetch(actualValue)
          newConfig.roleID = id
        }
      }
      const affectedRows = await Guild.update(newConfig, {
        where: { guildID: interaction.guild.id },
      })

      if (affectedRows) {
        return interaction.reply({
          content: "Config applied ✅",
          ephemeral: true,
        })
      }
      return interaction.reply({
        content: "Couldn't apply config ❌",
        ephemeral: true,
      })
    }
  }
}
