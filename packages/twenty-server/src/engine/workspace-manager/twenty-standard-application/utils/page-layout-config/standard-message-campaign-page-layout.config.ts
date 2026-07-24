import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

// The composer is the only tab, so the record page renders it full width
// instead of pinning the fields tab down the left side.
const MESSAGE_CAMPAIGN_PAGE_TABS = {
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
