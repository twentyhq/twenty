import { ViewTabType } from 'twenty-shared/types';

import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { getFlatViewFilterViewTabErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-flat-view-filter-view-tab-errors.util';

const buildFlatViewTabMaps = (type: ViewTabType) =>
  ({
    byUniversalIdentifier: {
      'view-tab': {
        universalIdentifier: 'view-tab',
        viewUniversalIdentifier: 'view',
        type,
      },
    },
  }) as unknown as MetadataUniversalFlatEntityMaps<'viewTab'>;

const validate = ({
  viewTabUniversalIdentifier,
  viewUniversalIdentifier = 'view',
  type = ViewTabType.CUSTOM,
}: {
  viewTabUniversalIdentifier: string | null;
  viewUniversalIdentifier?: string;
  type?: ViewTabType;
}) =>
  getFlatViewFilterViewTabErrors({
    viewFilter: { viewTabUniversalIdentifier, viewUniversalIdentifier },
    flatViewTabMaps: buildFlatViewTabMaps(type),
  }).map(({ message }) => message);

describe('getFlatViewFilterViewTabErrors', () => {
  it('accepts a view-level filter', () => {
    expect(validate({ viewTabUniversalIdentifier: null })).toEqual([]);
  });

  it('accepts a filter on a custom tab of the same view', () => {
    expect(validate({ viewTabUniversalIdentifier: 'view-tab' })).toEqual([]);
  });

  it('rejects a filter on a tab that does not exist', () => {
    expect(validate({ viewTabUniversalIdentifier: 'missing-tab' })).toEqual([
      'View tab not found',
    ]);
  });

  it('rejects a filter on a tab of another view', () => {
    expect(
      validate({
        viewTabUniversalIdentifier: 'view-tab',
        viewUniversalIdentifier: 'other-view',
      }),
    ).toEqual(['View filter and view tab must belong to the same view']);
  });

  it.each([ViewTabType.FIELD_VALUE, ViewTabType.NO_VALUE, ViewTabType.ALL])(
    'rejects a filter on a %s tab',
    (type) => {
      expect(
        validate({ viewTabUniversalIdentifier: 'view-tab', type }),
      ).toEqual(['View filters can only belong to a custom tab']);
    },
  );
});
