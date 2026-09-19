import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('about')
  .setDescription('Get information about Riya AI Girlfriend & Minigames Bot');

export const execute = async (interaction) => {
  const ping = interaction.client.ws.ping;
  const guildCount = interaction.client.guilds.cache.size;

  const embed = new EmbedBuilder()
    .setColor('#FF1493')
    .setTitle('👩🏻‍❤️‍👩🏻 About Riya — AI Girlfriend & Minigames Bot')
    .setDescription(
      `Kem chhe! I am **Riya**, a 20-year-old CS student & competitive gamer from Ahmedabad! ☕🎮✨\n\n` +
      `Powered by **Google Gemini API**, **Firebase Firestore**, and **Discord.js v14**.`
    )
    .addFields(
      { name: '📡 Latency', value: `\`${ping} ms\``, inline: true },
      { name: '🌐 Guilds Connected', value: `\`${guildCount} Servers\``, inline: true },
      { name: '👑 Creator', value: 'Antigravity AI Team', inline: true },
      { name: '💖 Key Features', value: 'AI Chatting, RPG Relationship Leveling, Bank Balance Economy, Gift Shop, Daily Quiz/Task, Connect Four, Counting, TicTacToe, Emoji Quiz, Antonym Quiz!' }
    )
    .setFooter({ text: 'Riya AI Girlfriend • Version 2.5' });

  await interaction.reply({ embeds: [embed] });
};
