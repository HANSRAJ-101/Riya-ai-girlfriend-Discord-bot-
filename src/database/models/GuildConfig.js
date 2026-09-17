import mongoose from 'mongoose';

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  boundChannelId: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now }
});

const GuildConfigModel = mongoose.model('GuildConfig', GuildConfigSchema);

// In-memory fallback
const memoryFallbackGuilds = new Map();

export const getGuildConfig = async (guildId) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let config = await GuildConfigModel.findOne({ guildId });
      if (!config) {
        config = await GuildConfigModel.create({ guildId });
      }
      return config;
    }
  } catch (err) {
    // Fallback
  }

  if (!memoryFallbackGuilds.has(guildId)) {
    memoryFallbackGuilds.set(guildId, {
      guildId,
      boundChannelId: null,
      save: async function () { return this; }
    });
  }
  return memoryFallbackGuilds.get(guildId);
};

export const setBoundChannel = async (guildId, channelId) => {
  const guildConfig = await getGuildConfig(guildId);
  guildConfig.boundChannelId = channelId;
  if (mongoose.connection.readyState === 1 && typeof guildConfig.save === 'function') {
    await guildConfig.save();
  }
  return guildConfig;
};

export { GuildConfigModel };
