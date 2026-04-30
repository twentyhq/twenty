import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

export const cleanupPageLayoutWidgetRecords = async (): Promise<void> => {
  await global.testDataSource.query(`DELETE from "core"."pageLayoutWidget"`);
};

export const assertPageLayoutWidgetStructure = (
  pageLayoutWidget: PageLayoutWidgetEntity,
  expectedFields?: Partial<PageLayoutWidgetEntity>,
) => {
  expect(pageLayoutWidget).toBeDefined();
  expect(pageLayoutWidget.id).toEqual(expect.any(String));
  expect(pageLayoutWidget.title).toEqual(expect.any(String));
  expect(pageLayoutWidget.type).toBeDefined();
  expect(pageLayoutWidget.pageLayoutTabId).toEqual(expect.any(String));
  expect(pageLayoutWidget.position).toBeDefined();
  expect(pageLayoutWidget.position?.layoutMode).toEqual(expect.any(String));
  expect(pageLayoutWidget.createdAt).toEqual(expect.any(String));
  expect(pageLayoutWidget.updatedAt).toEqual(expect.any(String));

  if (expectedFields) {
    expect(pageLayoutWidget).toMatchObject(expectedFields);
  }
};
