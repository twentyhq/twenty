import 'tsconfig-paths/register';

export default async () => {
  await global.testDataSource.destroy();
  await global.app.close();
};
