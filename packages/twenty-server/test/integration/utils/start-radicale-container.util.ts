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

const RADICALE_BINARY = '/venv/bin/radicale';
const RADICALE_USERS_FILE = '/config/users';

// Credentials are required rather than open: Radicale derives the principal
// collection from the authenticated user, so an anonymous session resolves to
// no calendars at all.
export const startRadicaleContainer = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<RadicaleServer> => {
  const container: StartedTestContainer = await new GenericContainer(
    RADICALE_IMAGE,
  )
    .withCopyContentToContainer([
      { content: `${username}:${password}\n`, target: RADICALE_USERS_FILE },
    ])
    .withCommand([
      RADICALE_BINARY,
      '--server-hosts',
      `0.0.0.0:${RADICALE_PORT}`,
      '--auth-type',
      'htpasswd',
      '--auth-htpasswd-filename',
      RADICALE_USERS_FILE,
      '--auth-htpasswd-encryption',
      'plain',
      '--storage-filesystem-folder',
      '/data/collections',
    ])
    .withExposedPorts(RADICALE_PORT)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  return {
    host: container.getHost(),
    port: container.getMappedPort(RADICALE_PORT),
    stop: async () => {
      await container.stop();
    },
  };
};
