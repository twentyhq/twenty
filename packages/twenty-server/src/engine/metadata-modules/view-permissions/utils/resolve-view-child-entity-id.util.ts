import { isNonEmptyString } from '@sniptt/guards';

// The top-level id is the authoritative one where a mutation takes it: its
// input extends a partial create input that also carries an optional id, and
// only the argument routes the mutation.
export const resolveViewChildEntityId = ({
  args,
  params,
}: {
  args: { id?: unknown; input?: { id?: unknown } } | undefined;
  params: { id?: unknown } | undefined;
}): string | null =>
  [args?.id, args?.input?.id, params?.id].find(isNonEmptyString) ?? null;
