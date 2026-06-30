import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { flatEntityDeletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/universal-flat-entity-deleted-created-updated-matrix-dispatcher.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type TestContext = FromTo<MetadataFlatEntity<'fieldMetadata'>[]> & {
  metadataName: 'fieldMetadata';
  buildOptions: WorkspaceMigrationBuilderOptions;
};

describe('flatEntityDeletedCreatedUpdatedMatrixDispatcher', () => {
  const testCases = [
    {
      title: 'It should detect a created entity',
      context: {
        from: [],
        to: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
          }),
        ],
        metadataName: 'fieldMetadata',
        buildOptions: {
          inferDeletionFromMissingEntities: { fieldMetadata: false },
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application-universal-identifier-1',
        },
      },
    },
    {
      title: 'It should detect a deleted entity',
      context: {
        from: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
          }),
        ],
        to: [],
        metadataName: 'fieldMetadata',
        buildOptions: {
          inferDeletionFromMissingEntities: { fieldMetadata: true },
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application-universal-identifier-1',
        },
      },
    },
    {
      title: 'It should detect an updated entity',
      context: {
        from: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            isActive: false,
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
          }),
        ],
        to: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            isActive: true,
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
          }),
        ],
        metadataName: 'fieldMetadata',
        buildOptions: {
          inferDeletionFromMissingEntities: { fieldMetadata: false },
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application-universal-identifier-1',
        },
      },
    },
    {
      title: 'It should detect created, deleted and updated entities',
      context: {
        from: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
            isActive: true,
          }),
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-2',
            id: 'field-id-2',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
          }),
        ],
        to: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
            updatedAt: '2024-01-01T00:00:00.000Z',
            isActive: false,
          }),
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-3',
            id: 'field-id-3',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
            updatedAt: '2024-01-01T00:00:00.000Z',
          }),
        ],
        metadataName: 'fieldMetadata',
        buildOptions: {
          inferDeletionFromMissingEntities: { fieldMetadata: true },
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application-universal-identifier-1',
        },
      },
    },
    {
      title:
        'It should not detect deleted entities when inferDeletionFromMissingEntities is false',
      context: {
        from: [
          getFlatFieldMetadataMock({
            objectMetadataId: 'object-metadata-id-1',
            type: FieldMetadataType.TEXT,
            universalIdentifier: 'universal-identifier-1',
            id: 'field-id-1',
            workspaceId: 'workspace-id-1',
            applicationId: 'application-id-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            applicationUniversalIdentifier:
              'application-universal-identifier-1',
            objectMetadataUniversalIdentifier:
              'object-metadata-universal-identifier-1',
            updatedAt: '2024-01-01T00:00:00.000Z',
          }),
        ],
        to: [],
        metadataName: 'fieldMetadata',
        buildOptions: {
          inferDeletionFromMissingEntities: { fieldMetadata: false },
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application-universal-identifier-1',
        },
      },
    },
  ] as EachTestingContext<TestContext>[];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { from, to, metadataName, buildOptions } }) => {
      const result = flatEntityDeletedCreatedUpdatedMatrixDispatcher({
        from: from as any,
        to: to as any,
        metadataName,
        buildOptions,
      });

      expect(result).toMatchSnapshot();
    },
  );
});
