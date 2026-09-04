import { getSystemFormFieldPageLayoutWidgetUniversalIdentifier } from 'twenty-shared/application';
import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const buildSystemFormFieldPageLayoutWidget = ({
  applicationUniversalIdentifier,
  pageLayoutTabUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  flatFieldMetadata,
  index,
}: {
  applicationUniversalIdentifier: string;
  pageLayoutTabUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  flatFieldMetadata: Pick<UniversalFlatFieldMetadata, 'universalIdentifier'>;
  index: number;
}): UniversalFlatPageLayoutWidget => {
  const now = new Date().toISOString();

  return {
    universalIdentifier: getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
      fieldMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier,
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
    }),
    applicationUniversalIdentifier,
    pageLayoutTabUniversalIdentifier,
    title: '',
    type: WidgetType.FORM_FIELD,
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
    universalConfiguration: {
      configurationType: WidgetConfigurationType.FORM_FIELD,
      fieldMetadataId: flatFieldMetadata.universalIdentifier,
    },
    objectMetadataUniversalIdentifier,
    isActive: true,
    isSystemSideEffect: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalDisplay: null,
    conditionalAvailabilityExpression: null,
    universalOverrides: null,
  };
};
