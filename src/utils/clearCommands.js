import { REST, Routes } from 'discord.js';
import { config } from '../config.js';
import { logger } from './logger.js';

// Import active commands
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

const activeCommands = [
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

const clearAndReRegisterCommands = async () => {
  if (!config.discordToken || !config.clientId) {
    logger.error('DISCORD_TOKEN or CLIENT_ID missing in environment variables.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  try {
    logger.info('1. Wiping ALL global slash commands from Discord API...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
    logger.info('Successfully cleared all global slash commands!');

    const guildId = process.argv[2];
    if (guildId) {
      logger.info(`2. Wiping guild-specific slash commands for Guild ID ${guildId}...`);
      await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), { body: [] });
      logger.info(`Successfully cleared guild slash commands for ${guildId}!`);
    }

    logger.info(`3. Re-registering ONLY the ${activeCommands.length} current active commands...`);
    await rest.put(Routes.applicationCommands(config.clientId), { body: activeCommands });
    logger.info('🎉 Wiped old commands and re-registered current slash commands cleanly!');

  } catch (error) {
    logger.error('Failed to clear/register slash commands:', error);
  }
};

clearAndReRegisterCommands();
