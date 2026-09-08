import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

// isActive is attributed in the blob but every reader and the deactivation
// cascade key on the column, so the column holds the effective value: the
// first author that deactivated, else active.
export const resolveMaterializedIsActive = ({
  overrides,
  authorContext,
}: {
  overrides: unknown;
  authorContext: OverrideAuthorReadContext;
}): boolean => {
  const overrideValue = readAuthoredOverrideProperty({
    overrides,
    property: 'isActive',
    authorContext,
  });

  return typeof overrideValue === 'boolean' ? overrideValue : true;
};
