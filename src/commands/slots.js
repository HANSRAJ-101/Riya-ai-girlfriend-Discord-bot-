import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { addBalance, deductBalance, formatMoney } from '../services/economyService.js';

export const data = new SlashCommandBuilder()
  .setName('slots')
  .setDescription('Spin the Slots for a jackpot!')
  .addIntegerOption(opt => opt.setName('bet').setDescription('Bet amount ($)').setRequired(true).setMinValue(100));

export const execute = async (interaction) => {
  const bet = interaction.options.getInteger('bet');
  const userDoc = await getUserData(interaction.user.id, interaction.guildId);

  if (!await deductBalance(userDoc, bet)) {
    return await interaction.reply({ content: `❌ Insufficient balance for **${formatMoney(bet)}** bet!`, ephemeral: true });
  }

  const items = ['🍒', '🍋', '💎', '7️⃣', '🔔'];
  const r1 = items[Math.floor(Math.random() * items.length)];
  const r2 = items[Math.floor(Math.random() * items.length)];
  const r3 = items[Math.floor(Math.random() * items.length)];

  let win = 0;
  if (r1 === r2 && r2 === r3) {
    win = bet * 5;
    await addBalance(userDoc, win);
  } else if (r1 === r2 || r2 === r3 || r1 === r3) {
    win = Math.floor(bet * 1.5);
    await addBalance(userDoc, win);
  }

  await saveUserData(userDoc);

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎰 Slot Machine')
    .setDescription(
      `[ ${r1} | ${r2} | ${r3} ]\n\n` +
      (win > 0 ? `🎉 **JACKPOT!** You won **${formatMoney(win)}**!` : `❌ No match! Lost **${formatMoney(bet)}**.`)
    );

  await interaction.reply({ embeds: [embed] });
};
