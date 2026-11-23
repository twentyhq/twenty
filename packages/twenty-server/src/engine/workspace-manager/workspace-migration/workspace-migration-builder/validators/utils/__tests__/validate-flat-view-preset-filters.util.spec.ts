import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewPresetFilter } from 'twenty-shared/types';

import { validateFlatViewPresetFilters } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-preset-filters.util';

const CHAT_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.universalIdentifier;

describe('validateFlatViewPresetFilters', () => {
  it('accepts a view without preset filters on any object', () => {
    expect(
      validateFlatViewPresetFilters({
        flatView: {
          objectMetadataUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          presetFilters: [],
        },
      }),
    ).toEqual([]);
  });

  it('accepts one status preset filter with the mention preset on a chat view', () => {
    expect(
      validateFlatViewPresetFilters({
        flatView: {
          objectMetadataUniversalIdentifier: CHAT_OBJECT_UNIVERSAL_IDENTIFIER,
          presetFilters: [
            ViewPresetFilter.INBOX_OPEN,
            ViewPresetFilter.INBOX_MENTIONED,
          ],
        },
      }),
    ).toEqual([]);
  });

  it('rejects preset filters on a view of another object', () => {
    const errors = validateFlatViewPresetFilters({
      flatView: {
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.company.universalIdentifier,
        presetFilters: [ViewPresetFilter.INBOX_OPEN],
      },
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'View preset filters must belong to the view object',
    ]);
  });

  it('rejects a personal and a channel status preset filter together', () => {
    const errors = validateFlatViewPresetFilters({
      flatView: {
        objectMetadataUniversalIdentifier: CHAT_OBJECT_UNIVERSAL_IDENTIFIER,
        presetFilters: [
          ViewPresetFilter.INBOX_OPEN,
          ViewPresetFilter.INBOX_CHANNEL_DONE,
        ],
      },
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'View can have at most one status preset filter',
    ]);
  });

  it('rejects a duplicated preset filter', () => {
    const errors = validateFlatViewPresetFilters({
      flatView: {
        objectMetadataUniversalIdentifier: CHAT_OBJECT_UNIVERSAL_IDENTIFIER,
        presetFilters: [
          ViewPresetFilter.INBOX_MENTIONED,
          ViewPresetFilter.INBOX_MENTIONED,
        ],
      },
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'View preset filters must be unique',
    ]);
  });
});
