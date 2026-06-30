"use client";

import React, { useEffect } from 'react';
import { useGamification } from '@/context/GamificationContext';
import styles from '@/styles/toast.module.css';

export default function GamificationAlerts() {
  const { 
    pointsEarnedToast, 
    badgeUnlockedToast, 
    clearPointsToast, 
    clearBadgeToast 
  } = useGamification();

  // Auto-clear XP toast after 3.5 seconds
  useEffect(() => {
    if (pointsEarnedToast) {
      const timer = setTimeout(() => {
        clearPointsToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [pointsEarnedToast?.timestamp, clearPointsToast]);

  // Auto-clear Badge toast after 5 seconds
  useEffect(() => {
    if (badgeUnlockedToast) {
      const timer = setTimeout(() => {
        clearBadgeToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badgeUnlockedToast?.id, clearBadgeToast]);

  if (!pointsEarnedToast && !badgeUnlockedToast) return null;

  return (
    <div className={styles.toastContainer}>
      {/* Badge Unlocked Notification */}
      {badgeUnlockedToast && (
        <div className={styles.badgeToast}>
          <div className={styles.badgeIconWrapper}>
            {badgeUnlockedToast.icon}
          </div>
          <div className={styles.badgeInfo}>
            <span className={styles.badgeTitle}>Achievement Unlocked</span>
            <span className={styles.badgeName}>{badgeUnlockedToast.name}</span>
            <span className={styles.badgeDesc}>{badgeUnlockedToast.description}</span>
          </div>
        </div>
      )}

      {/* Points Earned Notification */}
      {pointsEarnedToast && (
        <div className={`${styles.xpToast} ${pointsEarnedToast.amount >= 0 ? styles.xpToastPositive : styles.xpToastNegative}`}>
          <div className={`${styles.xpAmount} ${pointsEarnedToast.amount >= 0 ? styles.xpAmountPositive : styles.xpAmountNegative}`}>
            {pointsEarnedToast.amount >= 0 ? `+${pointsEarnedToast.amount}` : pointsEarnedToast.amount} XP
          </div>
          <div className={styles.xpDetails}>
            <span className={styles.xpReason}>{pointsEarnedToast.reason}</span>
            <span className={styles.xpSub}>CiviLog Gamification</span>
          </div>
        </div>
      )}
    </div>
  );
}
