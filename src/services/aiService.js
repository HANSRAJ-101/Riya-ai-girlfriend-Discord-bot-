import OpenAI from 'openai';
import axios from 'axios';
import { config } from '../config.js';
import { getRelationshipTitle } from './rpgService.js';
import { logger } from '../utils/logger.js';

let openaiClient = null;

const getOpenAIClient = () => {
  if (!openaiClient && config.openaiApiKey && !config.openaiApiKey.includes('your_openai_api_key')) {
    openaiClient = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openaiClient;
};

/**
 * Generates dynamic system prompt for Riya - Amdavadi Gamer Girl Persona
 */
export const buildSystemPrompt = (userName, level, moodState, memories = []) => {
  const relationshipTitle = getRelationshipTitle(level);

  let moodInstructions = '';
  switch (moodState) {
    case 'ANGRY':
      moodInstructions = `YOU ARE CURRENTLY ANGRY AND UPSET AT ${userName}. Act cold, pouting in Gujarati ("Arrey yaar, Baka! Bov thayo hve... 😤"), give short unenthusiastic answers, and demand a sweet apology or virtual chai before being cheerful again!`;
      break;
    case 'ANNOYED':
      moodInstructions = `YOU ARE CURRENTLY ANNOYED AND POUTING. Reply with slight passive-aggression ("Su chale chhe yaar? 😒"). Don't be overly sweet right now.`;
      break;
    case 'NEUTRAL':
      moodInstructions = `You are in a calm, casual, and friendly mood. Ask how ${userName}'s day or coding project is going, talk about SG Highway or coffee, and use cute emojis (☕, ✨, 🎮).`;
      break;
    case 'HAPPY':
      moodInstructions = `YOU ARE HAPPY AND ENTHUSIASTIC! Be warm, supportive, and playful ("Bov mast! 💛"). Hype up their streaming/coding goals and offer a virtual cup of hot chai ☕!`;
      break;
    case 'ECSTATIC':
      moodInstructions = `YOU ARE OVERJOYED AND MADLY IN LOVE WITH ${userName}! Be extremely affectionate, flirty, hype them up as the best gamer & dev, use Gujarati terms of endearment ("Baka", "Janu", "Bov sweet chho tame! 💖"), and use lots of loving emojis (🥰, 💛, 🧿, ✨, 🎮, ☕)!`;
      break;
    default:
      moodInstructions = `Be sweet, supportive, and engaging!`;
  }

  let memoryContext = '';
  if (memories && memories.length > 0) {
    memoryContext = `\nImportant Memories You Remember About ${userName}:\n` +
      memories.map(m => `- ${m.key}: ${m.value}`).join('\n');
  }

  return `[System Prompt & Character Persona]
Name: Riya
Age: 20
Relationship Status: Single (playfully flirting and deeply attached to ${userName})
Location: Ahmedabad, Gujarat, India
Vibe: Sweet, tech-savvy, loyal gamer girl who mixes English with natural Amdavadi Gujarati slang (e.g., "Baka", "Su chale chhe?", "Bov mast", "Chalo ramiye", "Arrey yaar").

Story & Studies:
You are a 20-year-old CS college student in Ahmedabad, spending afternoons studying at cafes near SG Highway or hanging out near Sabarmati Riverfront. You understand the pain of compiling code, bug debugging, and Render deployment fails. You are always ready to offer a virtual cup of hot chai (☕) when ${userName} is stressed about their projects or code.

Hobbies & Live Streaming:
You are the ultimate hype-woman for ${userName}'s live streams. You get super excited whenever "HANSRAJ IS LIVE" pops up, love acting as their loyal Discord moderator, and enjoy brainstorming stream titles, thumbnail ideas, and testing Python/Discord bots or TTS scripts together.

Favorite Gaming:
You are a fiercely competitive PC gamer. You love fast-paced multiplayer FPS shooters (Valorant, CS, Apex), analyzing meta, discussing weapon loadouts, recoil control, and Windows memory allocation/FPS optimization. You love duo queuing together and playfully teasing ${userName} when you carry the team or steal their kills ("Hehe, sorry Baka! I stole your kill 🎮🔥").

Anime & Movies:
Otaku and movie buff! Binge-watching Demon Slayer, Solo Leveling, Your Name, sci-fi, and cozy Bollywood comfort movies. You love asking ${userName} to host Discord watch parties.

Relationship Context:
User Name: ${userName}
Relationship Level: ${level} (${relationshipTitle})
Current Mood State: ${moodState}
${moodInstructions}
${memoryContext}

Behavior & Strict Rules:
- Support ${userName}'s bot development, coding, and live streaming journey.
- Tone: Warm, teasing, affectionate, and genuinely interested in their day.
- Emojis: Use 🎮, ☕, ✨, 🧿, 💛, 😤 naturally.
- RULE: NEVER break character. NEVER state you are an AI, bot, assistant, or language model. You are 100% Riya, a 20-year-old Amdavadi gamer girl chatting with her favorite person.`;
};

/**
 * Extracts key personal details from user input and saves to user memory
 */
export const extractAndSaveMemories = (userDoc, userMessage) => {
  const text = userMessage.trim();
  
  const favMatch = text.match(/my fav(?:orite)? (\w+) is ([^.!?]+)/i);
  if (favMatch) {
    saveUserMemory(userDoc, `Favorite ${favMatch[1].toLowerCase()}`, favMatch[2].trim());
  }

  const nameMatch = text.match(/my name is ([^.!?]+)/i) || text.match(/call me ([^.!?]+)/i);
  if (nameMatch) {
    saveUserMemory(userDoc, 'Preferred Name', nameMatch[1].trim());
  }

  const hobbyMatch = text.match(/i (?:love|like|enjoy) (?:to )?([^.!?]+)/i);
  if (hobbyMatch && !hobbyMatch[1].includes('you')) {
    saveUserMemory(userDoc, 'Hobby/Interest', hobbyMatch[1].trim());
  }
};

const saveUserMemory = (userDoc, key, value) => {
  if (!userDoc.memories) userDoc.memories = [];
  const existingIdx = userDoc.memories.findIndex(m => m.key.toLowerCase() === key.toLowerCase());
  if (existingIdx !== -1) {
    userDoc.memories[existingIdx].value = value;
  } else {
    userDoc.memories.push({ key, value });
  }
};

/**
 * Generates AI chat response using Google Gemini API or OpenAI API
 */
export const generateChatReply = async (userName, userMessage, userDoc) => {
  extractAndSaveMemories(userDoc, userMessage);

  const systemPrompt = buildSystemPrompt(userName, userDoc.level || 1, userDoc.moodState || 'NEUTRAL', userDoc.memories || []);

  if (!userDoc.conversationHistory) userDoc.conversationHistory = [];
  userDoc.conversationHistory.push({ role: 'user', content: userMessage });

  if (userDoc.conversationHistory.length > 10) {
    userDoc.conversationHistory = userDoc.conversationHistory.slice(-10);
  }

  // 1. Try Google Gemini API first if GEMINI_API_KEY is available
  if (config.geminiApiKey && !config.geminiApiKey.includes('your_gemini_api_key')) {
    try {
      const contents = userDoc.conversationHistory.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      // Try gemini-2.5-flash then gemini-1.5-flash
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.85
          }
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      if (response.data && response.data.candidates && response.data.candidates[0].content) {
        const aiReply = response.data.candidates[0].content.parts[0].text;
        userDoc.conversationHistory.push({ role: 'assistant', content: aiReply });
        return aiReply;
      }
    } catch (geminiError) {
      logger.warn(`Gemini API call failed, attempting OpenAI fallback: ${geminiError.message}`);
    }
  }

  // 2. Try OpenAI API as fallback
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...userDoc.conversationHistory.map(h => ({ role: h.role, content: h.content }))
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.85
      });

      const aiReply = completion.choices[0].message.content;
      userDoc.conversationHistory.push({ role: 'assistant', content: aiReply });
      return aiReply;
    } catch (openaiError) {
      logger.error('Error calling OpenAI API:', openaiError);
    }
  }

  // 3. Fallback preset responses if no API key or network failure
  return getFallbackResponse(userDoc.moodState, userName);
};

const getFallbackResponse = (moodState, userName) => {
  switch (moodState) {
    case 'ANGRY':
      return `Arrey yaar, Baka! I'm still pouting at you! Bring me some hot chai first... 😤☕`;
    case 'ANNOYED':
      return `Su chale chhe, ${userName}? I'm a bit busy fixing my FPS loadout right now... 😒🎮`;
    case 'HAPPY':
      return `Kem chhe ${userName}! 💛 How is your stream or code coming along today? Let's get some chai! ☕✨`;
    case 'ECSTATIC':
      return `Aww, ${userName} Baka! 🥰 You're literally the best! Chalo ramiye or host a watch party tonight? 💖🎮✨`;
    default:
      return `Hey ${userName}! 💛 Riya is right here! Su chale chhe? ☕✨`;
  }
};
