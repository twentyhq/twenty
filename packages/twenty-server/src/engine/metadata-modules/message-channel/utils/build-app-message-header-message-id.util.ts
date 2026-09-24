// The save path dedupes on headerMessageId across every channel in the
// workspace, which is what makes one email addressed to two synced mailboxes a
// single Message with two channel associations. That is only sound when the id
// is globally unique, as an RFC822 Message-ID is.
//
// A provider's own message id usually is not: plenty scope it per conversation
// or per account, so Alice's message "1" and Bob's unrelated message "1" would
// dedupe onto one row — discarding one body and attaching the other member's
// channel to it. Scoping to the channel makes a collision impossible without
// asking apps to guarantee a namespace they do not control.
//
// The cost is that two members in the same provider conversation get one
// Message each rather than a shared one. Deliberate: convergence is a nicety,
// and the alternative failure is one member's content surfacing under
// another's sharing policy.
export const buildAppMessageHeaderMessageId = ({
  applicationId,
  messageChannelId,
  externalId,
}: {
  applicationId: string;
  messageChannelId: string;
  externalId: string;
}): string => `app:${applicationId}:${messageChannelId}:${externalId}`;
