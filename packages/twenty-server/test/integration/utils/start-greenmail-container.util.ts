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

// GreenMail creates a user on delivery, with the login and password both set
// to the recipient address, so a mailbox exists once mail has been sent to it.
export const startGreenmailContainer = async (): Promise<GreenmailServer> => {
  const container: StartedTestContainer = await new GenericContainer(
    GREENMAIL_IMAGE,
  )
    .withEnvironment({
      GREENMAIL_OPTS:
        '-Dgreenmail.setup.test.imap -Dgreenmail.setup.test.smtp -Dgreenmail.hostname=0.0.0.0',
    })
    .withExposedPorts(GREENMAIL_IMAP_PORT, GREENMAIL_SMTP_PORT)
    .withWaitStrategy(Wait.forListeningPorts())
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
