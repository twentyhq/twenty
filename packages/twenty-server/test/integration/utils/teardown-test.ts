import 'tsconfig-paths/register';

export default async () => {
  await global.app.get('PUB_SUB').close();
  await global.app.close();
};
