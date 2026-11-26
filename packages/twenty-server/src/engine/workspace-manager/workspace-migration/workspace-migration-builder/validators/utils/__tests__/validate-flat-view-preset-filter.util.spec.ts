import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewPresetFilter } from 'twenty-shared/types';

import { validateFlatViewPresetFilter } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-preset-filter.util';

describe('validateFlatViewPresetFilter', () => {
  it('accepts a view without preset filter on any object', () => {
    expect(
      validateFlatViewPresetFilter({
        flatView: {
          objectMetadataUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          presetFilter: null,
        },
      }),
    ).toEqual([]);
  });

  it('accepts an inbox preset filter on a chat view', () => {
    expect(
      validateFlatViewPresetFilter({
        flatView: {
          objectMetadataUniversalIdentifier:
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
          presetFilter: ViewPresetFilter.INBOX_MENTIONS,
        },
      }),
    ).toEqual([]);
  });

  it('rejects an inbox preset filter on a view of another object', () => {
    const errors = validateFlatViewPresetFilter({
      flatView: {
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.company.universalIdentifier,
        presetFilter: ViewPresetFilter.INBOX_OPEN,
      },
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'View preset filter must belong to the view object',
    ]);
  });
});
