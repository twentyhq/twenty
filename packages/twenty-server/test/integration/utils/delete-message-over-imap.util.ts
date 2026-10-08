import { ImapFlow } from 'imapflow';

export const deleteMessageOverImap = async ({
  host,
  port,
  username,
  password,
  folder,
  subject,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
  folder: string;
  subject: string;
}): Promise<void> => {
  const client = new ImapFlow({
    host,
    port,
    secure: false,
    auth: { user: username, pass: password },
    logger: false,
  });

  await client.connect();

  try {
    const lock = await client.getMailboxLock(folder);

    try {
      await client.messageDelete({ subject });
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
};
