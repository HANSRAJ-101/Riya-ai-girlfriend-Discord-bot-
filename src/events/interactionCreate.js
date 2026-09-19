import { logger } from '../utils/logger.js';
import { loadAllCommands } from '../utils/commandLoader.js';

let commandsCache = null;

export const name = 'interactionCreate';

export const execute = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!commandsCache) {
    const { commandsMap } = await loadAllCommands();
    commandsCache = commandsMap;
  }

  const command = commandsCache.get(interaction.commandName);
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
