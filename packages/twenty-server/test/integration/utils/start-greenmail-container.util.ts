import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

const GREENMAIL_IMAGE = 'greenmail/standalone:2.1.9';
const GREENMAIL_IMAP_PORT = 3143;
const GREENMAIL_SMTP_PORT = 3025;

export type GreenmailServer = {
  host: string;
  imapPort: number;
  smtpPort: number;
  stop: () => Promise<void>;
};

// GreenMail creates a mailbox on first authentication, so accounts need no
// provisioning step: any handle plus password is a usable inbox.
export const startGreenmailContainer = async (): Promise<GreenmailServer> => {
  const container: StartedTestContainer = await new GenericContainer(
    GREENMAIL_IMAGE,
  )
    .withEnvironment({
      GREENMAIL_OPTS:
        '-Dgreenmail.setup.test.imap -Dgreenmail.setup.test.smtp -Dgreenmail.hostname=0.0.0.0 -Dgreenmail.auth.disabled',
    })
    .withExposedPorts(GREENMAIL_IMAP_PORT, GREENMAIL_SMTP_PORT)
    .withWaitStrategy(Wait.forLogMessage(/Started GreenMail/i))
    .start();

  return {
    host: container.getHost(),
    imapPort: container.getMappedPort(GREENMAIL_IMAP_PORT),
    smtpPort: container.getMappedPort(GREENMAIL_SMTP_PORT),
    stop: async () => {
      await container.stop();
    },
  };
};
