import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '../connect.js';
import { logger } from '../../utils/logger.js';

// In-memory fallback storage if Firestore is unavailable
const memoryFallbackUsers = new Map();

const getFallbackKey = (userId, guildId) => `${guildId}:${userId}`;

export const getUserData = async (userId, guildId) => {
  const db = getDb();
  const docId = `${guildId}_${userId}`;

  if (db) {
    try {
      const userRef = doc(db, 'users', docId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        data._docId = docId;
        data.save = async function () {
          return await saveUserData(this);
        };
        return data;
      } else {
        const newUser = {
          _docId: docId,
          userId,
          guildId,
          xp: 0,
          level: 1,
          moodScore: 50,
          moodState: 'NEUTRAL',
          memories: [],
          conversationHistory: [],
          lastDailyQuiz: null,
          lastDailyTask: null,
          currentDailyTask: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newUser.save = async function () {
          return await saveUserData(this);
        };
        await saveUserData(newUser);
        return newUser;
      }
    } catch (err) {
      logger.warn(`Firestore read failed for user ${docId}. Using in-memory fallback: ${err.message}`);
    }
  }

  // Fallback to in-memory store
  const key = getFallbackKey(userId, guildId);
  if (!memoryFallbackUsers.has(key)) {
    memoryFallbackUsers.set(key, {
      _docId: docId,
      userId,
      guildId,
      xp: 0,
      level: 1,
      moodScore: 50,
      moodState: 'NEUTRAL',
      memories: [],
      conversationHistory: [],
      lastDailyQuiz: null,
      lastDailyTask: null,
      currentDailyTask: null,
      save: async function () { return this; }
    });
  }
  return memoryFallbackUsers.get(key);
};

export const saveUserData = async (userData) => {
  const db = getDb();

  if (db && userData._docId) {
    try {
      const userRef = doc(db, 'users', userData._docId);
      const dataToSave = { ...userData };
      delete dataToSave._docId;
      delete dataToSave.save;
      dataToSave.updatedAt = new Date().toISOString();

      await setDoc(userRef, dataToSave, { merge: true });
      return userData;
    } catch (err) {
      logger.warn(`Firestore save failed for user ${userData._docId}: ${err.message}`);
    }
  }
  return userData;
};
