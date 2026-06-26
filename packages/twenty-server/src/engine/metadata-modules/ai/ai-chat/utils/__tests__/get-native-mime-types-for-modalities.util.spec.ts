import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-native-mime-types-for-modalities.util';

describe('getNativeMimeTypesForModalities', () => {
  it('returns an empty set when no modalities are provided', () => {
    expect(getNativeMimeTypesForModalities()).toEqual(new Set());
    expect(getNativeMimeTypesForModalities([])).toEqual(new Set());
  });

  it('maps image modality to image MIME types', () => {
    expect(getNativeMimeTypesForModalities(['image'])).toEqual(
      new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    );
  });

  it('maps image and pdf modalities together', () => {
    expect(getNativeMimeTypesForModalities(['image', 'pdf'])).toEqual(
      new Set([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
      ]),
    );
  });

  it('ignores unknown modalities', () => {
    expect(getNativeMimeTypesForModalities(['audio', 'image'])).toEqual(
      new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    );
  });
});
