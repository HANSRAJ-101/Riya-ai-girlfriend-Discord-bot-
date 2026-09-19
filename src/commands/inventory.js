import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserData } from '../database/models/User.js';
import { GIFTS } from '../services/economyService.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('Shows your inventory of gifts and items');

export const execute = async (interaction) => {
  try {
    const userDoc = await getUserData(interaction.user.id, interaction.guildId);
    const inventory = userDoc.inventory || [];

    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`🎒 ${interaction.user.username}'s Inventory`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    if (inventory.length === 0) {
      embed.setDescription('Your inventory is empty! Use `/gift store` or `/shop` to buy items!');
    } else {
      const counts = {};
      inventory.forEach(item => {
        const key = item.giftId || item.id;
        counts[key] = (counts[key] || 0) + 1;
      });
      let text = '';
      Object.entries(counts).forEach(([k, count]) => {
        const gift = GIFTS[k];
        text += gift ? `${gift.emoji} **${gift.name}** x${count} — *${gift.description}*\n` : `🎁 **${k}** x${count}\n`;
      });
      embed.setDescription(text);
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Error executing /inventory command:', error);
    await interaction.reply({ content: '❌ Failed to fetch inventory.', ephemeral: true });
  }
};
