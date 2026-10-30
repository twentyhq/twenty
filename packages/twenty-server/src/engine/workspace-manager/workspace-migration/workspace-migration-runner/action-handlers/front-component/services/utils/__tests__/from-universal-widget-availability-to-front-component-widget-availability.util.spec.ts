import { PageLayoutType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/front-component/services/utils/from-universal-widget-availability-to-front-component-widget-availability.util';

const COMPANY_OBJECT_METADATA_ID = '00000000-0000-4000-8000-000000000001';
const COMPANY_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';

const companyFlatObjectMetadata = getFlatObjectMetadataMock({
  id: COMPANY_OBJECT_METADATA_ID,
  universalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
});

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
  byUniversalIdentifier: {
    [COMPANY_UNIVERSAL_IDENTIFIER]: companyFlatObjectMetadata,
  },
  universalIdentifierById: {
    [COMPANY_OBJECT_METADATA_ID]: COMPANY_UNIVERSAL_IDENTIFIER,
  },
  universalIdentifiersByApplicationId: {},
};

describe('fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability', () => {
  it('keeps entries offered on every object', () => {
    expect(
      fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability({
        universalWidgetAvailability: [
          { pageLayoutType: PageLayoutType.RECORD_PAGE },
          { pageLayoutType: PageLayoutType.DASHBOARD },
        ],
        flatObjectMetadataMaps,
      }),
    ).toEqual([
      { pageLayoutType: PageLayoutType.RECORD_PAGE },
      { pageLayoutType: PageLayoutType.DASHBOARD },
    ]);
  });

  it('resolves object restrictions to object metadata ids', () => {
    expect(
      fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability({
        universalWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectMetadataUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
          },
        ],
        flatObjectMetadataMaps,
      }),
    ).toEqual([
      {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      },
    ]);
  });

  it('drops entries restricted to an object that no longer exists', () => {
    expect(
      fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability({
        universalWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectMetadataUniversalIdentifier: null,
          },
          { pageLayoutType: PageLayoutType.DASHBOARD },
        ],
        flatObjectMetadataMaps,
      }),
    ).toEqual([{ pageLayoutType: PageLayoutType.DASHBOARD }]);
  });

  it('throws on an object restriction that cannot be resolved', () => {
    expect(() =>
      fromUniversalWidgetAvailabilityToFrontComponentWidgetAvailability({
        universalWidgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectMetadataUniversalIdentifier:
              '20202020-0000-4000-8000-000000000099',
          },
        ],
        flatObjectMetadataMaps,
      }),
    ).toThrow();
  });
});
