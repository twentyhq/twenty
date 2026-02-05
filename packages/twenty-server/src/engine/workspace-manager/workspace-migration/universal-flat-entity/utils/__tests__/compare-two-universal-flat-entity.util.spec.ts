import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type AllMetadataName } from 'twenty-shared/metadata';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

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
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: true,
        }),
        metadataName: 'fieldMetadata',
        toUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
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
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: false,
        }),
        metadataName: 'fieldMetadata',
        toUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
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
});
