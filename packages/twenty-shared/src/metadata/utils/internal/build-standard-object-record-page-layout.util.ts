import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getSystemPageLayoutTabUniversalIdentifier } from '@/application/deterministic-identifier/get-system-page-layout-tab-universal-identifier.util';
import { getSystemRecordPageLayoutUniversalIdentifier } from '@/application/deterministic-identifier/get-system-record-page-layout-universal-identifier.util';
import { getSystemPageLayoutWidgetUniversalIdentifier } from '@/application/deterministic-identifier/get-system-page-layout-widget-universal-identifier.util';

type RecordPageLayoutTabsSpec = Record<
  string,
  { title: string; widgets: Record<string, string> }
>;

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
  const pageLayoutUniversalIdentifier = getSystemRecordPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
  });

  const derivedTabs = Object.fromEntries(
    Object.entries(tabs).map(([tabKey, { title, widgets }]) => {
      const tabUniversalIdentifier = getSystemPageLayoutTabUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
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
                universalIdentifier: getSystemPageLayoutWidgetUniversalIdentifier({
                  objectMetadataApplicationUniversalIdentifier:
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
