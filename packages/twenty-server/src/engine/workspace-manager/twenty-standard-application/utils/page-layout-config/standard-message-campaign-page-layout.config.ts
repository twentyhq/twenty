import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import {
  type ConditionalDisplay,
  PageLayoutType,
  ViewFilterOperand,
  WidgetType,
} from 'twenty-shared/types';
import {
  TAB_PROPS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const MESSAGE_CAMPAIGN_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
        .home.universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      recipients: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
            .tabs.home.widgets.recipients.universalIdentifier,
        title: 'Recipients',
        type: WidgetType.FIELD,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.FOURTH,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.messageCampaign.fields.recipients
            .universalIdentifier,
        conditionalAvailability: {
          recordFilters: [
            {
              id: 'db01bb10-8a45-5a81-a699-098a3dc06600',
              contextKey: 'selectedRecords',
              operand: ViewFilterOperand.IS_NOT,
              subFieldName: 'status',
              value: '"DRAFT"',
            },
          ],
        } satisfies ConditionalDisplay,
      },
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
            .tabs.home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
        conditionalAvailability: {
          recordFilters: [
            {
              id: 'db01bb10-8a45-5a81-a699-098a3dc06600',
              contextKey: 'selectedRecords',
              operand: ViewFilterOperand.IS_NOT,
              subFieldName: 'status',
              value: '"DRAFT"',
            },
          ],
        } satisfies ConditionalDisplay,
      },
    },
  },
  composer: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
        .composer.universalIdentifier,
    ...TAB_PROPS.composer,
    widgets: {
      messageCampaign: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
            .tabs.composer.widgets.messageCampaign.universalIdentifier,
        ...WIDGET_PROPS.messageCampaign,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_CAMPAIGN_PAGE_LAYOUT_CONFIG = {
  name: 'Default Campaign Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.messageCampaign.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_CAMPAIGN_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
