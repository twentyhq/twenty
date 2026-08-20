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

  it('fills a legacy label through the placeholder interpolator', () => {
    expect(
      interpolateMessagePlaceholders(
        'New ${capitalize(objectMetadataItem.labelSingular)}',
        { objectLabelSingular: 'Person' },
      ),
    ).toBe('New Person');
  });

  it('keeps a legacy placeholder the caller cannot fill', () => {
    expect(
      interpolateMessagePlaceholders(
        'New ${capitalize(objectMetadataItem.labelSingular)}',
        {},
      ),
    ).toBe('New {objectLabelSingular}');
  });
});
