import { type ComponentType } from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

// The three macOS dots: colors from the stage tokens, 6x6 svg glyphs that
// reveal on hover. Shared by the in-bar dots and the escaped flying ones.
function CloseGlyph() {
  return (
    <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
      <path
        d="M1 1 L5 5 M5 1 L1 5"
        stroke={APP_PREVIEW_STAGE.trafficLight.glyph}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinimizeGlyph() {
  return (
    <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
      <path
        d="M1 3 L5 3"
        stroke={APP_PREVIEW_STAGE.trafficLight.glyph}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ZoomGlyph() {
  return (
    <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
      <path
        d="M1.5 1.5 L1.5 4.5 L4.5 4.5 Z M4.5 1.5 L1.5 4.5"
        fill={APP_PREVIEW_STAGE.trafficLight.glyph}
      />
    </svg>
  );
}

type TrafficLightDotDefinition = {
  background: string;
  backgroundActive: string;
  Glyph: ComponentType;
  label: 'Close' | 'Minimize' | 'Zoom';
};

export const TRAFFIC_LIGHT_DOT_DEFINITIONS: ReadonlyArray<TrafficLightDotDefinition> =
  [
    {
      background: APP_PREVIEW_STAGE.trafficLight.close,
      backgroundActive: APP_PREVIEW_STAGE.trafficLight.closeActive,
      Glyph: CloseGlyph,
      label: 'Close',
    },
    {
      background: APP_PREVIEW_STAGE.trafficLight.minimize,
      backgroundActive: APP_PREVIEW_STAGE.trafficLight.minimizeActive,
      Glyph: MinimizeGlyph,
      label: 'Minimize',
    },
    {
      background: APP_PREVIEW_STAGE.trafficLight.zoom,
      backgroundActive: APP_PREVIEW_STAGE.trafficLight.zoomActive,
      Glyph: ZoomGlyph,
      label: 'Zoom',
    },
  ];
