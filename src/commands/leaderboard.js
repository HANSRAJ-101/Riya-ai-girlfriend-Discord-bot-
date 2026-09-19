import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildLeaderboard, isUserDailyPartner } from '../services/rpgService.js';
import { triggerDailyDatingInvite } from '../utils/dailyDatingEvent.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View top minigame, quiz, and XP leaderboards!')
  .addSubcommand(sub => sub.setName('xp').setDescription('Shows you a leaderboard with the most active minigames players'))
  .addSubcommand(sub => sub.setName('emojiquiz').setDescription('Shows you the top 10 emojiquiz players'))
  .addSubcommand(sub => sub.setName('antonymquiz').setDescription('Shows you the top 10 antonymquiz players'))
  .addSubcommand(sub => sub.setName('triviaquiz').setDescription('Shows you the top 10 triviaquiz players'))
  .addSubcommand(sub => sub.setName('connectfour').setDescription('Shows the Connect Four leaderboard'))
  .addSubcommand(sub => sub.setName('counting').setDescription('Shows you the top 10 counting servers'));

export const execute = async (interaction) => {
  await interaction.deferReply().catch(() => {});

  try {
    const subcommand = interaction.options.getSubcommand() || 'xp';
    const guildId = interaction.guildId || 'dm';
    const leaderboard = await getGuildLeaderboard(guildId, 10);

    const titles = {
      xp: '🏆 Riya\'s Affection & XP Leaderboard',
      emojiquiz: '🧩 Top 10 EmojiQuiz Champions',
      antonymquiz: '📝 Top 10 AntonymQuiz Champions',
      triviaquiz: '❓ Top 10 TriviaQuiz Champions',
      connectfour: '🔴🟡 Top Connect Four Champions',
      counting: '🔢 Top Counting Server Champions'
    };

    const embed = new EmbedBuilder()
      .setColor('#FF1493')
      .setTitle(titles[subcommand] || '🏆 Leaderboard')
      .setDescription('Top players competing on the leaderboard!')
      .setFooter({ text: 'The #1 Champion gets an exclusive 24-Hour Special Date invitation with Riya!' });

    if (!leaderboard || leaderboard.length === 0) {
      embed.setDescription('No stats found yet! Play minigames and chat with Riya to get on the leaderboard! ☕✨');
    } else {
      let text = '';
      leaderboard.forEach((u, index) => {
        const medal = index === 0 ? '👑 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`;
        const tagStatus = isUserDailyPartner(u) ? ` \`[${u.datingTag}]\`` : '';
        text += `${medal} <@${u.userId}> — Level **${u.level || 1}** (${u.xp || 0} XP)${tagStatus}\n`;
      });
      embed.addFields({ name: '📊 Top Champions', value: text });
    }

    const inviteBtn = new ButtonBuilder()
      .setCustomId('trigger_daily_date_invite')
      .setLabel('Send Daily Date Invite (Admin/Top User)')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(inviteBtn);

    const replyMsg = await interaction.editReply({ embeds: [embed], components: [row] });

    const filter = i => i.customId === 'trigger_daily_date_invite';
    const collector = replyMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      await i.reply({ content: '💌 Triggering daily dating invitation in the channel...', ephemeral: true });
      if (interaction.guild) {
        await triggerDailyDatingInvite(interaction.guild, interaction.client);
      }
    });

  } catch (error) {
    logger.error('Error executing /leaderboard command:', error);
    await interaction.editReply({ content: '❌ Failed to fetch leaderboard.' }).catch(() => {});
  }
};
