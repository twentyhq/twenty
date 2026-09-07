import {
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutType, WidgetType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-01-01T00:00:00.000Z',
    workspaceId: '20202020-0000-4000-8000-000000000000',
    twentyStandardApplicationId: '20202020-0000-4000-8000-000000000001',
  },
);

const getRecordFormWidgetFieldNames = (objectUniversalIdentifier: string) => {
  const pageLayoutUniversalIdentifier =
    getSystemRecordFormPageLayoutUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      objectUniversalIdentifier,
    });

  const pageLayoutTabUniversalIdentifier =
    getSystemPageLayoutTabUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      pageLayoutUniversalIdentifier,
      title: 'Fields',
    });

  const flatPageLayoutTab =
    allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
      pageLayoutTabUniversalIdentifier
    ];

  if (!isDefined(flatPageLayoutTab)) {
    throw new Error('expected the standard record form tab');
  }

  return flatPageLayoutTab.widgetUniversalIdentifiers
    .map(
      (widgetUniversalIdentifier) =>
        allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
          widgetUniversalIdentifier
        ],
    )
    .filter(isDefined)
    .map((flatPageLayoutWidget) => {
      expect(flatPageLayoutWidget.type).toBe(WidgetType.FORM_FIELD);
      expect(flatPageLayoutWidget.isSystemSideEffect).toBe(true);

      if (
        flatPageLayoutWidget.universalConfiguration.configurationType !==
        WidgetConfigurationType.FORM_FIELD
      ) {
        throw new Error('expected a FORM_FIELD configuration');
      }

      return allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        flatPageLayoutWidget.universalConfiguration.fieldMetadataId
      ]?.name;
    });
};

describe('computeStandardRecordFormFlatEntities', () => {
  it('should give every standard object a RECORD_FORM layout', () => {
    const recordFormPageLayouts = Object.values(
      allFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatPageLayout) => flatPageLayout.type === PageLayoutType.RECORD_FORM,
      );

    const objectCount = Object.values(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined).length;

    expect(recordFormPageLayouts).toHaveLength(objectCount);
  });

  it('should keep the many to one relation of person and drop its one to many ones', () => {
    const fieldNames = getRecordFormWidgetFieldNames(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
    );

    expect(fieldNames).toContain('company');
    expect(fieldNames).not.toContain('taskTargets');
    expect(fieldNames).not.toContain('noteTargets');
  });

  it('should put the label identifier first and drop system fields', () => {
    const fieldNames = getRecordFormWidgetFieldNames(
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
    );

    expect(fieldNames[0]).toBe('name');
    expect(fieldNames).not.toContain('id');
    expect(fieldNames).not.toContain('createdAt');
    expect(fieldNames).not.toContain('position');
    expect(fieldNames).not.toContain('searchVector');
  });
});
