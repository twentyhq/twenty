import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

import { validateFlatViewTypeObject } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-type-object.util';

describe('validateFlatViewTypeObject', () => {
  it('accepts a table view on any object', () => {
    expect(
      validateFlatViewTypeObject({
        flatView: {
          objectMetadataUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
          type: ViewType.TABLE,
        },
      }),
    ).toEqual([]);
  });

  it('accepts an inbox view on the chat thread object', () => {
    expect(
      validateFlatViewTypeObject({
        flatView: {
          objectMetadataUniversalIdentifier:
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
          type: ViewType.INBOX,
        },
      }),
    ).toEqual([]);
  });

  it('rejects an inbox view on another object', () => {
    const errors = validateFlatViewTypeObject({
      flatView: {
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.company.universalIdentifier,
        type: ViewType.INBOX,
      },
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'View type is not available on the view object',
    ]);
  });
});
