import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

const RADICALE_IMAGE = 'tomsquest/docker-radicale:3.5.7.0';
const RADICALE_PORT = 5232;

export type RadicaleServer = {
  host: string;
  port: number;
  stop: () => Promise<void>;
};

// Authentication is left open so the suite can connect as any handle: Radicale
// creates the collection for a principal on first write.
export const startRadicaleContainer = async (): Promise<RadicaleServer> => {
  const container: StartedTestContainer = await new GenericContainer(
    RADICALE_IMAGE,
  )
    .withCommand([
      '--server-hosts',
      `0.0.0.0:${RADICALE_PORT}`,
      '--auth-type',
      'none',
      '--storage-filesystem-folder',
      '/data/collections',
    ])
    .withExposedPorts(RADICALE_PORT)
    .withWaitStrategy(Wait.forHttp('/', RADICALE_PORT).forStatusCode(200))
    .start();

  return {
    host: container.getHost(),
    port: container.getMappedPort(RADICALE_PORT),
    stop: async () => {
      await container.stop();
    },
  };
};
