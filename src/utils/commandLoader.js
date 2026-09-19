import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsDir = path.resolve(__dirname, '../commands');

export const loadAllCommands = async () => {
  const commandsMap = new Map();
  const commandsJSON = [];

  try {
    const files = readdirSync(commandsDir).filter((file) => file.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      const fileUrl = pathToFileURL(filePath).href;
      
      try {
        const commandModule = await import(fileUrl);
        if (commandModule.data && commandModule.data.name && typeof commandModule.execute === 'function') {
          commandsMap.set(commandModule.data.name, commandModule);
          commandsJSON.push(commandModule.data.toJSON());
        } else {
          logger.warn(`Command file ${file} missing 'data' or 'execute' export.`);
        }
      } catch (err) {
        logger.error(`Failed to load command file ${file}:`, err);
      }
    }
  } catch (err) {
    logger.error('Failed to read commands directory:', err);
  }

  return { commandsMap, commandsJSON };
};
