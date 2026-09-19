import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '../connect.js';
import { logger } from '../../utils/logger.js';

const memoryFallbackGangs = new Map();

export const getGangData = async (gangId) => {
  const db = getDb();

  if (db) {
    try {
      const gangRef = doc(db, 'gangs', gangId);
      const gangSnap = await getDoc(gangRef);

      if (gangSnap.exists()) {
        const data = gangSnap.data();
        data._gangId = gangId;
        data.save = async function () {
          return await saveGangData(this);
        };
        return data;
      }
    } catch (err) {
      logger.warn(`Firestore read failed for gang ${gangId}: ${err.message}`);
    }
  }

  if (memoryFallbackGangs.has(gangId)) {
    return memoryFallbackGangs.get(gangId);
  }
  return null;
};

export const createGangData = async (gangId, name, ownerId) => {
  const gang = {
    _gangId: gangId,
    gangId,
    name,
    ownerId,
    members: [{ userId: ownerId, rank: 'Leader' }],
    vault: 0,
    isOpen: false,
    createdAt: new Date().toISOString()
  };
  gang.save = async function () {
    return await saveGangData(this);
  };
  await saveGangData(gang);
  return gang;
};

export const saveGangData = async (gangData) => {
  const db = getDb();
  memoryFallbackGangs.set(gangData.gangId, gangData);

  if (db && gangData.gangId) {
    try {
      const gangRef = doc(db, 'gangs', gangData.gangId);
      const dataToSave = { ...gangData };
      delete dataToSave._gangId;
      delete dataToSave.save;

      await setDoc(gangRef, dataToSave, { merge: true });
    } catch (err) {
      logger.warn(`Firestore save failed for gang ${gangData.gangId}: ${err.message}`);
    }
  }
  return gangData;
};
