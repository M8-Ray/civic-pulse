"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  UserStats, 
  Badge, 
  getUserStats, 
  handleReportAction, 
  handleUpvoteAction, 
  handleResolveAction 
} from '@/utils/gamification';

interface ToastData {
  amount: number;
  reason: string;
  timestamp: number;
}

interface GamificationContextType {
  stats: UserStats | null;
  pointsEarnedToast: ToastData | null;
  badgeUnlockedToast: Badge | null;
  registerReport: () => void;
  registerUpvote: (isUpvoted: boolean) => void;
  registerResolveVote: (isVoted: boolean) => void;
  clearPointsToast: () => void;
  clearBadgeToast: () => void;
}

const GamificationContext = createContext<GamificationContextType>({
  stats: null,
  pointsEarnedToast: null,
  badgeUnlockedToast: null,
  registerReport: () => {},
  registerUpvote: () => {},
  registerResolveVote: () => {},
  clearPointsToast: () => {},
  clearBadgeToast: () => {},
});

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pointsEarnedToast, setPointsEarnedToast] = useState<ToastData | null>(null);
  const [badgeUnlockedToast, setBadgeUnlockedToast] = useState<Badge | null>(null);

  // Sync stats when user authentication state changes
  useEffect(() => {
    if (user?.id) {
      setStats(getUserStats(user.id));
    } else {
      setStats(null);
    }
  }, [user]);

  const registerReport = () => {
    if (!user?.id) return;
    const { stats: newStats, unlockedBadge } = handleReportAction(user.id);
    setStats(newStats);
    
    // Trigger XP earned toast
    setPointsEarnedToast({
      amount: 20,
      reason: 'Reported civic issue',
      timestamp: Date.now()
    });

    // Trigger badge unlocked toast if any
    if (unlockedBadge) {
      setBadgeUnlockedToast(unlockedBadge);
    }
  };

  const registerUpvote = (isUpvoted: boolean) => {
    if (!user?.id) return;
    const { stats: newStats, unlockedBadge } = handleUpvoteAction(user.id, isUpvoted);
    setStats(newStats);

    // Trigger XP change toast
    setPointsEarnedToast({
      amount: isUpvoted ? 5 : -5,
      reason: isUpvoted ? 'Upvoted community report' : 'Removed community upvote',
      timestamp: Date.now()
    });

    if (unlockedBadge) {
      setBadgeUnlockedToast(unlockedBadge);
    }
  };

  const registerResolveVote = (isVoted: boolean) => {
    if (!user?.id) return;
    const { stats: newStats, unlockedBadge } = handleResolveAction(user.id, isVoted);
    setStats(newStats);

    // Trigger XP change toast
    setPointsEarnedToast({
      amount: isVoted ? 10 : -10,
      reason: isVoted ? 'Verified issue resolution' : 'Retracted resolution verification',
      timestamp: Date.now()
    });

    if (unlockedBadge) {
      setBadgeUnlockedToast(unlockedBadge);
    }
  };

  const clearPointsToast = () => setPointsEarnedToast(null);
  const clearBadgeToast = () => setBadgeUnlockedToast(null);

  return (
    <GamificationContext.Provider value={{
      stats,
      pointsEarnedToast,
      badgeUnlockedToast,
      registerReport,
      registerUpvote,
      registerResolveVote,
      clearPointsToast,
      clearBadgeToast
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => useContext(GamificationContext);
