import secret from '~/discord/bumblebot/secret.json';

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [
    { name: 'bcounter', description: 'Bumble\'s counting Bot!' }
]; 

const rest = new REST({ version: '9' }).setToken(secret.discord.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put( Routes.applicationGuildCommands(secret.discord.CLIENT_ID, secret.discord.groups.bumbles_humble_hive), { body: commands }, );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'bcounter') {
        await interaction.reply('Lets kill this b****!');
    }
});

client.login(secret.discord.TOKEN);