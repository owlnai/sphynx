# 𓂀 SPHINX
SPHINX is a Discord bot that checks every message for possible phishing links (e.g fake Nitro).

It uses a frequently updated [JSON list](https://github.com/nikolaischunk/discord-phishing-links) with +14k domains, as well as its own module (`discord-osiris`) that features RegExp patterns to catch even more links.

## Features
- Built with Typescript and Discord.js
- SQlite database for easy migration
- Per-guild configuration. 

## How it works
The bot scans every message sent. If it finds an ocurrence, it will check the current configuration of the server, and depending on the config it can:
- Kick out the user
- Delete the message
- Log the message to a moderation channel
- Add a custom role (if you want to "ground" the user without kicking them)

## Installation
- Clone the project
- Install the Node.js dependencies. Sticking to LTS is recommended.
- Create a configuration file. `config.ts`, `config.json` and `config.js` are supported
```js
export default {
  token: "foo",
  clientID: "bar",
}
```
- Deploy the slash commands with `npm run deploy`. You might need to do this every time you add a new command
- Run `npm start`. This is the command that actually starts the bot
- Enjoy!

## Development
SPHINX uses TypeScript and `discord-js` for the bot. Code is transpiled and built using `unbuild`. You might need to research about these tools prior to developing if you find any roadblocks.

## FAQ
### How do I update the data?
You shouldn't have to. SPHINX uses `stop-discord-phishing` which sends a request to a JSON list hosted on GitHub, cached for 30 minutes.

### I can't see the slash commands
This might happen for the following reasons:
- **Missing OAuth2 scope**. When inviting the bot to a Discord server, make sure it has the `applications.commands` scope. Take for example `https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&permissions=0&scope=bot%20applications.commands` where `{CLIENT_ID}` is your client ID.
- **Global command cache**. This only might happen if you edit the commands at [deploy-commands.js](deploy-commands.js). When you first submit the commands to Discord's API, it puts them under a cache that refreshes every hour, so it might take some time if you add more commands. If your bot works only in one server, you could change the `Routes.applicationCommands(clientID)` method to `Routes.applicationGuildCommands(clientID, guildID)` as there's no cache for local guild commands.

### Where do I host it?
You can use any VPS as long as it lets you use Node.js.

### Is the bot dangerous?
By default, it doesn't do _anything_, unless you specify an action using the `/config` slash command. You could even invite the bot with no permissions just to log the infraction to a channel.
### Can it ban users?
No. By design, SPHINX will kick users instead of banning them. In general, users with compromised accounts won't return to the server until they take back the access to their account. So banning them does more harm than good. If you think otherwise, feel free to fork.

### I still haven't solved my issue
Open a new issue on GitHub and I'll take a look into it.