export type ParsedMessageId = {
  folder: string;
  uid: number;
};

export function parseMessageId(messageId: string): ParsedMessageId | null {
  const separatorIndex = messageId.lastIndexOf(':');

  if (separatorIndex === -1) {
    return null;
  }

  const folder = messageId.slice(0, separatorIndex);
  const uidStr = messageId.slice(separatorIndex + 1);
  const uid = parseInt(uidStr, 10);

  if (isNaN(uid)) {
    return null;
  }

  return { folder, uid };
}
