import { MessageParticipantRole } from 'twenty-shared/types';

import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';

describe('formatAddressObjectAsParticipants', () => {
  it('should format address object as participants', () => {
    const addresses = [
      { name: 'John Doe', address: 'john.doe @example.com' },
      { name: 'Jane Smith', address: 'jane.smith@example.com ' },
    ];

    const result = formatAddressObjectAsParticipants(
      addresses,
      MessageParticipantRole.FROM,
    );

    expect(result).toEqual([
      {
        role: MessageParticipantRole.FROM,
        handle: 'john.doe@example.com',
        displayName: 'John Doe',
      },
      {
        role: MessageParticipantRole.FROM,
        handle: 'jane.smith@example.com',
        displayName: 'Jane Smith',
      },
    ]);
  });

  it('should return an empty array if address object handle has no @', () => {
    const addressObject = {
      name: 'John Doe',
      address: 'john.doe',
    };

    const result = formatAddressObjectAsParticipants(
      [addressObject],
      MessageParticipantRole.TO,
    );

    expect(result).toEqual([]);
  });

  it('should return an empty array if address object handle is empty', () => {
    const addressObject = {
      name: 'John Doe',
      address: '',
    };

    const result = formatAddressObjectAsParticipants(
      [addressObject],
      MessageParticipantRole.TO,
    );

    expect(result).toEqual([]);
  });

  it('should return a lowewrcase handle if the handle is not lowercase', () => {
    const addressObject = {
      name: 'John Doe',
      address: 'John.Doe@example.com',
    };

    const result = formatAddressObjectAsParticipants(
      [addressObject],
      MessageParticipantRole.TO,
    );

    expect(result).toEqual([
      {
        role: MessageParticipantRole.TO,
        handle: 'john.doe@example.com',
        displayName: 'John Doe',
      },
    ]);
  });
});
