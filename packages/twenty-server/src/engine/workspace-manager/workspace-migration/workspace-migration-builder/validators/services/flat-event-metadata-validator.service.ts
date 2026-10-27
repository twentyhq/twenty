import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { getEventDefinitionErrors } from 'twenty-shared/application';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { EventMetadataExceptionCode } from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatEventMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-event-metadata.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const validateEventMetadataDefinition = ({
  flatEventMetadata,
  flatObjectMetadataMaps,
}: {
  flatEventMetadata: Pick<
    UniversalFlatEventMetadata,
    'name' | 'label' | 'properties' | 'capabilities'
  >;
  flatObjectMetadataMaps: MetadataUniversalFlatEntityMaps<'objectMetadata'>;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (!isNonEmptyString(flatEventMetadata.name)) {
    errors.push({
      code: EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT,
      message: t`Event name is required`,
      userFriendlyMessage: msg`Event name is required`,
    });

    return errors;
  }

  if (!isNonEmptyString(flatEventMetadata.label)) {
    errors.push({
      code: EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT,
      message: t`Event label is required`,
      userFriendlyMessage: msg`Event label is required`,
    });
  }

  for (const definitionError of getEventDefinitionErrors({
    name: flatEventMetadata.name,
    properties: flatEventMetadata.properties,
    capabilities: flatEventMetadata.capabilities,
  })) {
    errors.push({
      code: EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT,
      message: definitionError,
      userFriendlyMessage: msg`Invalid event definition`,
    });
  }

  for (const property of flatEventMetadata.properties ?? []) {
    if (
      property.type === 'RECORD_REFERENCE' &&
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: property.objectUniversalIdentifier,
        }),
      )
    ) {
      errors.push({
        code: EventMetadataExceptionCode.INVALID_EVENT_METADATA_INPUT,
        message: t`Event property "${property.name}" references object "${property.objectUniversalIdentifier}", which was not found`,
        userFriendlyMessage: msg`An event property references an object that does not exist`,
      });
    }
  }

  return errors;
};

const findOtherEventMetadataWithName = ({
  flatEventMetadataMaps,
  name,
  applicationUniversalIdentifier,
  universalIdentifier,
}: {
  flatEventMetadataMaps: Pick<
    MetadataUniversalFlatEntityMaps<'eventMetadata'>,
    'byUniversalIdentifier'
  >;
  name: string;
  applicationUniversalIdentifier: string;
  universalIdentifier: string;
}) =>
  Object.values(flatEventMetadataMaps.byUniversalIdentifier).find(
    (existing) =>
      isDefined(existing) &&
      existing.name === name &&
      existing.applicationUniversalIdentifier ===
        applicationUniversalIdentifier &&
      existing.universalIdentifier !== universalIdentifier,
  );

const getNameAlreadyExistsError = (
  name: string,
): FlatEntityValidationError => ({
  code: EventMetadataExceptionCode.EVENT_METADATA_NAME_ALREADY_EXISTS,
  message: t`Event with name ${name} already exists for this application`,
  userFriendlyMessage: msg`An event with this name already exists for this application`,
});

@Injectable()
export class FlatEventMetadataValidatorService {
  public validateFlatEventMetadataCreation({
    flatEntityToValidate: flatEventMetadata,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatEventMetadataMaps: optimisticFlatEventMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.eventMetadata
  >): FailedFlatEntityValidation<'eventMetadata', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEventMetadata.universalIdentifier,
        name: flatEventMetadata.name,
      },
      metadataName: 'eventMetadata',
      type: 'create',
    });

    validationResult.errors.push(
      ...validateEventMetadataDefinition({
        flatEventMetadata,
        flatObjectMetadataMaps,
      }),
    );

    if (
      isDefined(
        findOtherEventMetadataWithName({
          flatEventMetadataMaps: optimisticFlatEventMetadataMaps,
          name: flatEventMetadata.name,
          applicationUniversalIdentifier:
            flatEventMetadata.applicationUniversalIdentifier,
          universalIdentifier: flatEventMetadata.universalIdentifier,
        }),
      )
    ) {
      validationResult.errors.push(
        getNameAlreadyExistsError(flatEventMetadata.name),
      );
    }

    return validationResult;
  }

  public validateFlatEventMetadataDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatEventMetadataMaps: optimisticFlatEventMetadataMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.eventMetadata
  >): FailedFlatEntityValidation<'eventMetadata', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'eventMetadata',
      type: 'delete',
    });

    if (
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: flatEntityToValidate.universalIdentifier,
          flatEntityMaps: optimisticFlatEventMetadataMaps,
        }),
      )
    ) {
      validationResult.errors.push({
        code: EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
        message: t`Event not found`,
        userFriendlyMessage: msg`Event not found`,
      });
    }

    return validationResult;
  }

  public validateFlatEventMetadataUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatEventMetadataMaps: optimisticFlatEventMetadataMaps,
      flatObjectMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.eventMetadata
  >): FailedFlatEntityValidation<'eventMetadata', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'eventMetadata',
      type: 'update',
    });

    const fromFlatEventMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatEventMetadataMaps,
    });

    if (!isDefined(fromFlatEventMetadata)) {
      validationResult.errors.push({
        code: EventMetadataExceptionCode.EVENT_METADATA_NOT_FOUND,
        message: t`Event not found`,
        userFriendlyMessage: msg`Event not found`,
      });

      return validationResult;
    }

    const toFlatEventMetadata = {
      ...fromFlatEventMetadata,
      ...flatEntityUpdate,
    };

    validationResult.errors.push(
      ...validateEventMetadataDefinition({
        flatEventMetadata: toFlatEventMetadata,
        flatObjectMetadataMaps,
      }),
    );

    if (
      isDefined(flatEntityUpdate.name) &&
      flatEntityUpdate.name !== fromFlatEventMetadata.name &&
      isDefined(
        findOtherEventMetadataWithName({
          flatEventMetadataMaps: optimisticFlatEventMetadataMaps,
          name: flatEntityUpdate.name,
          applicationUniversalIdentifier:
            fromFlatEventMetadata.applicationUniversalIdentifier,
          universalIdentifier,
        }),
      )
    ) {
      validationResult.errors.push(
        getNameAlreadyExistsError(flatEntityUpdate.name),
      );
    }

    return validationResult;
  }
}
