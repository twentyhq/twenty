export const getExpungedMessageUids = ({
  knownMessageUids,
  serverMessageUids,
}: {
  knownMessageUids: number[];
  serverMessageUids: number[];
}): number[] => {
  const serverMessageUidSet = new Set(serverMessageUids);

  return knownMessageUids.filter(
    (knownMessageUid) => !serverMessageUidSet.has(knownMessageUid),
  );
};
