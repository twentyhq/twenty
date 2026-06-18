import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { compositeTypeDefinitions, RelationType } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { MAX_CUSTOM_INDEXES_PER_OBJECT } from 'twenty-shared/constants';
import { type CreateIndexInput } from 'src/engine/metadata-modules/index-metadata/dtos/create-index.input';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { validateIndexTypeAgainstFieldsOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/validate-index-type-against-fields.util';
import { validateNoDuplicateUniqueIndexOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/validate-no-duplicate-unique-index.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class IndexMetadataService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createIndexInput,
    workspaceId,
  }: {
    createIndexInput: CreateIndexInput;
    workspaceId: string;
  }): Promise<FlatIndexMetadata> {
    const { fields: fieldInputs } = createIndexInput;

    if (fieldInputs.length === 0) {
      throw new IndexMetadataException(
        'At least one field is required to create an index',
        IndexMetadataExceptionCode.INDEX_FIELDS_REQUIRED,
        {
          userFriendlyMessage: msg`Pick at least one field for the index.`,
        },
      );
    }

    // Duplicate check considers (fieldMetadataId, subFieldName) pair so the
    // user CAN pick "Address > City" and "Address > Postcode" in the same
    // composite index, but not the exact same column twice.
    const dedupKeys = fieldInputs.map(
      (input) => `${input.fieldMetadataId}::${input.subFieldName ?? ''}`,
    );

    if (new Set(dedupKeys).size !== dedupKeys.length) {
      throw new IndexMetadataException(
        'Duplicate field+sub-field in index field list',
        IndexMetadataExceptionCode.DUPLICATE_INDEX_FIELDS,
        {
          userFriendlyMessage: msg`The same column cannot appear twice in an index.`,
        },
      );
    }

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
    } = await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
          'flatIndexMaps',
        ],
      },
    );

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: existingFlatObjectMetadataMaps,
      flatEntityId: createIndexInput.objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new IndexMetadataException(
        `Object metadata ${createIndexInput.objectMetadataId} not found`,
        IndexMetadataExceptionCode.INDEX_OBJECT_NOT_FOUND,
        {
          userFriendlyMessage: msg`Could not find the object for this index.`,
        },
      );
    }

    // Resolve each input to a flat field + validated subFieldName (or null
    // for scalar/relation parents).
    const resolvedInputs = fieldInputs.map((input) => {
      const flatField = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: existingFlatFieldMetadataMaps,
        flatEntityId: input.fieldMetadataId,
      });

      if (
        !isDefined(flatField) ||
        flatField.objectMetadataId !== createIndexInput.objectMetadataId
      ) {
        throw new IndexMetadataException(
          `Field ${input.fieldMetadataId} not found on object ${createIndexInput.objectMetadataId}`,
          IndexMetadataExceptionCode.INDEX_FIELD_NOT_FOUND_ON_OBJECT,
          {
            userFriendlyMessage: msg`One of the selected fields does not belong to this object.`,
          },
        );
      }

      if (
        isMorphOrRelationFlatFieldMetadata(flatField) &&
        flatField.settings?.relationType !== RelationType.MANY_TO_ONE
      ) {
        throw new IndexMetadataException(
          `Field ${flatField.name} is a non-MANY_TO_ONE relation and has no join column to index`,
          IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD,
          {
            userFriendlyMessage: msg`"${flatField.label}" is a one-to-many relation and can't be indexed directly. Index the foreign-key side instead.`,
          },
        );
      }

      const isComposite = isCompositeFieldMetadataType(flatField.type);

      if (isComposite) {
        if (!isNonEmptyString(input.subFieldName)) {
          throw new IndexMetadataException(
            `Composite field ${flatField.name} requires a sub-field selection`,
            IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
            {
              userFriendlyMessage: msg`Pick a specific sub-field of "${flatField.label}" — composite fields can't be indexed as a whole.`,
            },
          );
        }

        const compositeType = compositeTypeDefinitions.get(flatField.type);
        const knownProperty = compositeType?.properties.find(
          (property) => property.name === input.subFieldName,
        );

        if (!isDefined(knownProperty)) {
          throw new IndexMetadataException(
            `Unknown sub-field ${input.subFieldName} on composite field ${flatField.name}`,
            IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
            {
              userFriendlyMessage: msg`"${input.subFieldName}" is not a valid sub-field of "${flatField.label}".`,
            },
          );
        }
      } else if (isNonEmptyString(input.subFieldName)) {
        // Scalar / relation parent — sub-field doesn't apply.
        throw new IndexMetadataException(
          `Field ${flatField.name} is not composite — subFieldName must not be set`,
          IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
          {
            userFriendlyMessage: msg`"${flatField.label}" is not a composite field — remove the sub-field selection.`,
          },
        );
      }

      return {
        flatField,
        subFieldName: isComposite ? (input.subFieldName ?? null) : null,
      };
    });

    const objectFlatFieldMetadatas = resolvedInputs.map(
      ({ flatField }) => flatField,
    );

    validateIndexTypeAgainstFieldsOrThrow({
      indexType: createIndexInput.indexType,
      fields: resolvedInputs.map(({ flatField, subFieldName }) => ({
        type: flatField.type,
        name: flatField.name,
        label: flatField.label,
        subFieldName,
      })),
    });

    validateNoDuplicateUniqueIndexOrThrow({
      proposed: {
        isUnique: false,
        fields: resolvedInputs.map(({ flatField, subFieldName }) => ({
          fieldMetadataId: flatField.id,
          subFieldName,
        })),
      },
      existingFlatIndexMaps,
      objectMetadataId: createIndexInput.objectMetadataId,
    });

    const existingCustomIndexCount = Object.values(
      existingFlatIndexMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatIndex) =>
          flatIndex.objectMetadataId === createIndexInput.objectMetadataId &&
          flatIndex.isCustom,
      ).length;

    if (existingCustomIndexCount >= MAX_CUSTOM_INDEXES_PER_OBJECT) {
      throw new IndexMetadataException(
        `Custom index limit of ${MAX_CUSTOM_INDEXES_PER_OBJECT} reached for object ${createIndexInput.objectMetadataId}`,
        IndexMetadataExceptionCode.CUSTOM_INDEX_LIMIT_REACHED,
        {
          userFriendlyMessage: msg`You can have at most ${MAX_CUSTOM_INDEXES_PER_OBJECT} custom indexes per object. Delete one before creating a new one.`,
        },
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const indexMetadataUniversalIdentifier = v4();
    const createdAt = new Date().toISOString();

    const universalFlatIndexMetadata = generateFlatIndexMetadataWithNameOrThrow(
      {
        flatObjectMetadata,
        objectFlatFieldMetadatas,
        flatIndex: {
          createdAt,
          updatedAt: createdAt,
          indexType: createIndexInput.indexType,
          // WHERE clause is system-only — see CreateIndexInput for rationale.
          indexWhereClause: null,
          isCustom: true,
          isUnique: false,
          isSystemSideEffect: false,
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          universalIdentifier: indexMetadataUniversalIdentifier,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          universalFlatIndexFieldMetadatas: resolvedInputs.map(
            ({ flatField, subFieldName }, order) => ({
              createdAt,
              updatedAt: createdAt,
              order,
              subFieldName,
              fieldMetadataUniversalIdentifier: flatField.universalIdentifier,
              indexMetadataUniversalIdentifier,
            }),
          ),
        },
      },
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: [universalFlatIndexMetadata],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while creating index',
      );
    }

    const { flatIndexMaps: recomputedFlatIndexMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatIndexMaps'],
        },
      );

    const createdFlatIndexMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: indexMetadataUniversalIdentifier,
      flatEntityMaps: recomputedFlatIndexMaps,
    });

    if (!isDefined(createdFlatIndexMetadata)) {
      throw new IndexMetadataException(
        `Index ${indexMetadataUniversalIdentifier} was created but is missing from the recomputed cache`,
        IndexMetadataExceptionCode.INDEX_CREATION_FAILED,
      );
    }

    return createdFlatIndexMetadata;
  }

  async deleteOne({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<FlatIndexMetadata> {
    const { flatIndexMaps: existingFlatIndexMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatIndexMaps'],
        },
      );

    const flatIndexToDelete = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: existingFlatIndexMaps,
      flatEntityId: id,
    });

    // Map "no such index" to a domain-specific error so the GraphQL handler
    // can return a NotFoundError instead of leaking a FlatEntityMapsException.
    if (!isDefined(flatIndexToDelete)) {
      throw new IndexMetadataException(
        `Index ${id} not found`,
        IndexMetadataExceptionCode.INDEX_NOT_FOUND,
        {
          userFriendlyMessage: msg`This index does not exist or has already been deleted.`,
        },
      );
    }

    // Protect system indexes — they back uniqueness constraints, FK lookups,
    // and search performance. Dropping one corrupts the data model.
    if (!flatIndexToDelete.isCustom) {
      throw new IndexMetadataException(
        `Index ${id} is a system index and cannot be deleted`,
        IndexMetadataExceptionCode.CANNOT_DELETE_SYSTEM_INDEX,
        {
          userFriendlyMessage: msg`System indexes are required for Twenty to work and cannot be deleted.`,
        },
      );
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatIndexToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while deleting index',
      );
    }

    return flatIndexToDelete;
  }
}
