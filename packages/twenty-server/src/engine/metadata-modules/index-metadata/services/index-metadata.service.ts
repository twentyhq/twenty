import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { MAX_CUSTOM_INDEXES_PER_OBJECT } from 'src/engine/metadata-modules/index-metadata/constants/max-custom-indexes-per-object.constant';
import { type CreateIndexInput } from 'src/engine/metadata-modules/index-metadata/dtos/create-index.input';
import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { generateCustomFlatIndexMetadata } from 'src/engine/metadata-modules/index-metadata/utils/generate-custom-flat-index.util';
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
    // Reject unique up front. The CreateIndexInput type does not expose
    // isUnique, but a future contributor could add it — keep this guard so the
    // intent is explicit and unit-testable.
    if ((createIndexInput as { isUnique?: boolean }).isUnique === true) {
      throw new IndexMetadataException(
        'Unique indexes cannot be created here — use field creation instead',
        IndexMetadataExceptionCode.UNIQUE_INDEX_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`Unique indexes are created automatically when you mark a field as unique.`,
        },
      );
    }

    const { fieldMetadataIds } = createIndexInput;

    if (fieldMetadataIds.length === 0) {
      throw new IndexMetadataException(
        'At least one field is required to create an index',
        IndexMetadataExceptionCode.INDEX_FIELDS_REQUIRED,
        {
          userFriendlyMessage: msg`Pick at least one field for the index.`,
        },
      );
    }

    if (new Set(fieldMetadataIds).size !== fieldMetadataIds.length) {
      throw new IndexMetadataException(
        'Duplicate field ids in index field list',
        IndexMetadataExceptionCode.DUPLICATE_INDEX_FIELDS,
        {
          userFriendlyMessage: msg`The same field cannot appear twice in an index.`,
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

    const objectFlatFieldMetadatas = fieldMetadataIds.map((fieldId) => {
      const flatField = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: existingFlatFieldMetadataMaps,
        flatEntityId: fieldId,
      });

      if (
        !isDefined(flatField) ||
        flatField.objectMetadataId !== createIndexInput.objectMetadataId
      ) {
        throw new IndexMetadataException(
          `Field ${fieldId} not found on object ${createIndexInput.objectMetadataId}`,
          IndexMetadataExceptionCode.INDEX_FIELD_NOT_FOUND_ON_OBJECT,
          {
            userFriendlyMessage: msg`One of the selected fields does not belong to this object.`,
          },
        );
      }

      return flatField;
    });

    // Composite types (Address, Currency, Links, ...) can't be indexed as a
    // single field. computeFlatIndexFieldColumnNames filters their properties
    // by isIncludedInUniqueConstraint — which is false for everything in
    // Address/Currency — and returns []. That leaves the CREATE INDEX SQL
    // with an empty `()` column list and Postgres errors out with a syntax
    // error, leaving an orphaned indexMetadata row behind. Reject up front.
    for (const flatField of objectFlatFieldMetadatas) {
      if (isCompositeFieldMetadataType(flatField.type)) {
        const fieldType = flatField.type;
        const fieldLabel = flatField.label;

        throw new IndexMetadataException(
          `Cannot create index for composite field ${flatField.name} of type ${fieldType}`,
          IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD,
          {
            userFriendlyMessage: msg`The field "${fieldLabel}" (${fieldType}) is a composite type and can't be indexed directly. Index the underlying sub-fields instead, or pick a scalar field.`,
          },
        );
      }
    }

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

    const universalFlatIndexMetadata = generateCustomFlatIndexMetadata({
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
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        universalIdentifier: indexMetadataUniversalIdentifier,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        universalFlatIndexFieldMetadatas: objectFlatFieldMetadatas.map(
          (flatField, order) => ({
            createdAt,
            updatedAt: createdAt,
            order,
            fieldMetadataUniversalIdentifier: flatField.universalIdentifier,
            indexMetadataUniversalIdentifier,
          }),
        ),
      },
    });

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

    return findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: indexMetadataUniversalIdentifier,
      flatEntityMaps: recomputedFlatIndexMaps,
    });
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
