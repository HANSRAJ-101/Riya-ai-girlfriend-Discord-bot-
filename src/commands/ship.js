import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Calculate love compatibility % between two users')
  .addUserOption(opt => opt.setName('user1').setDescription('First user').setRequired(true))
  .addUserOption(opt => opt.setName('user2').setDescription('Second user (leave empty for yourself)').setRequired(false));

export const execute = async (interaction) => {
  const user1 = interaction.options.getUser('user1');
  const user2 = interaction.options.getUser('user2') || interaction.user;

  const calculateScore = () => Math.floor(Math.random() * 100) + 1;
  const score = calculateScore();

  const heartBar = '💖'.repeat(Math.round(score / 10)) + '🖤'.repeat(10 - Math.round(score / 10));

  const embed = new EmbedBuilder()
    .setColor('#FF1493')
    .setTitle(`💖 Shipping <@${user1.id}> x <@${user2.id}>`)
    .setDescription(
      `💘 **${score}% Compatibility**\n\n` +
      `${heartBar}\n\n` +
      `*Not Satisfied? Click Re-Roll & Try Again!*`
    )
    .setFooter({ text: 'Riya Matchmaker Engine ☕✨' });

  const rerollBtn = new ButtonBuilder()
    .setCustomId('ship_reroll')
    .setLabel('🔄 Re-Roll')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(rerollBtn);

  const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

  const filter = i => i.customId === 'ship_reroll';
  const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async i => {
    const newScore = calculateScore();
    const newBar = '💖'.repeat(Math.round(newScore / 10)) + '🖤'.repeat(10 - Math.round(newScore / 10));
    embed.setDescription(
      `💘 **${newScore}% Compatibility**\n\n` +
      `${newBar}\n\n` +
      `*Re-rolled compatibility result!*`
    );
    await i.update({ embeds: [embed] });
  });
};
