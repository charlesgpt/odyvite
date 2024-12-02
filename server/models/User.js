const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  totalBets: {
    type: Number,
    required: true
  },
  wins: {
    type: Number,
    required: true
  },
  losses: {
    type: Number,
    required: true
  },
  totalWon: {
    type: Number,
    required: true
  },
  totalLost: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const referralSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const questSchema = new mongoose.Schema({
  questId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  reward: {
    type: Number,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 100 // Starting balance
  },
  totalPoints: {
    type: Number,
    default: 0 // Total points for leaderboard
  },
  rank: {
    type: Number,
    default: 0 // Current rank in leaderboard
  },
  gameHistory: [gameHistorySchema],
  // Referral system fields
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referrals: [referralSchema],
  referredBy: {
    type: String,
    default: null
  },
  // Quest system fields
  quests: [questSchema],
  // Social connections
  twitter: String,
  telegram: String,
  discord: String,
  farcaster: String,
  ithacaWallet: String,
  ioWallet: String,
  // Profile
  avatar: {
    type: String,
    default: 'user-icon-1@2x.png' // Default avatar
  }
});

// Update total points before saving
userSchema.pre('save', function(next) {
  // Calculate total points from balance and other sources
  this.totalPoints = this.balance;
  next();
});

module.exports = mongoose.model('User', userSchema);
