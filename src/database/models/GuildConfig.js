import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '../connect.js';
import { logger } from '../../utils/logger.js';

// In-memory fallback
const memoryFallbackGuilds = new Map();

export const getGuildConfig = async (guildId) => {
  const db = getDb();

  if (db) {
    try {
      const guildRef = doc(db, 'guilds', guildId);
      const guildSnap = await getDoc(guildRef);

      if (guildSnap.exists()) {
        const data = guildSnap.data();
        data._guildId = guildId;
        data.boundChannelId = data.boundChannelId || null;
        data.emojiquizChannelId = data.emojiquizChannelId || null;
        data.antonymquizChannelId = data.antonymquizChannelId || null;
        data.countingChannelId = data.countingChannelId || null;
        data.currentCountingNumber = data.currentCountingNumber || 0;
        data.lastCountingUserId = data.lastCountingUserId || null;
        data.language = data.language || 'en';
        data.save = async function () {
          return await saveGuildConfig(this);
        };
        return data;
      } else {
        const newConfig = {
          _guildId: guildId,
          guildId,
          boundChannelId: null,
          emojiquizChannelId: null,
          antonymquizChannelId: null,
          countingChannelId: null,
          currentCountingNumber: 0,
          lastCountingUserId: null,
          language: 'en',
          updatedAt: new Date().toISOString()
        };
        newConfig.save = async function () {
          return await saveGuildConfig(this);
        };
        await saveGuildConfig(newConfig);
        return newConfig;
      }
    } catch (err) {
      logger.warn(`Firestore read failed for guild ${guildId}: ${err.message}`);
    }
  }

  if (!memoryFallbackGuilds.has(guildId)) {
    memoryFallbackGuilds.set(guildId, {
      _guildId: guildId,
      guildId,
      boundChannelId: null,
      emojiquizChannelId: null,
      antonymquizChannelId: null,
      countingChannelId: null,
      currentCountingNumber: 0,
      lastCountingUserId: null,
      language: 'en',
      save: async function () { return this; }
    });
  }
  const config = memoryFallbackGuilds.get(guildId);
  if (config.currentCountingNumber === undefined) config.currentCountingNumber = 0;
  if (config.language === undefined) config.language = 'en';
  return config;
};

export const saveGuildConfig = async (guildConfig) => {
  const db = getDb();

  if (db && guildConfig.guildId) {
    try {
      const guildRef = doc(db, 'guilds', guildConfig.guildId);
      const dataToSave = { ...guildConfig };
      delete dataToSave._guildId;
      delete dataToSave.save;
      dataToSave.updatedAt = new Date().toISOString();

      await setDoc(guildRef, dataToSave, { merge: true });
    } catch (err) {
      logger.warn(`Firestore save failed for guild ${guildConfig.guildId}: ${err.message}`);
    }
  }
  return guildConfig;
};

export const setBoundChannel = async (guildId, channelId) => {
  const guildConfig = await getGuildConfig(guildId);
  guildConfig.boundChannelId = channelId;
  await saveGuildConfig(guildConfig);
  return guildConfig;
};
