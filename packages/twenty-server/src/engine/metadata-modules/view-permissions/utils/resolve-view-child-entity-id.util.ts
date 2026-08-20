// The top-level id is the authoritative one where a mutation takes it: its
// input extends a partial create input that also carries an optional id, and
// only the argument routes the mutation.
export const resolveViewChildEntityId = ({
  args,
  params,
}: {
  args: { id?: unknown; input?: { id?: unknown } } | undefined;
  params: { id?: unknown } | undefined;
}): string | null => {
  const candidates = [args?.id, args?.input?.id, params?.id];

  return (
    candidates.find((candidate): candidate is string =>
      typeof candidate === 'string' ? candidate.length > 0 : false,
    ) ?? null
  );
};
