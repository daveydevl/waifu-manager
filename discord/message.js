/*
    discord -> message
*/

var save = (data, id) => {
    data[id] = data[id];
};
var commands = {
    help      : (discord, data, cache, message) => {
        var commands = {
            help      : 'Show this panel',
            name      : 'Set bot\'s name - !name Megumi Kato',
            pfp       : 'Set bot\'s avatar - !pfp example.com/image.png',
            cmd       : 'Add a command - !cmd bake I made a pie for you! (echo)',
            word      : 'Add a keyword - !word weeb What a weeb!',
            phrase    : 'Add a phrase - !phrase "im tired" then go to sleep!',
            delcmd    : 'Deletes a command - !delcmd bake',
            delword   : 'Deletes a word - !delword weeb',
            delphrase : 'Deletes a phrase - !delphrase im tired',
            cmds      : 'Shows all commands',
            words     : 'Shows all keywords',
            phrases   : 'Shows all phrases',
            say       : 'Talk as the bot - !say hello'
        };
        
        var fields = [];
        for (var command in commands)
            fields.push({
                name : '!' + command,
                value : commands[command]
            });
        
        return {
            title: 'List of Commands',
            fields: fields
        };
    },
    name      : (discord, data, cache, message, arg, rest) => {
        var id = message.author.id;
        rest = arg + ' ' + rest.replace(/\s{2,}/g, ' ');
        rest = rest.trim();
        
        if (rest == '')
            return 'Please follow this format: !name <name>';
        
        data[id].name = rest;
        save(data, id);
        
        return 'I\'ve changed my name!';
    },  
    pfp       : (discord, data, cache, message, arg) => {
        var id = message.author.id;
        
        if (arg == '')
            return 'Please follow this format: !pfp <image_url>';
        
        data[id].avatar = arg;
        save(data, id);
        
        return 'I\'ve changed my profile picture!';
    },
    cmd       : (discord, data, cache, message, cmd, resp) => {
        var id = message.author.id;
        
        if (resp == '')
            return 'Please follow this format: !cmd <cmd> <response>';
        
        data[id].cmds[cmd] = resp;
        save(data, id);
        
        return 'I\'ve updated the command `!' + cmd + '` for you!';
    },  
    word      : (discord, data, cache, message, word, resp) => {
        var id = message.author.id;
        
        if (resp == '')
            return 'Please follow this format: !word <word> <response>';
        
        data[id].words[word] = resp;
        save(data, id);
        
        return 'I\'ve updated the word `' + word + '` for you!';
    },  
    phrase    : (discord, data, cache, message) => {
        var id = message.author.id;
        var matches = message.content.match(/"(.*?)" (.*)/);
        if (matches && matches.length == 3) {
            data[id].phrases[matches[1]] = matches[2];
            save(data, id);
            
            return 'I\'ve updated the phrase `' + matches[1] + '` for you!';
        }
        
        return 'Please follow this format: !phrase "<phrase>" <response>';
    },   
    delcmd    : (discord, data, cache, message, cmd) => {
        var id = message.author.id;
        
        if (cmd == '')
            return 'Please follow this format: !delcmd <cmd>';
        
        if (!data[id].cmds[cmd])
            return 'That command does not exist!';
        
        delete data[id].cmds[cmd];
        save(data, id);
        
        return 'I\'ve removed the command `!' + cmd + '` for you!';
    },   
    delword   : (discord, data, cache, message, word) => {
        var id = message.author.id;
        
        if (word == '')
            return 'Please follow this format: !delword <word>';
        
        if (!data[id].words[word])
            return 'That word does not exist!';
        
        delete data[id].words[word];
        save(data, id);
        
        return 'I\'ve removed the word `' + word + '` for you!';
    },   
    delphrase : (discord, data, cache, message, phrase) => {
        var id = message.author.id;
        
        if (phrase == '')
            return 'Please follow this format: !delphrase <phrase>';
        
        if (!data[id].phrases[phrase])
            return 'That phrase does not exist!';
        
        delete data[id].phrases[phrase];
        save(data, id);
        
        return 'I\'ve removed the phrase `' + phrase + '` for you!';
    },    
    cmds      : (discord, data, cache, message) => {
        var fields = [];
        var id = message.author.id;
        var cmds = data[id].cmds;
        var count = 0;
    
        for (var cmd in cmds) {
            fields.push({
                name: '!' + cmd,
                value: cmds[cmd]
            });
            count++;
        }
            
        return {
            title: 'List of Commands (' + count + ')',
            fields: fields
        };
    },    
    words     : (discord, data, cache, message) => {
        var fields = [];
        var id = message.author.id;
        var words = data[id].words;
        var count = 0;
    
        for (var word in words) {
            fields.push({
                name: word,
                value: words[word]
            });
            count++;
        }
            
        return {
            title: 'List of Words (' + count + ')',
            fields: fields
        };
    },   
    phrases   : (discord, data, cache, message) => {
        var fields = [];
        var id = message.author.id;
        var phrases = data[id].phrases;
        var count = 0;
    
        for (var phrase in phrases) {
            fields.push({
                name: phrase,
                value: phrases[phrase]
            });
            count++;
        }
            
        return {
            title: 'List of Phrases (' + count + ')',
            fields: fields
        };
    }
};

