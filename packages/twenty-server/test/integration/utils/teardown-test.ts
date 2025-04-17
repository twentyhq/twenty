import 'tsconfig-paths/register';

export default async () => {
  const pubSub = global.app.get('PUB_SUB');

  pubSub.redisPublisher.quit();
  pubSub.redisSubscriber.quit();
  pubSub.close();
  global.app.close();
};
