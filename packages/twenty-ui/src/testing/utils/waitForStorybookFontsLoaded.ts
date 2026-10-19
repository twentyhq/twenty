const STORYBOOK_FONTS = [
  '400 1em Inter',
  '500 1em Inter',
  '600 1em Inter',
  '700 1em Inter',
  '400 1em "DM Mono"',
  '500 1em "DM Mono"',
];

export const waitForStorybookFontsLoaded = async () => {
  await Promise.all(STORYBOOK_FONTS.map((font) => document.fonts.load(font)));
  await document.fonts.ready;
};
