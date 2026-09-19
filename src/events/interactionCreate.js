import { logger } from '../utils/logger.js';

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

const commands = new Map([
  ['select_channel', selectChannelCmd],
  ['stats', statsCmd],
  ['daily_quiz', dailyQuizCmd],
  ['daily_task', dailyTaskCmd],
  ['hug', hugCmd],
  ['kiss', kissCmd],
  ['date', dateCmd],
  ['rps', rpsCmd],
  ['guess', guessCmd],
  ['leaderboard', leaderboardCmd],
  ['bank_balance', bankBalanceCmd],
  ['gift', giftCmd],
  ['add_bank_balance', addBankBalanceCmd],
  ['friend', friendCmd],
  ['daily', dailyCmd],
  ['account', accountCmd],
  ['profile', profileCmd],
  ['inventory', inventoryCmd],
  ['shop', shopCmd],
  ['transactions', transactionsCmd],
  ['about', aboutCmd],
  ['help', helpCmd],
  ['settings', settingsCmd],
  ['language', languageCmd],
  ['emojiquiz', emojiquizCmd],
  ['antonymquiz', antonymquizCmd],
  ['counting', countingCmd],
  ['connectfour', connectfourCmd],
  ['memory', memoryCmd],
  ['triviaquiz', triviaquizCmd],
  ['guessthenumber', guessthenumberCmd]
]);

export const name = 'interactionCreate';

export const execute = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    logger.warn(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing slash command /${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ There was an error while executing this command!', ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: '❌ There was an error while executing this command!', ephemeral: true }).catch(() => {});
    }
  }
};
