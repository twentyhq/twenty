import { formatConnectRecordNotFoundErrorMessage } from 'src/engine/twenty-orm/relation-nested-queries/utils/formatConnectRecordNotFoundErrorMessage.util';

describe('formatConnectRecordNotFoundErrorMessage', () => {
  it('should format the error message correctly', () => {
    const result = formatConnectRecordNotFoundErrorMessage(
      'connectFieldName',
      0,
      [
        ['field1', 'value1'],
        ['field2', 'value2'],
      ],
    );

    expect(result).toEqual({
      errorMessage:
        'Expected 1 record to connect to connectFieldName, but found 0 for field1 = value1 and field2 = value2',
      userFriendlyMessage: expect.objectContaining({
        id: expect.any(String),
        message:
          "Can't connect to {connectFieldName}. No unique record found with condition: {formattedConnectCondition}",
        values: {
          connectFieldName: 'connectFieldName',
          formattedConnectCondition: 'field1 = value1 and field2 = value2',
        },
      }),
    });
  });
});
