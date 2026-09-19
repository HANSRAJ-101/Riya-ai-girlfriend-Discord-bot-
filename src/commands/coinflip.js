import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { addBalance, deductBalance, formatMoney } from '../services/economyService.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a coin and pick heads or tails!')
  .addIntegerOption(opt => opt.setName('bet').setDescription('Bet amount ($)').setRequired(true).setMinValue(100))
  .addStringOption(opt => opt.setName('choice').setDescription('Heads or Tails').setRequired(true).addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' }));

export const execute = async (interaction) => {
  const bet = interaction.options.getInteger('bet');
  const choice = interaction.options.getString('choice');
  const userDoc = await getUserData(interaction.user.id, interaction.guildId);

  if (!await deductBalance(userDoc, bet)) {
    return await interaction.reply({ content: `❌ Insufficient balance for **${formatMoney(bet)}** bet!`, ephemeral: true });
  }

  const result = Math.random() < 0.5 ? 'heads' : 'tails';

  let msg = '';
  if (result === choice) {
    const win = bet * 2;
    await addBalance(userDoc, win);
    msg = `🪙 The coin landed on **${result.toUpperCase()}**! You won **${formatMoney(win)}**! 🎉`;
  } else {
    msg = `🪙 The coin landed on **${result.toUpperCase()}**! You lost **${formatMoney(bet)}**! ❌`;
  }

  await saveUserData(userDoc);

  const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🪙 Coinflip Result').setDescription(msg);
  await interaction.reply({ embeds: [embed] });
};
