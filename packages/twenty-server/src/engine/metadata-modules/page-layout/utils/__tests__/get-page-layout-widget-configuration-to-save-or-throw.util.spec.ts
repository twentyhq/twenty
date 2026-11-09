import { isUndefined } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type DashboardFilterBinding } from 'twenty-shared/types';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { getPageLayoutWidgetConfigurationToSaveOrThrow } from 'src/engine/metadata-modules/page-layout/utils/get-page-layout-widget-configuration-to-save-or-throw.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c01';
const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c02';
const WIDGET_ID = 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90';

const CREATED_AT_FIELD_METADATA_ID = '7a1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c01';
const CLOSE_DATE_FIELD_METADATA_ID = '7a1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c02';

const PERIOD_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  fieldMetadataId: CREATED_AT_FIELD_METADATA_ID,
};

const CLOSE_DATE_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  fieldMetadataId: CLOSE_DATE_FIELD_METADATA_ID,
};

const NOT_APPLIED_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e04',
  fieldMetadataId: null,
};

const FIELD_METADATA_UNIVERSAL_IDENTIFIER_BY_ID = {
  [CREATED_AT_FIELD_METADATA_ID]: 'created-at-field',
  [CLOSE_DATE_FIELD_METADATA_ID]: 'close-date-field',
};

const buildConfiguration = (
  dashboardFilterBindings?: DashboardFilterBinding[] | null,
): FlatPageLayoutWidget['configuration'] => ({
  configurationType: WidgetConfigurationType.RECORD_TABLE,
  viewId: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b91',
  ...(isUndefined(dashboardFilterBindings) ? {} : { dashboardFilterBindings }),
});

