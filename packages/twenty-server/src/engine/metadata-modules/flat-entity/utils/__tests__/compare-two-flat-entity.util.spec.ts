import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type AllMetadataName } from 'twenty-shared/metadata';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-properties-to-compare-and-stringify.constant';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { compareTwoFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/compare-two-flat-entity.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

type TestContext<T extends AllMetadataName = AllMetadataName> = FromTo<
  MetadataFlatEntity<T>,
  'flatEntity'
> & { metadataName: T };

describe('compareTwoFlatEntity', () => {
  const testCases = [
    {
      title:
        'It should detect flat field metadata isActive diff from true to false',
      context: {
        fromFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: true,
        }),
        metadataName: 'fieldMetadata',
        toFlatEntity: getFlatFieldMetadataMock({
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
        fromFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: false,
        }),
        metadataName: 'fieldMetadata',
        toFlatEntity: getFlatFieldMetadataMock({
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
    ({ context: { metadataName, fromFlatEntity, toFlatEntity } }) => {
      const result = compareTwoFlatEntity({
        fromFlatEntity,
        propertiesToCompare:
          ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName]
            .propertiesToCompare as any,
        propertiesToStringify:
          ALL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY[metadataName]
            .propertiesToStringify as any,
        toFlatEntity,
      });

      expect(result).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(result),
      );
    },
  );
});
