import { PageLayoutType } from '@/types/page-layout/PageLayoutType';
import { WidgetType } from '@/types/page-layout/WidgetType';
import {
  SUPPORTED_PAGE_LAYOUT_TYPES_BY_WIDGET_TYPE,
  isWidgetTypeSupportedInPageLayoutType,
} from '@/utils/pageLayout/isWidgetTypeSupportedInPageLayoutType';

describe('isWidgetTypeSupportedInPageLayoutType', () => {
  it('accepts a form field widget in a record form layout', () => {
    expect(
      isWidgetTypeSupportedInPageLayoutType({
        widgetType: WidgetType.FORM_FIELD,
        pageLayoutType: PageLayoutType.RECORD_FORM,
      }),
    ).toBe(true);
  });

  it.each([
    PageLayoutType.RECORD_PAGE,
    PageLayoutType.RECORD_INDEX,
    PageLayoutType.DASHBOARD,
    PageLayoutType.STANDALONE_PAGE,
  ])('rejects a form field widget in a %s layout', (pageLayoutType) => {
    expect(
      isWidgetTypeSupportedInPageLayoutType({
        widgetType: WidgetType.FORM_FIELD,
        pageLayoutType,
      }),
    ).toBe(false);
  });

  it('rejects a fields widget in a record form layout', () => {
    expect(
      isWidgetTypeSupportedInPageLayoutType({
        widgetType: WidgetType.FIELDS,
        pageLayoutType: PageLayoutType.RECORD_FORM,
      }),
    ).toBe(false);
  });

  it('keeps every pre-existing widget type available on record pages', () => {
    const widgetTypesRejectedOnRecordPage = Object.values(WidgetType).filter(
      (widgetType) =>
        widgetType !== WidgetType.FORM_FIELD &&
        !isWidgetTypeSupportedInPageLayoutType({
          widgetType,
          pageLayoutType: PageLayoutType.RECORD_PAGE,
        }),
    );

    expect(widgetTypesRejectedOnRecordPage).toEqual([]);
  });

  it('declares supported layouts for every widget type', () => {
    expect(
      Object.keys(SUPPORTED_PAGE_LAYOUT_TYPES_BY_WIDGET_TYPE).sort(),
    ).toEqual(Object.values(WidgetType).sort());
  });
});
