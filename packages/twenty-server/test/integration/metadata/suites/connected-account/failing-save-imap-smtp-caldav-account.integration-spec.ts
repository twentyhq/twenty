import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  handle: string;
  connectionParameters: {
    IMAP?: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      secure?: boolean;
    };
    SMTP?: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      secure?: boolean;
    };
    CALDAV?: {
      host: string;
      port: number;
      username?: string;
      password?: string;
      secure?: boolean;
    };
  };
  id?: string;
};

type FailingTestContext = EachTestingContext<TestContext>[];

const VALID_HANDLE = 'test-failing@example.com';

describe('Connected account creation should fail', () => {
  const failingCreationTestCases: FailingTestContext = [
    {
      title: 'when IMAP password is missing on creation',
      context: {
        handle: VALID_HANDLE,
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            username: 'user@example.com',
            secure: true,
          },
        },
      },
    },
    {
      title: 'when SMTP password is missing on creation',
      context: {
        handle: VALID_HANDLE,
        connectionParameters: {
          SMTP: {
            host: 'smtp.example.com',
            port: 465,
            username: 'user@example.com',
            secure: true,
          },
        },
      },
    },
    {
      title: 'when CALDAV password is missing on creation',
      context: {
        handle: VALID_HANDLE,
        connectionParameters: {
          CALDAV: {
            host: 'caldav.example.com',
            port: 443,
            username: 'user@example.com',
            secure: true,
          },
        },
      },
    },
    {
      title: 'when IMAP host is empty',
      context: {
        handle: VALID_HANDLE,
        connectionParameters: {
          IMAP: {
            host: '',
            port: 993,
            password: 'secret',
            secure: true,
          },
        },
      },
    },
    {
      title: 'when IMAP port is zero',
      context: {
        handle: VALID_HANDLE,
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 0,
            password: 'secret',
            secure: true,
          },
        },
      },
    },
    {
      title: 'when IMAP password is empty string on creation',
      context: {
        handle: VALID_HANDLE,
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            password: '',
            secure: true,
          },
        },
      },
    },
  ];

  it.each(eachTestingContextFilter(failingCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await saveImapSmtpCaldavAccount({
        expectToFail: true,
        input: {
          handle: context.handle,
          connectionParameters: context.connectionParameters,
          id: context.id,
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
