"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Sparkles, Map, MapPin, ThumbsUp, ArrowRight, Flame, Camera, BarChart3, 
  Bot, Share2, Send, CheckCircle2, Mail, FileText, Smartphone, AlertCircle, X, Shield 
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Footer from '@/components/Footer';
import TopBar from '@/components/TopBar';
import styles from '../styles/landing.module.css';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';

const Aurora = dynamic(() => import('@/components/Aurora'), { ssr: false });

export default function LandingPage() {
  const { userLocation, defaultLocation } = useLocation();
  const { theme } = useTheme();

  // Word Flip Animation logic
  const typewriterWords = ["potholes", "broken streetlights", "water leaks", "trash overflows", "clogged drains"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % typewriterWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [typewriterWords.length]);

  // Center coordinate reference to display hotspots
  const centerLat = userLocation?.lat ?? defaultLocation.lat;
  const centerLng = userLocation?.lng ?? defaultLocation.lng;



  // Animation Variants
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15,
      },
    },
  };

  return (
    <div className={styles.landingContainer}>
      <TopBar />
      <div className={styles.auroraBg}>
        <Aurora
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className={styles.landingContent}>
        {/* HERO SECTION */}
        <motion.section
          className={styles.hero}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.badge} variants={itemVariants}>
            <Sparkles size={12} fill="currentColor" style={{ marginRight: '4px' }} />
            <span>powered by gemini ai</span>
          </motion.div>

          <motion.h1 className={styles.title} variants={itemVariants}>
            The live public registry
            <br />
            for community <span className={styles.gradientText}>issues.</span>
          </motion.h1>

          <motion.p className={styles.subtitle} variants={itemVariants}>
            An open platform to report and track{' '}
            <span className={styles.typewriterContainer}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  className={styles.typewriterText}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  {typewriterWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>{' '}
            in real-time.
          </motion.p>

          <motion.div className={styles.ctaGroup} variants={itemVariants}>
            <Link href="/map" className={styles.btnPrimary}>
              <span>Launch Map Dashboard</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/report" className={styles.btnSecondary}>
              <span>Report an Issue</span>
            </Link>
          </motion.div>
        </motion.section>

        {/* HOW IT WORKS SECTION */}
        <motion.section
          className={styles.howItWorksSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={cardContainerVariants}
        >
          <motion.h2 className={styles.howItWorksTitle} variants={cardVariants}>How it Works</motion.h2>
          <motion.p className={styles.howItWorksSubtitle} variants={cardVariants}>
            Simple steps to make a real difference in your neighborhood.
          </motion.p>

          <div className={styles.howItWorksGrid}>
            <motion.div
              className={styles.howItWorksCard}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={styles.iconCircle}>
                <Camera size={20} className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>1. Snap a Photo</h3>
              <p className={styles.cardDescription}>
                Capture the issue clearly using our intuitive mobile interface. One photo says more than a thousand words.
              </p>
            </motion.div>

            <motion.div
              className={styles.howItWorksCard}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={styles.iconCircle}>
                <MapPin size={20} className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>2. Pin the Location</h3>
              <p className={styles.cardDescription}>
                Our GPS-integrated map automatically tags the exact spot. Fine-tune it with a simple tap to ensure accuracy.
              </p>
            </motion.div>

            <motion.div
              className={styles.howItWorksCard}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={styles.iconCircle}>
                <BarChart3 size={20} className={styles.cardIcon} />
              </div>
              <h3 className={styles.cardTitle}>3. Track the Progress</h3>
              <p className={styles.cardDescription}>
                Watch as your report moves through the system. Get real-time updates when the issue is assigned and resolved.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* CLEAN STATIC BENTO GRID SECTION */}
        <motion.section
          className={styles.bentoSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={cardContainerVariants}
        >
          <div className={styles.bentoTitleGroup}>
            <motion.h2 className={styles.bentoHeader} variants={cardVariants}>Platform Features</motion.h2>
            <motion.p className={styles.bentoDesc} variants={cardVariants}>
              Everything you need to report street hazards, coordinate resolutions, and keep your community safe.
            </motion.p>
          </div>

          <div className={styles.bentoGrid}>
            {/* CARD 1: Vision AI Autofill (col2) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col2}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Camera size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(0, 240, 255, 0.05)', '--badge-border': 'var(--accent-cyan)', '--badge-color': 'var(--accent-cyan)' } as React.CSSProperties}>Gemini AI Powered</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Vision AI Autofill</h3>
                <p className={styles.bentoCardText}>
                  Snap a photo or upload media of street damage. CiviLog uses Gemini Vision models to automatically analyze, categorize, and draft structured issue descriptions.
                </p>
              </div>
            </motion.div>

            {/* CARD 2: Proximity Guard (col1) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col1}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><MapPin size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(255, 255, 255, 0.03)', '--badge-border': 'var(--border-light)', '--badge-color': 'var(--text-secondary)' } as React.CSSProperties}>GPS Validated</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>100m Proximity Guard</h3>
                <p className={styles.bentoCardText}>
                  Restricts incident marker placement to a strict 100-meter radius around the device's true GPS location coordinates.
                </p>
              </div>
            </motion.div>

            {/* CARD 3: Citizen Resolve (col1) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col1}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><ThumbsUp size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(5, 255, 197, 0.05)', '--badge-border': 'var(--accent-emerald)', '--badge-color': 'var(--accent-emerald)' } as React.CSSProperties}>Community Resolves</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Citizen Resolve</h3>
                <p className={styles.bentoCardText}>
                  Citizens upvote reports. Reaching 5 resolution votes automatically marks issues as resolved on the live registry.
                </p>
              </div>
            </motion.div>

            {/* CARD 4: Municipal Routing (col1) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col1}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Mail size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(99, 102, 241, 0.05)', '--badge-border': '#818cf8', '--badge-color': '#818cf8' } as React.CSSProperties}>Direct Endpoint</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Municipal Routing</h3>
                <p className={styles.bentoCardText}>
                  Formats a formal complaint draft and auto-routes it directly to matched commissioners across 21 supported local bodies.
                </p>
              </div>
            </motion.div>

            {/* CARD 5: Instant Broadcast (col1) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col1}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Share2 size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(255, 255, 255, 0.03)', '--badge-border': 'var(--border-light)', '--badge-color': 'var(--text-secondary)' } as React.CSSProperties}>One-Click Share</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Instant Broadcast</h3>
                <p className={styles.bentoCardText}>
                  Auto-draft reports instantly for WhatsApp or X (Twitter) to mobilize community action and speed up repairs.
                </p>
              </div>
            </motion.div>

            {/* CARD 6: Duplicate Prevention (col1) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col1}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><AlertCircle size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(255, 65, 108, 0.05)', '--badge-border': '#ff6b8b', '--badge-color': '#ff6b8b' } as React.CSSProperties}>Spam Filter</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Duplicate Prevention</h3>
                <p className={styles.bentoCardText}>
                  Scans nearby areas for active reports before submitting, encouraging citizens to upvote existing pins instead of duplication.
                </p>
              </div>
            </motion.div>

            {/* CARD 7: Gamification System (col2) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col2}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Flame size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(255, 170, 0, 0.05)', '--badge-border': '#ffbe33', '--badge-color': '#ffbe33' } as React.CSSProperties}>XP Rewards</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Gamification & Leveling</h3>
                <p className={styles.bentoCardText}>
                  Earn experience points (XP) and unlock badges for local watch contributions. Advance through levels from a "Novice Citizen" to a "Neighborhood Hero".
                </p>
              </div>
            </motion.div>

            {/* CARD 8: AI Chatbot Assistant (col2) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col2}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Bot size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(0, 240, 255, 0.05)', '--badge-border': 'var(--accent-cyan)', '--badge-color': 'var(--accent-cyan)' } as React.CSSProperties}>AI Assistant</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>CiviLog AI Chatbot</h3>
                <p className={styles.bentoCardText}>
                  Get immediate answers to platform queries, municipal jurisdiction guidelines, city center support details, and reporting policies using the responsive floating AI support chat bubble.
                </p>
              </div>
            </motion.div>

            {/* CARD 9: Authority Dashboard (col1) */}
            <motion.div
              className={`${styles.bentoCard} ${styles.col1}`}
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}><Shield size={20} /></div>
                <span className={styles.cardBadge} style={{ '--badge-bg': 'rgba(124, 255, 103, 0.05)', '--badge-border': '#7cff67', '--badge-color': '#7cff67' } as React.CSSProperties}>Secure Portal</span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.bentoCardTitle}>Authority Dashboard</h3>
                <p className={styles.bentoCardText}>
                  A dedicated portal for municipal engineers and local officials to inspect active alerts, verify data, update progress statuses, and log official repairs.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* VISUAL SPOTLIGHTS REGISTRY */}
        <motion.section
          className={styles.ledgerSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={cardContainerVariants}
        >
          <motion.div className={styles.ledgerHeader} variants={cardVariants}>
            <div className={styles.ledgerTitleGroup}>
              <h2 className={styles.ledgerTitle}>Local Spotlights</h2>
              <p className={styles.ledgerSubtitle}>Curated visual alerts of active repairs and resolutions near you</p>
            </div>
            <Link href="/feed" className={styles.ledgerLink}>
              <span>View full feed</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className={styles.spotlightGrid}>
            {/* CARD 1: PIPE BURST */}
            <motion.div
              className={styles.spotlightCard}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={styles.spotlightImageWrapper}>
                <img src="/pipe burst.webp" alt="Main Line Pipe Burst" className={styles.spotlightImage} />
              </div>
              <div className={styles.spotlightContent}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Infrastructure • Water Leak
                </span>
                <h3 className={styles.spotlightTitle}>Main Line Pipe Burst</h3>
                <p className={styles.spotlightDesc}>
                  Water flooding onto the pedestrian pathway. Alerted municipality crew who are currently on-site working to patch the leak.
                </p>
                <div className={styles.spotlightLocation}>
                  <MapPin size={12} className={styles.spotlightLocationIcon} />
                  <span>Outer Ring Road • Sector 4</span>
                </div>
                <div className={styles.spotlightFooter}>
                  <div className={styles.spotlightUpvotes}>
                    <ThumbsUp size={12} />
                    <span>42 reports</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: POTHOLE */}
            <motion.div
              className={styles.spotlightCard}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={styles.spotlightImageWrapper}>
                <img src="/pothole.webp" alt="Deep Road Pothole" className={styles.spotlightImage} />
              </div>
              <div className={styles.spotlightContent}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Infrastructure • Road Hazard
                </span>
                <h3 className={styles.spotlightTitle}>Deep Road Pothole</h3>
                <p className={styles.spotlightDesc}>
                  Crater-sized road pothole causing dangerous lane swerves. Highly visible risk for two-wheelers at night.
                </p>
                <div className={styles.spotlightLocation}>
                  <MapPin size={12} className={styles.spotlightLocationIcon} />
                  <span>5th Avenue • Downtown</span>
                </div>
                <div className={styles.spotlightFooter}>
                  <div className={styles.spotlightUpvotes}>
                    <ThumbsUp size={12} />
                    <span>56 reports</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: FALLEN TREE */}
            <motion.div
              className={styles.spotlightCard}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className={styles.spotlightImageWrapper}>
                <img src="/fallen-tree-blocking-the-road.webp" alt="Fallen Banyan Tree" className={styles.spotlightImage} />
              </div>
              <div className={styles.spotlightContent}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Environment • Safety
                </span>
                <h3 className={styles.spotlightTitle}>Fallen Banyan Tree</h3>
                <p className={styles.spotlightDesc}>
                  Massive tree branch collapsed onto the walkway. Successfully cleared and hauled away by local hazard response services.
                </p>
                <div className={styles.spotlightLocation}>
                  <MapPin size={12} className={styles.spotlightLocationIcon} />
                  <span>Park Street • Ward 12</span>
                </div>
                <div className={styles.spotlightFooter}>
                  <div className={styles.spotlightUpvotes}>
                    <ThumbsUp size={12} />
                    <span>29 reports</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
