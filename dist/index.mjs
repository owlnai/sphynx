import { PermissionsBitField, InteractionType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ChannelType, Client, GatewayIntentBits } from 'discord.js';
import { Sequelize, DataTypes, Model } from 'sequelize';
import { listDomains } from 'stop-discord-phishing';
import { checkString, regexes } from 'discord-osiris';
import { loadConfig } from 'c12';

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite"
});
class Guild extends Model {
}
Guild.init({
  guildID: {
    type: new DataTypes.STRING(18),
    primaryKey: true
  },
  shouldKick: DataTypes.BOOLEAN,
  shouldDelete: DataTypes.BOOLEAN,
  logChannelID: {
    type: new DataTypes.STRING(18)
  },
  roleID: {
    type: new DataTypes.STRING(18)
  }
}, {
  sequelize
});

const ReadyEvent = async (client) => {
  if (!client.user) {
    throw new Error("Couldn't login for some reason!");
  }
  console.log(`Logged in as ${client.user.tag} and patrolling ${client.guilds.cache.size} servers.`);
  Guild.sync();
  for (const guild of client.guilds.cache.values()) {
    Guild.findOrCreate({ where: { guildID: guild.id } });
  }
};

async function deleteMessage(message) {
  if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    await message.delete();
  }
}
async function kickUser(member) {
  if (member.kickable) {
    await member.kick();
  }
}
async function logChannel(message, channelID) {
  const channel = message.guild.channels.cache.get(channelID);
  await channel.send(`**${message.author.tag}** (<@${message.author.id}>) triggered SPHINX rules:
\`\`\`${message.content}\`\`\``);
}
async function addRole(message, roleID) {
  const role = message.guild.roles.cache.get(roleID);
  if (message.member.manageable && role.editable) {
    message.member.roles.add(role);
  }
}

const MessageCreateEvent = async (message) => {
  if (message.author.bot)
    return;
  const domains = await listDomains();
  console.log("mensaje", message);
  const ocurrence = await checkString(message.content, [...regexes, ...domains]);
  console.log("ocurrencia: ", ocurrence);
  if (!ocurrence)
    return;
  const {
    shouldKick,
    shouldDelete,
    logChannelID,
    roleID
  } = await Guild.findOne({
    where: { guildID: message.guild.id }
  });
  console.table([shouldKick, shouldDelete, logChannelID, roleID]);
  if (shouldDelete) {
    await deleteMessage(message);
  }
  if (shouldKick) {
    await kickUser(message.member);
  }
  if (logChannelID) {
    await logChannel(message, logChannelID);
  }
  if (roleID) {
    await addRole(message, roleID);
  }
};

const InteractionCreateEvent = async (interaction) => {
  if (interaction.type == InteractionType.ApplicationCommand) {
    const { commandName, memberPermissions } = interaction;
    if (commandName == "ping") {
      await interaction.reply("Pong!");
    } else if (commandName == "config") {
      if (!memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) {
        await interaction.reply("Error. You can't manage this server \u274C");
        return;
      }
      const currentConfig = await Guild.findOne({
        where: { guildID: interaction.guild.id }
      });
      const modal = new ModalBuilder({
        custom_id: "sphynxConfig",
        title: "Server Configuration"
      });
      modal.setComponents([
        new ActionRowBuilder().setComponents([
          new TextInputBuilder().setCustomId("sphynxShouldDelete").setLabel("Should the bot delete the message? (Y/N)").setPlaceholder("Y/N").setMaxLength(1).setValue(currentConfig?.shouldDelete ? "Y" : "N").setStyle(TextInputStyle.Short)
        ]),
        new ActionRowBuilder().setComponents([
          new TextInputBuilder().setCustomId("sphynxShouldKick").setLabel("Should the bot kick the author? (Y/N)").setPlaceholder("Y/N").setMaxLength(1).setValue(currentConfig?.shouldKick ? "Y" : "N").setStyle(TextInputStyle.Short)
        ]),
        new ActionRowBuilder().setComponents([
          new TextInputBuilder().setCustomId("sphynxLogChannelID").setLabel("What channel should it log to? (ID)").setPlaceholder("Channel ID").setMaxLength(18).setValue(currentConfig?.logChannelID ? currentConfig.logChannelID : "0").setStyle(TextInputStyle.Short)
        ]),
        new ActionRowBuilder().setComponents([
          new TextInputBuilder().setCustomId("sphynxRoleID").setLabel("What role should it add? (ID)").setPlaceholder("Role ID").setMaxLength(18).setValue(currentConfig?.roleID ? currentConfig.roleID : "0").setStyle(TextInputStyle.Short)
        ])
      ]);
      await interaction.showModal(modal);
    }
  } else if (interaction.type == InteractionType.ModalSubmit) {
    const {
      customId,
      fields: { fields: data }
    } = interaction;
    if (customId == "sphynxConfig") {
      const newConfig = {
        shouldKick: false,
        shouldDelete: false,
        logChannelID: "",
        roleID: ""
      };
      for (const [key, value] of data) {
        const actualValue = value.value.toLowerCase();
        if (!actualValue || actualValue === "0")
          continue;
        if (key == "sphynxShouldKick") {
          if (actualValue == "y") {
            newConfig.shouldKick = true;
          }
        } else if (key == "sphynxShouldDelete") {
          if (actualValue == "y") {
            newConfig.shouldDelete = true;
          }
        } else if (key == "sphynxLogChannelID") {
          const { type } = await interaction.guild.channels.fetch(actualValue);
          if (type == ChannelType.GuildText) {
            newConfig.logChannelID = actualValue;
          }
        } else if (key == "sphynxRoleID") {
          const { id } = await interaction.guild.roles.fetch(actualValue);
          newConfig.roleID = id;
        }
      }
      console.log(newConfig);
      const affectedRows = await Guild.update(newConfig, {
        where: { guildID: interaction.guild.id }
      });
      if (affectedRows) {
        return interaction.reply({ content: "Config applied \u2705", ephemeral: true });
      }
      return interaction.reply({ content: "Couldn't apply config \u274C", ephemeral: true });
    }
  }
};

const { config } = await loadConfig({});
if (!config.token) {
  throw new Error("Please, set a token following the SPHYNX config");
}
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});
bot.once("ready", (...args) => ReadyEvent(...args));
bot.on("messageCreate", (...args) => MessageCreateEvent(...args));
bot.on("interactionCreate", (...args) => InteractionCreateEvent(...args));
bot.login(config.token);
