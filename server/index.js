require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Connect to MongoDB

// Get leaderboard
app.get('/api/users/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, {
      username: 1,
      balance: 1,
      _id: 0
    }).sort({ balance: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odyfate')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Default quests configuration
const DEFAULT_QUESTS = [
  {
    questId: 'twitter_follow',
    name: 'Follow us on X (Twitter)',
    reward: 1000,
    link: 'https://x.com/IthacaProtocol'
  },
  {
    questId: 'telegram_follow',
    name: 'Follow us on Telegram',
    reward: 400,
    link: 'https://t.me/ithaca_protocol'
  },
  {
    questId: 'discord_join',
    name: 'Join Our Discord',
    reward: 350,
    link: 'https://discord.gg/ithaca'
  },
  {
    questId: 'farcaster_follow',
    name: 'Follow us on Farcaster',
    reward: 250,
    link: 'https://warpcast.com/ithacaprotocol/'
  },
  {
    questId: 'ithaca_wallet',
    name: 'Connect Wallet on Ithaca App',
    reward: 3000,
    link: 'https://app.ithacaprotocol.io/'
  },
  {
    questId: 'io_wallet',
    name: 'Connect Wallet on IO Bot',
    reward: 300
  },
  {
    questId: 'twitter_engage',
    name: 'X Post - Like comment Rt',
    reward: 300
  }
];

// Get user data
app.get('/api/user/:username', async (req, res) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({ 
        username: req.params.username,
        balance: 100, // Starting balance
        referralCode: generateReferralCode(), // Generate unique referral code
        referralCount: 0,
        referrals: [],
        // Initialize quests
        quests: DEFAULT_QUESTS.map(quest => ({
          ...quest,
          completed: false,
          completedAt: null
        }))
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user balance
app.post('/api/user/update-balance', async (req, res) => {
  try {
    const { username, balance } = req.body;
    const user = await User.findOneAndUpdate(
      { username },
      { balance },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save game stats
app.post('/api/stats/save', async (req, res) => {
  try {
    const { username, stats } = req.body;
    const user = await User.findOneAndUpdate(
      { username },
      { 
        $push: { 
          gameHistory: {
            totalBets: stats.totalBets,
            wins: stats.wins,
            losses: stats.losses,
            totalWon: stats.totalWon,
            totalLost: stats.totalLost,
            date: new Date()
          }
        }
      },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
app.get('/api/stats/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.gameHistory || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Roll dice endpoint
app.post('/api/roll-dice', async (req, res) => {
  try {
    const markets = ['bull-market.html', 'choppy.html', 'bear.html'];
    const randomMarket = markets[Math.floor(Math.random() * markets.length)];
    res.json({ market: randomMarket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's referral data
app.get('/api/referral/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      code: user.referralCode,
      count: user.referralCount,
      referrals: user.referrals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process new referral
app.post('/api/referral/process', async (req, res) => {
  try {
    const { referrerCode, newUser } = req.body;
    
    // Find referrer by their code
    const referrer = await User.findOne({ referralCode: referrerCode });
    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Check if user already exists
    let user = await User.findOne({ username: newUser });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = await User.create({
      username: newUser,
      balance: 100,
      referralCode: generateReferralCode(),
      referralCount: 0,
      referrals: [],
      referredBy: referrer.username,
      // Initialize quests
      quests: DEFAULT_QUESTS.map(quest => ({
        ...quest,
        completed: false,
        completedAt: null
      }))
    });

    // Update referrer
    const REFERRAL_REWARD = 300;
    await User.findOneAndUpdate(
      { username: referrer.username },
      { 
        $inc: { 
          balance: REFERRAL_REWARD,
          referralCount: 1
        },
        $push: { 
          referrals: {
            username: newUser,
            date: new Date()
          }
        }
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's quests
app.get('/api/quests/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.quests || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete quest
app.post('/api/quests/complete', async (req, res) => {
  try {
    const { username, questId, socialData } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the quest
    const questIndex = user.quests.findIndex(q => q.questId === questId);
    if (questIndex === -1) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if quest is already completed
    if (user.quests[questIndex].completed) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Update social data based on quest type
    const updates = {
      $set: {
        [`quests.${questIndex}.completed`]: true,
        [`quests.${questIndex}.completedAt`]: new Date()
      }
    };

    // Add social connection data if provided
    if (socialData) {
      switch (questId) {
        case 'twitter_follow':
          updates.$set.twitter = socialData;
          break;
        case 'telegram_follow':
          updates.$set.telegram = socialData;
          break;
        case 'discord_join':
          updates.$set.discord = socialData;
          break;
        case 'farcaster_follow':
          updates.$set.farcaster = socialData;
          break;
        case 'ithaca_wallet':
          updates.$set.ithacaWallet = socialData;
          break;
        case 'io_wallet':
          updates.$set.ioWallet = socialData;
          break;
      }
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { username },
      updates,
      { new: true }
    );

    res.json(updatedUser.quests[questIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim quest reward
app.post('/api/quests/claim', async (req, res) => {
  try {
    const { username, questId } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the quest
    const quest = user.quests.find(q => q.questId === questId);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if quest is completed
    if (!quest.completed) {
      return res.status(400).json({ error: 'Quest not completed' });
    }

    // Update user balance
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $inc: { balance: quest.reward } },
      { new: true }
    );

    res.json({
      success: true,
      newBalance: updatedUser.balance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate unique referral code
function generateReferralCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
