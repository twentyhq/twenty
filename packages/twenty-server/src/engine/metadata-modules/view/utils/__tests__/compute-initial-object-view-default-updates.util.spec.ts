import { VIEW_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

import {
  INITIAL_OBJECT_VIEW_POSITION,
  INITIAL_OBJECT_VIEW_POSITION_AFTER_STANDARD_VIEWS,
} from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';
import { computeInitialObjectViewDefaultUpdates } from 'src/engine/metadata-modules/view/utils/compute-initial-object-view-default-updates.util';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000001';

type InitialObjectViewFixture = {
  type: ViewType;
  position: number;
  icon: string;
  deletedAt: string | null;
};

const seedDefaultsFlatView: InitialObjectViewFixture = {
  type: ViewType.TABLE,
  position: INITIAL_OBJECT_VIEW_POSITION,
  icon: VIEW_TYPE_DEFAULT_ICONS[ViewType.TABLE],
  deletedAt: null,
};

const buildFlatViewMaps = (
  flatViewByObjectUniversalIdentifier: Record<
    string,
    InitialObjectViewFixture | undefined
  >,
) => ({
  byUniversalIdentifier: Object.fromEntries(
    Object.entries(flatViewByObjectUniversalIdentifier).map(
      ([objectUniversalIdentifier, flatView]) => [
        getInitialObjectViewUniversalIdentifier({
          viewApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier,
        }),
        flatView,
      ],
    ),
  ),
});

const computeUpdates = (
  flatViewByObjectUniversalIdentifier: Record<
    string,
    InitialObjectViewFixture | undefined
  >,
) =>
  computeInitialObjectViewDefaultUpdates({
    flatViewMaps: buildFlatViewMaps(flatViewByObjectUniversalIdentifier),
    initialViewApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('computeInitialObjectViewDefaultUpdates', () => {
  it('should turn the seeded campaign view into a list', () => {
    const updates = computeUpdates({
      [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]:
        seedDefaultsFlatView,
    });

    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      type: ViewType.LIST,
      position: INITIAL_OBJECT_VIEW_POSITION,
      icon: VIEW_TYPE_DEFAULT_ICONS[ViewType.LIST],
    });
  });

  it('should move the seeded opportunity view below the standard views', () => {
    const updates = computeUpdates({
      [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity]: seedDefaultsFlatView,
    });

    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      type: ViewType.TABLE,
      position: INITIAL_OBJECT_VIEW_POSITION_AFTER_STANDARD_VIEWS,
    });
  });

  it('should produce nothing for an object without a default of its own', () => {
    expect(
      computeUpdates({
        [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company]: seedDefaultsFlatView,
      }),
    ).toHaveLength(0);
  });

  it('should skip a view that is already at its target', () => {
    expect(
      computeUpdates({
        [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]: {
          ...seedDefaultsFlatView,
          type: ViewType.LIST,
          icon: VIEW_TYPE_DEFAULT_ICONS[ViewType.LIST],
        },
      }),
    ).toHaveLength(0);
  });

  it('should skip a view whose type, position or icon was changed since the seed', () => {
    expect(
      computeUpdates({
        [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]: {
          ...seedDefaultsFlatView,
          position: 7,
        },
      }),
    ).toHaveLength(0);

    expect(
      computeUpdates({
        [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity]: {
          ...seedDefaultsFlatView,
          icon: 'IconCustomPick',
        },
      }),
    ).toHaveLength(0);
  });

  it('should skip a soft-deleted or missing view', () => {
    expect(
      computeUpdates({
        [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]: {
          ...seedDefaultsFlatView,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    ).toHaveLength(0);

    expect(computeUpdates({})).toHaveLength(0);
  });
});
