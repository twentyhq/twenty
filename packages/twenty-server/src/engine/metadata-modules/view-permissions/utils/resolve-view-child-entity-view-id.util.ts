import { resolveViewChildEntityViewIds } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-child-entity-view-ids.util';

export const resolveViewChildEntityViewId = ({
  args,
  body,
}: {
  args:
    | { input?: { viewId?: unknown }; inputs?: { viewId?: unknown }[] }
    | undefined;
  body: { viewId?: unknown } | undefined;
}): string | null => resolveViewChildEntityViewIds({ args, body })[0] ?? null;
