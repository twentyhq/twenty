import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { PageLayoutTabExceptionCode } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatPageLayoutWidgetValidatorService {
  constructor() {}

  public validateFlatPageLayoutWidgetUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): FailedFlatEntityValidation<'pageLayoutWidget', 'update'> {
    const existingFlatPageLayoutWidget =
      optimisticFlatPageLayoutWidgetMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatPageLayoutWidget?.universalIdentifier,
      },
      metadataName: 'pageLayoutWidget',
      type: 'update',
    });

    if (!isDefined(existingFlatPageLayoutWidget)) {
      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
        message: t`Page layout widget to update not found`,
        userFriendlyMessage: msg`Page layout widget to update not found`,
      });

      return validationResult;
    }

    const updatedFlatPageLayoutWidget = {
      ...existingFlatPageLayoutWidget,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      id: updatedFlatPageLayoutWidget.id,
      pageLayoutTabId: updatedFlatPageLayoutWidget.pageLayoutTabId,
    };

    return validationResult;
  }

  public validateFlatPageLayoutWidgetDeletion({
    flatEntityToValidate: {
      id: pageLayoutWidgetIdToDelete,
      universalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): FailedFlatEntityValidation<'pageLayoutWidget', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: pageLayoutWidgetIdToDelete,
        universalIdentifier,
      },
      metadataName: 'pageLayoutWidget',
      type: 'delete',
    });

    const existingFlatPageLayoutWidget =
      optimisticFlatPageLayoutWidgetMaps.byId[pageLayoutWidgetIdToDelete];

    if (!isDefined(existingFlatPageLayoutWidget)) {
      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
        message: t`Page layout widget to delete not found`,
        userFriendlyMessage: msg`Page layout widget to delete not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatPageLayoutWidgetCreation({
    flatEntityToValidate: flatPageLayoutWidgetToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: optimisticFlatPageLayoutWidgetMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayoutWidget
  >): FailedFlatEntityValidation<'pageLayoutWidget', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatPageLayoutWidgetToValidate.id,
        universalIdentifier: flatPageLayoutWidgetToValidate.universalIdentifier,
        pageLayoutTabId: flatPageLayoutWidgetToValidate.pageLayoutTabId,
      },
      metadataName: 'pageLayoutWidget',
      type: 'create',
    });

    const existingFlatPageLayoutWidget =
      optimisticFlatPageLayoutWidgetMaps.byId[
        flatPageLayoutWidgetToValidate.id
      ];

    if (isDefined(existingFlatPageLayoutWidget)) {
      const flatPageLayoutWidgetId = flatPageLayoutWidgetToValidate.id;

      validationResult.errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Page layout widget with id ${flatPageLayoutWidgetId} already exists`,
        userFriendlyMessage: msg`Page layout widget already exists`,
      });
    }

    const referencedPageLayoutTab = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatPageLayoutWidgetToValidate.pageLayoutTabId,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    if (!isDefined(referencedPageLayoutTab)) {
      validationResult.errors.push({
        code: PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND,
        message: t`Page layout tab not found`,
        userFriendlyMessage: msg`Page layout tab not found`,
      });
    }

    return validationResult;
  }
}
