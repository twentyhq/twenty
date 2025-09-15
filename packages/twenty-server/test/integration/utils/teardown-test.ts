import 'tsconfig-paths/register';

export default async () => {
  global.testDataSource.destroy();
  global.app.close();
};
