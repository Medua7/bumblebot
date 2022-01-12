require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const { Client, Intents, Guild, TextChannel } = require('discord.js');
const { GroupNotificationTypes } = require('whatsapp-web.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const groups = [ {name: 'Bumble\'s Humble Hive', id: '692768770581856366', counting: '737207984601694299' } ]; //string -> id = Snowflake
const commands = [ {name: 'bcounter', description: 'Bumble 0000000!'} ];
let countings = { '737207984601694299': { current: 0, last: '' } };

const MESSAGE_INIT = 'Initializing bot..';
let initMessages = [];

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

    console.log('Initializing bot for guilds.');
    groups.forEach(group => {
        client.channels.cache.get(group.counting).send(MESSAGE_INIT);
    });

    //TODO: load current counting number
    //TODO: delete all message until
});

client.on('messageCreate', async message => {
    if(message.author.id == client.user.id){
        if(message.content == MESSAGE_INIT){
            console.log('found the init message for guild '+message.guildId);

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
        console.log('args: '+args);
        let approve = false;
        if(args.length > 0){
            if(counting.last != message.author.id || 1 == 1){
                if(!isNaN(args[0]) && (parseInt(args[0]) == (1+counting.current))){
                    approve = true;
                }else{
                    console.log('now: '+(parseInt(args[0]))+' vs expected: '+(1+counting.current));
                    console.log('not a number or incorrect number (isNaN('+isNaN(args[0])+'), isCurrent('+((parseInt(args[0])) == (1+counting.current))+'))');
                }
            }else{
                console.log('last user is same');
            }
        }else{
            console.log('0 args');
        }

        if(approve){
            counting.last = message.author.id;
            counting.current++;

            countings[group.id] = counting;

            const approveEmote = message.guild.emojis.cache.find(e => e.name == 'approve');
            if(approveEmote){
                message.react(approveEmote.id);
            }
            console.log('"'+message.content+'" approved..');
        }else{
            const denyEmote = message.guild.emojis.cache.find(e => e.name == 'no_entry');
            if(denyEmote){
                message.react(denyEmote.id);
            }
            message.delete();
            console.log('"'+message.content+'" deleted..');
        }
    }
});

client.on('interactionCreate', async interaction => {
    console.log('please');
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'bcounter') {
        await interaction.reply('Lets kill this b****!');
    }
});

function getGroupById(groupId){
    const filteredGroups = groups.filter(group => group.id == groupId);
    return (filteredGroups.length > 0) ? filteredGroups[0] : null;
}