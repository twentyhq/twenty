// The studio loads user-imported (possibly Draco-compressed) GLBs through this
// CDN decoder. The marketing engine uses pre-baked non-Draco GLBs and needs
// none — this lives only in the standalone studio.
export const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';
