import {
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from '@/types';
import { getPageLayoutWidgetHeightBehavior } from '@/utils/pageLayout/getPageLayoutWidgetHeightBehavior';

const EXPECTED_IS_VIEWPORT_FILLING_BY_WIDGET_TYPE = {
  [WidgetType.CALENDAR]: true,
  [WidgetType.CALL_RECORDING_SUMMARY]: true,
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: true,
  [WidgetType.EMAILS]: true,
  [WidgetType.EMAIL_THREAD]: true,
  [WidgetType.FIELD]: false,
  [WidgetType.FIELDS]: false,
  [WidgetType.FIELD_RICH_TEXT]: false,
  [WidgetType.FILES]: true,
  [WidgetType.FRONT_COMPONENT]: false,
  [WidgetType.GRAPH]: false,
  [WidgetType.IFRAME]: false,
  [WidgetType.MESSAGE_CAMPAIGN_BODY]: false,
  [WidgetType.MESSAGE_CAMPAIGN_DETAILS]: false,
  [WidgetType.NOTES]: true,
  [WidgetType.FORM_FIELD]: false,
  [WidgetType.RECORD_TABLE]: false,
  [WidgetType.STANDALONE_RICH_TEXT]: false,
  [WidgetType.TASKS]: true,
  [WidgetType.TIMELINE]: true,
  [WidgetType.VIEW]: false,
  [WidgetType.WORKFLOW]: true,
  [WidgetType.WORKFLOW_RUN]: true,
  [WidgetType.WORKFLOW_VERSION]: true,
} satisfies Record<WidgetType, boolean>;

describe('getPageLayoutWidgetHeightBehavior', () => {
  it.each(Object.values(WidgetType))(
    'preserves the default height for %s',
    (widgetType) => {
      expect(getPageLayoutWidgetHeightBehavior({ widgetType })).toBe(
        EXPECTED_IS_VIEWPORT_FILLING_BY_WIDGET_TYPE[widgetType]
          ? PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT
          : PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
      );
    },
  );

  it.each([
    [
      WidgetType.TIMELINE,
      PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
    ],
    [
      WidgetType.TIMELINE,
      PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    ],
    [
      WidgetType.FRONT_COMPONENT,
      PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
    ],
    [
      WidgetType.FRONT_COMPONENT,
      PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
    ],
  ])('uses the explicit height %s / %s', (widgetType, heightBehavior) => {
    expect(
      getPageLayoutWidgetHeightBehavior({ widgetType, heightBehavior }),
    ).toBe(heightBehavior);
  });

  it('treats a null API height as an omitted height', () => {
    expect(
      getPageLayoutWidgetHeightBehavior({
        widgetType: WidgetType.TIMELINE,
        heightBehavior: null,
      }),
    ).toBe(PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT);
  });
});
