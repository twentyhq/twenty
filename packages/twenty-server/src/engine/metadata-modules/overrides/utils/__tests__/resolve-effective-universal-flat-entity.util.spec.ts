import { resolveEffectiveUniversalFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const universalFlatPageLayoutWidget = {
  applicationUniversalIdentifier: OWNER,
  title: 'Timeline',
  isActive: true,
  pageLayoutTabUniversalIdentifier: 'tab-1',
  position: { index: 0 },
  universalOverrides: null as unknown,
};

describe('resolveEffectiveUniversalFlatEntity', () => {
  it('returns the entity as is without overrides', () => {
    expect(
      resolveEffectiveUniversalFlatEntity({
        metadataName: 'pageLayoutWidget',
        universalFlatEntity: universalFlatPageLayoutWidget,
      }),
    ).toEqual(universalFlatPageLayoutWidget);
  });

  it('resolves relation overrides through their universal property', () => {
    const universalOverrides = {
      [CUSTOM]: { pageLayoutTabUniversalIdentifier: 'tab-2' },
      [OWNER]: { title: 'Activity', position: null },
    };

    expect(
      resolveEffectiveUniversalFlatEntity({
        metadataName: 'pageLayoutWidget',
        universalFlatEntity: {
          ...universalFlatPageLayoutWidget,
          universalOverrides,
        },
        authorContext: {
          workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        },
      }),
    ).toEqual({
      ...universalFlatPageLayoutWidget,
      universalOverrides,
      title: 'Activity',
      position: null,
      pageLayoutTabUniversalIdentifier: 'tab-2',
    });
  });

  it('lifts a legacy flat blob as the owner entry', () => {
    const universalOverrides = { pageLayoutTabUniversalIdentifier: null };

    expect(
      resolveEffectiveUniversalFlatEntity({
        metadataName: 'pageLayoutWidget',
        universalFlatEntity: {
          ...universalFlatPageLayoutWidget,
          universalOverrides,
        },
      }).pageLayoutTabUniversalIdentifier,
    ).toBeNull();
  });
});
