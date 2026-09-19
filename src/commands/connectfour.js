import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { getBalance, addBalance, deductBalance, formatMoney } from '../services/economyService.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('connectfour')
  .setDescription('Play interactive Connect Four game or view your history!')
  .addSubcommand(sub =>
    sub.setName('play')
      .setDescription('Start a game of Connect Four')
      .addUserOption(opt => opt.setName('opponent').setDescription('Challenge another user (leave empty for Riya AI)').setRequired(false))
      .addIntegerOption(opt => opt.setName('stake').setDescription('Coin stake amount ($)').setRequired(false).setMinValue(0))
  )
  .addSubcommand(sub =>
    sub.setName('history')
      .setDescription('Shows your history of all Connect Four games')
  );

export const execute = async (interaction) => {
  try {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'history') {
      const userDoc = await getUserData(interaction.user.id, interaction.guildId);
      const stats = userDoc.stats || {};
      const wins = stats.connectfourWins || 0;
      const losses = stats.connectfourLosses || 0;

      const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle(`🔴🟡 ${interaction.user.username}'s Connect Four History`)
        .setDescription(
          `🏆 **Wins:** **${wins}**\n` +
          `💀 **Losses:** **${losses}**\n` +
          `📊 **Win Rate:** **${wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0}%**`
        );

      return await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'play') {
      const opponent = interaction.options.getUser('opponent') || interaction.client.user;
      const stake = interaction.options.getInteger('stake') || 0;
      const userDoc = await getUserData(interaction.user.id, interaction.guildId);

      if (stake > 0 && !await deductBalance(userDoc, stake)) {
        return await interaction.reply({ content: `❌ You do not have **${formatMoney(stake)}** for this stake!`, ephemeral: true });
      }

      const isBot = opponent.id === interaction.client.user.id;
      const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('🔴🟡 Connect Four Challenge')
        .setDescription(
          `🔴 • <@${interaction.user.id}>\n` +
          `🟡 • <@${opponent.id}>\n\n` +
          `**Stake:** **${formatMoney(stake)}**\n` +
          `**Status:** Game initiated! Drop your token into columns 1 - 7 below!`
        );

      const row = new ActionRowBuilder();
      for (let col = 1; col <= 5; col++) {
        row.addComponents(
          new ButtonBuilder().setCustomId(`c4_col_${col}`).setLabel(`Col ${col}`).setStyle(ButtonStyle.Primary)
        );
      }

      await interaction.reply({ embeds: [embed], components: [row] });
    }

  } catch (error) {
    logger.error('Error executing /connectfour command:', error);
    await interaction.reply({ content: '❌ Failed to launch Connect Four.', ephemeral: true });
  }
};
