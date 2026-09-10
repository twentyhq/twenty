import { isNonEmptyString } from '@sniptt/guards';
import {
  GenericContainer,
  type StartedNetwork,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import { isDefined } from 'twenty-shared/utils';

const RADICALE_IMAGE =
  'tomsquest/docker-radicale:3.5.7.0@sha256:ed0bc36eb284ae7ad6e81d0f00b4f477c025e3ed22e780ca683a80b35102a66e';
const RADICALE_PORT = 5232;

export type RadicaleServer = {
  host: string;
  port: number;
  internalPort: number;
  stop: () => Promise<void>;
};

const attachToNetwork = (
  container: GenericContainer,
  network: StartedNetwork | undefined,
  networkAlias: string | undefined,
): GenericContainer => {
  if (!isDefined(network) || !isNonEmptyString(networkAlias)) {
    return container;
  }

  return container.withNetwork(network).withNetworkAliases(networkAlias);
};

const RADICALE_BINARY = '/venv/bin/radicale';
const RADICALE_USERS_FILE = '/config/users';

// Credentials are required rather than open: Radicale derives the principal
// collection from the authenticated user, so an anonymous session resolves to
// no calendars at all.
export const startRadicaleContainer = async ({
  username,
  password,
  network,
  networkAlias,
}: {
  username: string;
  password: string;
  network?: StartedNetwork;
  networkAlias?: string;
}): Promise<RadicaleServer> => {
  const container: StartedTestContainer = await attachToNetwork(
    new GenericContainer(RADICALE_IMAGE),
    network,
    networkAlias,
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
    internalPort: RADICALE_PORT,
    stop: async () => {
      await container.stop();
    },
  };
};
