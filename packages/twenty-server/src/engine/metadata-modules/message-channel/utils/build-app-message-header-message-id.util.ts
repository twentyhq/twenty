// The save path dedupes on headerMessageId across every channel in the
// workspace, which is what makes one email addressed to two synced mailboxes
// a single Message with two channel associations. App messages want that same
// behaviour within one app — two members' channels on the same conversation
// should converge — and must never collide across apps, whose external id
// namespaces are unrelated. Scoping to the application gives both.
export const buildAppMessageHeaderMessageId = ({
  applicationId,
  externalId,
}: {
  applicationId: string;
  externalId: string;
}): string => `app:${applicationId}:${externalId}`;
