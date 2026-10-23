import { randomUUID } from 'crypto';

import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

const FLOCI_IMAGE =
  'floci/floci:2.3.0@sha256:e0b292df4dc9559b7b1bf4f51bdda4bb8e269276236438cd03cae661260ea8a9';
const FLOCI_PORT = 4566;
const DOCKER_SOCKET_PATH = '/var/run/docker.sock';

type FlociServer = {
  endpoint: string;
  stop: () => Promise<void>;
};

export const startFlociContainer = async (): Promise<FlociServer> => {
  const container: StartedTestContainer = await new GenericContainer(
    FLOCI_IMAGE,
  )
    .withEnvironment({
      FLOCI_DOCKER_RESOURCE_NAMESPACE: `twenty-test-${randomUUID().slice(0, 8)}`,
    })
    .withBindMounts([
      { source: DOCKER_SOCKET_PATH, target: DOCKER_SOCKET_PATH, mode: 'rw' },
    ])
    .withExposedPorts(FLOCI_PORT)
    .withWaitStrategy(Wait.forHttp('/_floci/health', FLOCI_PORT))
    .start();

  return {
    endpoint: `http://${container.getHost()}:${container.getMappedPort(FLOCI_PORT)}`,
    stop: async () => {
      await container.stop();
    },
  };
};
