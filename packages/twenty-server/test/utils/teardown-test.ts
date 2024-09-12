import 'tsconfig-paths/register';

export default async () => {
  console.log('teardown-test');
  global.app.close();
  console.log('teardown-test done');
};
