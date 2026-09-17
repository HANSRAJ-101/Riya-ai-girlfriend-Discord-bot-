import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildLeaderboard, isUserDailyPartner } from '../services/rpgService.js';
import { triggerDailyDatingInvite } from '../utils/dailyDatingEvent.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View top Affection XP users and Riya\'s Official Daily Dating Partner!');

export const execute = async (interaction) => {
  try {
    const leaderboard = await getGuildLeaderboard(interaction.guildId, 10);

    const embed = new EmbedBuilder()
      .setColor('#FF1493')
      .setTitle('🏆 Riya\'s Affection XP Leaderboard')
      .setDescription('The top users in the server competing for Riya\'s affection!')
      .setFooter({ text: 'The #1 Champion gets an exclusive 24-Hour Special Date invitation with Riya!' });

    if (leaderboard.length === 0) {
      embed.setDescription('No user stats found yet! Start chatting with Riya to get on the leaderboard! ☕✨');
    } else {
      let text = '';
      leaderboard.forEach((u, index) => {
        const medal = index === 0 ? '👑 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`;
        const tagStatus = isUserDailyPartner(u) ? ` \`[${u.datingTag}]\`` : '';
        text += `${medal} <@${u.userId}> — Level **${u.level}** (${u.xp} XP)${tagStatus}\n`;
      });
      embed.addFields({ name: '📊 Top Champions', value: text });
    }

    const inviteBtn = new ButtonBuilder()
      .setCustomId('trigger_daily_date_invite')
      .setLabel('Send Daily Date Invite (Admin/Top User)')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(inviteBtn);

    const replyMsg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const filter = i => i.customId === 'trigger_daily_date_invite';
    const collector = replyMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      await i.reply({ content: '💌 Triggering daily dating invitation in the channel...', ephemeral: true });
      await triggerDailyDatingInvite(interaction.guild, interaction.client);
    });

  } catch (error) {
    logger.error('Error executing /leaderboard command:', error);
    await interaction.reply({ content: '❌ Failed to fetch leaderboard.', ephemeral: true });
  }
};
