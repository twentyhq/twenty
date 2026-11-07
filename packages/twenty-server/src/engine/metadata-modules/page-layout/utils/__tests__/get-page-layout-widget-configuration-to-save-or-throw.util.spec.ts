import { isUndefined } from '@sniptt/guards';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  type DashboardFilterBinding,
  PageLayoutType,
} from 'twenty-shared/types';

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

const PERIOD_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  fieldMetadataId: '7a1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c01',
};

const CLOSE_DATE_BINDING: DashboardFilterBinding = {
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  fieldMetadataId: '7a1c2d3e-4f50-4a6b-8c7d-9e0f1a2b3c02',
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
  type = PageLayoutType.DASHBOARD,
  existingConfiguration = buildConfiguration([
    PERIOD_BINDING,
    CLOSE_DATE_BINDING,
  ]),
  configuration,
}: {
  applicationUniversalIdentifier?: string;
  type?: PageLayoutType;
  existingConfiguration?: FlatPageLayoutWidget['configuration'];
  configuration: FlatPageLayoutWidget['configuration'];
}) =>
  getPageLayoutWidgetConfigurationToSaveOrThrow({
    pageLayout: {
      id: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90',
      type,
      applicationUniversalIdentifier,
    },
    existingConfiguration,
    configuration,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('getPageLayoutWidgetConfigurationToSaveOrThrow', () => {
  it.each([
    ['the workspace', WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER],
    ['twenty-standard', TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  ])(
    'should save changed bindings on a dashboard owned by %s',
    (_owner, applicationUniversalIdentifier) => {
      const configuration = buildConfiguration([PERIOD_BINDING]);

      expect(
        getConfigurationToSave({
          applicationUniversalIdentifier,
          configuration,
        }),
      ).toBe(configuration);
    },
  );

  it('should save any configuration of a widget on a page layout an application installed that is not a dashboard', () => {
    const configuration = buildConfiguration(null);

    expect(
      getConfigurationToSave({
        type: PageLayoutType.RECORD_PAGE,
        configuration,
      }),
    ).toBe(configuration);
  });

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
    ['omits the bindings', buildConfiguration()],
  ])(
    'should reject a save that %s on a dashboard an application installed',
    (_change, configuration) => {
      expect(() => getConfigurationToSave({ configuration })).toThrow(
        new PageLayoutException(
          'Dashboard filter bindings of widgets on dashboard page layout "b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90" are defined by the application that installed it and cannot be changed',
          PageLayoutExceptionCode.DASHBOARD_FILTER_BINDINGS_NOT_EDITABLE,
        ),
      );
    },
  );

  it('should reject a new widget with bindings on a dashboard an application installed', () => {
    expect(() =>
      getConfigurationToSave({
        existingConfiguration: undefined,
        configuration: buildConfiguration([PERIOD_BINDING]),
      }),
    ).toThrow(PageLayoutException);
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

  it('should accept a save without bindings on a widget that has none', () => {
    const configuration = buildConfiguration([]);

    expect(
      getConfigurationToSave({
        existingConfiguration: buildConfiguration(),
        configuration,
      }),
    ).toEqual({ ...configuration, dashboardFilterBindings: undefined });
  });
});
