export const UNITS: {
  spacingBasePx: number;
  fontBaseRem: number;
  radiusBasePx: number;
} = {
  spacingBasePx: 4,
  fontBaseRem: 0.25,
  // 2px, matching the old site — verified against --radius-base there; a
  // 4px assumption shipped every radius() at double scale until caught.
  radiusBasePx: 2,
};
