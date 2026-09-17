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
    leaderboardCmd.data.toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  try {
    logger.info(`Started registering ${commands.length} application slash commands...`);
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    logger.info('Successfully registered all slash commands globally! ✨');
  } catch (error) {
    logger.error('Failed to register slash commands:', error);
  }
};
