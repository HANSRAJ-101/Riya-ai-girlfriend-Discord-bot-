import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { getBalance, deductBalance, formatMoney } from '../services/economyService.js';

export const data = new SlashCommandBuilder()
  .setName('deposit')
  .setDescription('Move coins from wallet to bank for safekeeping')
  .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to deposit').setRequired(true).setMinValue(1));

export const execute = async (interaction) => {
  const amt = interaction.options.getInteger('amount');
  const userDoc = await getUserData(interaction.user.id, interaction.guildId);

  if (!await deductBalance(userDoc, amt)) {
    return await interaction.reply({ content: `❌ Insufficient wallet balance to deposit **${formatMoney(amt)}**!`, ephemeral: true });
  }

  userDoc.bank = (userDoc.bank || 0) + amt;
  await saveUserData(userDoc);

  const embed = new EmbedBuilder()
    .setColor('#00FF7F')
    .setTitle('🏦 Bank Deposit Successful')
    .setDescription(
      `✅ Deposited **${formatMoney(amt)}** into your bank savings account!\n\n` +
      `💳 **Wallet:** **${formatMoney(getBalance(userDoc))}**\n` +
      `🏦 **Bank:** **${formatMoney(userDoc.bank)}**`
    );

  await interaction.reply({ embeds: [embed] });
};
