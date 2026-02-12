import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';

export const cleanupPageLayoutTabRecords = async (): Promise<void> => {
  await global.testDataSource.query(`DELETE from "core"."pageLayoutTab"`);
};

export const assertPageLayoutTabStructure = (
  pageLayoutTab: PageLayoutTabEntity,
  expectedFields?: Partial<PageLayoutTabEntity>,
) => {
  expect(pageLayoutTab).toBeDefined();
  expect(pageLayoutTab.id).toEqual(expect.any(String));
  expect(pageLayoutTab.title).toEqual(expect.any(String));
  expect(pageLayoutTab.position).toEqual(expect.any(Number));
  expect(pageLayoutTab.pageLayoutId).toEqual(expect.any(String));
  expect(pageLayoutTab.createdAt).toEqual(expect.any(String));
  expect(pageLayoutTab.updatedAt).toEqual(expect.any(String));

  if (expectedFields) {
    expect(pageLayoutTab).toMatchObject(expectedFields);
  }
};
