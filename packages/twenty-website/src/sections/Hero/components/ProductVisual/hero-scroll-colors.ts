const LIGHT_BACKGROUND = '#ffffff';
const DARK_BACKGROUND = '#141414';

const LIGHT_HEADING = '#1c1c1c';
const DARK_HEADING = '#ffffff';

const LIGHT_BODY = 'rgba(28, 28, 28, 0.6)';
const DARK_BODY = 'rgba(255, 255, 255, 0.7)';

export const HERO_COLOR_TRANSITION_START = 0.15;
export const HERO_COLOR_TRANSITION_END = 0.55;

export const HERO_PANEL_TRANSITION_START = 0.2;
export const HERO_PANEL_TRANSITION_END = 0.6;

function mapScrollToRange(
  progress: number,
  rangeStart: number,
  rangeEnd: number,
): number {
  if (progress <= rangeStart) {
    return 0;
  }

  if (progress >= rangeEnd) {
    return 1;
  }

  const linearMix = (progress - rangeStart) / (rangeEnd - rangeStart);

  return smoothstep(linearMix);
}

export function mapScrollToColorMix(progress: number): number {
  return mapScrollToRange(
    progress,
    HERO_COLOR_TRANSITION_START,
    HERO_COLOR_TRANSITION_END,
  );
}

export function mapScrollToPanelMix(progress: number): number {
  return mapScrollToRange(
    progress,
    HERO_PANEL_TRANSITION_START,
    HERO_PANEL_TRANSITION_END,
  );
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function parseHexColor(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function parseRgbaColor(rgba: string): [number, number, number, number] {
  const match = rgba.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );

  if (!match) {
    return [0, 0, 0, 1];
  }

  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] !== undefined ? Number(match[4]) : 1,
  ];
}

function interpolateHex(from: string, to: string, mix: number): string {
  const [fromRed, fromGreen, fromBlue] = parseHexColor(from);
  const [toRed, toGreen, toBlue] = parseHexColor(to);

  const red = Math.round(fromRed + (toRed - fromRed) * mix);
  const green = Math.round(fromGreen + (toGreen - fromGreen) * mix);
  const blue = Math.round(fromBlue + (toBlue - fromBlue) * mix);

  return `rgb(${red}, ${green}, ${blue})`;
}

function interpolateRgba(from: string, to: string, mix: number): string {
  const [fromRed, fromGreen, fromBlue, fromAlpha] = parseRgbaColor(from);
  const [toRed, toGreen, toBlue, toAlpha] = parseRgbaColor(to);

  const red = Math.round(fromRed + (toRed - fromRed) * mix);
  const green = Math.round(fromGreen + (toGreen - fromGreen) * mix);
  const blue = Math.round(fromBlue + (toBlue - fromBlue) * mix);
  const alpha = fromAlpha + (toAlpha - fromAlpha) * mix;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getHeroScrollColors(colorMix: number) {
  return {
    backgroundColor: interpolateHex(
      LIGHT_BACKGROUND,
      DARK_BACKGROUND,
      colorMix,
    ),
    headingColor: interpolateHex(LIGHT_HEADING, DARK_HEADING, colorMix),
    bodyColor: interpolateRgba(LIGHT_BODY, DARK_BODY, colorMix),
    patternOpacity: colorMix * 0.4,
  };
}

export function getHeroScrollMotion(
  panelMix: number,
  panelStepPixels: number,
) {
  return {
    trackTranslateY: -panelMix * panelStepPixels,
  };
}
