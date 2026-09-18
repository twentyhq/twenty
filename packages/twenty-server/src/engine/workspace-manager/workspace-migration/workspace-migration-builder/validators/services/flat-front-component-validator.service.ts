import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  isReservedFrontComponentSettingsTabLabel,
  takesDefaultFrontComponentSettingsTab,
} from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { validateFilePath } from 'src/engine/core-modules/file-storage/utils/validate-file-path.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FrontComponentExceptionCode } from 'src/engine/metadata-modules/front-component/front-component.exception';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatFrontComponentValidatorService {
  public validateFlatFrontComponentCreation({
    flatEntityToValidate: flatFrontComponent,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
    remainingFlatEntityMapsToValidate,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatFrontComponent.universalIdentifier,
        name: flatFrontComponent.name,
      },
      metadataName: 'frontComponent',
      type: 'create',
    });

    if (!isNonEmptyString(flatFrontComponent.name)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Front component name is required`,
        userFriendlyMessage: msg`Front component name is required`,
      });
    }

    if (isDefined(flatFrontComponent.builtComponentPath)) {
      const builtPathResult = validateFilePath({
        resourcePath: flatFrontComponent.builtComponentPath,
        fileFolder: FileFolder.BuiltFrontComponent,
      });

      if (!builtPathResult.isValid) {
        validationResult.errors.push({
          code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          message: builtPathResult.error,
          userFriendlyMessage: msg`Built component path is invalid`,
        });
      }
    }

    if (isDefined(flatFrontComponent.sourceComponentPath)) {
      const sourcePathResult = validateFilePath({
        resourcePath: flatFrontComponent.sourceComponentPath,
        fileFolder: FileFolder.Source,
      });

      if (!sourcePathResult.isValid) {
        validationResult.errors.push({
          code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          message: sourcePathResult.error,
          userFriendlyMessage: msg`Source component path is invalid`,
        });
      }
    }

    validationResult.errors.push(
      ...this.getSettingsTabValidationErrors(flatFrontComponent.settingsTab),
      ...this.getDefaultSettingsTabCollisionErrors({
        applicationUniversalIdentifier:
          flatFrontComponent.applicationUniversalIdentifier,
        settingsTab: flatFrontComponent.settingsTab,
        universalIdentifier: flatFrontComponent.universalIdentifier,
        flatFrontComponentMapsToSearch: [
          optimisticFlatFrontComponentMaps,
          remainingFlatEntityMapsToValidate,
        ],
      }),
    );

    return validationResult;
  }

  public validateFlatFrontComponentDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'frontComponent',
      type: 'delete',
    });

    const existingFrontComponent = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatFrontComponentMaps,
    });

    if (!isDefined(existingFrontComponent)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component not found`,
        userFriendlyMessage: msg`Front component not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatFrontComponentUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatFrontComponentMaps: optimisticFlatFrontComponentMaps,
    },
    finalFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.frontComponent
  >): FailedFlatEntityValidation<'frontComponent', 'update'> {
    const fromFlatFrontComponent = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatFrontComponentMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'frontComponent',
      type: 'update',
    });

    if (!isDefined(fromFlatFrontComponent)) {
      validationResult.errors.push({
        code: FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component not found`,
        userFriendlyMessage: msg`Front component not found`,
      });

      return validationResult;
    }

    if (isDefined(flatEntityUpdate.builtComponentPath)) {
      const builtPathResult = validateFilePath({
        resourcePath: flatEntityUpdate.builtComponentPath,
        fileFolder: FileFolder.BuiltFrontComponent,
      });

      if (!builtPathResult.isValid) {
        validationResult.errors.push({
          code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          message: builtPathResult.error,
          userFriendlyMessage: msg`Built component path is invalid`,
        });
      }
    }

    if (isDefined(flatEntityUpdate.sourceComponentPath)) {
      const sourcePathResult = validateFilePath({
        resourcePath: flatEntityUpdate.sourceComponentPath,
        fileFolder: FileFolder.Source,
      });

      if (!sourcePathResult.isValid) {
        validationResult.errors.push({
          code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          message: sourcePathResult.error,
          userFriendlyMessage: msg`Source component path is invalid`,
        });
      }
    }

    if (isDefined(flatEntityUpdate.settingsTab)) {
      validationResult.errors.push(
        ...this.getSettingsTabValidationErrors(flatEntityUpdate.settingsTab),
        ...this.getDefaultSettingsTabCollisionErrors({
          applicationUniversalIdentifier:
            fromFlatFrontComponent.applicationUniversalIdentifier,
          settingsTab: flatEntityUpdate.settingsTab,
          universalIdentifier,
          flatFrontComponentMapsToSearch: [finalFlatEntityMaps],
        }),
      );
    }

    return validationResult;
  }

  private getSettingsTabValidationErrors(
    settingsTab: FlatFrontComponent['settingsTab'],
  ) {
    if (!isDefined(settingsTab)) {
      return [];
    }

    const errors = [];

    if (
      isDefined(settingsTab.position) &&
      !Number.isInteger(settingsTab.position)
    ) {
      errors.push({
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Settings tab position must be an integer`,
        userFriendlyMessage: msg`Settings tab position must be an integer`,
      });
    }

    if (isDefined(settingsTab.label)) {
      if (!isNonEmptyString(settingsTab.label)) {
        errors.push({
          code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          message: t`Settings tab label must not be empty`,
          userFriendlyMessage: msg`Settings tab label must not be empty`,
        });
      } else if (isReservedFrontComponentSettingsTabLabel(settingsTab.label)) {
        errors.push({
          code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          message: t`Settings tab label is reserved`,
          userFriendlyMessage: msg`Settings tab label is reserved`,
        });
      }
    }

    return errors;
  }

  // Two components taking the default tab would render as identically labelled
  // tabs on the same position. The SDK build rejects it, so this only catches a
  // manifest synced without going through it.
  private getDefaultSettingsTabCollisionErrors({
    applicationUniversalIdentifier,
    settingsTab,
    universalIdentifier,
    flatFrontComponentMapsToSearch,
  }: {
    applicationUniversalIdentifier: string;
    settingsTab: FlatFrontComponent['settingsTab'];
    universalIdentifier: string;
    flatFrontComponentMapsToSearch: MetadataUniversalFlatEntityMaps<
      typeof ALL_METADATA_NAME.frontComponent
    >[];
  }) {
    if (!takesDefaultFrontComponentSettingsTab(settingsTab)) {
      return [];
    }

    const collidesWithDefaultSettingsTab = flatFrontComponentMapsToSearch
      .flatMap((flatFrontComponentMaps) =>
        Object.values(flatFrontComponentMaps.byUniversalIdentifier),
      )
      .some(
        (otherFlatFrontComponent) =>
          isDefined(otherFlatFrontComponent) &&
          otherFlatFrontComponent.universalIdentifier !== universalIdentifier &&
          otherFlatFrontComponent.applicationUniversalIdentifier ===
            applicationUniversalIdentifier &&
          takesDefaultFrontComponentSettingsTab(
            otherFlatFrontComponent.settingsTab,
          ),
      );

    if (!collidesWithDefaultSettingsTab) {
      return [];
    }

    return [
      {
        code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        message: t`Only one settings front component can take the default settings tab`,
        userFriendlyMessage: msg`Only one settings front component can take the default settings tab`,
      },
    ];
  }
}
