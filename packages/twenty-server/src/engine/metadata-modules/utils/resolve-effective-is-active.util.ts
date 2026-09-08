import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

// The first author in order that set isActive wins; with no entry the row is
// active. The base column is not a fallback: writers copy this result into it
// so that readers and the deactivation cascade keep keying on the column.
export const resolveEffectiveIsActive = ({
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
