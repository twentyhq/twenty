import 'tsconfig-paths/register';

export default async () => {
  await global.app.close();
  await global.testDataSource.destroy();
};
