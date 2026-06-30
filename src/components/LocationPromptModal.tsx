"use client";

import React, { useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { MapPinOff, RefreshCw, X } from 'lucide-react';
import styles from '../styles/components.module.css';

export default function LocationPromptModal() {
  const { userLocation, isLoading, error, permissionDenied, refreshLocation } = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // If loading, valid location, or user dismissed the warning, hide the modal
  if (isLoading || userLocation || dismissed) {
    return null;
  }

  const isDenied = permissionDenied;
  const hasError = !!error;

  if (!isDenied && !hasError) {
    return null;
  }

  return (
    <div className={styles.locationModalOverlay}>
      <div className={styles.locationModalCard} style={{ position: 'relative' }}>
        {/* Close Button in corner */}
        <button 
          onClick={() => setDismissed(true)} 
          className={styles.modalCloseBtn}
          title="Dismiss location warning"
          aria-label="Dismiss location warning"
          type="button"
        >
          <X size={16} />
        </button>

        <div className={styles.locationIconWrapper}>
          <MapPinOff size={32} />
        </div>
        
        <h2 className={styles.locationTitle}>
          {isDenied ? 'Location Access Blocked' : 'GPS Location Required'}
        </h2>
        
        <p className={styles.locationDesc}>
          {isDenied ? (
            "CiviLog needs to know where you are to find nearby community issues. Please enable location permissions for this website in your browser's site settings."
          ) : (
            "We couldn't resolve your coordinates. Please make sure your device's location services (GPS) are turned on and try refreshing."
          )}
        </p>
        
        <div className={styles.locationBtnGroup}>
          <button 
            onClick={refreshLocation}
            className={styles.locationPrimaryBtn}
            type="button"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
          
          <button 
            onClick={() => setDismissed(true)}
            className={styles.locationSecondaryBtn}
            type="button"
          >
            Bypass / Use Default Center
          </button>
        </div>
      </div>
    </div>
  );
}
