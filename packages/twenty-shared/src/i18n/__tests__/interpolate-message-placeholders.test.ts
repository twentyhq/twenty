import {
  interpolateMessagePlaceholders,
  METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
} from '../index';

describe('interpolateMessagePlaceholders', () => {
  it('returns the message unchanged when no values are given', () => {
    expect(interpolateMessagePlaceholders('Hello {name}')).toBe('Hello {name}');
  });

  it('substitutes named placeholders', () => {
    expect(
      interpolateMessagePlaceholders('Saved {count} cards', { count: 3 }),
    ).toBe('Saved 3 cards');
  });

  it('leaves placeholders the caller cannot fill intact', () => {
    expect(
      interpolateMessagePlaceholders('Hi {name} from {city}', { name: 'Ada' }),
    ).toBe('Hi Ada from {city}');
  });

  it('substitutes every occurrence of the same placeholder', () => {
    expect(
      interpolateMessagePlaceholders('{objectLabel} and {objectLabel}', {
        objectLabel: 'People',
      }),
    ).toBe('People and People');
  });

  it('leaves a placeholder whose value the caller could not resolve', () => {
    expect(
      interpolateMessagePlaceholders('Go to {objectLabelPlural}', {
        objectLabelPlural: undefined,
      }),
    ).toBe('Go to {objectLabelPlural}');
  });

  it('round-trips a message through the pass-through values', () => {
    expect(
      interpolateMessagePlaceholders(
        'Go to {objectLabelPlural}',
        METADATA_LABEL_PLACEHOLDER_PASS_THROUGH,
      ),
    ).toBe('Go to {objectLabelPlural}');
  });
});
