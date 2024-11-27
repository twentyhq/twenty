import 'tsconfig-paths/register';

export default async () => {
  await global.rawDataSourceConnection.destroy();
  global.app.close();
};
