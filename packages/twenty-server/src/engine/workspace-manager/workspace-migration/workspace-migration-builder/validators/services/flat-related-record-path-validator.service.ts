/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { MAX_INHERENT_RELATED_RECORD_PATH_CHAIN_LENGTH } from 'src/engine/metadata-modules/related-record-path/constants/max-inherent-related-record-path-chain-length.constant';
import { RelatedRecordPathExceptionCode } from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';
import {
  hasInherentRelatedRecordPathCycle,
  type InherentRelatedRecordPathEdge,
} from 'src/engine/metadata-modules/related-record-path/utils/has-inherent-related-record-path-cycle.util';
import { getInherentRelatedRecordPathChainLengthThroughPath } from 'src/engine/metadata-modules/related-record-path/utils/get-inherent-related-record-path-chain-length-through-path.util';
import { getRelatedRecordPathFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/related-record-path/utils/get-related-record-path-field-metadata-universal-identifiers.util';
import { type UniversalFlatRelatedRecordPath } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-related-record-path.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type RelatedRecordPathRelatedMaps = Pick<
  UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >['optimisticFlatEntityMapsAndRelatedFlatEntityMaps'],
  | 'flatObjectMetadataMaps'
  | 'flatFieldMetadataMaps'
  | 'flatRelatedRecordPathMaps'
>;

const buildInvalidInputError = ({
  message,
  userFriendlyMessage,
}: Pick<
  FlatEntityValidationError,
  'message' | 'userFriendlyMessage'
>): FlatEntityValidationError => ({
  code: RelatedRecordPathExceptionCode.INVALID_RELATED_RECORD_PATH_INPUT,
  message,
  userFriendlyMessage,
});

const buildInherentRelatedRecordPathEdge = ({
  universalFlatRelatedRecordPath,
  flatFieldMetadataMaps,
}: {
  universalFlatRelatedRecordPath: UniversalFlatRelatedRecordPath;
  flatFieldMetadataMaps: RelatedRecordPathRelatedMaps['flatFieldMetadataMaps'];
}): InherentRelatedRecordPathEdge | undefined => {
  const fieldMetadataUniversalIdentifiers =
    getRelatedRecordPathFieldMetadataUniversalIdentifiers(
      universalFlatRelatedRecordPath,
    );
  const lastFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier:
      fieldMetadataUniversalIdentifiers[
        fieldMetadataUniversalIdentifiers.length - 1
      ],
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(lastFlatFieldMetadata) ||
    !isMorphOrRelationUniversalFlatFieldMetadata(lastFlatFieldMetadata) ||
    !isDefined(
      lastFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    )
  ) {
    return undefined;
  }

  return {
    sourceObjectMetadataUniversalIdentifier:
      universalFlatRelatedRecordPath.objectMetadataUniversalIdentifier,
    targetObjectMetadataUniversalIdentifier:
      lastFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
  };
};

const buildNotFoundError = (): FlatEntityValidationError => ({
  code: RelatedRecordPathExceptionCode.RELATED_RECORD_PATH_NOT_FOUND,
  message: t`Related record path not found`,
  userFriendlyMessage: msg`Related record path not found`,
});

