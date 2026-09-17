import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  moodScore: { type: Number, default: 50 }, // 0 to 100 scale (0 = Angry, 25 = Annoyed, 50 = Neutral, 75 = Happy, 100 = Ecstatic)
  moodState: { type: String, enum: ['ANGRY', 'ANNOYED', 'NEUTRAL', 'HAPPY', 'ECSTATIC'], default: 'NEUTRAL' },
  memories: [
    {
      key: String,
      value: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  conversationHistory: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastDailyQuiz: { type: Date, default: null },
  lastDailyTask: { type: Date, default: null },
  currentDailyTask: {
    id: String,
    description: String,
    xpReward: Number,
    completed: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.index({ userId: 1, guildId: 1 }, { unique: true });

const UserModel = mongoose.model('User', UserSchema);

// In-memory fallback storage if MongoDB is unavailable
const memoryFallbackUsers = new Map();

const getFallbackKey = (userId, guildId) => `${guildId}:${userId}`;

export const getUserData = async (userId, guildId) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let user = await UserModel.findOne({ userId, guildId });
      if (!user) {
        user = await UserModel.create({ userId, guildId });
      }
      return user;
    }
  } catch (err) {
    // Fallback to in-memory store
  }

  const key = getFallbackKey(userId, guildId);
  if (!memoryFallbackUsers.has(key)) {
    memoryFallbackUsers.set(key, {
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

export const saveUserData = async (userDoc) => {
  try {
    if (mongoose.connection.readyState === 1 && typeof userDoc.save === 'function') {
      userDoc.updatedAt = new Date();
      return await userDoc.save();
    }
  } catch (err) {
    // Handle fallback save
  }
  return userDoc;
};

export { UserModel };
