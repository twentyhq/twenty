import { type MetadataLabelPlaceholderName } from './metadata-label-placeholder';
import { isDefined } from '../utils/validation/isDefined';

// DEPRECATED — remove once every workspace has run the 2.33 command
// `upgrade:2-33:migrate-command-menu-item-labels-to-placeholders`, which
// rewrites stored command menu item labels to the placeholder syntax.
// Until then a workspace provisioned before that release still stores labels
// as template expressions, and the placeholder interpolator leaves what it
// does not recognise as written -- so the raw expression reaches the screen.
// See the tracking issue for the removal checklist.

// The expressions those labels were stored as, mapped onto the placeholder
// that replaced them. Values are already capitalized by the placeholder
// builder, so the capitalize() wrapper is dropped rather than reimplemented.
const LEGACY_EXPRESSION_TO_PLACEHOLDER_NAME: Record<
  string,
  MetadataLabelPlaceholderName
> = {
  objectMetadataLabel: 'objectLabel',
  'objectMetadataItem.labelSingular': 'objectLabelSingular',
  'objectMetadataItem.labelPlural': 'objectLabelPlural',
  'objectMetadataItem.icon': 'objectIcon',
  'navigateToObjectMetadataItem.labelSingular': 'objectLabelSingular',
  'navigateToObjectMetadataItem.labelPlural': 'objectLabelPlural',
  'navigateToObjectMetadataItem.icon': 'objectIcon',
};

// `${capitalize(expression)}`, `${capitalize{expression}}` and bare
// `${expression}` all occur in stored rows across the releases this syntax
// changed in.
const LEGACY_TEMPLATE_REGEX =
  /\$\{\s*(?:capitalize\s*[({]\s*([\w.]+)\s*[)}]|([\w.]+))\s*\}/g;

export const rewriteLegacyMetadataLabelTemplate = (message: string): string => {
  if (!message.includes('${')) {
    return message;
  }

  return message.replace(
    LEGACY_TEMPLATE_REGEX,
    (legacyExpression, capitalizedName?: string, bareName?: string) => {
      const placeholderName =
        LEGACY_EXPRESSION_TO_PLACEHOLDER_NAME[
          capitalizedName ?? bareName ?? ''
        ];

      return isDefined(placeholderName)
        ? `{${placeholderName}}`
        : legacyExpression;
    },
  );
};
