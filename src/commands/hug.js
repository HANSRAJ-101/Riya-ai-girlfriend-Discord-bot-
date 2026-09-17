import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { fetchGif } from '../services/tenorService.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { addXp } from '../services/rpgService.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('hug')
  .setDescription('Give a warm hug to Riya or another user!')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user you want to hug (leave empty to hug Riya)')
      .setRequired(false)
  );

export const execute = async (interaction) => {
  try {
    const targetUser = interaction.options.getUser('user') || interaction.client.user;
    const isBot = targetUser.id === interaction.client.user.id;
    const gifUrl = await fetchGif('hug');

    const userDoc = await getUserData(interaction.user.id, interaction.guildId);

    let messageText = '';
    if (isBot) {
      addXp(userDoc, 20);
      userDoc.moodScore = Math.min(100, (userDoc.moodScore || 50) + 5);
      await saveUserData(userDoc);
      messageText = `<@${interaction.user.id}> wraps their arms tightly around Riya! Riya blushes warmly: *"Aww Baka! Hugs after compiling code are the absolute best!"* 🫂💛☕ (+20 Affection XP)`;
    } else {
      messageText = `<@${interaction.user.id}> gives <@${targetUser.id}> a big warm hug! 🫂✨`;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFB6C1')
      .setDescription(messageText)
      .setImage(gifUrl);

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Error executing /hug:', error);
    await interaction.reply({ content: '❌ Could not perform hug.', ephemeral: true });
  }
};
