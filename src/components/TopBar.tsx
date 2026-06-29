"use client";

import React, { useState, useEffect, useRef } from 'react';
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
