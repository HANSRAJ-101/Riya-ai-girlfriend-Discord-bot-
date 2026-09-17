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

const commands = new Map([
  ['select_channel', selectChannelCmd],
  ['stats', statsCmd],
  ['daily_quiz', dailyQuizCmd],
  ['daily_task', dailyTaskCmd],
  ['hug', hugCmd],
  ['kiss', kissCmd],
  ['date', dateCmd],
  ['rps', rpsCmd],
  ['guess', guessCmd]
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
