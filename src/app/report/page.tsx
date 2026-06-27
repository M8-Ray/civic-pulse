"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveIssue, calculateDistance, IssueCategory, IssueSeverity, CITY_CENTERS } from '@/data/mockIssues';
import { Camera, MapPin, Sparkles, UploadCloud, ChevronRight, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../styles/report.module.css';

// Dynamic import for coordinate MapPicker with SSR disabled
const MapPicker = dynamic(
  () => import('@/components/MapPicker'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-muted)'
      }}>
        <span>Loading selector grid...</span>
      </div>
    )
  }
);

// Dynamic import for AIScan to ensure client-only loading
const AIScan = dynamic(
  () => import('@/components/AIScan'),
  { ssr: false }
);

const DEMO_PRESETS = [
  {
    type: 'pothole' as const,
    label: 'Pothole',
    mediaUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    type: 'garbage' as const,
    label: 'Garbage Bin',
    mediaUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    type: 'light' as const,
    label: 'Streetlight',
    mediaUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    type: 'tree' as const,
    label: 'Tree Branch',
    mediaUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
];

export default function ReportPage() {
  const router = useRouter();
  const { userLocation, defaultLocation, isLoading: locationLoading } = useLocation();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Upload/AI trigger states
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [detectedType, setDetectedType] = useState<'pothole' | 'garbage' | 'light' | 'tree' | 'generic'>('generic');

  // Form inputs state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Infrastructure');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(defaultLocation.lat);
  const [lng, setLng] = useState(defaultLocation.lng);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedIssue, setSubmittedIssue] = useState<any | null>(null);

  // Email modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState<{
    to: string;
    subject: string;
    body: string;
    isSupported: boolean;
    matchedCity?: typeof CITY_CENTERS[number];
    issueLat: number;
    issueLng: number;
  } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Coordinate center alignment
  useEffect(() => {
    if (!locationLoading) {
      const activeCoords = userLocation ?? defaultLocation;
      setLat(activeCoords.lat);
      setLng(activeCoords.lng);
    }
  }, [locationLoading, userLocation, defaultLocation]);

  // Handle local file uploads (supports photo/video inputs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setDetectedType('generic');
    
    // Proceed to AI scanning step
    setStep(2);
  };

  // Handle picking preset mock files
  const handlePresetSelect = (preset: typeof DEMO_PRESETS[number]) => {
    setMediaUrl(preset.mediaUrl);
    setMediaType(preset.mediaType);
    setDetectedType(preset.type);
    
    // Proceed to AI scanning step
    setStep(2);
  };

  // AI completed callback
  const handleAIScanComplete = (results: {
    title: string;
    category: IssueCategory;
    severity: IssueSeverity;
    description: string;
  }) => {
    setTitle(results.title);
    setCategory(results.category);
    setSeverity(results.severity);
    setDescription(results.description);
    
    // Go to Form details input
    setStep(3);
  };

  // Submit report flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !mediaUrl || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const issueData = {
      title,
      description,
      category,
      severity,
      lat,
      lng,
      mediaUrl,
      mediaType,
    };

    try {
      const newIssue = await saveIssue(issueData, defaultLocation.lat, defaultLocation.lng, user?.id);
      setSubmittedIssue(newIssue);
    } catch (err: any) {
      console.error("Failed to submit issue:", err);
      setErrorMessage(err.message || "Something went wrong while submitting the issue. Please try again.");
      setIsSubmitting(false);
    }
  };

  const shareOnWhatsApp = () => {
    if (!submittedIssue) return;
    
    // Construct message
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${submittedIssue.lat},${submittedIssue.lng}`;
    const dashboardUrl = `${window.location.origin}/map?lat=${submittedIssue.lat}&lng=${submittedIssue.lng}&id=${submittedIssue.id}`;
    
    const message = `🚨 *CivicPulse Grievance Alert* 🚨

*Issue:* ${submittedIssue.title}
*Category:* ${submittedIssue.category}
*Severity:* ${submittedIssue.severity}

*Description:* 
"${submittedIssue.description}"

📍 *Incident Location:* ${mapsUrl}
🖼️ *Photo / Video:* ${submittedIssue.mediaUrl}

👉 *Support & track this report on CivicPulse:* ${dashboardUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const emailToMunicipality = () => {
    try {
      if (!submittedIssue) {
        console.warn("No submitted issue found.");
        return;
      }

      const issueLat = submittedIssue.lat ?? lat;
      const issueLng = submittedIssue.lng ?? lng;

      console.log("Locating municipal contact for:", issueLat, issueLng);

      // Find closest city within 50km
      const matchedCity = CITY_CENTERS.find(c => 
        calculateDistance(issueLat, issueLng, c.lat, c.lng) < 50
      );

      if (!matchedCity) {
        setEmailDetails({
          to: '',
          subject: '',
          body: '',
          isSupported: false,
          issueLat,
          issueLng
        });
        setCopiedEmail(false);
        setIsEmailModalOpen(true);
        return;
      }

      // Construct email parameters
      const to = matchedCity.email;
      const subject = `🚨 [CivicPulse Grievance Alert] ${submittedIssue.category} Issue: ${submittedIssue.title}`;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${issueLat},${issueLng}`;
      const dashboardUrl = `${window.location.origin}/map?lat=${issueLat}&lng=${issueLng}&id=${submittedIssue.id}`;

      const body = `To,
The Municipal Commissioner / Grievance Redressal Cell
${matchedCity.body}

Subject: Grievance report regarding ${submittedIssue.category.toLowerCase()} issue in our neighborhood.

Dear Sir/Madam,

I am writing to formally report a public grievance regarding a severe ${submittedIssue.category.toLowerCase()} issue: "${submittedIssue.title}".

Grievance Details:
- Description: ${submittedIssue.description}
- Severity: ${submittedIssue.severity}
- Incident Coordinates: ${issueLat}, ${issueLng}
- Photo/Video Link: ${submittedIssue.mediaUrl}
- Google Maps Navigation Link: ${mapsUrl}

This issue has been reported and verified by local residents on the CivicPulse live dashboard. 

Kindly assign a maintenance crew to inspect and resolve this issue at the earliest.

Sincerely,
A Concerned Citizen

(Track updates on the public dashboard: ${dashboardUrl})`;

      setEmailDetails({
        to,
        subject,
        body,
        isSupported: true,
        matchedCity,
        issueLat,
        issueLng
      });
      setCopiedEmail(false);
      setIsEmailModalOpen(true);

    } catch (error) {
      console.error("Error in emailToMunicipality:", error);
      alert("An error occurred while preparing the email. Please check your console.");
    }
  };

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportContent}>
        
        {/* Header Title */}
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Report a Local Issue</h1>
          <p className={styles.subtitle}>Help improve your neighborhood with automated AI classifications and precise location pins.</p>
        </div>

        {/* Progress bar visual */}
        <div className={styles.stepProgress}>
          <div className={styles.stepLine}></div>
          <div 
            className={styles.stepLineActive} 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          ></div>
          <div className={`${styles.stepNode} ${step >= 1 ? styles.stepNodeActive : ''} ${step > 1 ? styles.stepNodeCompleted : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`${styles.stepNode} ${step >= 2 ? styles.stepNodeActive : ''} ${step > 2 ? styles.stepNodeCompleted : ''}`}>
            {step > 2 ? '✓' : '2'}
          </div>
          <div className={`${styles.stepNode} ${step >= 3 ? styles.stepNodeActive : ''}`}>
            3
          </div>
        </div>

        {/* STEP 1: MEDIA UPLOAD SELECTOR */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label className={`${styles.uploadCard} glass`}>
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                aria-label="Upload photo or video of community issue"
              />
              <UploadCloud size={48} className={styles.uploadIcon} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
                  Capture or Upload Media
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Take a photo/video or drag-and-drop a file from your device.
                </p>
              </div>
              <div className={styles.btnSecondary} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} />
                <span>Camera / Gallery</span>
              </div>
            </label>

            {/* Presets Grid */}
            <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Quick Test Presets
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Select a preset photo below to trigger AI analysis and map plotting instantly:
              </p>
              <div className={styles.demoGrid}>
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className={styles.demoItem}
                    aria-label={`Select demo preset ${preset.label}`}
                  >
                    <img src={preset.mediaUrl} alt={preset.label} className={styles.demoThumb} />
                    <span className={styles.demoLabel}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: AI SCANNING MODAL */}
        {step === 2 && mediaUrl && (
          <AIScan
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            detectedType={detectedType}
            onComplete={handleAIScanComplete}
          />
        )}

        {/* STEP 3: DETAILS FORM & COORDINATES PICKER */}
        {step === 3 && mediaUrl && (
          submittedIssue ? (
            <div className={`${styles.formCard} glass`} style={{ textAlign: 'center', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(5, 255, 197, 0.1)',
                border: '2px solid var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>✓</span>
              </div>
              
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Report Submitted Successfully!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '480px', margin: '0 auto' }}>
                  Thank you for helping improve our neighborhood. The issue has been registered on the live dashboard. Share it on WhatsApp to mobilize neighborhood upvotes!
                </p>
              </div>

              {/* Summary Card */}
              <div style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                gap: '16px'
              }}>
                {submittedIssue.mediaUrl && (
                  <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    {submittedIssue.mediaType === 'video' ? (
                      <video src={submittedIssue.mediaUrl} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={submittedIssue.mediaUrl} alt={submittedIssue.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: submittedIssue.severity === 'High' ? 'var(--accent-crimson)' : submittedIssue.severity === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {submittedIssue.category} • {submittedIssue.severity} Severity
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{submittedIssue.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {submittedIssue.description}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={shareOnWhatsApp}
                    className={styles.btnSecondary}
                    style={{ 
                      flex: '1 1 200px', 
                      justifyContent: 'center', 
                      borderColor: '#25D366', 
                      color: '#25D366', 
                      background: 'rgba(37, 211, 102, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.472 14.382c-.024-.014-.507-.25-5.863-1.503-.082-.022-.165-.034-.247-.034-.247 0-.482.11-.634.302l-.63 1.053c-1.393-.728-2.616-1.91-3.385-3.292l.834-.51c.216-.13.342-.37.337-.624-.01-.082-.206-1.02-.323-1.52-.083-.352-.256-.414-.49-.414-.082 0-.173.013-.267.038-.344.093-1.92.518-2.073 1.956-.046.425.07.973.352 1.63 1.052 2.456 3.012 4.475 5.516 5.596.53.237 1.026.357 1.48.357.65 0 1.155-.246 1.488-.727l.456-.732c.162-.26.47-.384.77-.303.486.13 1.57.518 1.954.71.216.11.336.262.336.435 0 .092-.022.18-.066.263l-.79 1.57c-.244.492-.76.78-1.3.78-.17 0-.348-.027-.52-.08-2.148-.68-3.955-2.046-5.185-3.935a9.07 9.07 0 0 1-.955-2.278c-.282-.936-.183-1.745.284-2.278l.732-.832c.176-.2.433-.302.69-.302.08 0 .163.01.246.03l1.196.346c.264.076.433.3.433.57 0 .093-.01.19-.034.286-.196.79-.37 1.48-.37 1.48a.498.498 0 0 0 .153.518c.038.026.073.05.11.077 1.4 1.037 2.4 2.378 2.895 3.86a.488.488 0 0 0 .422.332h.007c.074 0 .148-.016.216-.048l1.436-.717c.216-.108.337-.26.337-.432a.573.573 0 0 0-.033-.194z"/>
                      <path d="M12.004 22c-2.048 0-4.052-.53-5.824-1.538l-4.305 1.41a1 1 0 0 1-1.247-1.247l1.41-4.305C1.03 14.552.5 12.548.5 10.5.5 4.15 5.65 1 12 1c6.35 0 11.5 5.15 11.5 11.5S18.35 22 12.004 22zm0-19c-5.238 0-9.5 4.262-9.5 9.5 0 1.8.508 3.56 1.47 5.09a1 1 0 0 1 .127.818l-.946 2.89 2.89-.946a1 1 0 0 1 .818.127c1.53 1.002 3.29 1.51 5.09 1.51 5.238 0 9.5-4.262 9.5-9.5S17.242 3 12.004 3z"/>
                    </svg>
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={emailToMunicipality}
                    className={styles.btnSecondary}
                    style={{ 
                      flex: '1 1 200px', 
                      justifyContent: 'center', 
                      borderColor: 'var(--accent-cyan)', 
                      color: 'var(--accent-cyan)', 
                      background: 'rgba(0, 240, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 700
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>Email Municipal Corp</span>
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/map?lat=${submittedIssue.lat}&lng=${submittedIssue.lng}&id=${submittedIssue.id}`);
                  }}
                  className={styles.btnPrimary}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Go to Map Dashboard</span>
                </button>
              </div>
            </div>
          ) : !user ? (
            <div className={`${styles.formCard} glass`} style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <AlertCircle size={48} style={{ color: 'var(--accent-cyan)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Authentication Required</h2>
              <p style={{ maxWidth: '400px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Please sign in to submit local issue reports. Creating an account helps us verify coordinates and securely manage your dashboard.
              </p>
              <button 
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className={styles.btnPrimary}
                style={{ minWidth: '180px', justifyContent: 'center' }}
              >
                Sign In / Register
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`${styles.formCard} glass`}>
              {/* Auto filled highlight */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--accent-cyan-glow)',
                border: '1.5px solid var(--accent-cyan)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)'
              }}>
                <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <strong>CivicPulse AI Autofill Active:</strong> Categorized and structured description automatically from scanning results.
                </div>
              </div>

              {/* Title field */}
              <div className={styles.formGroup}>
                <label htmlFor="issue-title" className={styles.label}>Issue Title</label>
                <input
                  id="issue-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                  placeholder="Name the issue report"
                  required
                />
              </div>

              {/* Category selection */}
              <div className={styles.formGroup}>
                <label htmlFor="issue-category" className={styles.label}>Category</label>
                <select
                  id="issue-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className={styles.select}
                >
                  <option value="Infrastructure">Infrastructure (Potholes, roads, lighting)</option>
                  <option value="Sanitation">Sanitation (Garbage, sewage leaks)</option>
                  <option value="Safety">Safety (Broken barriers, unsafe dark spots)</option>
                  <option value="Traffic">Traffic (Stuck lights, signs blocked)</option>
                  <option value="Environment">Environment (Fallen trees, green areas)</option>
                </select>
              </div>

              {/* Severity choices */}
              <div className={styles.formGroup}>
                <span className={styles.label}>Estimated Severity</span>
                <div className={styles.severityRadioGroup} role="radiogroup" aria-label="Estimated Severity Level">
                  {(['Low', 'Medium', 'High'] as const).map((level) => (
                    <div key={level} style={{ flex: 1 }}>
                      <input
                        id={`severity-${level}`}
                        type="radio"
                        name="severity"
                        value={level}
                        checked={severity === level}
                        onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                        className={styles.radioInput}
                      />
                      <label htmlFor={`severity-${level}`} className={styles.radioLabel}>
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description field */}
              <div className={styles.formGroup}>
                <label htmlFor="issue-description" className={styles.label}>Detailed Description</label>
                <textarea
                  id="issue-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  placeholder="Detail the issue..."
                  required
                />
              </div>

              {/* Geographic marker picker map */}
              <div className={styles.formGroup}>
                <span className={styles.label}>Confirm Incident Location</span>
                <div className={styles.mapPickerContainer}>
                  <div className={styles.mapPickerInstruction}>
                    <MapPin size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Click/drag marker to reposition
                  </div>
                  <MapPicker
                    lat={lat}
                    lng={lng}
                    onChange={(newLat, newLng) => {
                      setLat(newLat);
                      setLng(newLng);
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>LAT: {lat.toFixed(6)}</span>
                  <span>LNG: {lng.toFixed(6)}</span>
                </div>
              </div>

              {/* Error display if any */}
              {errorMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 65, 108, 0.1)',
                  border: '1.5px solid var(--accent-crimson)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: 'var(--accent-crimson)',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Buttons Row */}
              <div className={styles.actionRow}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={styles.btnSecondary}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer', minWidth: '160px', justifyContent: 'center' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(8, 11, 17, 0.2)',
                        borderTopColor: '#080b11',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        marginRight: '8px'
                      }} />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Report</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}
      </div>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Email Modal Overlay */}
      <AnimatePresence>
        {isEmailModalOpen && emailDetails && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEmailModalOpen(false)}
          >
            <motion.div
              className={`${styles.modalContent} glass`}
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              {emailDetails.isSupported ? (
                <>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle} style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
                      Email Municipal Corp
                    </h3>
                    <button onClick={() => setIsEmailModalOpen(false)} className={styles.modalCloseBtn}>✕</button>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Match found: <span style={{ color: 'var(--text-primary)' }}>{emailDetails.matchedCity?.city}</span> ({emailDetails.matchedCity?.body})
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Direct endpoint: <code style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{emailDetails.to}</code>
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Draft Email Preview</label>
                    <div className={styles.previewBox}>
                      {emailDetails.body}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {/* Web Gmail Option */}
                    <button
                      type="button"
                      onClick={() => {
                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailDetails.to}&su=${encodeURIComponent(emailDetails.subject)}&body=${encodeURIComponent(emailDetails.body)}`;
                        window.open(gmailUrl, '_blank');
                      }}
                      className={styles.optionCard}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(219, 68, 85, 0.05)',
                        border: '1px solid rgba(219, 68, 85, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(219, 68, 85, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#db4437',
                        flexShrink: 0
                      }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Compose in Gmail (Web)</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Launches browser tab with pre-filled form</p>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>

                    {/* Default client option */}
                    <button
                      type="button"
                      onClick={() => {
                        const mailtoUrl = `mailto:${emailDetails.to}?subject=${encodeURIComponent(emailDetails.subject)}&body=${encodeURIComponent(emailDetails.body)}`;
                        window.location.href = mailtoUrl;
                      }}
                      className={styles.optionCard}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(0, 240, 255, 0.05)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0, 240, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                        flexShrink: 0
                      }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Open Default Mail App</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Triggers local Outlook/OS client</p>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>

                    {/* Clipboard option */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(emailDetails.body);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className={styles.optionCard}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(5, 255, 197, 0.05)',
                        border: '1px solid rgba(5, 255, 197, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(5, 255, 197, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-emerald)',
                        flexShrink: 0
                      }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{copiedEmail ? '✓ Copied to Clipboard!' : 'Copy Email Body'}</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Copies formatted draft text for manual pasting</p>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle} style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }}></span>
                      Location Out of Range
                    </h3>
                    <button onClick={() => setIsEmailModalOpen(false)} className={styles.modalCloseBtn}>✕</button>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    CivicPulse municipal integration routes reports directly to official endpoints. However, your reported coordinates 
                    <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', margin: '0 4px', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                      {emailDetails.issueLat.toFixed(4)}, {emailDetails.issueLng.toFixed(4)}
                    </code> 
                    are outside our active service radius (within 50km of supported city centers).
                  </p>

                  <div style={{ marginTop: '4px' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                      Supported Cities & Core Bodies
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      {CITY_CENTERS.map(c => (
                        <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>✓</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.city}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({c.city === 'Mumbai' ? 'BMC' : c.city === 'Bengaluru' ? 'BBMP' : c.city === 'Delhi' ? 'MCD' : c.city === 'Chennai' ? 'GCC' : c.city === 'Hyderabad' ? 'GHMC' : c.city === 'Kolkata' ? 'KMC' : c.city === 'Pune' ? 'PMC' : 'AMC'})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      You can still copy the formal report draft generated by CivicPulse to manually email your local authorities:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${emailDetails.issueLat},${emailDetails.issueLng}`;
                        const dashboardUrl = `${window.location.origin}/map?lat=${emailDetails.issueLat}&lng=${emailDetails.issueLng}&id=${submittedIssue?.id}`;
                        const genericBody = `Subject: Grievance report regarding ${submittedIssue?.category.toLowerCase()} issue\n\nDear Sir/Madam,\n\nI am reporting a public grievance: "${submittedIssue?.title}".\n\nDetails:\n- Description: ${submittedIssue?.description}\n- Severity: ${submittedIssue?.severity}\n- Coordinates: ${emailDetails.issueLat}, ${emailDetails.issueLng}\n- Photo/Video: ${submittedIssue?.mediaUrl}\n- Google Maps: ${mapsUrl}\n\nTrack updates: ${dashboardUrl}`;
                        navigator.clipboard.writeText(genericBody);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className={styles.btnSecondary}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', outline: 'none' }}
                    >
                      <span>{copiedEmail ? '✓ Copied Draft' : 'Copy Formal Draft to Clipboard'}</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}





