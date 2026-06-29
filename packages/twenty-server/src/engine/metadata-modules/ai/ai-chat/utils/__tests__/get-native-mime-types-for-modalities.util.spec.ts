import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-native-mime-types-for-modalities.util';

describe('getNativeMimeTypesForModalities', () => {
  it('returns an empty set when no modalities are provided', () => {
    expect(getNativeMimeTypesForModalities()).toEqual(new Set());
    expect(getNativeMimeTypesForModalities([])).toEqual(new Set());
  });

  it('maps image modality to image MIME types', () => {
    expect(getNativeMimeTypesForModalities(['image'])).toEqual(
      new Set([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
      ]),
    );
  });

  it('maps image and pdf modalities together', () => {
    expect(getNativeMimeTypesForModalities(['image', 'pdf'])).toEqual(
      new Set([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'application/pdf',
      ]),
    );
  });

  it('maps audio modality to audio MIME types', () => {
    expect(getNativeMimeTypesForModalities(['audio'])).toEqual(
      new Set([
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'audio/wav',
        'audio/x-wav',
        'audio/webm',
        'audio/ogg',
        'audio/flac',
        'audio/aac',
        'audio/aiff',
        'audio/x-m4a',
      ]),
    );
  });

  it('maps video modality to video MIME types', () => {
    expect(getNativeMimeTypesForModalities(['video'])).toEqual(
      new Set([
        'video/mp4',
        'video/mpeg',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-flv',
        'video/x-ms-wmv',
        'video/3gpp',
      ]),
    );
  });

  it('ignores unknown modalities', () => {
    expect(getNativeMimeTypesForModalities(['unknown', 'image'])).toEqual(
      new Set([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
      ]),
    );
  });
});
