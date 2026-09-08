import { listAuthoredOverrideEntries } from 'src/engine/metadata-modules/utils/list-authored-override-entries.util';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';

// The first author in order that carries the property wins, null included: a
// null override is an explicit value, only an absent key falls through.
export const readAuthoredOverrideProperty = ({
  overrides,
  property,
  authorContext,
}: {
  overrides: unknown;
  property: string;
  authorContext: OverrideAuthorReadContext;
}): unknown =>
  listAuthoredOverrideEntries<Record<string, unknown>>({
    overrides,
    authorContext,
  }).find((entry) => entry[property] !== undefined)?.[property];
