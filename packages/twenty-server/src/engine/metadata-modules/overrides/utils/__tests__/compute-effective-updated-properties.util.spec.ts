import { computeEffectiveUpdatedProperties } from 'src/engine/metadata-modules/overrides/utils/compute-effective-updated-properties.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const flatFieldMetadata = {
  applicationUniversalIdentifier: OWNER,
  label: 'Company',
  description: null,
  icon: 'IconBuilding',
  isActive: true,
  isSystem: true,
  overrides: null as unknown,
};

describe('computeEffectiveUpdatedProperties', () => {
  it('reports a raw column update', () => {
    expect(
      computeEffectiveUpdatedProperties({
        metadataName: 'fieldMetadata',
        existingFlatEntity: flatFieldMetadata,
        flatEntityUpdate: { isActive: false },
      }),
    ).toEqual(['isActive']);
  });

  it('reports the property an override entry changes, not the overrides key', () => {
    expect(
      computeEffectiveUpdatedProperties({
        metadataName: 'fieldMetadata',
        existingFlatEntity: flatFieldMetadata,
        flatEntityUpdate: { overrides: { [CUSTOM]: { isActive: false } } },
      }),
    ).toEqual(['isActive']);
  });

  it('reports a removed entry as a change of its property', () => {
    expect(
      computeEffectiveUpdatedProperties({
        metadataName: 'fieldMetadata',
        existingFlatEntity: {
          ...flatFieldMetadata,
          overrides: {
            [CUSTOM]: { label: 'Société', isActive: false },
          } as unknown,
        },
        flatEntityUpdate: { overrides: { [CUSTOM]: { label: 'Société' } } },
      }),
    ).toEqual(['isActive']);
  });

  it('ignores an override that resolves to the same value', () => {
    expect(
      computeEffectiveUpdatedProperties({
        metadataName: 'fieldMetadata',
        existingFlatEntity: flatFieldMetadata,
        flatEntityUpdate: { overrides: { [CUSTOM]: { label: 'Company' } } },
      }),
    ).toEqual([]);
  });

  it('reports translations when only they change', () => {
    expect(
      computeEffectiveUpdatedProperties({
        metadataName: 'fieldMetadata',
        existingFlatEntity: flatFieldMetadata,
        flatEntityUpdate: {
          overrides: {
            [CUSTOM]: { translations: { 'fr-FR': { label: 'Société' } } },
          },
        },
      }),
    ).toEqual(['translations']);
  });
});
