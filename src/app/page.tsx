"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Map, MapPin, ThumbsUp, ArrowRight, Flame, Camera, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Footer from '@/components/Footer';
import styles from '../styles/landing.module.css';
import { useLocation } from '@/context/LocationContext';

export default function LandingPage() {
  const { userLocation, defaultLocation } = useLocation();

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
      <div className={styles.landingContent}>
        {/* HERO SECTION */}
        <motion.section 
          className={styles.hero}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.badge} variants={itemVariants}>
            <Flame size={12} fill="currentColor" style={{ marginRight: '4px' }} />
            <span>Community Dashboard v1.0</span>
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

        {/* FEATURES GRID */}
        <motion.section 
          className={styles.featuresGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={cardContainerVariants}
        >
          <motion.div 
            className={styles.featureCard} 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className={styles.iconBox}>
              <Sparkles size={20} />
            </div>
            <h3 className={styles.featureTitle}>Vision AI Autofill</h3>
            <p className={styles.featureText}>
              Snap a photo or record a short video. Our local computer vision models detect categories, estimate severity, and autofill location parameters immediately.
            </p>
          </motion.div>

          <motion.div 
            className={styles.featureCard} 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className={styles.iconBox}>
              <Map size={20} />
            </div>
            <h3 className={styles.featureTitle}>Precision Registry</h3>
            <p className={styles.featureText}>
              Track street hazards and active resolutions on a vector grid map. Dynamic location sorting prioritizes active issues based on distance from your coordinates.
            </p>
          </motion.div>

          <motion.div 
            className={styles.featureCard} 
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className={styles.iconBox}>
              <ThumbsUp size={20} />
            </div>
            <h3 className={styles.featureTitle}>Citizen Prioritization</h3>
            <p className={styles.featureText}>
              Elevate critical problems with community upvoting. Help municipalities prioritize repairs efficiently by showing where local demand is highest.
            </p>
          </motion.div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
