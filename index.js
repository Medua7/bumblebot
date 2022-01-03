require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [ { name: 'bcounter', description: 'Bumble\'s counting Bot!' } ];
const groups = [ {name: 'Bumble\'s Humble Hive', id: 692768770581856366 } ];

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put( Routes.applicationCommands(process.env.CLIENT_ID, { body: commands }, ));

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

client.login(process.env.TOKEN);