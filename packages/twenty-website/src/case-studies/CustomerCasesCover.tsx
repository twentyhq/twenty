import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { paletteColorNumber, type PaletteToken } from '@/tokens';

import { buildCustomerCasesCoverSettings } from './customer-cases-cover-config';

const HOVER_LIGHTEN = 0.35;
const COLOR_CHANNEL_MAX = 255;

// The hover dash is the accent mixed toward white — the old site's lighter
// [70] tint, derived rather than carried as a second token per accent.
function lightenTowardWhite(value: number, amount: number): number {
  const blend = (channel: number) =>
    Math.round(channel + (COLOR_CHANNEL_MAX - channel) * amount);
  return (
    (blend((value >> 16) & 0xff) << 16) |
    (blend((value >> 8) & 0xff) << 8) |
    blend(value & 0xff)
  );
}

export type CustomerCasesCoverProps = {
  accent: PaletteToken;
  imageUrl: string;
};

export function CustomerCasesCover({
  accent,
  imageUrl,
}: CustomerCasesCoverProps) {
  const dashColor = paletteColorNumber(accent);
  const hoverDashColor = lightenTowardWhite(dashColor, HOVER_LIGHTEN);

  return (
    <HalftoneImageBackdrop
      imageUrl={imageUrl}
      settings={buildCustomerCasesCoverSettings({ dashColor, hoverDashColor })}
    />
  );
}
