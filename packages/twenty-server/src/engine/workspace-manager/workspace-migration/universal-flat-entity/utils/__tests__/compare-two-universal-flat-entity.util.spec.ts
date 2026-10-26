import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type AllMetadataName } from 'twenty-shared/metadata';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  FieldMetadataType,
  type FromTo,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';

import { fromApplicationVariableManifestToUniversalFlatApplicationVariable } from 'src/engine/core-modules/application/application-manifest/converters/from-application-variable-manifest-to-universal-flat-application-variable.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const NOW = '2026-01-01T00:00:00.000Z';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';

const buildPageLayoutTab = ({
  pageLayoutUniversalIdentifier,
  title = 'Overview',
  now = NOW,
}: {
  pageLayoutUniversalIdentifier: string;
  title?: string;
  now?: string;
}) =>
  fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
    pageLayoutTabManifest: {
      universalIdentifier: 'page-layout-tab-universal-identifier',
      title,
      position: 0,
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [],
    },
    pageLayoutUniversalIdentifier,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    now,
  });

const buildApplicationVariable = ({ isSecret }: { isSecret: boolean }) =>
  fromApplicationVariableManifestToUniversalFlatApplicationVariable({
    key: 'API_KEY',
    universalIdentifier: 'application-variable-universal-identifier',
    defaultValue: null,
    isSecret,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  });

type TestContext<T extends AllMetadataName = AllMetadataName> = FromTo<
  MetadataUniversalFlatEntity<T>,
  'universalFlatEntity'
> & { metadataName: T };

describe('compareTwoFlatEntity', () => {
  const testCases = [
    {
      title:
        'It should detect flat field metadata isActive diff from true to false',
      context: {
        fromUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          objectMetadataUniversalIdentifier:
            'object-metadata-universal-identifier',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: true,
        }),
        metadataName: 'fieldMetadata',
        toUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          objectMetadataUniversalIdentifier:
            'object-metadata-universal-identifier',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: false,
        }),
      },
    },
    {
      title:
        'It should detect flat field metadata isActive diff from true to false',
      context: {
        fromUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          objectMetadataUniversalIdentifier:
            'object-metadata-universal-identifier',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: false,
        }),
        metadataName: 'fieldMetadata',
        toUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          objectMetadataUniversalIdentifier:
            'object-metadata-universal-identifier',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: true,
        }),
      },
    },
  ] as const satisfies EachTestingContext<TestContext>[];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({
      context: { metadataName, fromUniversalFlatEntity, toUniversalFlatEntity },
    }) => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity,
        toUniversalFlatEntity,
        metadataName,
      });

      expect(result).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...result }),
      );
    },
  );

  describe('non-updatable property divergences', () => {
    it('should report a page layout tab moved to another page layout', () => {
      expect(
        compareTwoFlatEntity({
          fromUniversalFlatEntity: buildPageLayoutTab({
            pageLayoutUniversalIdentifier: 'page-layout-a',
          }),
          toUniversalFlatEntity: buildPageLayoutTab({
            pageLayoutUniversalIdentifier: 'page-layout-b',
          }),
          metadataName: 'pageLayoutTab',
        }),
      ).toEqual({
        update: {},
        nonUpdatablePropertyDivergences: ['pageLayoutUniversalIdentifier'],
      });
    });

    it.each([
      { fromIsSecret: true, toIsSecret: false },
      { fromIsSecret: false, toIsSecret: true },
    ])(
      'should report an application variable isSecret change from $fromIsSecret to $toIsSecret',
      ({ fromIsSecret, toIsSecret }) => {
        expect(
          compareTwoFlatEntity({
            fromUniversalFlatEntity: buildApplicationVariable({
              isSecret: fromIsSecret,
            }),
            toUniversalFlatEntity: buildApplicationVariable({
              isSecret: toIsSecret,
            }),
            metadataName: 'applicationVariable',
          }),
        ).toEqual({
          update: {},
          nonUpdatablePropertyDivergences: ['isSecret'],
        });
      },
    );

    it('should ignore a stored value the incoming entity does not define', () => {
      expect(
        compareTwoFlatEntity({
          fromUniversalFlatEntity: {
            ...buildApplicationVariable({ isSecret: true }),
            value: 'enc:v2:stored' as EncryptedString,
          },
          toUniversalFlatEntity: buildApplicationVariable({ isSecret: true }),
          metadataName: 'applicationVariable',
        }),
      ).toBeUndefined();
    });

    it('should ignore server-managed timestamps', () => {
      expect(
        compareTwoFlatEntity({
          fromUniversalFlatEntity: buildPageLayoutTab({
            pageLayoutUniversalIdentifier: 'page-layout-a',
          }),
          toUniversalFlatEntity: buildPageLayoutTab({
            pageLayoutUniversalIdentifier: 'page-layout-a',
            title: 'Renamed',
            now: '2027-01-01T00:00:00.000Z',
          }),
          metadataName: 'pageLayoutTab',
        }),
      ).toEqual({
        update: { title: 'Renamed' },
        nonUpdatablePropertyDivergences: [],
      });
    });
  });
});
