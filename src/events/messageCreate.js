import { getGuildConfig } from '../database/models/GuildConfig.js';
import { getUserData, saveUserData } from '../database/models/User.js';
import { calculateSentimentChange, updateMood, getMoodReactionEmoji } from '../services/moodService.js';
import { addXp } from '../services/rpgService.js';
import { generateChatReply } from '../services/aiService.js';
import { transcribeVoiceAttachment, generateTextToSpeech } from '../services/voiceService.js';
import { triggerRandomEvent } from '../utils/randomEvents.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export const name = 'messageCreate';

export const execute = async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const guildConfig = await getGuildConfig(message.guildId);
  const isBoundChannel = guildConfig.boundChannelId && guildConfig.boundChannelId === message.channel.id;
  const isMentioned = message.mentions.has(message.client.user.id);

  // If not in bound channel and not mentioned, ignore
  if (!isBoundChannel && !isMentioned) return;

  try {
    const userDoc = await getUserData(message.author.id, message.guildId);

    // 1. Sentiment Analysis & Dynamic Mood Shift
    const sentimentDelta = calculateSentimentChange(message.content);
    const updatedMoodState = updateMood(userDoc, sentimentDelta);

    // 2. React to every single message in bound channel with mood emoji
    if (isBoundChannel) {
      const emoji = getMoodReactionEmoji(updatedMoodState, message.content);
      await message.react(emoji).catch(err => logger.debug(`Failed to react with emoji: ${err.message}`));
    }

    // 3. Grant Affection XP for chatting
    const xpResult = addXp(userDoc, 10);
    if (xpResult.leveledUp) {
      message.channel.send(`🎊 **LEVEL UP!** <@${message.author.id}>, your relationship with Aura grew to **Level ${xpResult.newLevel}**! 💕`).catch(() => {});
    }

    // 4. Daily Task Auto-Completion Check
    if (userDoc.currentDailyTask && !userDoc.currentDailyTask.completed) {
      const text = message.content.toLowerCase();
      let taskCompleted = false;

      if (userDoc.currentDailyTask.id === 'greet' && (text.includes('good morning') || text.includes('goodnight') || text.includes('good night'))) {
        taskCompleted = true;
      } else if (userDoc.currentDailyTask.id === 'compliment' && (text.includes('pretty') || text.includes('cute') || text.includes('beautiful') || text.includes('love you'))) {
        taskCompleted = true;
      }

      if (taskCompleted) {
        userDoc.currentDailyTask.completed = true;
        addXp(userDoc, userDoc.currentDailyTask.xpReward);
        message.channel.send(`✅ **Daily Task Completed!** <@${message.author.id}> earned **+${userDoc.currentDailyTask.xpReward} XP** for completing today's task! 🌟`).catch(() => {});
      }
    }

    await saveUserData(userDoc);

    // 5. Handle Voice Messages (Audio attachments)
    const audioAttachment = message.attachments.find(att =>
      att.contentType?.startsWith('audio/') ||
      att.name?.endsWith('.ogg') ||
      att.name?.endsWith('.mp3') ||
      att.name?.endsWith('.wav') ||
      att.name?.endsWith('.m4a')
    );

    if (audioAttachment) {
      message.channel.sendTyping().catch(() => {});
      try {
        const transcribedText = await transcribeVoiceAttachment(audioAttachment.url);
        message.reply(`🎤 *[Voice Transcription]* "${transcribedText}"`).catch(() => {});

        const aiTextReply = await generateChatReply(message.member?.displayName || message.author.username, transcribedText, userDoc);
        await saveUserData(userDoc);

        const ttsAudio = await generateTextToSpeech(aiTextReply);

        if (ttsAudio) {
          await message.reply({ content: aiTextReply, files: [ttsAudio] });
        } else {
          await message.reply(aiTextReply);
        }
        return;
      } catch (voiceErr) {
        logger.error('Voice processing error:', voiceErr);
        await message.reply("🎤 I heard your voice message, but I had trouble decoding the audio! Tell me in text? 💕");
        return;
      }
    }

    // 6. Natural Chat Decision: reply if mentioned OR 20% random chance (1 in 5)
    const shouldReply = isMentioned || (isBoundChannel && Math.random() < config.randomChatChance);

    if (shouldReply) {
      await message.channel.sendTyping().catch(() => {});
      const cleanUserText = message.content.replace(/<@!?\d+>/g, '').trim() || 'Hello!';
      const aiReply = await generateChatReply(message.member?.displayName || message.author.username, cleanUserText, userDoc);
      await saveUserData(userDoc);
      await message.reply(aiReply);
    }

    // 7. Spontaneous Random Event Trigger (5% chance)
    if (isBoundChannel && Math.random() < config.randomEventChance) {
      setTimeout(() => {
        triggerRandomEvent(message.channel);
      }, 5000);
    }

  } catch (error) {
    logger.error('Error handling messageCreate event:', error);
  }
};
