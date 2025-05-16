import 'tsconfig-paths/register';

export default async () => {
  // @ts-expect-error legacy noImplicitAny
  global.testDataSource.destroy();
  // @ts-expect-error legacy noImplicitAny
  global.app.close();
};
