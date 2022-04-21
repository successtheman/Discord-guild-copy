const { copy } = require('../settings.json');
const Logger = require('./logger');

class Cleaner {
    /**
     * Cleaning the new guild.
     * Channels: All categories/text/voice channels
     * Roles: All roles except the 'guildcopy' role
     * Emojis: All emojis (only if enabled in the settings)
     * Bans: All banned users (only if enabled in the settings)
     * @param {Client} client Discord Client
     * @param {string} newGuildId New guild id
     * @param {string} newGuildAdminRoleId New guild Administrator role id
     * @param {Object} guildData Serialized guild data
     * @param {Object} translator Translator object
     * @returns {Object} guildData
     */
    static cleanNewGuild(client, newGuildId, newGuildAdminRoleId, guildData, translator) {
        return new Promise(async (resolve, reject) => {
            try {
                let newGuild = client.guilds.cache.get(newGuildId);

                // Delete channel
                Logger.logMessage(translator.disp('messageCleanerChannels', guildData.step++));
                let promises = [];
                newGuild.channels.cache.forEach(channel => {
                    promises.push(channel.delete());
                });
                await Promise.all(promises);
                promises = [];


                // Delete roles
                let filter = role => role.id !== newGuildAdminRoleId && role.id !== newGuild.roles.everyone.id && !role.managed;
                let rolesToDelete = newGuild.roles.cache.filter(filter);
                Logger.logMessage(translator.disp('messageCleanerRoles', guildData.step++));
                rolesToDelete.forEach(role => {
                    promises.push(role.delete());
                });
                await Promise.all(promises);
                promises = [];

                // Delete emojis
                if (copy.Emojis) {
                    Logger.logMessage(translator.disp('messageCleanerEmojis', guildData.step++));
                    newGuild.emojis.cache.forEach(emoji => {
                        promises.push(emoji.delete());
                    });
                }
                await Promise.all(promises);
                promises = [];

                // Delete Bans
                if (copy.Bans) {
                    Logger.logMessage(translator.disp('messageCleanerBans', guildData.step++));
                    let bans = await newGuild.bans.fetch();
                    let unbans = [];
                    bans.forEach(ban => unbans.push(newGuild.members.unban(ban.user.id)));
                    await Promise.all(unbans);
                }

                Logger.logMessage(translator.disp('messageCleanerFinished', guildData.step++));
                return resolve(guildData);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports = Cleaner;
