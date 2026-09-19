import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { addBalance, formatMoney, getBalance } from '../services/economyService.js';

export const data = new SlashCommandBuilder()
  .setName('withdraw')
  .setDescription('Take coins out of your bank into your wallet')
  .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to withdraw').setRequired(true).setMinValue(1));

export const execute = async (interaction) => {
  const amt = interaction.options.getInteger('amount');
  const userDoc = await getUserData(interaction.user.id, interaction.guildId);

  const bankBal = userDoc.bank || 0;
  if (bankBal < amt) {
    return await interaction.reply({ content: `❌ Insufficient bank savings to withdraw **${formatMoney(amt)}**!`, ephemeral: true });
  }

  userDoc.bank = bankBal - amt;
  await addBalance(userDoc, amt);
  await saveUserData(userDoc);

  const embed = new EmbedBuilder()
    .setColor('#00FF7F')
    .setTitle('🏦 Bank Withdrawal Successful')
    .setDescription(
      `✅ Withdrew **${formatMoney(amt)}** from your bank savings account!\n\n` +
      `💳 **Wallet:** **${formatMoney(getBalance(userDoc))}**\n` +
      `🏦 **Bank:** **${formatMoney(userDoc.bank)}**`
    );

  await interaction.reply({ embeds: [embed] });
};
