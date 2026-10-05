import { restrictWaitEventToReadableRecord } from 'src/modules/workflow/workflow-wait/utils/restrict-wait-event-to-readable-record.util';

describe('restrictWaitEventToReadableRecord', () => {
  it('drops the fields the run cannot read from every part of the event', () => {
    expect(
      restrictWaitEventToReadableRecord({
        event: {
          eventName: 'company.updated',
          recordId: 'company-id',
          record: { id: 'company-id', name: 'Acme', secret: 'new' },
          before: { id: 'company-id', name: 'Old Acme', secret: 'old' },
          updatedFields: ['name', 'secret'],
        },
        readableRecord: { id: 'company-id', name: 'Acme' },
      }),
    ).toEqual({
      eventName: 'company.updated',
      recordId: 'company-id',
      record: { id: 'company-id', name: 'Acme' },
      before: { id: 'company-id', name: 'Old Acme' },
      updatedFields: ['name'],
    });
  });

  it('leaves an event without a previous snapshot without one', () => {
    expect(
      restrictWaitEventToReadableRecord({
        event: {
          eventName: 'company.created',
          recordId: 'company-id',
          record: { id: 'company-id', secret: 'new' },
        },
        readableRecord: { id: 'company-id' },
      }),
    ).toEqual({
      eventName: 'company.created',
      recordId: 'company-id',
      record: { id: 'company-id' },
      before: undefined,
      updatedFields: undefined,
    });
  });
});
