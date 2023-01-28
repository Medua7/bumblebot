require('dotenv').config();

// const { Client, Intents, Guild, TextChannel, Integration } = require('discord.js');

const { REST, Routes, Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

//PT-BumbleTrixx: 737207984601694299
const groups = [ {name: 'Bumble\'s Humble Hive', id: '692768770581856366', counting: '765674569243164682' } ]; //string -> id = Snowflake
const commands = [
    {
        name: 'bumblebot',
        description: 'Bumble\'s Bot Command!'
    },
    {
        name: 'bcounter',
        description: 'Bumble\'s Counter Command!',
        options: [{
            name: "current",
            description: "Returns the current count for this server",
            type: 1
        },{
            name: "next",
            description: "Returns the next count for this server",
            type: 1
        },{
            name: "set",
            description: "Sets the servers counter to a specific value",
            type: 1,
            options: [
                {
                    name: "count",
                    description: "The amount to set the counter to",
                    required: true,
                    type: 4
                }
            ]
        }]
    }
];
let countings = { '765674569243164682': { current: 0, last: '' } };

const MESSAGE_INIT = 'Initializing bot..';
let initMessages = [];

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        let CommandManager = Routes.applicationCommands(process.env.CLIENT_ID);
        console.log(CommandManager);

        //REMOVE ALL (/) COMMANDS
        /*await rest.get(CommandManager).then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${CommandManager}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });*/
        
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

    console.log('Initializing bot for guilds.');
    groups.forEach(group => {
        client.channels.cache.get(group.counting).send(MESSAGE_INIT);
    });
});

client.on('messageCreate', async message => {
    if(message.author.id == client.user.id){
        if(message.content == MESSAGE_INIT){
            console.log('Found the init message for guild '+message.guildId);

            //INIT GUILD
            const lastMessages = await message.channel.messages.fetch({ limit: 10 });
            console.log('LastMessages: '+lastMessages.size);
            if(lastMessages && lastMessages.size > 0){
                lastMessages.forEach(msg => {
                    //CHECK FOR LAST APPROVED
                    if(countings[message.channelId].last == ''){
                        msg.reactions.cache.every(reaction => {
                            if(reaction.me && reaction.emoji.name == 'approve'){
                                console.log('Found last approved for guild '+message.guildId);
                                const lastNumber = parseInt(msg.content.split(' ')[0]);
                                const lastUser = msg.author.id;
                                let counting = countings[message.channelId];
                                counting.last = lastUser;
                                counting.current = lastNumber;
                                countings[message.guildId] = counting;
                                console.log('Guild '+message.guildId+' initiated with number '+counting.current+' and last user '+counting.last);
                            }
                        });
                    }
                });
            }

            message.delete();
        }
    }

    const group = getGroupById(message.guildId);

    if(group != null && group.counting == message.channelId && message.author.id != client.user.id){
        //COUNTING CHANNEL
        let counting = countings[group.counting];

        const args = message.content.split(' ');
        let approve = false;
        if(args.length > 0){
            if(counting != '' && (counting.last != message.author.id)){
                if(!isNaN(args[0]) && (parseInt(args[0]) == (1+counting.current))){
                    approve = true;
                }
            }
        }

        if(approve){
            counting.last = message.author.id;
            counting.current++;

            countings[group.id] = counting;

            const approveEmote = message.guild.emojis.cache.find(e => e.name == 'approve');
            if(approveEmote){
                message.react(approveEmote.id);
            }
        }else{
            if(message.deletable){
                message.delete().then().catch(error => console.error('Error: ', error));
            }
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'bcounter') {
        if(interaction.options.getSubcommand() === 'set'){
            if(countings[interaction.channelId]) return;
            const countValue = interaction.options.getInteger('count');
            const group = getGroupById(interaction.guildId);
            if(countValue && group && group != null){
                const counting = countings[group.counting];
                if(counting){
                    if(counting.current != countValue){
                        counting.current = countValue;
                        countings[group.counting] = counting;
                        await interaction.reply('<:approve:930918425923039302> Counting has been set to: **'+countValue+'** (continue here <#'+group.counting+'>)');
                    }else{
                        await interaction.reply(':no_entry: You cannot change it to the same number!');
                    }
                }else{
                    await interaction.reply(':no_entry: No counting channel was found for this server!');
                }
            }else{
                await interaction.reply(':no_entry: No counting channel was found or values are missing!');
            }
        }else if(interaction.options.getSubcommand() === 'current'){
            const group = getGroupById(interaction.guildId);
            if(group && group != null){
                await interaction.reply({ content:':1234: Current count number for this server is: **'+countings[group.counting].current+'**', ephemeral: true });
            }else{
                await interaction.reply({ content:':no_entry: No counting channel was found for this server!', ephemeral: true });
            }
        }else if(interaction.options.getSubcommand() === 'next'){
            const group = getGroupById(interaction.guildId);
            if(group && group != null){
                await interaction.reply({ content:':new: Next number for this server is: **'+(parseInt(countings[group.counting].current)+1)+'**', ephemeral: true });
            }else{
                await interaction.reply({ content:':no_entry: No counting channel was found for this server!', ephemeral: true });
            }
        }
    }
});

function getGroupById(groupId){
    const filteredGroups = groups.filter(group => group.id == groupId);
    return (filteredGroups.length > 0) ? filteredGroups[0] : null;
}