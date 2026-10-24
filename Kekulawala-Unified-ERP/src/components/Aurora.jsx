import React from 'react';

/**
 * AuroraBackdrop — the living light behind the entire workspace.
 * Pure CSS/SVG, zero layout cost, GPU-transformed blobs.
 */
export const AuroraBackdrop = () => (
  <div className="aurora-backdrop" aria-hidden="true">
    <div className="aurora-blob b1" />
    <div className="aurora-blob b2" />
    <div className="aurora-blob b3" />
    <div className="aurora-blob b4" />
    <div className="aurora-grid" />
    <div className="aurora-grain" />
  </div>
);

export default AuroraBackdrop;
