import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import { FLAT_OBJECT_METADATA_MAPS_MOCKS } from 'src/engine/metadata-modules/flat-object-metadata-maps/mocks/flat-object-metadata-maps.mock';
import { deleteObjectFromFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-object-from-flat-object-metadata-maps-or-throw.util';
import { replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/replace-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { OPPORTUNITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/opportunity-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { fromFlatObjectMetadatasToFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadatas-to-flat-object-metadata-maps.util';
import { type WorkspaceMigrationBuilderTestCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/__tests__/types/workspace-migration-builder-test-case.type';

export const WORKSPACE_MIGRATION_OBJECT_BUILDER_TEST_CASES: WorkspaceMigrationBuilderTestCase[] =
  [
    {
      title: 'It should build an update_object for custom object',
      context: {
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps:
            replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatObjectMetadata: getFlatObjectMetadataMock({
                ...PET_FLAT_OBJECT_MOCK,
                nameSingular: 'prastouin',
                namePlural: 'prastoins',
                isLabelSyncedWithName: false,
              }),
            }),
        },
        expectedActionsTypeCounter: {
          updateObject: 1,
        },
      },
    },
    {
      title: 'It should build an update_object for standard object',
      context: {
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps:
            replaceFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              flatObjectMetadata: getFlatObjectMetadataMock({
                ...OPPORTUNITY_FLAT_OBJECT_MOCK,
                standardOverrides: {
                  description: 'Updated description',
                },
              }),
            }),
        },
        expectedActionsTypeCounter: {
          updateObject: 1,
        },
      },
    },
    {
      title: 'It should build a create_object action',
      context: {
        input: {
          fromFlatObjectMetadataMaps:
            fromFlatObjectMetadatasToFlatObjectMetadataMaps([
              PET_FLAT_OBJECT_MOCK,
            ]),
          toFlatObjectMetadataMaps:
            fromFlatObjectMetadatasToFlatObjectMetadataMaps([
              PET_FLAT_OBJECT_MOCK,
              ROCKET_FLAT_OBJECT_MOCK,
            ]),
        },
        expectedActionsTypeCounter: {
          createObject: 1,
        },
      },
    },
    {
      title:
        'It should build a create_object and create_index actions for each of this fieldMetadata',
      context: {
        input: {
          fromFlatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
          toFlatObjectMetadataMaps:
            fromFlatObjectMetadatasToFlatObjectMetadataMaps([
              {
                ...ROCKET_FLAT_OBJECT_MOCK,
                flatIndexMetadatas: [
                  getFlatIndexMetadataMock({
                    objectMetadataId: ROCKET_FLAT_OBJECT_MOCK.id,
                    uniqueIdentifier: 'field-metadata-unique-identifier-1',
                  }),
                ],
              },
            ]),
        },

        expectedActionsTypeCounter: {
          createObject: 1,
          createField: 0,
          createIndex: 1,
        },
      },
    },
    {
      title: 'It should build a delete_object action',
      context: {
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps:
            deleteObjectFromFlatObjectMetadataMapsOrThrow({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
              objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
            }),
        },
        expectedActionsTypeCounter: {
          deleteObject: 1,
          deleteField: COMPANY_FLAT_OBJECT_MOCK.flatFieldMetadatas.length,
        },
      },
    },
    {
      title: 'It should not infer any actions as from and to are identical',
      context: {
        input: {
          fromFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
          toFlatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS_MOCKS,
        },
      },
    },
  ];
