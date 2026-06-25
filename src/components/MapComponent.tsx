"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getIssues, toggleUpvoteIssue, deleteIssue, calculateDistance, Issue, IssueCategory, IssueStatus } from '@/data/mockIssues';
import { Navigation, ShieldAlert, Layers } from 'lucide-react';
import styles from '../styles/map.module.css';

// Helper to determine status color classes
const getStatusLabelClass = (status: IssueStatus) => {
  switch (status) {
    case 'Reported': return 'popup-badge-reported';
    case 'In Progress': return 'popup-badge-inprogress';
    case 'Resolved': return 'popup-badge-resolved';
    default: return '';
  }
};

export default function MapComponent() {
  const { userLocation, isLoading: locationLoading, defaultLocation } = useLocation();
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // States
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);

  // Lat and Lng to use as active map center
  const centerLat = userLocation?.lat ?? defaultLocation.lat;
  const centerLng = userLocation?.lng ?? defaultLocation.lng;

  // Initialize issues
  useEffect(() => {
    let active = true;
    if (!locationLoading) {
      getIssues(centerLat, centerLng, user?.id)
        .then((loadedIssues) => {
          if (active) {
            setIssues(loadedIssues);
          }
        })
        .catch((err) => {
          console.error("Failed to load map issues:", err);
        });
    }
    return () => {
      active = false;
    };
  }, [locationLoading, centerLat, centerLng, user?.id]);

  // Handle URL query parameter centering and popup auto-open
  useEffect(() => {
    if (mapInstanceRef.current && issues.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const latParam = params.get('lat');
      const lngParam = params.get('lng');
      const idParam = params.get('id');

      if (latParam && lngParam) {
        const lat = parseFloat(latParam);
        const lng = parseFloat(lngParam);
        mapInstanceRef.current.setView([lat, lng], 16, { animate: false });

        if (idParam && markerLayerRef.current) {
          setTimeout(() => {
            markerLayerRef.current?.eachLayer((layer: any) => {
              if (layer instanceof L.Marker) {
                const latLng = layer.getLatLng();
                if (Math.abs(latLng.lat - lat) < 0.0001 && Math.abs(latLng.lng - lng) < 0.0001) {
                  layer.openPopup();
                }
              }
            });
          }, 300);
        }
      }
    }
  }, [issues, locationLoading]);

  // Recenter map on user location
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const targetCoords = userLocation ?? defaultLocation;
      mapInstanceRef.current.setView([targetCoords.lat, targetCoords.lng], 15, { animate: true });
    }
  };



  // Calculate statistics
  const stats = {
    total: issues.length,
    reported: issues.filter(i => i.status === 'Reported').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  // 1. Initialize Map Instance
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && !locationLoading) {
      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: false, // Position standard zoom controls or hide them
        attributionControl: true
      }).setView([centerLat, centerLng], 14);

      // Add custom zoom control to bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Initialize a layer group for issue markers
      const markerLayer = L.layerGroup().addTo(map);
      markerLayerRef.current = markerLayer;

      mapInstanceRef.current = map;

      // Global click handler integration for upvoting inside Leaflet popups
      map.on('popupopen', (e) => {
        const popupNode = e.popup.getElement();
        const upvoteBtn = popupNode?.querySelector('.popup-upvote-btn');
        if (upvoteBtn) {
          const issueId = upvoteBtn.getAttribute('data-id');
          if (issueId) {
            // Remove existing listener if any to avoid multiples
            const newUpvoteBtn = upvoteBtn.cloneNode(true) as HTMLButtonElement;
            upvoteBtn.parentNode?.replaceChild(newUpvoteBtn, upvoteBtn);

            newUpvoteBtn.addEventListener('click', async (ev) => {
              ev.stopPropagation();

              const upvoteCountSpan = popupNode?.querySelector('.popup-upvote-count');
              const isCurrentlyUpvoted = newUpvoteBtn.classList.contains('popup-upvoted');
              let count = parseInt(upvoteCountSpan?.textContent || '0', 10);

              // Optimistic UI updates
              if (upvoteCountSpan) {
                if (isCurrentlyUpvoted) {
                  count = Math.max(0, count - 1);
                  newUpvoteBtn.classList.remove('popup-upvoted');
                  newUpvoteBtn.innerHTML = '▲ Upvote';
                } else {
                  count += 1;
                  newUpvoteBtn.classList.add('popup-upvoted');
                  newUpvoteBtn.innerHTML = '▲ Upvoted';
                }
                upvoteCountSpan.textContent = count.toString();
              }

              try {
                const updatedIssues = await toggleUpvoteIssue(issueId, centerLat, centerLng, user?.id);
                setIssues(updatedIssues);
              } catch (err) {
                console.error("Upvote failed:", err);
                // Revert
                if (upvoteCountSpan) {
                  if (isCurrentlyUpvoted) {
                    newUpvoteBtn.classList.add('popup-upvoted');
                    newUpvoteBtn.innerHTML = '▲ Upvoted';
                    upvoteCountSpan.textContent = (count + 1).toString();
                  } else {
                    newUpvoteBtn.classList.remove('popup-upvoted');
                    newUpvoteBtn.innerHTML = '▲ Upvote';
                    upvoteCountSpan.textContent = Math.max(0, count - 1).toString();
                  }
                }
              }
            });
          }
        }

        const deleteBtn = popupNode?.querySelector('.popup-delete-btn');
        if (deleteBtn) {
          const issueId = deleteBtn.getAttribute('data-id');
          if (issueId) {
            const newDeleteBtn = deleteBtn.cloneNode(true) as HTMLButtonElement;
            deleteBtn.parentNode?.replaceChild(newDeleteBtn, deleteBtn);

            newDeleteBtn.addEventListener('click', async (ev) => {
              ev.stopPropagation();
              if (window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
                try {
                  const updatedIssues = await deleteIssue(issueId, centerLat, centerLng, user?.id);
                  setIssues(updatedIssues);
                  map.closePopup();
                } catch (err: any) {
                  console.error("Delete failed:", err);
                  alert(err.message || "Failed to delete issue. Please check your connection and policies.");
                  getIssues(centerLat, centerLng, user?.id).then(setIssues).catch(console.error);
                }
              }
            });
          }
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markerLayerRef.current = null;
        userMarkerRef.current = null;
      }
    };
  }, [locationLoading]); // Initialize map once location is loaded

  // 1.5 Handle Dynamic Tile Layer Theme Changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }

      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
    }
  }, [theme, locationLoading]);

  // 2. Handle User Location Marker Updates
  useEffect(() => {
    if (mapInstanceRef.current) {
      const activeCoords = userLocation ?? defaultLocation;

      // Define custom user location icon (pulsing dot)
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
          <div class="user-location-marker">
            <div class="pulse-ring"></div>
            <div class="pulse-dot"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Update or create user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([activeCoords.lat, activeCoords.lng]);
      } else {
        userMarkerRef.current = L.marker([activeCoords.lat, activeCoords.lng], {
          icon: userIcon,
          zIndexOffset: 1000
        }).addTo(mapInstanceRef.current);
      }
    }
  }, [userLocation, defaultLocation, locationLoading]);

  // 3. Handle Issue Markers Updates (filters and upvote sync)
  useEffect(() => {
    if (mapInstanceRef.current && markerLayerRef.current) {
      // Clear all active layers in the group
      markerLayerRef.current.clearLayers();

      issues.forEach((issue) => {
        const distance = calculateDistance(centerLat, centerLng, issue.lat, issue.lng);
        if (distance > 10) return;

        // Create custom Leaflet icon based on severity
        const severityClass = `issue-severity-${issue.severity.toLowerCase()}`;
        const markerIcon = L.divIcon({
          className: 'custom-issue-icon',
          html: `
            <div class="issue-marker-glow ${severityClass}">
              <div class="marker-pin"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // HTML markup structure for custom popup
        const mediaHtml = issue.mediaType === 'video'
          ? `<video src="${issue.mediaUrl}" muted loop autoplay class="popup-media"></video>`
          : `<img src="${issue.mediaUrl}" alt="${issue.title}" class="popup-media" />`;

        const isUpvoted = issue.userUpvoted;
        const statusClass = getStatusLabelClass(issue.status);

        const popupContent = `
          <div class="popup-card">
            <div class="popup-media-container">
              ${mediaHtml}
            </div>
            <div class="popup-header">
              <h4 class="popup-title">${issue.title}</h4>
              <span class="popup-badge ${statusClass}">${issue.status}</span>
            </div>
            <p class="popup-desc">${issue.description}</p>
            <div class="popup-footer">
              <div class="popup-upvotes">
                <span class="popup-upvote-count">${issue.upvotes}</span> Upvotes
              </div>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button 
                  class="popup-upvote-btn ${isUpvoted ? 'popup-upvoted' : ''}" 
                  data-id="${issue.id}"
                >
                  ${isUpvoted ? '▲ Upvoted' : '▲ Upvote'}
                </button>
                ${issue.userReported ? `
                  <button 
                    class="popup-delete-btn" 
                    data-id="${issue.id}"
                    title="Delete your report"
                  >
                    ❌
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([issue.lat, issue.lng], { icon: markerIcon });

        marker.bindPopup(popupContent, {
          closeButton: false,
          minWidth: 220,
          maxWidth: 220,
        });

        marker.addTo(markerLayerRef.current!);
      });
    }
  }, [issues]); // Re-render markers if issues change

  return (
    <div className={styles.mapWrapper}>
      {/* Map HTML container */}
      <div ref={mapRef} className={styles.mapElement} />

      {/* Floating Controls Overlay */}
      <div className={styles.floatingControls}>
        <div className={styles.controlsRow} style={{ justifyContent: 'flex-end' }}>
          {/* Action Floating Buttons */}
          <div className={styles.actionStack}>
            <button
              onClick={handleRecenter}
              className={`${styles.fab} glass`}
              title="Center on my location"
              aria-label="Recenter map"
            >
              <Navigation size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Overlay */}
      <div className={`${styles.statsCard} glass`}>
        <div className={styles.filterHeader} style={{ marginBottom: '4px' }}>Live Stats</div>
        <div className={styles.statItem}>
          <span><span className={styles.statDot} style={{ background: 'var(--accent-cyan)' }} />Total</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statItem}>
          <span><span className={styles.statDot} style={{ background: 'var(--accent-crimson)' }} />Reported</span>
          <span className={styles.statValue}>{stats.reported}</span>
        </div>
        <div className={styles.statItem}>
          <span><span className={styles.statDot} style={{ background: 'var(--accent-amber)' }} />In Progress</span>
          <span className={styles.statValue}>{stats.inProgress}</span>
        </div>
        <div className={styles.statItem}>
          <span><span className={styles.statDot} style={{ background: 'var(--accent-emerald)' }} />Resolved</span>
          <span className={styles.statValue}>{stats.resolved}</span>
        </div>
      </div>
    </div>
  );
}
