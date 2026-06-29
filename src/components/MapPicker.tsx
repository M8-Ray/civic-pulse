"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  boundaryCenter?: { lat: number; lng: number } | null;
}

export default function MapPicker({ lat, lng, onChange, boundaryCenter }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 17); // slightly zoom closer to show 100m radius clearly

      // Add CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      // Draw 100m radius boundary circle around boundaryCenter if provided
      if (boundaryCenter) {
        L.circle([boundaryCenter.lat, boundaryCenter.lng], {
          color: 'var(--accent-cyan)',
          fillColor: 'var(--accent-cyan)',
          fillOpacity: 0.05,
          weight: 1.5,
          dashArray: '5, 5',
          radius: 100 // 100 meters
        }).addTo(map);
      }

      // Custom severity high style marker for coordinate picking
      const pickerIcon = L.divIcon({
        className: 'custom-picker-icon',
        html: `
          <div class="issue-marker-glow issue-severity-high" style="transform: scale(1.2)">
            <div class="marker-pin" style="background: var(--accent-cyan); box-shadow: 0 0 6px var(--accent-cyan)"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Add picker marker
      const marker = L.marker([lat, lng], {
        icon: pickerIcon,
        draggable: true
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle marker drag end
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange(position.lat, position.lng);
      });

      // Handle click on map to move marker
      map.on('click', (e) => {
        const newCoords = e.latlng;
        marker.setLatLng(newCoords);
        onChange(newCoords.lat, newCoords.lng);
        map.panTo(newCoords);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentLatLng = markerRef.current.getLatLng();
      if (currentLatLng.lat !== lat || currentLatLng.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
