import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { isMessageReadStateProvisioned } from 'src/modules/messaging/common/utils/is-message-read-state-provisioned.util';

const IS_READ_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.isRead
    .universalIdentifier;

describe('isMessageReadStateProvisioned', () => {
  it('is true once the workspace has the isRead field', () => {
    const isReadField = getFlatFieldMetadataMock({
      universalIdentifier: IS_READ_FIELD_UNIVERSAL_IDENTIFIER,
      objectMetadataId: 'message-channel-message-association-id',
      type: FieldMetadataType.BOOLEAN,
    });

    expect(
      isMessageReadStateProvisioned({
        byUniversalIdentifier: {
          [IS_READ_FIELD_UNIVERSAL_IDENTIFIER]: isReadField,
        },
      }),
    ).toBe(true);
  });

  it('is false while the upgrade command has not reached the workspace', () => {
    expect(isMessageReadStateProvisioned({ byUniversalIdentifier: {} })).toBe(
      false,
    );
  });
});
