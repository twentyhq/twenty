import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isReservedSettingPageTitle } from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { SettingPageExceptionCode } from 'src/engine/metadata-modules/setting-page/setting-page.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type SettingPagePositionCollisionArgs = {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  scope: string;
  position: number;
  flatSettingPageMapsToSearch: MetadataUniversalFlatEntityMaps<'settingPage'>[];
};

// Two pages of the same application sharing a position in the same scope would
// render in an order the manifest does not determine, so the sync refuses it
// rather than picking a winner.
const hasSettingPagePositionCollision = ({
  universalIdentifier,
  applicationUniversalIdentifier,
  scope,
  position,
  flatSettingPageMapsToSearch,
}: SettingPagePositionCollisionArgs): boolean =>
  flatSettingPageMapsToSearch.some((flatSettingPageMaps) =>
    Object.values(flatSettingPageMaps.byUniversalIdentifier).some(
      (existingSettingPage) =>
        isDefined(existingSettingPage) &&
        existingSettingPage.universalIdentifier !== universalIdentifier &&
        existingSettingPage.applicationUniversalIdentifier ===
          applicationUniversalIdentifier &&
        existingSettingPage.scope === scope &&
        existingSettingPage.position === position,
    ),
  );

@Injectable()
export class FlatSettingPageValidatorService {
  public validateFlatSettingPageCreation({
    flatEntityToValidate: flatSettingPage,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSettingPageMaps: optimisticFlatSettingPageMaps,
      flatFrontComponentMaps,
    },
    remainingFlatEntityMapsToValidate,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.settingPage
  >): FailedFlatEntityValidation<'settingPage', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatSettingPage.universalIdentifier,
        title: flatSettingPage.title,
      },
      metadataName: 'settingPage',
      type: 'create',
    });

    if (!isNonEmptyString(flatSettingPage.title)) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.INVALID_SETTING_PAGE_INPUT,
        message: t`Setting page title is required`,
        userFriendlyMessage: msg`Setting page title is required`,
      });
    }

    if (
      isNonEmptyString(flatSettingPage.title) &&
      isReservedSettingPageTitle(flatSettingPage.title)
    ) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.RESERVED_SETTING_PAGE_TITLE,
        message: t`Setting page title "${flatSettingPage.title}" is reserved`,
        userFriendlyMessage: msg`This setting page title is reserved.`,
      });
    }

    const frontComponent = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatSettingPage.frontComponentUniversalIdentifier,
      flatEntityMaps: flatFrontComponentMaps,
    });

    if (!isDefined(frontComponent)) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.SETTING_PAGE_FRONT_COMPONENT_NOT_FOUND,
        message: t`Front component "${flatSettingPage.frontComponentUniversalIdentifier}" not found`,
        userFriendlyMessage: msg`The front component this setting page renders was not found.`,
      });
    }

    if (
      hasSettingPagePositionCollision({
        universalIdentifier: flatSettingPage.universalIdentifier,
        applicationUniversalIdentifier:
          flatSettingPage.applicationUniversalIdentifier,
        scope: flatSettingPage.scope,
        position: flatSettingPage.position,
        flatSettingPageMapsToSearch: [
          optimisticFlatSettingPageMaps,
          remainingFlatEntityMapsToValidate,
        ],
      })
    ) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.SETTING_PAGE_POSITION_ALREADY_TAKEN,
        message: t`Another setting page already uses position ${flatSettingPage.position}`,
        userFriendlyMessage: msg`Another setting page of this application already uses this position.`,
      });
    }

    return validationResult;
  }

  public validateFlatSettingPageUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSettingPageMaps: optimisticFlatSettingPageMaps,
      flatFrontComponentMaps,
    },
    finalFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.settingPage
  >): FailedFlatEntityValidation<'settingPage', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'settingPage',
      type: 'update',
    });

    const fromFlatSettingPage = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatSettingPageMaps,
    });

    if (!isDefined(fromFlatSettingPage)) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.SETTING_PAGE_NOT_FOUND,
        message: t`Setting page not found`,
        userFriendlyMessage: msg`Setting page not found.`,
      });

      return validationResult;
    }

    const updatedTitle = flatEntityUpdate.title;

    if (isDefined(updatedTitle)) {
      if (!isNonEmptyString(updatedTitle)) {
        validationResult.errors.push({
          code: SettingPageExceptionCode.INVALID_SETTING_PAGE_INPUT,
          message: t`Setting page title is required`,
          userFriendlyMessage: msg`Setting page title is required`,
        });
      } else if (isReservedSettingPageTitle(updatedTitle)) {
        validationResult.errors.push({
          code: SettingPageExceptionCode.RESERVED_SETTING_PAGE_TITLE,
          message: t`Setting page title "${updatedTitle}" is reserved`,
          userFriendlyMessage: msg`This setting page title is reserved.`,
        });
      }
    }

    const updatedFrontComponentUniversalIdentifier =
      flatEntityUpdate.frontComponentUniversalIdentifier;

    if (isDefined(updatedFrontComponentUniversalIdentifier)) {
      const frontComponent = findFlatEntityByUniversalIdentifier({
        universalIdentifier: updatedFrontComponentUniversalIdentifier,
        flatEntityMaps: flatFrontComponentMaps,
      });

      if (!isDefined(frontComponent)) {
        validationResult.errors.push({
          code: SettingPageExceptionCode.SETTING_PAGE_FRONT_COMPONENT_NOT_FOUND,
          message: t`Front component "${updatedFrontComponentUniversalIdentifier}" not found`,
          userFriendlyMessage: msg`The front component this setting page renders was not found.`,
        });
      }
    }

    const nextPosition = flatEntityUpdate.position ?? fromFlatSettingPage.position;
    const nextScope = flatEntityUpdate.scope ?? fromFlatSettingPage.scope;

    if (
      hasSettingPagePositionCollision({
        universalIdentifier,
        applicationUniversalIdentifier:
          fromFlatSettingPage.applicationUniversalIdentifier,
        scope: nextScope,
        position: nextPosition,
        flatSettingPageMapsToSearch: [finalFlatEntityMaps],
      })
    ) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.SETTING_PAGE_POSITION_ALREADY_TAKEN,
        message: t`Another setting page already uses position ${nextPosition}`,
        userFriendlyMessage: msg`Another setting page of this application already uses this position.`,
      });
    }

    return validationResult;
  }

  public validateFlatSettingPageDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSettingPageMaps: optimisticFlatSettingPageMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.settingPage
  >): FailedFlatEntityValidation<'settingPage', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        title: flatEntityToValidate.title,
      },
      metadataName: 'settingPage',
      type: 'delete',
    });

    const existingSettingPage = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatSettingPageMaps,
    });

    if (!isDefined(existingSettingPage)) {
      validationResult.errors.push({
        code: SettingPageExceptionCode.SETTING_PAGE_NOT_FOUND,
        message: t`Setting page not found`,
        userFriendlyMessage: msg`Setting page not found.`,
      });
    }

    return validationResult;
  }
}
