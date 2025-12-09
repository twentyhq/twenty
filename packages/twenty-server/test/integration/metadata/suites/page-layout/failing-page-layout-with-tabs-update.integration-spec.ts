import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { v4 } from 'uuid';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

describe('Page layout with tabs update should fail', () => {
  it('when updating a non-existent page layout', async () => {
    const tabId = v4();
    const widgetId = v4();

    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: faker.string.uuid(),
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
                configuration: null,
              },
            ],
          },
        ],
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
