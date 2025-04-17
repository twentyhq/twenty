import 'tsconfig-paths/register';

export default async () => {
  global.app.get('PUB_SUB').close();
  global.app.close();
};
