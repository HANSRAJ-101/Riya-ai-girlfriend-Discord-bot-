import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { GIFTS, formatMoney } from '../services/economyService.js';

export const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('Shows the Riya Gift & Item Shop');

export const execute = async (interaction) => {
  const embed = new EmbedBuilder()
    .setColor('#FF1493')
    .setTitle('🛍️ Riya Official Gift & Luxury Shop')
    .setDescription('Buy luxury gifts and boosters to level up your relationship and affection!')
    .addFields(
      { name: '💍 Diamond Ring', value: `**Price:** ${formatMoney(GIFTS.diamond_ring.price)}\n**Boost:** +1,000 XP\n*${GIFTS.diamond_ring.description}*` },
      { name: '🌹 Red Flower', value: `**Price:** ${formatMoney(GIFTS.red_flower.price)}\n**Boost:** +50 XP\n*${GIFTS.red_flower.description}*` },
      { name: '🧸 Teddy Bear', value: `**Price:** ${formatMoney(GIFTS.teddy_bear.price)}\n**Boost:** +20 XP\n*${GIFTS.teddy_bear.description}*` }
    )
    .setFooter({ text: 'Use /gift send <item> <user> to purchase and send!' });

  await interaction.reply({ embeds: [embed] });
};
