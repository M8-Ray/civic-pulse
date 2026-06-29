"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, LayoutGrid, PlusCircle } from 'lucide-react';
import styles from '../styles/components.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  const navItems = [
    {
      href: '/feed',
      label: 'Near Me',
      icon: LayoutGrid,
    },
    {
      href: '/map',
      label: 'Map View',
      icon: Map,
    },
    {
      href: '/report',
      label: 'Report Issue',
      icon: PlusCircle,
    },
  ];

  return (
    <nav className={styles.bottomNavContainer} aria-label="Main Navigation">
      <div className={`${styles.bottomNavPill} glass`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match or matches start of pathname for active state
          const isActive = pathname === item.href || (item.href !== '/map' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
