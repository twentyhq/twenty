// twenty-cli gives an app that ships no image a generated cover
// (GENERATED_COVER_PATH, twenty-cli/src/app/bundles/cover). The site draws
// that same cover itself (AppDefaultCover), so it fits any band.
export const isGeneratedCover = (url: string): boolean =>
  url.endsWith('/cover.generated.png');
