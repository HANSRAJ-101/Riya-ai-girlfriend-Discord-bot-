import { REST, Routes } from 'discord.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { loadAllCommands } from '../utils/commandLoader.js';

export const name = 'guildCreate';

export const execute = async (guild) => {
  logger.info(`🎉 Riya was added to a new server: ${guild.name} (${guild.id})!`);

  const { commandsJSON } = await loadAllCommands();
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  try {
    logger.info(`Instantly registering ${commandsJSON.length} slash commands for new server ${guild.name}...`);
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, guild.id),
      { body: commandsJSON }
    );
    logger.info(`✨ Successfully registered all 82 slash commands for ${guild.name}!`);
  } catch (error) {
    logger.error(`Failed to register slash commands for new guild ${guild.id}:`, error);
  }
};