var process = (discord, data, cache, message, isDM) => { 
    var content = message.content;
    var id = message.author.id;

    if (content.startsWith('!')) {
        var matches = content.match(/!([^\s]+)[\s]*([^\s]*)[\s]*(.*)/);
        var cmd = matches[1].toLowerCase();
        
        var command = commands[cmd];
        if (isDM && command)
            return command(discord, data, cache, message, matches[2], matches[3]);
        
        if (cmd == 'say') {
            if (!isDM)
                message.delete();
            
            return content.substr(5);
        }
        
        var resp = data[id].cmds[matches[1]];
        if (resp)
            return resp;
    }
    
    var words = data[id].words;
    
    for (var word in words)
        if (content.indexOf(word) !== -1)
            return words[word];
        
    var phrases = data[id].phrases;
    
    for (var phrase in phrases)
        if (content.indexOf(phrase) !== -1)
            return phrases[phrase];
        
    if (!data[id].once) {
        data[id].once = true;
        save(data, id);
        
        return 'Hello!\n\n' +
               'Type !name <name> to set my name\n' +
               'Type !pfp  <image_url> to set my avatar\n\n' +
               'Type !help to view all commands';
    }
    
    return false;
};
var sendWebhook = (hook, message, bot) => {
    hook.send(message, {
        username        : bot.name,
        avatarURL       : bot.avatar,
        disableEveryone : true
    });
};
var handlers = {
    dm : (discord, data, cache, message) => {
        var id = message.author.id;
        
        if (!data[id])
            data[id] = {
                cmds     : {
                    owo  : 'hewwo owo'
                },
                words    : {
                    weeb : 'what a weeb!'
                },
                phrases  : {
                    'im tired' : 'then go to sleep!'
                },
                name     : 'Your Waifu',
                avatar   : 'https://cdn.discordapp.com/embed/avatars/0.png'
            };
        
        var output = process(discord, data, cache, message, true);
        if (!output)
            return;
        
        var embed = {
            author: {
                name     : data[id].name,
                icon_url : data[id].avatar
            }
        };
        
        if (typeof output == 'string')
            embed.description = output;
        else {
            embed.title = output.title;
            embed.fields = output.fields;
        }
        
        message.channel.send({
            embed: embed
        });
    },
    
    text : (discord, data, cache, message) => {
        var output = process(discord, data, cache, message, false);
        var channel_id = message.channel.id;
        var id = message.author.id;
        
        if (!output)
            return;
        
        var webhook = cache.webhooks[channel_id];
        
        if (!webhook)
            message.channel.fetchWebhooks().then(hooks => {
                if (hooks.size == 0)
                    message.channel.createWebhook('Waifu Manager').then(webhook => {
                        cache.webhooks[channel_id] = webhook;
                        sendWebhook(webhook, output, data[id]);
                    });
                else {
                    cache.webhooks[channel_id] = hooks.first();
                    sendWebhook(cache.webhooks[channel_id], output, data[id]);
                }
            });
        else
            sendWebhook(webhook, output, data[id]);  
    }
};

module.exports = (discord, data, cache, message) => {
    if (message.author.bot)
        return;
    
    var handler = handlers[message.channel.type];
    
    if (handler)
        handler(discord, data, cache, message);
};

