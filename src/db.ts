import {
  Sequelize,
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize"

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
})

export class Guild extends Model<
  InferAttributes<Guild>,
  InferCreationAttributes<Guild>
> {
  declare guildID: string
  declare shouldKick: boolean
  declare shouldDelete: boolean
  declare logChannelID: string
  declare roleID: string
}

Guild.init(
  {
    guildID: {
      type: new DataTypes.STRING(18), // current snowstamp length
      primaryKey: true,
    },
    shouldKick: DataTypes.BOOLEAN,
    shouldDelete: DataTypes.BOOLEAN,
    logChannelID: {
      type: new DataTypes.STRING(18),
    },
    roleID: {
      type: new DataTypes.STRING(18),
    },
  },
  {
    sequelize,
  }
)

export async function initServer(guildID: string) {
  try {
    await Guild.create({
      guildID,
    })
  } catch (exception) {
    // a server might re-add the bot, that's fine
    if (exception.name !== "SequelizeUniqueConstraintError") {
      throw new Error(exception)
    }
  }
}
