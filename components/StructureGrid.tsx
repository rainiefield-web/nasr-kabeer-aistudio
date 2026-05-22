import React from 'react';

export const StructureGrid: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: [
          'linear-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
          'linear-gradient(135deg, rgba(148, 163, 184, 0.10) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '64px 64px, 64px 64px, 96px 96px',
        maskImage: 'linear-gradient(180deg, transparent, black 16%, black 82%, transparent)',
      }}
    />
  );
};
