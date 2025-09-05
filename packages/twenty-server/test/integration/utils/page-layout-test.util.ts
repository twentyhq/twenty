import { type PageLayoutEntity } from 'src/engine/core-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';

export const cleanupPageLayoutRecords = async (): Promise<void> => {
  // @ts-expect-error legacy noImplicitAny
  await global.testDataSource.query(`DELETE from "core"."pageLayout"`);
};

export const assertPageLayoutStructure = (
  pageLayout: PageLayoutEntity,
  expectedFields?: Partial<PageLayoutEntity>,
) => {
  expect(pageLayout).toBeDefined();
  expect(pageLayout.id).toEqual(expect.any(String));
  expect(pageLayout.name).toEqual(expect.any(String));
  expect(Object.values(PageLayoutType)).toContain(pageLayout.type);
  expect(pageLayout.createdAt).toEqual(expect.any(String));
  expect(pageLayout.updatedAt).toEqual(expect.any(String));

  if (expectedFields) {
    expect(pageLayout).toMatchObject(expectedFields);
  }
};
