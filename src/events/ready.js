import { REST, Routes } from 'discord.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { loadAllCommands } from '../utils/commandLoader.js';

export const name = 'ready';
export const once = true;

export const execute = async (client) => {
  logger.info(`Logged in successfully as ${client.user.tag}! Riya is ready to chat! 💕`);

  const { commandsJSON } = await loadAllCommands();

  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  try {
    logger.info(`Started registering ${commandsJSON.length} application slash commands...`);
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commandsJSON }
    );
    logger.info('Successfully registered all slash commands globally! ✨');

    // Also register per-guild for instant update without waiting for global cache propagation
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        await rest.put(
          Routes.applicationGuildCommands(config.clientId, guildId),
          { body: commandsJSON }
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
