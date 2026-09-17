# 👩🏻‍❤️‍👩🏻 Advanced AI-Girlfriend Discord Bot (Riya - Amdavadi Gamer Girl Persona)

A production-ready, feature-rich **AI Girlfriend Discord Bot** featuring **Riya**—a 20-year-old CS student and gamer girl from Ahmedabad, India—built with **Node.js (Discord.js v14)**, **Express**, **MongoDB (Mongoose)**, **OpenAI (GPT-4o, Whisper, TTS)**, **Tenor GIF API**, and interactive Discord components.

---

## 🎭 Persona Profile: Riya
- **Name**: Riya
- **Age**: 20
- **Location**: Ahmedabad, Gujarat, India (SG Highway, Sabarmati Riverfront cafes)
- **Vibe**: Sweet, tech-savvy, loyal gamer girl who mixes English with natural Amdavadi Gujarati slang (*"Baka", "Su chale chhe?", "Bov mast", "Chalo ramiye", "Arrey yaar"*).
- **Hobbies**: Hype-woman for streams (*"HANSRAJ IS LIVE"*), Discord mod, testing Python/Discord bots & TTS scripts, competitive FPS PC gamer, Otaku (Demon Slayer, Solo Leveling, Your Name), and movie watch parties.
- **Support**: Always ready with virtual chai (☕) when code compiling fails or Render deployments crash!

---

## 📁 Project Directory Structure

```
👩🏻‍❤️‍👩🏻︱ᴀɪ-ɢɪʀʟꜰʀɪᴇɴᴅ/
├── package.json                   # Project dependencies and scripts
├── .env.example                   # Environment variable template
├── .env                           # Secret tokens (Discord, OpenAI, MongoDB, Tenor)
├── README.md                      # Complete documentation & UptimeRobot setup guide
└── src/
    ├── index.js                   # Entry point: Express server & Discord Client init
    ├── config.js                  # Environment configuration & Riya defaults loader
    ├── database/
    │   ├── connect.js             # MongoDB Mongoose connection module
    │   └── models/
    │       ├── User.js            # User Schema (XP, level, mood score/state, memories)
    │       └── GuildConfig.js     # Server Config Schema (bound channel ID)
    ├── services/
    │   ├── aiService.js           # OpenAI GPT-4o chat completions & Riya system prompt
    │   ├── voiceService.js        # OpenAI Whisper voice transcription & TTS audio reply
    │   ├── moodService.js         # Sentiment analysis & mood state machine
    │   ├── tenorService.js        # Tenor GIF API v2 search wrapper
    │   └── rpgService.js          # Relationship XP, levels, daily tasks & Riya quizzes
    ├── events/
    │   ├── ready.js               # Bot login & global slash command REST registration
    │   ├── messageCreate.js       # Auto-emoji reactions, sentiment shift, voice & AI chat
    │   └── interactionCreate.js   # Slash command & button interaction router
    ├── commands/
    │   ├── select_channel.js      # /select_channel [channel] command
    │   ├── stats.js               # /stats relationship level & mood viewer
    │   ├── daily_quiz.js          # /daily_quiz trivia mini-game for XP
    │   ├── daily_task.js          # /daily_task daily activity system
    │   ├── hug.js                 # /hug [@user] action command
    │   ├── kiss.js                # /kiss [@user] action command
    │   ├── date.js                # /date interactive text-adventure mini-date
    │   ├── rps.js                 # /rps Rock-Paper-Scissors button mini-game
    │   └── guess.js               # /guess Number guessing button mini-game
    └── utils/
        ├── logger.js              # Timestamped console logging utility
        └── randomEvents.js        # Spontaneous channel event triggers
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory:

```env
# Discord Credentials (from Discord Developer Portal)
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here

# AI Services Credentials (from OpenAI Platform & Tenor API)
OPENAI_API_KEY=your_openai_api_key_here
TENOR_API_KEY=your_tenor_api_key_here

# Database URI (MongoDB Atlas or Local MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_girlfriend?retryWrites=true&w=majority

# Express Web Server Port
PORT=3000
```

---

## 🎮 Slash Commands Overview

- `/select_channel [channel]` - Binds Riya's AI chatting, reactions, and random events to a specific channel.
- `/stats` - Displays your Relationship Level, Title, XP progress, Riya's Mood State, and saved memories.
- `/daily_quiz` - Take a daily Amdavadi gamer trivia quiz to earn bonus XP.
- `/daily_task` - Get a daily relationship task to complete in chat.
- `/hug [@user]` - Give a warm hug (with cute GIF) to Riya or another user.
- `/kiss [@user]` - Give a romantic kiss (with cute GIF) to Riya or another user.
- `/date` - Start an interactive rooftop or Riverfront date with choice buttons.
- `/rps` - Play Rock, Paper, Scissors against Riya with UI buttons.
- `/guess` - Guess Riya's secret number (1-10) with interactive buttons.

---

## 🌐 Render Hosting & UptimeRobot 24/7 Setup Guide

### 1. Deploying to Render (Free Web Service)
1. Push your repository to **GitHub**.
2. Log into [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `OPENAI_API_KEY`
   - `TENOR_API_KEY`
   - `MONGODB_URI`
   - `PORT` = `3000`
6. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g. `https://ai-girlfriend-bot.onrender.com`).

### 2. Setting Up UptimeRobot for 24/7 Uptime
1. Go to [UptimeRobot.com](https://uptimerobot.com) and create a free account.
2. Click **+ Add New Monitor**.
3. Fill out the monitor details:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `AI Girlfriend Bot (Riya)`
   - **URL (or IP)**: Enter your Render URL (e.g., `https://ai-girlfriend-bot.onrender.com/`)
   - **Monitoring Interval**: `5 minutes`
4. Click **Create Monitor**.
5. UptimeRobot will ping the Express health checker endpoint (`/`) every 5 minutes, keeping your bot online 24/7/365!
