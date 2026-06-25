"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveIssue, IssueCategory, IssueSeverity } from '@/data/mockIssues';
import { Camera, MapPin, Sparkles, UploadCloud, ChevronRight, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
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
      
      // Redirect to Map centering coordinates with popup trigger active
      router.push(`/map?lat=${newIssue.lat}&lng=${newIssue.lng}&id=${newIssue.id}`);
    } catch (err: any) {
      console.error("Failed to submit issue:", err);
      setErrorMessage(err.message || "Something went wrong while submitting the issue. Please try again.");
      setIsSubmitting(false);
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
          !user ? (
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
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
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
    </div>
  );
}
