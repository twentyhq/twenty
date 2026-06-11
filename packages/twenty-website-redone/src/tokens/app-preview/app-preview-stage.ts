// The mockup's marketing staging (authored, NOT product-derived): the
// window scene, frame geometry, and shadows the hero presents the product
// in. Values ported from the old AppPreviewFrame/window-shadows full reads.
export const APP_PREVIEW_STAGE = {
  frame: {
    maxWidthPx: 1040,
    aspectRatio: '1280 / 832',
    borderRadiusPx: 20,
    noiseImageUrl: '/images/shared/light-noise.webp',
  },
  windowScene: {
    widthPx: 1040,
    heightPx: 676,
  },
  shadow: {
    resting: '0 10px 64px 0 rgba(0, 0, 0, 0.2)',
    elevated:
      '0 14px 80px 0 rgba(0, 0, 0, 0.26), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
    floating: '0 36px 64px -8px rgba(0, 0, 0, 0.36)',
    mobileResting: '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
    mobileElevated: '0 6px 20px 0 rgba(0, 0, 0, 0.12)',
    mobileFloating: '0 14px 28px -4px rgba(0, 0, 0, 0.17)',
  },
};
