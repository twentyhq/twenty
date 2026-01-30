import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Page layout with tabs update should fail', () => {
  it('when updating a non-existent page layout', async () => {
    const tabId = 'bb4bd7f2-2f89-429c-9d85-8c20a6f776ea';
    const widgetId = 'cf89849b-2106-4b51-8945-359ffeb88141';

    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: '5b66ba47-198c-4b0d-8583-cd4745f8f9f3',
        name: 'Updated Name',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: null,
        tabs: [
          {
            id: tabId,
            title: 'Tab 1',
            position: 0,
            widgets: [
              {
                id: widgetId,
                pageLayoutTabId: tabId,
                title: 'Widget 1',
                type: WidgetType.FIELDS,
                objectMetadataId: null,
                gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
                configuration: {
                  configurationType: WidgetConfigurationType.IFRAME,
                },
              },
            ],
          },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
