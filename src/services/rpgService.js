/**
 * RPG & Relationship Leveling System
 */

// XP required per level formula: Level * 100
export const getXpForNextLevel = (level) => level * 100;

export const addXp = (userDoc, amount) => {
  userDoc.xp = (userDoc.xp || 0) + amount;
  let nextLevelXp = getXpForNextLevel(userDoc.level || 1);
  let leveledUp = false;

  while (userDoc.xp >= nextLevelXp) {
    userDoc.xp -= nextLevelXp;
    userDoc.level = (userDoc.level || 1) + 1;
    nextLevelXp = getXpForNextLevel(userDoc.level);
    leveledUp = true;
  }

  return { leveledUp, newLevel: userDoc.level, currentXp: userDoc.xp };
};

export const getRelationshipTitle = (level) => {
  if (level >= 15) return '👑 Soulmate & Forever Partner';
  if (level >= 10) return '💖 Intimate & Devoted Girlfriend';
  if (level >= 7) return '🥰 Loving Girlfriend';
  if (level >= 5) return 'Flirty Close Friend';
  if (level >= 3) return '😊 Warm Acquaintance';
  return '🌱 Shy New Connection';
};

export const DAILY_QUIZZES = [
  {
    question: "What is my absolute favorite way to spend a cozy evening with you?",
    options: [
      "Watching anime wrapped under a warm blanket 🍿",
      "Going to a loud rock concert 🎸",
      "Doing heavy math homework 📚",
      "Cleaning the whole house 🧹"
    ],
    correctAnswer: 0,
    xpReward: 100
  },
  {
    question: "If I cooked breakfast for you in bed, what sweet treat would I bring?",
    options: [
      "Heart-shaped fluffy pancakes with strawberry syrup 🥞",
      "Plain cold bread crusts 🍞",
      "Super spicy ghost pepper chili 🌶️",
      "Raw onions 🧅"
    ],
    correctAnswer: 0,
    xpReward: 100
  },
  {
    question: "What makes my mood state go up the fastest?",
    options: [
      "Sweet compliments & heartfelt chat 💕",
      "Ignoring me for 3 days straight 😶",
      "Using mean words 😤",
      "Spamming random numbers 🔢"
    ],
    correctAnswer: 0,
    xpReward: 100
  },
  {
    question: "Which stargazing spot sounds the most romantic for our virtual date?",
    options: [
      "A peaceful grassy hill under a starry midnight sky 🌌",
      "Inside a noisy crowded subway car 🚆",
      "A dark smelly basement 🏚️",
      "Next to a loud construction site 🏗️"
    ],
    correctAnswer: 0,
    xpReward: 100
  }
];

export const DAILY_TASKS = [
  { id: 'greet', description: 'Say a sweet "Good Morning" or "Good Night" to her in chat! 🌅', xpReward: 75 },
  { id: 'compliment', description: 'Give her a cute compliment (e.g. "You look pretty today") 💖', xpReward: 80 },
  { id: 'minigame', description: 'Play a mini-game with her using /rps or /guess 🎮', xpReward: 90 },
  { id: 'hug', description: 'Give her a warm hug using /hug 🫂', xpReward: 70 }
];

export const getRandomDailyTask = () => {
  return DAILY_TASKS[Math.floor(Math.random() * DAILY_TASKS.length)];
};
