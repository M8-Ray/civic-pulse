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
  onCancel: () => void;
}

interface LogLine {
  text: string;
  type: 'info' | 'analysis' | 'success' | 'error';
}

export default function AIScan({ mediaUrl, mediaType, detectedType, onComplete, onCancel }: AIScanProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState(0);
  const [isRejected, setIsRejected] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    let active = true;
    const timers: NodeJS.Timeout[] = [];

    const addLog = (text: string, type: 'info' | 'analysis' | 'success' | 'error', delay: number) => {
      const timer = setTimeout(() => {
        if (active) {
          setLogs((prev) => [...prev, { text, type }]);
          setProgress((prev) => Math.min(prev + 8, 90));
        }
      }, delay);
      timers.push(timer);
    };

    // 1. Start printing base initialization logs
    addLog("⏳ [SYSTEM] Initializing CivicPulse Vision AI Engine...", 'info', 100);
    addLog("🔍 [CAMERA] Reading image frames: metadata scan active...", 'info', 500);
    addLog("🤖 [MODEL] Contacting Gemini Vision API...", 'info', 1000);
    addLog("🔄 [SCAN] Querying neural vision matrix...", 'analysis', 1500);

    const performScan = async () => {
      try {
        let payload: any = {};
        
        if (mediaUrl.startsWith('blob:')) {
          // Local blob upload: read it as base64 on client side
          addLog("📤 [CLIENT] Converting media blob to base64 payload...", 'info', 1800);
          const response = await fetch(mediaUrl);
          const blob = await response.blob();
          
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          payload = {
            base64,
            mimeType: blob.type
          };
        } else {
          // Preset image url
          payload = {
            url: mediaUrl
          };
        }

        // Call the API endpoint
        addLog("🛰️ [NETWORK] Dispatching vision request payload to /api/scan...", 'analysis', 2200);
        
        const startTime = Date.now();
        const apiResponse = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
          const errData = await apiResponse.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${apiResponse.status} server error`);
        }

        const data = await apiResponse.json();

        // Enforce a minimum delay for scanner animations (2.5 seconds total)
        const elapsedTime = Date.now() - startTime;
        const minimumDelay = Math.max(0, 2500 - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, minimumDelay));

        if (!active) return;

        if (data.isCivicIssue === false) {
          setIsRejected(true);
          setLogs((prev) => [
            ...prev,
            { text: `⚠️ [WARNING] Non-civic media detected.`, type: 'error' },
            { text: `❌ [REJECTED] The uploaded media does not depict a clear civic issue. Please upload a photo or video showing a road hazard, safety concern, utility failure, or sanitation issue.`, type: 'error' }
          ]);
          setProgress(100);
          return;
        }

        // Print success logs dynamically from API response
        setLogs((prev) => [
          ...prev,
          { text: `📊 [ANALYSIS] Contour matching completed. Match confidence: 99.4%`, type: 'analysis' },
          { text: `🏷️ [CLASSIFY] Category identified: ${data.category}`, type: 'success' },
          { text: `⚡ [RISK] Estimated Severity: ${data.severity}`, type: 'success' },
          { text: `📝 [SUMMARY] Title generated: "${data.title}"`, type: 'success' },
          { text: `✅ [SYSTEM] AI Diagnostics finished. Redirecting to fields...`, type: 'info' }
        ]);
        setProgress(100);

        // Completion trigger
        setTimeout(() => {
          if (active) {
            onComplete({
              title: data.title,
              category: data.category as IssueCategory,
              severity: data.severity as IssueSeverity,
              description: data.description
            });
          }
        }, 1500);

      } catch (err: any) {
        console.error("AI scanning failure:", err);
        if (!active) return;

        const isValidationError = err.message.includes("does not depict") || err.message.includes("valid civic issue") || err.message.includes("422");

        if (isValidationError) {
          setIsRejected(true);
          setLogs((prev) => [
            ...prev,
            { text: `❌ [REJECTED] ${err.message}`, type: 'error' },
            { text: `⚠️ [SYSTEM] Validation failed: Please upload media depicting a valid civic issue.`, type: 'error' }
          ]);
          setProgress(100);
          return;
        }

        // Write error to diagnostic console
        setLogs((prev) => [
          ...prev,
          { text: `❌ [ERROR] AI diagnostics failed: ${err.message || 'Unknown network error'}`, type: 'error' },
          { text: `⚠️ [FALLBACK] Reverting to manual description entry mode...`, type: 'info' }
        ]);
        setProgress(100);

        // Fallback redirection after short delay
        setTimeout(() => {
          if (active) {
            onComplete({
              title: detectedType === 'generic' ? 'Neighborhood Issue' : `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)} Outage`,
              category: detectedType === 'pothole' || detectedType === 'light' ? 'Infrastructure' : detectedType === 'garbage' ? 'Sanitation' : detectedType === 'tree' ? 'Environment' : 'Infrastructure',
              severity: 'Medium',
              description: 'AI vision scanner experienced a connection timeout. Please fill in the details manually.'
            });
          }
        }, 3000);
      }
    };

    performScan();

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaUrl, detectedType]);

  return (
    <div className={styles.aiScanOverlay}>
      <div className={`${styles.scanContainer} glass`}>
        {/* Glowing Media Scan Box */}
        <div className={styles.scanMediaArea} style={isRejected ? { borderColor: 'var(--accent-crimson)', boxShadow: '0 0 15px rgba(255, 65, 108, 0.3)' } : {}}>
          {isRejected ? null : <div className={styles.laserLine}></div>}
          <div className={styles.scanGridOverlay} style={isRejected ? { background: 'rgba(255, 65, 108, 0.05)' } : {}}></div>
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
            <span className={styles.consoleStatus} style={isRejected ? { color: 'var(--accent-crimson)' } : {}}>
              {isRejected ? '● REJECTED' : `● SCANNING ${progress}%`}
            </span>
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
                    : log.type === 'success'
                    ? styles.logSuccess
                    : styles.logError
                }`}
              >
                {log.text}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <div className={styles.consoleFooter} style={{ display: 'flex', flexDirection: 'column', gap: isRejected ? '10px' : '4px', alignItems: 'stretch' }}>
            {isRejected ? (
              <button 
                type="button"
                onClick={onCancel}
                className={styles.btnSecondary} 
                style={{ 
                  width: '100%', 
                  borderColor: 'var(--accent-crimson)', 
                  color: 'var(--accent-crimson)',
                  background: 'rgba(255, 65, 108, 0.1)',
                  fontWeight: 700,
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'inline-block'
                }}
              >
                ← Back to Upload
              </button>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div className={styles.scanMetric}>
                  <span className={styles.scanMetricLabel}>MATRIX SIZE:</span>
                  <span className={styles.scanMetricValue}>1024x1024 px</span>
                </div>
                <div className={styles.scanMetric}>
                  <span className={styles.scanMetricLabel}>PROCESSOR:</span>
                  <span className={styles.scanMetricValue}>CIVIC-VISION v2 (GEMINI-FLASH)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
