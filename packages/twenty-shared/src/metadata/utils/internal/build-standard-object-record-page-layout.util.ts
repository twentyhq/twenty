import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getPageLayoutTabUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-tab-universal-identifier.util';
import { getPageLayoutWidgetUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-widget-universal-identifier.util';
import { getRecordPageLayoutUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-universal-identifier.util';

type RecordPageLayoutTabsSpec = Record<
  string,
  { title: string; widgets: Record<string, string> }
>;

// Derives the engine-owned record-page layout universal identifiers for a
// standard object: the layout (object identifier + the name-free RECORD_PAGE
// discriminator), its tabs (keyed on the tab title within the layout) and
// their widgets (keyed on the widget title within the tab). The tab and widget
// titles MUST match the ones the server page-layout configs assign.
export const buildStandardObjectRecordPageLayout = <
  const TTabs extends RecordPageLayoutTabsSpec,
>({
  objectUniversalIdentifier,
  tabs,
}: {
  objectUniversalIdentifier: string;
  tabs: TTabs;
}): {
  universalIdentifier: string;
  tabs: {
    [TTabKey in keyof TTabs]: {
      universalIdentifier: string;
      widgets: {
        [TWidgetKey in keyof TTabs[TTabKey]['widgets']]: {
          universalIdentifier: string;
        };
      };
    };
  };
} => {
  const pageLayoutUniversalIdentifier = getRecordPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
  });

  const derivedTabs = Object.fromEntries(
    Object.entries(tabs).map(([tabKey, { title, widgets }]) => {
      const tabUniversalIdentifier = getPageLayoutTabUniversalIdentifier({
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        pageLayoutUniversalIdentifier,
        title,
      });

      return [
        tabKey,
        {
          universalIdentifier: tabUniversalIdentifier,
          widgets: Object.fromEntries(
            Object.entries(widgets).map(([widgetKey, widgetTitle]) => [
              widgetKey,
              {
                universalIdentifier: getPageLayoutWidgetUniversalIdentifier({
                  applicationUniversalIdentifier:
                    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
                  pageLayoutTabUniversalIdentifier: tabUniversalIdentifier,
                  title: widgetTitle,
                }),
              },
            ]),
          ),
        },
      ];
    }),
  ) as {
    [TTabKey in keyof TTabs]: {
      universalIdentifier: string;
      widgets: {
        [TWidgetKey in keyof TTabs[TTabKey]['widgets']]: {
          universalIdentifier: string;
        };
      };
    };
  };

  return {
    universalIdentifier: pageLayoutUniversalIdentifier,
    tabs: derivedTabs,
  };
};
