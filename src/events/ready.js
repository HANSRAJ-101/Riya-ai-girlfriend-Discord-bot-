import { REST, Routes } from 'discord.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

// Import all slash commands data
import * as selectChannelCmd from '../commands/select_channel.js';
import * as statsCmd from '../commands/stats.js';
import * as dailyQuizCmd from '../commands/daily_quiz.js';
import * as dailyTaskCmd from '../commands/daily_task.js';
import * as hugCmd from '../commands/hug.js';
import * as kissCmd from '../commands/kiss.js';
import * as dateCmd from '../commands/date.js';
import * as rpsCmd from '../commands/rps.js';
import * as guessCmd from '../commands/guess.js';
import * as leaderboardCmd from '../commands/leaderboard.js';
import * as bankBalanceCmd from '../commands/bank_balance.js';
import * as giftCmd from '../commands/gift.js';
import * as addBankBalanceCmd from '../commands/add_bank_balance.js';
import * as friendCmd from '../commands/friend.js';
import * as dailyCmd from '../commands/daily.js';
import * as accountCmd from '../commands/account.js';
import * as profileCmd from '../commands/profile.js';
import * as inventoryCmd from '../commands/inventory.js';
import * as shopCmd from '../commands/shop.js';
import * as transactionsCmd from '../commands/transactions.js';
import * as aboutCmd from '../commands/about.js';
import * as helpCmd from '../commands/help.js';
import * as settingsCmd from '../commands/settings.js';
import * as languageCmd from '../commands/language.js';
import * as emojiquizCmd from '../commands/emojiquiz.js';
import * as antonymquizCmd from '../commands/antonymquiz.js';
import * as countingCmd from '../commands/counting.js';
import * as connectfourCmd from '../commands/connectfour.js';
import * as memoryCmd from '../commands/memory.js';
import * as triviaquizCmd from '../commands/triviaquiz.js';
import * as guessthenumberCmd from '../commands/guessthenumber.js';

export const name = 'ready';
export const once = true;

export const execute = async (client) => {
  logger.info(`Logged in successfully as ${client.user.tag}! Riya is ready to chat! 💕`);

  const commands = [
    selectChannelCmd.data.toJSON(),
    statsCmd.data.toJSON(),
    dailyQuizCmd.data.toJSON(),
    dailyTaskCmd.data.toJSON(),
    hugCmd.data.toJSON(),
    kissCmd.data.toJSON(),
    dateCmd.data.toJSON(),
    rpsCmd.data.toJSON(),
    guessCmd.data.toJSON(),
    leaderboardCmd.data.toJSON(),
    bankBalanceCmd.data.toJSON(),
    giftCmd.data.toJSON(),
    addBankBalanceCmd.data.toJSON(),
    friendCmd.data.toJSON(),
    dailyCmd.data.toJSON(),
    accountCmd.data.toJSON(),
    profileCmd.data.toJSON(),
    inventoryCmd.data.toJSON(),
    shopCmd.data.toJSON(),
    transactionsCmd.data.toJSON(),
    aboutCmd.data.toJSON(),
    helpCmd.data.toJSON(),
    settingsCmd.data.toJSON(),
    languageCmd.data.toJSON(),
    emojiquizCmd.data.toJSON(),
    antonymquizCmd.data.toJSON(),
    countingCmd.data.toJSON(),
    connectfourCmd.data.toJSON(),
    memoryCmd.data.toJSON(),
    triviaquizCmd.data.toJSON(),
    guessthenumberCmd.data.toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  try {
    logger.info(`Started registering ${commands.length} application slash commands...`);
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    logger.info('Successfully registered all slash commands globally! ✨');

    // Also register per-guild for instant update without waiting for global cache propagation
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        await rest.put(
          Routes.applicationGuildCommands(config.clientId, guildId),
          { body: commands }
        );
        logger.info(`Instantly registered slash commands for guild: ${guild.name} (${guildId}) ✨`);
      } catch (gErr) {
        logger.error(`Failed to register slash commands for guild ${guildId}:`, gErr);
      }
    }
  } catch (error) {
    logger.error('Failed to register slash commands:', error);
  }
};
