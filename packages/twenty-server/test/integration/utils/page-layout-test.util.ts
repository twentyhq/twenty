import { type PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';

export const cleanupPageLayoutRecords = async (): Promise<void> => {
  // @ts-expect-error legacy noImplicitAny
  await global.testDataSource.query(`DELETE from "core"."pageLayout"`);
};

export const assertPageLayoutStructure = (
  pageLayout: PageLayoutEntity,
  expectedFields?: Partial<PageLayoutEntity>,
) => {
  expect(pageLayout).toBeDefined();
  expect(pageLayout.id).toBeDefined();
  expect(pageLayout.name).toBeDefined();
  expect(pageLayout.type).toBeDefined();
  expect(pageLayout.workspaceId).toBeDefined();
  expect(pageLayout.createdAt).toBeDefined();
  expect(pageLayout.updatedAt).toBeDefined();

  if (expectedFields) {
    expect(pageLayout).toMatchObject(expectedFields);
  }
};
