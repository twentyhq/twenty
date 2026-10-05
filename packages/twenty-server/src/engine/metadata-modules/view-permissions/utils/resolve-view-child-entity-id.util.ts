import { isNonEmptyString } from '@sniptt/guards';

// The input also carries an optional id from the create input, but only the top-level argument routes the mutation
export const resolveViewChildEntityId = ({
  args,
  params,
}: {
  args: { id?: unknown; input?: { id?: unknown } } | undefined;
  params: { id?: unknown } | undefined;
}): string | null =>
  [args?.id, args?.input?.id, params?.id].find(isNonEmptyString) ?? null;
