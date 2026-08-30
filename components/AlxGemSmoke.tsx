import React, { useEffect, useRef } from 'react';
import { GemSmoke, gemSmokePresets } from '@paper-design/shaders-react';

const LOW_POWER_CONTEXT: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
  powerPreference: 'low-power',
};

interface AlxGemSmokeProps {
  image: string;
  active: boolean;
  onContextLost: () => void;
}

const AlxGemSmoke: React.FC<AlxGemSmokeProps> = ({ image, active, onContextLost }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };

    wrapper.addEventListener('webglcontextlost', handleContextLost, true);
    return () => wrapper.removeEventListener('webglcontextlost', handleContextLost, true);
  }, [onContextLost]);

  return (
    <div ref={wrapperRef} className="alx-brand-gem-smoke-wrap" aria-hidden="true">
      <GemSmoke
        className="alx-brand-gem-smoke"
        {...gemSmokePresets[0].params}
        image={image}
        fit="contain"
        speed={active ? 0.55 : 0}
        minPixelRatio={1}
        maxPixelCount={850_000}
        webGlContextAttributes={LOW_POWER_CONTEXT}
        suspendWhenProcessingImage
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default AlxGemSmoke;
