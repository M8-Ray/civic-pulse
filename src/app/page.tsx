"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Map, MapPin, ThumbsUp, ArrowRight, Flame } from 'lucide-react';
import Footer from '@/components/Footer';
import styles from '../styles/landing.module.css';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { userLocation, defaultLocation } = useLocation();

  // Typewriter Animation logic
  const typewriterWords = ["potholes", "broken streetlights", "water leaks", "trash overflows", "clogged drains"];
  const [wordIndex, setWordIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (subIndex === typewriterWords[wordIndex].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 1600);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % typewriterWords.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 60 : 100);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, wordIndex]);

  useEffect(() => {
    setTypedText(typewriterWords[wordIndex].substring(0, subIndex));
  }, [subIndex, wordIndex]);

  // Center coordinate reference to display hotspots
  const centerLat = userLocation?.lat ?? defaultLocation.lat;
  const centerLng = userLocation?.lng ?? defaultLocation.lng;

  return (
    <div className={styles.landingContainer}>
      <div className={styles.landingContent}>
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            <Flame size={12} fill="currentColor" style={{ marginRight: '4px' }} />
            <span>Community Dashboard v1.0</span>
          </div>

          <h1 className={styles.title}>
            The live public registry
            <br />
            for community <span className={styles.gradientText}>issues.</span>
          </h1>

          <p className={styles.subtitle}>
            An open platform to report and track{' '}
            <span className={styles.typewriterContainer}>
              <span className={styles.typewriterText}>{typedText}</span>
            </span>{' '}
            in real-time.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/map" className={styles.btnPrimary}>
              <span>Launch Map Dashboard</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/report" className={styles.btnSecondary}>
              <span>Report an Issue</span>
            </Link>
          </div>
        </section>
        {/* WORKFLOW PROCESS GUIDE (Editorial Broadsheet style) */}
        <section className={styles.stepsRow}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>01</span>
            <h4 className={styles.stepTitle}>Upload Media</h4>
            <p className={styles.stepDescription}>
              Snap a photo or record video. Our vision models automatically categorize category and severity.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>02</span>
            <h4 className={styles.stepTitle}>Confirm Location</h4>
            <p className={styles.stepDescription}>
              Automatic geo-tagging estimates the exact coordinates; drag the pin to adjust for accuracy.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>03</span>
            <h4 className={styles.stepTitle}>Report</h4>
            <p className={styles.stepDescription}>
              Help the community by reporting issues and track their progress.
            </p>
          </div>
        </section>
        <span className={styles.stepsCaption}>Powered by community coordination & vision AI</span>

        {/* VISUAL SPOTLIGHTS REGISTRY */}
        <section className={styles.ledgerSection}>
          <div className={styles.ledgerHeader}>
            <div className={styles.ledgerTitleGroup}>
              <h2 className={styles.ledgerTitle}>Local Spotlights</h2>
              <p className={styles.ledgerSubtitle}>Curated visual alerts of active repairs and resolutions near you</p>
            </div>
            <Link href="/feed" className={styles.ledgerLink}>
              <span>View full feed</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.spotlightGrid}>
            {/* CARD 1: PIPE BURST */}
            <div className={styles.spotlightCard}>
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
            </div>

            {/* CARD 2: POTHOLE */}
            <div className={styles.spotlightCard}>
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
            </div>

            {/* CARD 3: FALLEN TREE */}
            <div className={styles.spotlightCard}>
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
            </div>
          </div>

        </section>

        {/* FEATURES GRID */}
        <section className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <Sparkles size={20} />
            </div>
            <h3 className={styles.featureTitle}>Vision AI Autofill</h3>
            <p className={styles.featureText}>
              Snap a photo or record a short video. Our local computer vision models detect categories, estimate severity, and autofill location parameters immediately.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <Map size={20} />
            </div>
            <h3 className={styles.featureTitle}>Precision Registry</h3>
            <p className={styles.featureText}>
              Track street hazards and active resolutions on a vector grid map. Dynamic location sorting prioritizes active issues based on distance from your coordinates.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconBox}>
              <ThumbsUp size={20} />
            </div>
            <h3 className={styles.featureTitle}>Citizen Prioritization</h3>
            <p className={styles.featureText}>
              Elevate critical problems with community upvoting. Help municipalities prioritize repairs efficiently by showing where local demand is highest.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
