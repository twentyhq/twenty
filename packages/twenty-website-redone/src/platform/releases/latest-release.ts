// The newest release, surfaced in the menu's Releases preview. The old site
// derives this from the generated release-notes manifest; until the releases
// route family is ported (which brings the content pipeline), this record
// tracks the manifest's head entry and is updated with each release.
export const LATEST_RELEASE: {
  release: string;
  title: string;
  previewImage: string;
} = {
  release: '2.0.0',
  title: 'Build an app',
  previewImage: '/images/releases/2.0/2.0.0-build-anything.webp',
};
