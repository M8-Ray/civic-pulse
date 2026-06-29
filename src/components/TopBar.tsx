"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { useGamification } from '@/context/GamificationContext';
import { ALL_BADGES } from '@/utils/gamification';
import { Flame, Sun, Moon } from 'lucide-react';
import styles from '../styles/components.module.css';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { stats } = useGamification();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={`${styles.topBar} glass`}>
      <Link href="/" className={styles.logoArea}>
        <div className={styles.logoIcon}>
          <Flame size={24} fill="var(--accent-cyan)" />
        </div>
        <span className={styles.logoText}>CivicPulse</span>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot}></span>
          <span>LIVE</span>
        </div>
      </Link>

      <div className={styles.profileArea}>
        <Link 
          href="/municipal" 
          className={styles.municipalBtn}
          title="Municipal Authority Console"
        >
          Portal For Authorities
        </Link>

        <button
          onClick={toggleTheme}
          className={styles.themeToggleBtn}
          aria-label="Toggle light/dark theme"
          title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
        >
          {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <div className={styles.avatarContainer} ref={menuRef}>
            {stats && (
              <div className={styles.xpBadge} title={`Level ${stats.level}: ${stats.levelName}`}>
                <span className={styles.xpLabel}>Lvl {stats.level}</span>
                <span className={styles.xpVal}>{stats.points} XP</span>
              </div>
            )}
            <div 
              className={styles.avatar} 
              title={user.email || "User Profile"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ cursor: 'pointer' }}
            >
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isMenuOpen && (
              <div className={styles.logoutDropdown}>
                <div className={styles.dropdownEmail}>{user.email}</div>

                {stats && (
                  <div className={styles.gamificationCard}>
                    <div className={styles.levelHeader}>
                      <span className={styles.levelName}>{stats.levelName}</span>
                      <span className={styles.levelNumber}>Lvl {stats.level}</span>
                    </div>
                    
                    {(() => {
                      const nextXP = stats.xpNeededForNextLevel;
                      const minXP = stats.currentLevelMinXP;
                      const range = nextXP - minXP;
                      const currentProgress = range > 0 ? stats.points - minXP : 1;
                      const maxProgress = range > 0 ? range : 1;
                      const pct = Math.min(100, Math.max(0, (currentProgress / maxProgress) * 100));

                      return (
                        <div className={styles.progressBarWrapper}>
                          <div className={styles.progressBarContainer}>
                            <div 
                              className={styles.progressBarFill} 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className={styles.progressLabels}>
                            <span>{stats.points} XP</span>
                            {nextXP > minXP ? (
                              <span>{nextXP} XP</span>
                            ) : (
                              <span>MAX XP</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className={styles.badgesLabel}>Achievements</div>
                    <div className={styles.badgesGrid}>
                      {ALL_BADGES.map(badge => {
                        const isEarned = stats.earnedBadges.includes(badge.id);
                        return (
                          <div 
                            key={badge.id}
                            className={`${styles.badgeItem} ${isEarned ? styles.badgeItemEarned : styles.badgeItemLocked}`}
                            title={`${badge.name}: ${badge.description}`}
                            style={isEarned ? { '--badge-color': badge.color } as React.CSSProperties : {}}
                          >
                            <span className={styles.badgeItemIcon}>{badge.icon}</span>
                            <span className={styles.badgeItemName}>{badge.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link 
                  href="/feed?tab=my" 
                  className={styles.dropdownLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Reports
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }} 
                  className={styles.logoutBtn}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className={styles.signInBtn}
          >
            Sign In
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
