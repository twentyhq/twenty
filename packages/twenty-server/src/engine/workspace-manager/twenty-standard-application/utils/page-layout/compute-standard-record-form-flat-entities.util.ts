import { msg } from '@lingui/core/macro';
import {
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { RECORD_FORM_TAB_PROPS } from 'src/engine/metadata-modules/metadata-side-effect/constants/record-form-tab-props.constant';
import { computeRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-flat-field-metadatas.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

const STANDARD_RECORD_FORM_TAB_TITLE = i18nLabel(
  msg({
    message: `Fields`,
    context: 'pageLayoutTab.title',
  }),
);

const STANDARD_RECORD_FORM_NAME = i18nLabel(
  msg({
    message: `Creation Form`,
    context: 'pageLayout.name',
  }),
);

type ComputeStandardRecordFormFlatEntitiesArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

export const computeStandardRecordFormFlatEntities = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: ComputeStandardRecordFormFlatEntitiesArgs): {
  flatPageLayouts: FlatPageLayout[];
  flatPageLayoutTabs: FlatPageLayoutTab[];
  flatPageLayoutWidgets: FlatPageLayoutWidget[];
} => {
  const applicationUniversalIdentifier =
    TWENTY_STANDARD_APPLICATION.universalIdentifier;

  const flatPageLayouts: FlatPageLayout[] = [];
  const flatPageLayoutTabs: FlatPageLayoutTab[] = [];
  const flatPageLayoutWidgets: FlatPageLayoutWidget[] = [];

  const flatFieldMetadatasByObjectUniversalIdentifier = new Map<
    string,
    FlatFieldMetadata[]
  >();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    const objectFlatFieldMetadatas =
      flatFieldMetadatasByObjectUniversalIdentifier.get(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
      ) ?? [];

    objectFlatFieldMetadatas.push(flatFieldMetadata);
    flatFieldMetadatasByObjectUniversalIdentifier.set(
      flatFieldMetadata.objectMetadataUniversalIdentifier,
      objectFlatFieldMetadatas,
    );
  }

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const pageLayoutId = v4();
    const pageLayoutTabId = v4();

    const pageLayoutUniversalIdentifier =
      getSystemRecordFormPageLayoutUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      });

    const pageLayoutTabUniversalIdentifier =
      getSystemPageLayoutTabUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        pageLayoutUniversalIdentifier,
        title: RECORD_FORM_TAB_PROPS.title,
      });

    const orderedFormFlatFieldMetadatas = computeRecordFormFlatFieldMetadatas({
      flatFieldMetadatas:
        flatFieldMetadatasByObjectUniversalIdentifier.get(
          flatObjectMetadata.universalIdentifier,
        ) ?? [],
      labelIdentifierFieldMetadataUniversalIdentifier:
        flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
    });

    const objectFlatPageLayoutWidgets: FlatPageLayoutWidget[] =
      orderedFormFlatFieldMetadatas.map((flatFieldMetadata, index) => ({
        id: v4(),
        universalIdentifier:
          getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            pageLayoutTabUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              flatFieldMetadata.universalIdentifier,
          }),
        applicationId: twentyStandardApplicationId,
        applicationUniversalIdentifier,
        workspaceId,
        pageLayoutTabId,
        pageLayoutTabUniversalIdentifier,
        title: '',
        type: WidgetType.FORM_FIELD,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index,
        },
        configuration: {
          configurationType: WidgetConfigurationType.FORM_FIELD,
          fieldMetadataId: flatFieldMetadata.id,
        },
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FORM_FIELD,
          fieldMetadataId: flatFieldMetadata.universalIdentifier,
        },
        objectMetadataId: flatObjectMetadata.id,
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        isActive: true,
        isSystemSideEffect: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        conditionalDisplay: null,
        conditionalAvailabilityExpression: null,
        overrides: null,
        universalOverrides: null,
      }));

    flatPageLayoutWidgets.push(...objectFlatPageLayoutWidgets);

    flatPageLayoutTabs.push({
      id: pageLayoutTabId,
      universalIdentifier: pageLayoutTabUniversalIdentifier,
      applicationId: twentyStandardApplicationId,
      applicationUniversalIdentifier,
      workspaceId,
      title: STANDARD_RECORD_FORM_TAB_TITLE,
      position: RECORD_FORM_TAB_PROPS.position,
      pageLayoutId,
      pageLayoutUniversalIdentifier,
      widgetIds: objectFlatPageLayoutWidgets.map(
        (flatPageLayoutWidget) => flatPageLayoutWidget.id,
      ),
      widgetUniversalIdentifiers: objectFlatPageLayoutWidgets.map(
        (flatPageLayoutWidget) => flatPageLayoutWidget.universalIdentifier,
      ),
      isActive: true,
      isSystemSideEffect: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      icon: RECORD_FORM_TAB_PROPS.icon,
      layoutMode: RECORD_FORM_TAB_PROPS.layoutMode,
      overrides: null,
    });

    flatPageLayouts.push({
      id: pageLayoutId,
      universalIdentifier: pageLayoutUniversalIdentifier,
      applicationId: twentyStandardApplicationId,
      applicationUniversalIdentifier,
      workspaceId,
      name: STANDARD_RECORD_FORM_NAME,
      type: PageLayoutType.RECORD_FORM,
      isFirstTabPinned: true,
      objectMetadataId: flatObjectMetadata.id,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      isSystemSideEffect: true,
      tabIds: [pageLayoutTabId],
      tabUniversalIdentifiers: [pageLayoutTabUniversalIdentifier],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      defaultTabToFocusOnMobileAndSidePanelId: null,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
    });
  }

  return { flatPageLayouts, flatPageLayoutTabs, flatPageLayoutWidgets };
};
