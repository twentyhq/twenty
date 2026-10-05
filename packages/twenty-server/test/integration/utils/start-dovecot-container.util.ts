import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

const DOVECOT_IMAGE =
  'dovecot/dovecot:2.4.4@sha256:723e3392fe16c6fad8ddc605ea767cc01b4bad9cd9f13eb1dbac15e79c89b2d4';
const DOVECOT_IMAP_PORT = 31143;

export type DovecotServer = {
  host: string;
  imapPort: number;
  stop: () => Promise<void>;
};

// Unlike GreenMail, Dovecot advertises CONDSTORE, QRESYNC and SPECIAL-USE, and
// scopes HIGHESTMODSEQ per mailbox as RFC 7162 requires, so it is the reference
// server for the incremental sync path. Its static passdb accepts any username
// with USER_PASSWORD.
// Cleartext auth has to be switched on and SSL switched off because these tests
// connect without TLS: while STARTTLS is advertised ImapFlow upgrades to it and
// then rejects the image's self-signed certificate.
const DOVECOT_TEST_CONFIG = ['auth_allow_cleartext = yes', 'ssl = no', ''].join(
  '\n',
);

export const startDovecotContainer = async ({
  password,
}: {
  password: string;
}): Promise<DovecotServer> => {
  const container: StartedTestContainer = await new GenericContainer(
    DOVECOT_IMAGE,
  )
    .withEnvironment({ USER_PASSWORD: `{PLAIN}${password}` })
    .withCopyContentToContainer([
      {
        content: DOVECOT_TEST_CONFIG,
        target: '/etc/dovecot/conf.d/99-integration-test.conf',
      },
    ])
    .withExposedPorts(DOVECOT_IMAP_PORT)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  return {
    host: container.getHost(),
    imapPort: container.getMappedPort(DOVECOT_IMAP_PORT),
    stop: async () => {
      await container.stop();
    },
  };
};
