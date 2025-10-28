export type ParsedMessageId = {
  folder: string;
  uid: number;
};

export function parseMessageId(messageId: string): ParsedMessageId | null {
  const regex = /^(.+):(\d+)$/;
  const match = regex.exec(messageId);

  if (!match) {
    return null;
  }

  const [, folder, uidStr] = match;
  const uid = Number(uidStr);

  if (!Number.isInteger(uid)) {
    return null;
  }

  return { folder, uid };
}
