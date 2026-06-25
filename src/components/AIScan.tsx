"use client";

import React, { useEffect, useState, useRef } from 'react';
import { IssueCategory, IssueSeverity } from '@/data/mockIssues';
import styles from '../styles/report.module.css';

interface AIScanProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  detectedType: 'pothole' | 'garbage' | 'light' | 'tree' | 'generic';
  onComplete: (results: {
    title: string;
    category: IssueCategory;
    severity: IssueSeverity;
    description: string;
  }) => void;
}

interface LogLine {
  text: string;
  type: 'info' | 'analysis' | 'success';
}

export default function AIScan({ mediaUrl, mediaType, detectedType, onComplete }: AIScanProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Sequence of mock scanning logs
    const logSequence: { text: string; type: 'info' | 'analysis' | 'success'; time: number }[] = [
      { text: "⏳ [SYSTEM] Initializing CivicPulse Vision AI Engine...", type: 'info', time: 300 },
      { text: "🔍 [CAMERA] Reading metadata: EXIF location match active", type: 'info', time: 700 },
      { text: "⚡ [ACCELERATOR] WebGL GPU pipeline initialized", type: 'info', time: 1100 },
      { text: "🤖 [MODEL] Loading Civic-Net Tensor Model v2.9...", type: 'info', time: 1500 },
      { text: "🔄 [SCAN] Running spatial density matrix analysis...", type: 'analysis', time: 1900 },
      { text: "📊 [ANALYSIS] Analyzing object contours and texture patterns...", type: 'analysis', time: 2400 },
    ];

    // Append type-specific analysis details based on detectedType
    if (detectedType === 'pothole') {
      logSequence.push(
        { text: "🚧 [MATCH] Feature detected: Road surface fissure & cavitation", type: 'analysis', time: 2800 },
        { text: "📈 [CONFIDENCE] Classification match: Pothole (97.4%)", type: 'success', time: 3200 },
        { text: "🏷️ [CLASSIFY] Auto-selected Category: Infrastructure", type: 'success', time: 3600 },
        { text: "⚠️ [RISK] Risk index: High (Tire puncture & alignment hazard)", type: 'success', time: 4000 }
      );
    } else if (detectedType === 'garbage') {
      logSequence.push(
        { text: "🚮 [MATCH] Feature detected: Non-organic bulk refuse pile", type: 'analysis', time: 2800 },
        { text: "📈 [CONFIDENCE] Classification match: Solid Waste Dump (94.8%)", type: 'success', time: 3200 },
        { text: "🏷️ [CLASSIFY] Auto-selected Category: Sanitation", type: 'success', time: 3600 },
        { text: "⚠️ [RISK] Risk index: Medium (Stray animal attraction & sanitation)", type: 'success', time: 4000 }
      );
    } else if (detectedType === 'light') {
      logSequence.push(
        { text: "💡 [MATCH] Feature detected: Public luminaire structural fault", type: 'analysis', time: 2800 },
        { text: "📈 [CONFIDENCE] Classification match: Broken Streetlight (91.2%)", type: 'success', time: 3200 },
        { text: "🏷️ [CLASSIFY] Auto-selected Category: Safety", type: 'success', time: 3600 },
        { text: "⚠️ [RISK] Risk index: Medium (Intersection darkness hazard)", type: 'success', time: 4000 }
      );
    } else if (detectedType === 'tree') {
      logSequence.push(
        { text: "🌳 [MATCH] Feature detected: Displaced arboreal biomass obstruction", type: 'analysis', time: 2800 },
        { text: "📈 [CONFIDENCE] Classification match: Fallen Tree Branch (95.1%)", type: 'success', time: 3200 },
        { text: "🏷️ [CLASSIFY] Auto-selected Category: Environment", type: 'success', time: 3600 },
        { text: "⚠️ [RISK] Risk index: Low (Sidewalk blockage)", type: 'success', time: 4000 }
      );
    } else {
      logSequence.push(
        { text: "⚙️ [MATCH] General anomaly identified in spatial frames", type: 'analysis', time: 2800 },
        { text: "📈 [CONFIDENCE] Classification match: General Obstruction (85.0%)", type: 'success', time: 3200 },
        { text: "🏷️ [CLASSIFY] Auto-selected Category: Infrastructure", type: 'success', time: 3600 },
        { text: "⚠️ [RISK] Risk index: Medium", type: 'success', time: 4000 }
      );
    }

    logSequence.push({ text: "✅ [SYSTEM] AI Diagnostics finished. Populating fields...", type: 'info', time: 4400 });

    // Set timers to display logs chronologically
    const timers = logSequence.map((item) => {
      return setTimeout(() => {
        setLogs((prev) => [...prev, { text: item.text, type: item.type }]);
        setProgress((prev) => Math.min(prev + Math.floor(100 / logSequence.length), 100));
      }, item.time);
    });

    // Final callback trigger after sequence completes
    const completionTimer = setTimeout(() => {
      let finalResults = {
        title: 'Road Damage Anomaly',
        category: 'Infrastructure' as IssueCategory,
        severity: 'Medium' as IssueSeverity,
        description: 'AI-assisted description: Visual scan shows general infrastructure surface issues. Needs onsite maintenance check.'
      };

      if (detectedType === 'pothole') {
        finalResults = {
          title: 'Asphalt Pothole Outage',
          category: 'Infrastructure',
          severity: 'High',
          description: 'AI-assisted description: Significant road surface cavitation and deep pothole detected. Poses immediate vehicle alignment damage risk. Needs patch repair.'
        };
      } else if (detectedType === 'garbage') {
        finalResults = {
          title: 'Accumulated Refuse Dump',
          category: 'Sanitation',
          severity: 'Medium',
          description: 'AI-assisted description: Accumulated community solid waste and overflowing public dumpster bin. High density of plastic wrapping. Attracting local animal pests.'
        };
      } else if (detectedType === 'light') {
        finalResults = {
          title: 'Broken Streetlight Outage',
          category: 'Safety',
          severity: 'Medium',
          description: 'AI-assisted description: Pedestrian streetlight luminaire dark/non-functional. Low lighting creates risk factors at night.'
        };
      } else if (detectedType === 'tree') {
        finalResults = {
          title: 'Fallen Tree Sidewalk Obstruction',
          category: 'Environment',
          severity: 'Low',
          description: 'AI-assisted description: Snap-off tree branch has landed onto the pedestrian path, creating a complete walking obstruction. Needs pruning crew.'
        };
      }

      onComplete(finalResults);
    }, 4800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completionTimer);
    };
  }, [detectedType, onComplete]);

  return (
    <div className={styles.aiScanOverlay}>
      <div className={`${styles.scanContainer} glass`}>
        {/* Glowing Media Scan Box */}
        <div className={styles.scanMediaArea}>
          <div className={styles.laserLine}></div>
          <div className={styles.scanGridOverlay}></div>
          {mediaType === 'video' ? (
            <video src={mediaUrl} muted loop autoPlay playsInline className={styles.scanMedia} />
          ) : (
            <img src={mediaUrl} alt="Scanning preview" className={styles.scanMedia} />
          )}
        </div>

        {/* Terminal Logs Box */}
        <div className={styles.scannerConsole}>
          <div className={styles.consoleHeader}>
            <span className={styles.consoleTitle}>CORE DIAGNOSTICS</span>
            <span className={styles.consoleStatus}>● SCANNING {progress}%</span>
          </div>

          <div className={styles.consoleLogs}>
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`${styles.logLine} ${
                  log.type === 'info' 
                    ? styles.logInfo 
                    : log.type === 'analysis' 
                    ? styles.logAnalysis 
                    : styles.logSuccess
                }`}
              >
                {log.text}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <div className={styles.consoleFooter}>
            <div className={styles.scanMetric}>
              <span className={styles.scanMetricLabel}>MATRIX SIZE:</span>
              <span className={styles.scanMetricValue}>1024x1024 px</span>
            </div>
            <div className={styles.scanMetric}>
              <span className={styles.scanMetricLabel}>PROCESSOR:</span>
              <span className={styles.scanMetricValue}>CIVIC-VISION v2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
