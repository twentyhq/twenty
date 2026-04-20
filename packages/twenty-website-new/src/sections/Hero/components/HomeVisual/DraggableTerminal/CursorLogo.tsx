'use client';

// Cursor app icon — black rounded tile wrapping an isometric hexagonal prism
// with a folded white arrow bursting out of its front face.
export const CursorLogo = ({ size = 14 }: { size?: number }) => {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dark rounded tile background */}
      <rect x="0" y="0" width="24" height="24" rx="5" fill="#0b0b0b" />

      {/* Isometric cube — 3 shaded faces meeting at the center */}
      {/* Top face (lightest) */}
      <path
        d="M12 4.5 L19.5 8.5 L12 12.5 L4.5 8.5 Z"
        fill="#5e5e5e"
      />
      {/* Left face (mid) */}
      <path
        d="M4.5 8.5 L12 12.5 L12 20.5 L4.5 16.5 Z"
        fill="#3d3d3d"
      />
      {/* Right face (darkest) */}
      <path
        d="M19.5 8.5 L19.5 16.5 L12 20.5 L12 12.5 Z"
        fill="#2a2a2a"
      />

      {/* White folded arrow — triangular silhouette with an inner fold line
          that splits it into two slightly different shades */}
      {/* Top wing (brighter) */}
      <path d="M5.2 8.2 L17.2 8.2 L12.8 12.5 Z" fill="#ffffff" />
      {/* Front wing (dimmer) */}
      <path d="M17.2 8.2 L13.8 17 L12.8 12.5 Z" fill="#dcdcdc" />
    </svg>
  );
};
