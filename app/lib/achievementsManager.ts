'use client';

import { Achievement, UserStats } from './types';

class AchievementsManager {
  private readonly STORAGE_KEY = 'nidam_achievements';
  private achievements: Achievement[] = [
    {
      id: 'daily_visitor',
      name: 'Daily Visitor',
      description: 'Log in 7 days in a row',
      icon: '📅',
      category: 'usage',
      requirement: 7,
      progress: 0,
      unlocked: false
    },
    {
      id: 'wordsmith',
      name: 'Wordsmith',
      description: 'Generate 10,000 words of content',
      icon: '✍️',
      category: 'performance',
      requirement: 10000,
      progress: 0,
      unlocked: false
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Share 5 conversations with peers',
      icon: '🦋',
      category: 'social',
      requirement: 5,
      progress: 0,
      unlocked: false
    },
    {
      id: 'power_user',
      name: 'Power User',
      description: 'Send 100 messages',
      icon: '⚡',
      category: 'usage',
      requirement: 100,
      progress: 0,
      unlocked: false
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Use N.I.D.A.M after midnight',
      icon: '🦉',
      category: 'usage',
      requirement: 1,
      progress: 0,
      unlocked: false
    }
  ];

  private stats: UserStats = {
    totalMessages: 0,
    dailyLogins: 0,
    consecutiveLogins: 0,
    lastLoginDate: '',
    totalTokensGenerated: 0,
    totalConversationsShared: 0,
    achievements: this.achievements
  };

  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.loadStats();
      this.checkDailyLogin();
    }
  }

  private loadStats() {
    if (this.isClient) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.stats = JSON.parse(saved);
      }
    }
  }

  private saveStats() {
    if (this.isClient) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
    }
  }

  private checkDailyLogin() {
    if (!this.isClient) return;

    const today = new Date().toDateString();
    if (this.stats.lastLoginDate !== today) {
      this.stats.dailyLogins++;
      if (this.isConsecutiveDay(this.stats.lastLoginDate)) {
        this.stats.consecutiveLogins++;
      } else {
        this.stats.consecutiveLogins = 1;
      }
      this.stats.lastLoginDate = today;
      this.checkAchievements();
      this.saveStats();
    }
  }

  private isConsecutiveDay(lastDate: string): boolean {
    if (!lastDate) return false;
    const last = new Date(lastDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  public trackMessage() {
    if (!this.isClient) return;
    
    this.stats.totalMessages++;
    this.checkAchievements();
    this.saveStats();
  }

  public trackSharedConversation() {
    if (!this.isClient) return;
    
    this.stats.totalConversationsShared++;
    this.checkAchievements();
    this.saveStats();
  }

  public trackTokensGenerated(tokens: number) {
    if (!this.isClient) return;
    
    this.stats.totalTokensGenerated += tokens;
    this.checkAchievements();
    this.saveStats();
  }

  private checkAchievements() {
    if (!this.isClient) return;

    let newUnlocks = false;

    this.stats.achievements = this.stats.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let progress = 0;
      switch (achievement.id) {
        case 'daily_visitor':
          progress = this.stats.consecutiveLogins;
          break;
        case 'wordsmith':
          progress = this.stats.totalTokensGenerated;
          break;
        case 'social_butterfly':
          progress = this.stats.totalConversationsShared;
          break;
        case 'power_user':
          progress = this.stats.totalMessages;
          break;
        case 'night_owl':
          progress = new Date().getHours() >= 0 && new Date().getHours() < 5 ? 1 : 0;
          break;
      }

      const updatedAchievement = {
        ...achievement,
        progress,
        unlocked: progress >= achievement.requirement
      };

      if (updatedAchievement.unlocked && !achievement.unlocked) {
        updatedAchievement.unlockedAt = Date.now();
        newUnlocks = true;
        this.notifyAchievement(updatedAchievement);
      }

      return updatedAchievement;
    });

    if (newUnlocks) {
      this.saveStats();
    }
  }

  private notifyAchievement(achievement: Achievement) {
    if (!this.isClient) return;

    const event = new CustomEvent('achievementUnlocked', {
      detail: achievement
    });
    window.dispatchEvent(event);
  }

  public getStats(): UserStats {
    return this.stats;
  }

  public getAchievements(): Achievement[] {
    return this.stats.achievements;
  }
}

// Create instance only on client-side
let achievementsManager: AchievementsManager;

if (typeof window !== 'undefined') {
  achievementsManager = new AchievementsManager();
} else {
  // Provide a dummy instance for SSR
  achievementsManager = {
    trackMessage: () => {},
    trackSharedConversation: () => {},
    trackTokensGenerated: () => {},
    getStats: () => ({
      totalMessages: 0,
      dailyLogins: 0,
      consecutiveLogins: 0,
      lastLoginDate: '',
      totalTokensGenerated: 0,
      totalConversationsShared: 0,
      achievements: []
    }),
    getAchievements: () => []
  } as AchievementsManager;
}

export { achievementsManager };
