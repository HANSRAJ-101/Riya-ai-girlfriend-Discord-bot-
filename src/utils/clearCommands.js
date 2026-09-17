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

const activeCommands = [
  selectChannelCmd.data.toJSON(),
  statsCmd.data.toJSON(),
  dailyQuizCmd.data.toJSON(),
  dailyTaskCmd.data.toJSON(),
  hugCmd.data.toJSON(),
  kissCmd.data.toJSON(),
  dateCmd.data.toJSON(),
  rpsCmd.data.toJSON(),
  guessCmd.data.toJSON()
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
