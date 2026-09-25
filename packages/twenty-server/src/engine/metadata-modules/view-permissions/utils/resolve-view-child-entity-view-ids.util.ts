import { isNonEmptyString } from '@sniptt/guards';

export const resolveViewChildEntityViewIds = ({
  args,
  body,
}: {
  args:
    | { input?: { viewId?: unknown }; inputs?: { viewId?: unknown }[] }
    | undefined;
  body: { viewId?: unknown } | undefined;
}): string[] => {
  const ids: string[] = [];

  if (isNonEmptyString(args?.input?.viewId)) {
    ids.push(args.input.viewId);
  }

  if (Array.isArray(args?.inputs)) {
    for (const item of args.inputs) {
      if (isNonEmptyString(item?.viewId)) {
        ids.push(item.viewId);
      }
    }
  }

  if (isNonEmptyString(body?.viewId)) {
    ids.push(body.viewId);
  }

  return [...new Set(ids)];
};