@Injectable()
export class FlatRelatedRecordPathValidatorService {
  private collectPathErrors({
    universalFlatRelatedRecordPath,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatRelatedRecordPathMaps,
    },
  }: {
    universalFlatRelatedRecordPath: UniversalFlatRelatedRecordPath;
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: RelatedRecordPathRelatedMaps;
  }): FlatEntityValidationError[] {
    const {
      objectMetadataUniversalIdentifier,
      secondFieldMetadataUniversalIdentifier,
      thirdFieldMetadataUniversalIdentifier,
    } = universalFlatRelatedRecordPath;

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return [
        buildInvalidInputError({
          message: t`Related record path object not found`,
          userFriendlyMessage: msg`Related record path object not found`,
        }),
      ];
    }

    if (
      isDefined(thirdFieldMetadataUniversalIdentifier) &&
      !isDefined(secondFieldMetadataUniversalIdentifier)
    ) {
      return [
        buildInvalidInputError({
          message: t`Related record path cannot skip its second relation`,
          userFriendlyMessage: msg`Related record path cannot skip its second relation`,
        }),
      ];
    }

    if (
      universalFlatRelatedRecordPath.isInherent &&
      isDefined(thirdFieldMetadataUniversalIdentifier)
    ) {
      return [
        buildInvalidInputError({
          message: t`Inherent related record paths cannot have more than two relations`,
          userFriendlyMessage: msg`Inherent related record paths cannot have more than two relations`,
        }),
      ];
    }

    const fieldMetadataUniversalIdentifiers =
      getRelatedRecordPathFieldMetadataUniversalIdentifiers(
        universalFlatRelatedRecordPath,
      );

    const visitedObjectMetadataUniversalIdentifiers = new Set([
      objectMetadataUniversalIdentifier,
    ]);
    let currentObjectMetadataUniversalIdentifier =
      objectMetadataUniversalIdentifier;

    for (const fieldMetadataUniversalIdentifier of fieldMetadataUniversalIdentifiers) {
      const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(flatFieldMetadata)) {
        return [
          buildInvalidInputError({
            message: t`Related record path field not found`,
            userFriendlyMessage: msg`Related record path field not found`,
          }),
        ];
      }

      if (
        flatFieldMetadata.objectMetadataUniversalIdentifier !==
        currentObjectMetadataUniversalIdentifier
      ) {
        return [
          buildInvalidInputError({
            message: t`Each related record path field must belong to the object reached by the previous relation`,
            userFriendlyMessage: msg`Each related record path field must belong to the object reached by the previous relation`,
          }),
        ];
      }

      if (
        !isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata) ||
        isMorphRelationHead(flatFieldMetadata) ||
        !isDefined(
          flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
        )
      ) {
        return [
          buildInvalidInputError({
            message: t`Related record path fields must be relations`,
            userFriendlyMessage: msg`Related record path fields must be relations`,
          }),
        ];
      }

      if (!flatFieldMetadata.isActive) {
        return [
          buildInvalidInputError({
            message: t`Related record path fields must be active`,
            userFriendlyMessage: msg`Related record path fields must be active`,
          }),
        ];
      }

      const nextObjectMetadataUniversalIdentifier =
        flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier;

      if (
        visitedObjectMetadataUniversalIdentifiers.has(
          nextObjectMetadataUniversalIdentifier,
        )
      ) {
        return [
          buildInvalidInputError({
            message: t`Related record path cannot visit the same object twice`,
            userFriendlyMessage: msg`Related record path cannot visit the same object twice`,
          }),
        ];
      }

      visitedObjectMetadataUniversalIdentifiers.add(
        nextObjectMetadataUniversalIdentifier,
      );
      currentObjectMetadataUniversalIdentifier =
        nextObjectMetadataUniversalIdentifier;
    }

    const hasDuplicatePath = Object.values(
      flatRelatedRecordPathMaps.byUniversalIdentifier,
    ).some(
      (otherFlatRelatedRecordPath) =>
        isDefined(otherFlatRelatedRecordPath) &&
        otherFlatRelatedRecordPath.universalIdentifier !==
          universalFlatRelatedRecordPath.universalIdentifier &&
        getRelatedRecordPathFieldMetadataUniversalIdentifiers(
          otherFlatRelatedRecordPath,
        ).join() === fieldMetadataUniversalIdentifiers.join(),
    );

    if (hasDuplicatePath) {
      return [
        buildInvalidInputError({
          message: t`This related record path already exists`,
          userFriendlyMessage: msg`This related record path already exists`,
        }),
      ];
    }

    if (!universalFlatRelatedRecordPath.isInherent) {
      return [];
    }

    const inherentRelatedRecordPathEdges = [
      ...Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier).filter(
        (otherFlatRelatedRecordPath) =>
          isDefined(otherFlatRelatedRecordPath) &&
          otherFlatRelatedRecordPath.isInherent &&
          otherFlatRelatedRecordPath.universalIdentifier !==
            universalFlatRelatedRecordPath.universalIdentifier,
      ),
      universalFlatRelatedRecordPath,
    ]
      .filter(isDefined)
      .map((flatRelatedRecordPath) =>
        buildInherentRelatedRecordPathEdge({
          universalFlatRelatedRecordPath: flatRelatedRecordPath,
          flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined);

    if (hasInherentRelatedRecordPathCycle({ inherentRelatedRecordPathEdges })) {
      return [
        buildInvalidInputError({
          message: t`Inherent related record paths cannot form a cycle`,
          userFriendlyMessage: msg`Inherent related record paths cannot form a cycle`,
        }),
      ];
    }

    const inherentRelatedRecordPathEdge = buildInherentRelatedRecordPathEdge({
      universalFlatRelatedRecordPath,
      flatFieldMetadataMaps,
    });

    if (
      isDefined(inherentRelatedRecordPathEdge) &&
      getInherentRelatedRecordPathChainLengthThroughPath({
        inherentRelatedRecordPathEdges,
        inherentRelatedRecordPathEdge,
      }) > MAX_INHERENT_RELATED_RECORD_PATH_CHAIN_LENGTH
    ) {
      return [
        buildInvalidInputError({
          message: t`No more than ${MAX_INHERENT_RELATED_RECORD_PATH_CHAIN_LENGTH} inherent related record paths can follow one another`,
          userFriendlyMessage: msg`No more than ${MAX_INHERENT_RELATED_RECORD_PATH_CHAIN_LENGTH} inherent related record paths can follow one another`,
        }),
      ];
    }

    return [];
  }

  public validateFlatRelatedRecordPathCreation({
    flatEntityToValidate: universalFlatRelatedRecordPath,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >): FailedFlatEntityValidation<'relatedRecordPath', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: universalFlatRelatedRecordPath.universalIdentifier,
      },
      metadataName: 'relatedRecordPath',
      type: 'create',
    });

    validationResult.errors.push(
      ...this.collectPathErrors({
        universalFlatRelatedRecordPath,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatRelatedRecordPathDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRelatedRecordPathMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >): FailedFlatEntityValidation<'relatedRecordPath', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'relatedRecordPath',
      type: 'delete',
    });

    const existingFlatRelatedRecordPath = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: flatRelatedRecordPathMaps,
    });

    if (!isDefined(existingFlatRelatedRecordPath)) {
      validationResult.errors.push(buildNotFoundError());
    }

    return validationResult;
  }

  public validateFlatRelatedRecordPathUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.relatedRecordPath
  >): FailedFlatEntityValidation<'relatedRecordPath', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'relatedRecordPath',
      type: 'update',
    });

    const existingFlatRelatedRecordPath = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRelatedRecordPathMaps,
    });

    if (!isDefined(existingFlatRelatedRecordPath)) {
      validationResult.errors.push(buildNotFoundError());

      return validationResult;
    }

    validationResult.errors.push(
      ...this.collectPathErrors({
        universalFlatRelatedRecordPath: {
          ...existingFlatRelatedRecordPath,
          ...flatEntityUpdate,
        },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }
}
