require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const { Client, Intents, Guild } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const groups = [ {name: 'Bumble\'s Humble Hive', id: '692768770581856366' } ]; //string -> id = Snowflake
const commands = [ {name: 'bcounter', description: 'Bumble 23213123!'} ];

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        let CommandManager = Routes.applicationCommands(process.env.CLIENT_ID);
        console.log(CommandManager);

        //REMOVE ALL (/) COMMANDS
        await rest.get(CommandManager).then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${CommandManager}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
        
        //ADD ALL (/) COMMANDS
        await rest.put(
            CommandManager,
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
        
        client.login(process.env.TOKEN);
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