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

// The image's entrypoint rejects passed arguments, so configuration arrives as
// a file. Credentials are required rather than open: Radicale derives the
// principal collection from the authenticated user, and an anonymous session
// resolves to no calendars at all.
const radicaleConfig = `[server]
hosts = 0.0.0.0:${RADICALE_PORT}

[auth]
type = htpasswd
htpasswd_filename = /config/users
htpasswd_encryption = plain

[storage]
filesystem_folder = /data/collections
`;

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
      { content: radicaleConfig, target: '/config/config' },
      { content: `${username}:${password}\n`, target: '/config/users' },
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
