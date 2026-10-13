import { PageLayoutType } from 'twenty-shared/types';

import { fromFrontComponentEntityToFlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-entity-to-flat-front-component.util';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';

const APPLICATION_ID = '00000000-0000-4000-8000-000000000001';
const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const COMPANY_OBJECT_METADATA_ID = '00000000-0000-4000-8000-000000000002';
const COMPANY_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';

const buildFrontComponentEntity = (
  overrides: Partial<FrontComponentEntity> = {},
): FrontComponentEntity =>
  Object.assign(new FrontComponentEntity(), {
    id: '00000000-0000-4000-8000-000000000003',
    universalIdentifier: '20202020-0000-4000-8000-000000000003',
    workspaceId: '00000000-0000-4000-8000-000000000004',
    applicationId: APPLICATION_ID,
    name: 'Company insights',
    description: null,
    sourceComponentPath: 'src/company-insights.tsx',
    builtComponentPath: 'dist/company-insights.mjs',
    componentName: 'CompanyInsights',
    builtComponentChecksum: 'checksum',
    isHeadless: false,
    usesSdkClient: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

const convert = (entity: FrontComponentEntity) =>
  fromFrontComponentEntityToFlatFrontComponent({
    entity,
    applicationIdToUniversalIdentifierMap: new Map([
      [APPLICATION_ID, APPLICATION_UNIVERSAL_IDENTIFIER],
    ]),
    objectMetadataUniversalIdentifierById: {
      [COMPANY_OBJECT_METADATA_ID]: COMPANY_UNIVERSAL_IDENTIFIER,
    },
  });

describe('fromFrontComponentEntityToFlatFrontComponent', () => {
  it('resolves object restrictions to object universal identifiers', () => {
    const flatFrontComponent = convert(
      buildFrontComponentEntity({
        widgetAvailability: [
          {
            pageLayoutType: PageLayoutType.RECORD_PAGE,
            objectMetadataId: COMPANY_OBJECT_METADATA_ID,
          },
          { pageLayoutType: PageLayoutType.DASHBOARD },
        ],
      }),
    );

    expect(flatFrontComponent.universalWidgetAvailability).toEqual([
      {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectMetadataUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
      },
      { pageLayoutType: PageLayoutType.DASHBOARD },
    ]);
  });

  it('falls back to the column default before its upgrade step has run', () => {
    const flatFrontComponent = convert(buildFrontComponentEntity());

    expect(flatFrontComponent.universalWidgetAvailability).toEqual([]);
  });
});
