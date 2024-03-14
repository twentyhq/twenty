import { AddressObject } from 'mailparser';

import { FetchMessagesByBatchesService } from './fetch-messages-by-batches.service';

describe('FetchMessagesByBatchesService', () => {
  let service: FetchMessagesByBatchesService;

  beforeEach(() => {
    service = new FetchMessagesByBatchesService();
  });

  describe('formatAddressObjectAsParticipants', () => {
    it('should format address object as participants', () => {
      const addressObject: AddressObject = {
        value: [
          { name: 'John Doe', address: 'john.doe @example.com' },
          { name: 'Jane Smith', address: 'jane.smith@example.com ' },
        ],
        html: '',
        text: '',
      };

      const result = service.formatAddressObjectAsParticipants(
        addressObject,
        'from',
      );

      expect(result).toEqual([
        {
          role: 'from',
          handle: 'john.doe@example.com',
          displayName: 'John Doe',
        },
        {
          role: 'from',
          handle: 'jane.smith@example.com',
          displayName: 'Jane Smith',
        },
      ]);
    });

    it('should return an empty array if address object is undefined', () => {
      const addressObject = undefined;

      const result = service.formatAddressObjectAsParticipants(
        addressObject,
        'to',
      );

      expect(result).toEqual([]);
    });
  });
});
