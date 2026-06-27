"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { Flame, Sun, Moon } from 'lucide-react';
import styles from '../styles/components.module.css';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          <div className={styles.avatarContainer}>
            <div className={styles.avatar} title={user.email || "User Profile"}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.logoutDropdown}>
              <div className={styles.dropdownEmail}>{user.email}</div>
              <button onClick={logout} className={styles.logoutBtn}>
                Log Out
              </button>
            </div>
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
