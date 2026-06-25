"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../styles/components.module.css';

export default function Footer() {
  const footerLinks = [
    { label: 'About', href: '/info/about' },
    { label: 'Privacy Policy', href: '/info/privacy' },
    { label: 'Terms', href: '/info/terms' },
    { label: 'Community Guidelines', href: '/info/guidelines' },
    { label: 'Safety', href: '/info/safety' },
    { label: 'Cookies', href: '/info/cookies' },
    { label: 'Contact', href: '/info/contact' },
    { label: 'Report Content', href: '/info/report-content' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className={styles.footerLink}>
            {link.label}
          </Link>
        ))}
      </div>

      <div className={styles.footerMeta}>
        <div className={styles.footerSocials}>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="X (formerly Twitter)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
        <div>Created by Maitreya</div>
        <div>&copy; 2026 CivicPulse</div>
      </div>
    </footer>
  );
}
