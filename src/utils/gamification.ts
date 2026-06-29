export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserActivity {
  reportsCount: number;
  upvotesCount: number;
  resolveVotesCount: number;
  points: number;
  earnedBadges: string[];
}

export interface UserStats extends UserActivity {
  level: number;
  levelName: string;
  xpNeededForNextLevel: number;
  currentLevelMinXP: number;
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_report',
    name: 'First Pulse',
    description: 'Reported your first community issue',
    icon: '🌟',
    color: '#00f0ff' // neon cyan
  },
  {
    id: 'active_upvoter',
    name: 'Community Advocate',
    description: 'Upvoted 5 or more neighborhood issues',
    icon: '👍',
    color: '#05ffc5' // neon emerald
  },
  {
    id: 'trusted_validator',
    name: 'City Inspector',
    description: 'Voted on 3 or more resolution verifications',
    icon: '🛡️',
    color: '#ffaa00' // amber
  },
  {
    id: 'hero_status',
    name: 'Neighborhood Hero',
    description: 'Earned 250 XP or more (Level 3+)',
    icon: '👑',
    color: '#ff416c' // crimson
  }
];

export function calculateLevel(points: number): { level: number; levelName: string; xpNeededForNextLevel: number; currentLevelMinXP: number } {
  if (points < 100) {
    return { level: 1, levelName: "Novice Citizen", xpNeededForNextLevel: 100, currentLevelMinXP: 0 };
  }
  if (points < 250) {
    return { level: 2, levelName: "Local Watchdog", xpNeededForNextLevel: 250, currentLevelMinXP: 100 };
  }
  if (points < 500) {
    return { level: 3, levelName: "Active Vigilant", xpNeededForNextLevel: 500, currentLevelMinXP: 250 };
  }
  if (points < 800) {
    return { level: 4, levelName: "City Guardian", xpNeededForNextLevel: 800, currentLevelMinXP: 500 };
  }
  return { level: 5, levelName: "Neighborhood Hero", xpNeededForNextLevel: 800, currentLevelMinXP: 800 }; // max level cap for display
}

const LOCAL_STORAGE_PREFIX = 'civicpulse_gamification_';

export function getUserActivity(userId: string): UserActivity {
  if (typeof window === 'undefined') {
    return { reportsCount: 0, upvotesCount: 0, resolveVotesCount: 0, points: 0, earnedBadges: [] };
  }
  
  const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    return { reportsCount: 0, upvotesCount: 0, resolveVotesCount: 0, points: 0, earnedBadges: [] };
  }

  try {
    return JSON.parse(stored) as UserActivity;
  } catch (e) {
    console.error("Error parsing gamification data:", e);
    return { reportsCount: 0, upvotesCount: 0, resolveVotesCount: 0, points: 0, earnedBadges: [] };
  }
}

export function saveUserActivity(userId: string, activity: UserActivity): void {
  if (typeof window === 'undefined') return;
  const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
  localStorage.setItem(key, JSON.stringify(activity));
}

export function getUserStats(userId: string): UserStats {
  const activity = getUserActivity(userId);
  const lvlInfo = calculateLevel(activity.points);
  return {
    ...activity,
    ...lvlInfo
  };
}

// Internal badge checker
function checkBadges(activity: UserActivity): Badge | null {
  const currentBadges = [...activity.earnedBadges];
  let newlyUnlocked: Badge | null = null;

  // 1. First Pulse badge
  if (activity.reportsCount >= 1 && !currentBadges.includes('first_report')) {
    activity.earnedBadges.push('first_report');
    newlyUnlocked = ALL_BADGES.find(b => b.id === 'first_report') || null;
  }

  // 2. Community Advocate badge
  if (activity.upvotesCount >= 5 && !currentBadges.includes('active_upvoter')) {
    activity.earnedBadges.push('active_upvoter');
    newlyUnlocked = ALL_BADGES.find(b => b.id === 'active_upvoter') || null;
  }

  // 3. City Inspector badge
  if (activity.resolveVotesCount >= 3 && !currentBadges.includes('trusted_validator')) {
    activity.earnedBadges.push('trusted_validator');
    newlyUnlocked = ALL_BADGES.find(b => b.id === 'trusted_validator') || null;
  }

  // 4. Neighborhood Hero badge
  if (activity.points >= 250 && !currentBadges.includes('hero_status')) {
    activity.earnedBadges.push('hero_status');
    newlyUnlocked = ALL_BADGES.find(b => b.id === 'hero_status') || null;
  }

  return newlyUnlocked;
}

export function handleReportAction(userId: string): { stats: UserStats; unlockedBadge: Badge | null } {
  const activity = getUserActivity(userId);
  activity.reportsCount += 1;
  activity.points += 20;

  const unlockedBadge = checkBadges(activity);
  saveUserActivity(userId, activity);

  return {
    stats: { ...activity, ...calculateLevel(activity.points) },
    unlockedBadge
  };
}

export function handleUpvoteAction(userId: string, isUpvoted: boolean): { stats: UserStats; unlockedBadge: Badge | null } {
  const activity = getUserActivity(userId);
  
  if (isUpvoted) {
    activity.upvotesCount += 1;
    activity.points += 5;
  } else {
    activity.upvotesCount = Math.max(0, activity.upvotesCount - 1);
    activity.points = Math.max(0, activity.points - 5);
  }

  const unlockedBadge = checkBadges(activity);
  saveUserActivity(userId, activity);

  return {
    stats: { ...activity, ...calculateLevel(activity.points) },
    unlockedBadge
  };
}

export function handleResolveAction(userId: string, isVoted: boolean): { stats: UserStats; unlockedBadge: Badge | null } {
  const activity = getUserActivity(userId);

  if (isVoted) {
    activity.resolveVotesCount += 1;
    activity.points += 10;
  } else {
    activity.resolveVotesCount = Math.max(0, activity.resolveVotesCount - 1);
    activity.points = Math.max(0, activity.points - 10);
  }

  const unlockedBadge = checkBadges(activity);
  saveUserActivity(userId, activity);

  return {
    stats: { ...activity, ...calculateLevel(activity.points) },
    unlockedBadge
  };
}