const getConfigurationToSave = ({
  applicationUniversalIdentifier = INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
  existingConfiguration = buildConfiguration([
    PERIOD_BINDING,
    CLOSE_DATE_BINDING,
  ]),
  isNewWidget = false,
  configuration,
}: {
  applicationUniversalIdentifier?: string;
  existingConfiguration?: FlatPageLayoutWidget['configuration'];
  isNewWidget?: boolean;
  configuration: FlatPageLayoutWidget['configuration'];
}) =>
  getPageLayoutWidgetConfigurationToSaveOrThrow({
    existingWidget: isNewWidget
      ? undefined
      : {
          id: WIDGET_ID,
          applicationUniversalIdentifier,
          configuration: existingConfiguration,
        },
    configuration,
    fieldMetadataUniversalIdentifierById:
      FIELD_METADATA_UNIVERSAL_IDENTIFIER_BY_ID,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('getPageLayoutWidgetConfigurationToSaveOrThrow', () => {
  it.each([
    ['the workspace', WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER],
    ['twenty-standard', TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  ])(
    'should save changed bindings on a widget owned by %s',
    (_owner, applicationUniversalIdentifier) => {
      const configuration = buildConfiguration([PERIOD_BINDING]);

      expect(
        getConfigurationToSave({
          applicationUniversalIdentifier,
          configuration,
        }),
      ).toEqual(configuration);
    },
  );

  it('should save bindings on a new widget, such as one duplicated on a dashboard an application installed', () => {
    const configuration = buildConfiguration([PERIOD_BINDING]);

    expect(
      getConfigurationToSave({ isNewWidget: true, configuration }),
    ).toEqual(configuration);
  });

  it.each([
    ['the workspace', WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER],
    ['an installed application', INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER],
  ])(
    'should keep the stored bindings when a save of a widget owned by %s omits them',
    (_owner, applicationUniversalIdentifier) => {
      expect(
        getConfigurationToSave({
          applicationUniversalIdentifier,
          configuration: buildConfiguration(),
        }),
      ).toEqual(buildConfiguration([PERIOD_BINDING, CLOSE_DATE_BINDING]));
    },
  );

  it.each([
    ['null', null],
    ['an empty list', []],
  ])(
    'should clear the bindings of a workspace widget when the save sends %s',
    (_value, dashboardFilterBindings) => {
      const configuration = buildConfiguration(dashboardFilterBindings);

      expect(
        getConfigurationToSave({
          applicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          configuration,
        }),
      ).toEqual(configuration);
    },
  );

  it.each([
    [
      'adds a binding',
      buildConfiguration([
        PERIOD_BINDING,
        CLOSE_DATE_BINDING,
        {
          ...PERIOD_BINDING,
          pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e03',
        },
      ]),
    ],
    ['removes a binding', buildConfiguration([PERIOD_BINDING])],
    [
      'rebinds a filter',
      buildConfiguration([
        PERIOD_BINDING,
        {
          ...CLOSE_DATE_BINDING,
          fieldMetadataId: PERIOD_BINDING.fieldMetadataId,
        },
      ]),
    ],
    ['clears the bindings', buildConfiguration(null)],
  ])(
    'should reject a save that %s on a widget an application installed',
    (_change, configuration) => {
      expect(() => getConfigurationToSave({ configuration })).toThrow(
        new PageLayoutException(
          `Dashboard filter bindings of page layout widget "${WIDGET_ID}" are defined by the application that installed it and cannot be changed`,
          PageLayoutExceptionCode.DASHBOARD_FILTER_BINDINGS_NOT_EDITABLE,
        ),
      );
    },
  );

  it('should save a binding that excludes the widget from a filter', () => {
    const configuration = buildConfiguration([
      PERIOD_BINDING,
      NOT_APPLIED_BINDING,
    ]);

    expect(
      getConfigurationToSave({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        configuration,
      }),
    ).toEqual(configuration);
  });

  it('should reject a binding to a field that does not exist, even on a new widget', () => {
    const missingFieldMetadataId = '7a1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c09';

    expect(() =>
      getConfigurationToSave({
        isNewWidget: true,
        configuration: buildConfiguration([
          { ...PERIOD_BINDING, fieldMetadataId: missingFieldMetadataId },
        ]),
      }),
    ).toThrow(
      new PageLayoutException(
        `Dashboard filter "${PERIOD_BINDING.pageLayoutFilterId}" is bound to field "${missingFieldMetadataId}", which does not exist`,
        PageLayoutExceptionCode.INVALID_PAGE_LAYOUT_DATA,
      ),
    );
  });

  it('should drop the stored overrides to missing fields when a save omits the bindings', () => {
    expect(
      getConfigurationToSave({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        existingConfiguration: buildConfiguration([
          {
            ...PERIOD_BINDING,
            fieldMetadataId: '7a1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c09',
          },
          NOT_APPLIED_BINDING,
        ]),
        configuration: buildConfiguration(),
      }),
    ).toEqual(buildConfiguration([NOT_APPLIED_BINDING]));
  });

  it('should strip the keys a binding does not have, such as __typename', () => {
    const bindingSentBackByTheFront = {
      ...PERIOD_BINDING,
      __typename: 'DashboardFilterBinding',
    };

    expect(
      getConfigurationToSave({
        isNewWidget: true,
        configuration: buildConfiguration([bindingSentBackByTheFront]),
      }),
    ).toEqual(buildConfiguration([PERIOD_BINDING]));
  });

  it('should keep the stored bindings when the same bindings come back in another order', () => {
    const existingConfiguration = buildConfiguration([
      PERIOD_BINDING,
      CLOSE_DATE_BINDING,
    ]);

    expect(
      getConfigurationToSave({
        existingConfiguration,
        configuration: buildConfiguration([
          { ...CLOSE_DATE_BINDING },
          { ...PERIOD_BINDING },
        ]),
      }),
    ).toEqual(existingConfiguration);
  });

  it('should accept a save without bindings on an installed widget that has none', () => {
    const configuration = buildConfiguration([]);

    expect(
      getConfigurationToSave({
        existingConfiguration: buildConfiguration(),
        configuration,
      }),
    ).toEqual({ ...configuration, dashboardFilterBindings: undefined });
  });
});
