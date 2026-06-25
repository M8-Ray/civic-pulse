"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100svh',
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="pulsar-cyan" style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            border: '2px solid var(--accent-cyan)',
            backgroundColor: 'var(--accent-cyan-glow)'
          }}></div>
          <span style={{ fontSize: '0.9rem', letterSpacing: '0.5px', fontWeight: '500' }}>
            Initializing local radar grid...
          </span>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  return <MapComponent />;
}
