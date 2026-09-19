import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserData } from '../database/models/User.js';
import { addBalance, formatMoney } from '../services/economyService.js';
import { addXp } from '../services/rpgService.js';

const ORES = [
  { name: '🥉 Copper Ore', chance: 0.50, val: 200, xp: 25 },
  { name: '🥈 Iron Ore', chance: 0.30, val: 500, xp: 50 },
  { name: '🥇 Gold Ore', chance: 0.15, val: 1500, xp: 120 },
  { name: '💎 Diamond Gem', chance: 0.05, val: 5000, xp: 300 }
];

export const data = new SlashCommandBuilder()
  .setName('mine')
  .setDescription('Mine underground caverns to extract valuable ores and gems!');

export const execute = async (interaction) => {
  const user = interaction.user;
  const userDoc = await getUserData(user.id, interaction.guildId);

  const now = Date.now();
  const lastMine = userDoc.cooldowns?.mine || 0;
  if (now - lastMine < 180000) { // 3 minutes cooldown
    const remainingSec = Math.ceil((180000 - (now - lastMine)) / 1000);
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    return interaction.reply({
      content: `⛏️ Your pickaxe is overheating! Wait **${mins}m ${secs}s** before mining again!`,
      ephemeral: true
    });
  }

  userDoc.cooldowns.mine = now;

  const rand = Math.random();
  let cumulative = 0;
  let minedOre = ORES[0];

  for (const ore of ORES) {
    cumulative += ore.chance;
    if (rand <= cumulative) {
      minedOre = ore;
      break;
    }
  }

  if (!userDoc.inventory) userDoc.inventory = [];
  userDoc.inventory.push(minedOre.name);

  const xpResult = addXp(userDoc, minedOre.xp);
  await addBalance(userDoc, minedOre.val / 2); // Mining gives cash bonus + raw ore item
  await userDoc.save();

  const embed = new EmbedBuilder()
    .setTitle('⛏️ Mining Extraction Successful!')
    .setColor('#00BFFF')
    .setDescription(`Clang! Clang! You swung your diamond pickaxe deep into the caverns and excavated **${minedOre.name}**!`)
    .addFields(
      { name: '⛏️ Extracted Ore', value: minedOre.name, inline: true },
      { name: '💰 Estimated Value', value: formatMoney(minedOre.val), inline: true },
      { name: '⭐ Mining XP', value: `+${minedOre.xp} XP`, inline: true }
    )
    .setFooter({ text: xpResult.leveledUp ? `🎉 LEVEL UP! Level ${xpResult.newLevel}` : 'Riya AI Girlfriend • Mine more for crafting gear!' });

  return interaction.reply({ embeds: [embed] });
};
