import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows all Riya commands and their usage');

export const execute = async (interaction) => {
  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle('📖 Riya Bot Commands Directory')
    .setDescription('Here is a complete list of all active slash commands in Riya!')
    .addFields(
      {
        name: '💳 Economy & Account',
        value: '`/bank_balance` • `/daily` • `/account` • `/profile` • `/inventory` • `/shop` • `/transactions` • `/gift` • `/add_bank_balance`'
      },
      {
        name: '💖 Relationship & Interactions',
        value: '`/date` • `/kiss` • `/hug` • `/stats` • `/friend` • `/select_channel` • `/leaderboard`'
      },
      {
        name: '🕹️ Minigames & Quizzes',
        value: '`/rps` • `/guess` • `/guessthenumber` • `/daily_quiz` • `/daily_task` • `/tictactoe` • `/connectfour` • `/memory` • `/triviaquiz`'
      },
      {
        name: '🤖 Auto-Channel Games',
        value: '`/emojiquiz` • `/antonymquiz` • `/counting` • `/settings` • `/language` • `/about` • `/help`'
      }
    )
    .setFooter({ text: 'Type / followed by the command name to use!' });

  await interaction.reply({ embeds: [embed] });
};
