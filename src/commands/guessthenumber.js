import { SlashCommandBuilder } from 'discord.js';
import { execute as executeGuess } from './guess.js';

export const data = new SlashCommandBuilder()
  .setName('guessthenumber')
  .setDescription('Starts a game of Guess The Number');

export const execute = async (interaction) => {
  return await executeGuess(interaction);
};
