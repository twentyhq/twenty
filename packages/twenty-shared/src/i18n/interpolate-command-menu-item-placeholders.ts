import { interpolateMessagePlaceholders } from './interpolate-message-placeholders';
import { rewriteLegacyMetadataLabelTemplate } from './rewrite-legacy-metadata-label-template';

// DEPRECATED — remove once every workspace has run the 2.33 command
// `upgrade:2-33:migrate-command-menu-item-labels-to-placeholders`, and call
// interpolateMessagePlaceholders directly again. Until then a workspace
// provisioned before that release still stores its command menu item labels as
// template expressions, which the placeholder interpolator would leave as
// written -- putting the raw expression on screen. Scoped to command menu
// items on purpose: the same text in a user-authored view name is a literal
// the viewer typed, and must stay untouched. See the tracking issue.
export const interpolateCommandMenuItemPlaceholders = (
  message: string,
  values?: Record<string, string | number | undefined>,
): string =>
  interpolateMessagePlaceholders(
    rewriteLegacyMetadataLabelTemplate(message),
    values,
  );
