import { msg, t } from '@lingui/core/macro';
import {
  FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES,
  isFrontComponentWidgetPageLayoutType,
} from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalFrontComponentWidgetAvailability } from 'src/engine/metadata-modules/flat-front-component/types/universal-front-component-widget-availability.type';
import { FrontComponentExceptionCode } from 'src/engine/metadata-modules/front-component/front-component.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';

export const validateFrontComponentUniversalWidgetAvailability = ({
  universalWidgetAvailability,
  flatObjectMetadataMaps,
}: {
  universalWidgetAvailability: UniversalFrontComponentWidgetAvailability[];
  flatObjectMetadataMaps: MetadataUniversalFlatEntityMaps<'objectMetadata'>;
}): FlatEntityValidationError[] =>
  universalWidgetAvailability.flatMap<FlatEntityValidationError>(
    ({ pageLayoutType, objectMetadataUniversalIdentifier }) => {
      if (!isFrontComponentWidgetPageLayoutType(pageLayoutType)) {
        const supportedPageLayoutTypes =
          FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES.join(', ');
        const receivedPageLayoutType = String(pageLayoutType);

        return [
          {
            code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
            message: t`Front component widget availability has an unsupported page layout type: supported values are ${supportedPageLayoutTypes}, received ${receivedPageLayoutType}`,
            userFriendlyMessage: msg`Front component widget availability has an unsupported page layout type: supported values are ${supportedPageLayoutTypes}, received ${receivedPageLayoutType}`,
            value: pageLayoutType,
          },
        ];
      }

      if (!isDefined(objectMetadataUniversalIdentifier)) {
        return [];
      }

      if (pageLayoutType !== PageLayoutType.RECORD_PAGE) {
        return [
          {
            code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
            message: t`Front component widget availability can only restrict record pages to objects`,
            userFriendlyMessage: msg`Front component widget availability can only restrict record pages to objects`,
            value: pageLayoutType,
          },
        ];
      }

      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectMetadataUniversalIdentifier,
      });

      if (!isDefined(flatObjectMetadata)) {
        return [
          {
            code: FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
            message: t`Front component widget availability references an unknown object`,
            userFriendlyMessage: msg`Front component widget availability references an unknown object`,
            value: objectMetadataUniversalIdentifier,
          },
        ];
      }

      return [];
    },
  );
