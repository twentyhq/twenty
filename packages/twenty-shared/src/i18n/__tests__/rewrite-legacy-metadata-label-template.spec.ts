import { interpolateCommandMenuItemPlaceholders } from '../interpolate-command-menu-item-placeholders';
import { interpolateMessagePlaceholders } from '../interpolate-message-placeholders';
import { rewriteLegacyMetadataLabelTemplate } from '../rewrite-legacy-metadata-label-template';

describe('rewriteLegacyMetadataLabelTemplate', () => {
  it.each([
    [
      'New ${capitalize(objectMetadataItem.labelSingular)}',
      'New {objectLabelSingular}',
    ],
    [
      'New ${capitalize{objectMetadataItem.labelSingular}}',
      'New {objectLabelSingular}',
    ],
    [
      'Go to ${capitalize(objectMetadataItem.labelPlural)}',
      'Go to {objectLabelPlural}',
    ],
    ['Delete ${capitalize(objectMetadataLabel)}', 'Delete {objectLabel}'],
    ['${navigateToObjectMetadataItem.labelPlural}', '{objectLabelPlural}'],
    ['${navigateToObjectMetadataItem.icon}', '{objectIcon}'],
  ])('rewrites %s to the placeholder syntax', (legacyMessage, expected) => {
    expect(rewriteLegacyMetadataLabelTemplate(legacyMessage)).toBe(expected);
  });

  it('leaves messages already using placeholders untouched', () => {
    expect(
      rewriteLegacyMetadataLabelTemplate('New {objectLabelSingular}'),
    ).toBe('New {objectLabelSingular}');
  });

  it('leaves unknown template expressions as written', () => {
    expect(rewriteLegacyMetadataLabelTemplate('Hello ${user.firstName}')).toBe(
      'Hello ${user.firstName}',
    );
  });

  it('fills a legacy label through the command menu item interpolator', () => {
    expect(
      interpolateCommandMenuItemPlaceholders(
        'New ${capitalize(objectMetadataItem.labelSingular)}',
        { objectLabelSingular: 'Person' },
      ),
    ).toBe('New Person');
  });

  it('keeps a legacy placeholder the caller cannot fill', () => {
    expect(
      interpolateCommandMenuItemPlaceholders(
        'New ${capitalize(objectMetadataItem.labelSingular)}',
        {},
      ),
    ).toBe('New {objectLabelSingular}');
  });

  // A view name is text a person typed: it must survive verbatim even when it
  // happens to look like the syntax command menu item labels once used.
  it('leaves a user-authored name alone through the generic interpolator', () => {
    expect(
      interpolateMessagePlaceholders(
        'New ${capitalize(objectMetadataItem.labelSingular)}',
        { objectLabelSingular: 'Person' },
      ),
    ).toBe('New ${capitalize(objectMetadataItem.labelSingular)}');
  });
});
