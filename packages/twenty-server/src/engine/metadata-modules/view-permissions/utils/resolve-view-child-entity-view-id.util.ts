import { isNonEmptyString } from '@sniptt/guards';

export const resolveViewChildEntityViewId = ({
  args,
  body,
}: {
  args:
    | { input?: { viewId?: unknown }; inputs?: { viewId?: unknown }[] }
    | undefined;
  body: { viewId?: unknown } | undefined;
}): string | null =>
  [args?.input?.viewId, args?.inputs?.[0]?.viewId, body?.viewId].find(
    isNonEmptyString,
  ) ?? null;
