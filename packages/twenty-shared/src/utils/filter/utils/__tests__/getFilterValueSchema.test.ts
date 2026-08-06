import {
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand,
} from '@/types';
import { getFilterValueSchema } from '@/utils/filter/utils/validation-schemas/getFilterValueSchema';

const ISSUE_23397_VALUE = '{"unit":"DAY","amount":30,"direction":"NEXT"}';

const expectAccepted = (
  args: {
    filterType: FilterableAndTSVectorFieldType;
    operand: ViewFilterOperand;
    subFieldName?: string;
  },
  value: string,
) => {
  const schema = getFilterValueSchema(args);

  expect(schema?.safeParse(value).success).toBe(true);
};

const expectRejected = (
  args: {
    filterType: FilterableAndTSVectorFieldType;
    operand: ViewFilterOperand;
    subFieldName?: string;
  },
  value: string,
) => {
  const schema = getFilterValueSchema(args);

  expect(schema?.safeParse(value).success).toBe(false);
};

describe('getFilterValueSchema', () => {
  it('should return no schema for operands not expecting a value', () => {
    expect(
      getFilterValueSchema({
        filterType: 'DATE',
        operand: ViewFilterOperand.IS_EMPTY,
      }),
    ).toBeUndefined();

    expect(
      getFilterValueSchema({
        filterType: 'DATE',
        operand: ViewFilterOperand.IS_TODAY,
      }),
    ).toBeUndefined();
  });

  describe('IS_RELATIVE', () => {
    it.each(['DATE', 'DATE_TIME'] as const)(
      'should accept a stringified relative date on %s',
      (filterType) => {
        expectAccepted(
          { filterType, operand: ViewFilterOperand.IS_RELATIVE },
          'NEXT_30_DAY',
        );
      },
    );

    it.each(['DATE', 'DATE_TIME'] as const)(
      'should reject the object form of a relative date on %s',
      (filterType) => {
        expectRejected(
          { filterType, operand: ViewFilterOperand.IS_RELATIVE },
          ISSUE_23397_VALUE,
        );
      },
    );

    it('should accept the timezone and first day of week suffix the UI emits', () => {
      expectAccepted(
        { filterType: 'DATE', operand: ViewFilterOperand.IS_RELATIVE },
        'NEXT_30_DAY;;Europe/Paris;;MONDAY;;',
      );
    });
  });

  describe('dates', () => {
    it('should accept a plain date on DATE', () => {
      expectAccepted(
        { filterType: 'DATE', operand: ViewFilterOperand.IS },
        '2026-01-31',
      );
    });

    it('should reject a non date on DATE', () => {
      expectRejected(
        { filterType: 'DATE', operand: ViewFilterOperand.IS },
        ISSUE_23397_VALUE,
      );
    });

    // The UI seeds DATE_TIME + IS with a plain date, the reader narrows an
    // instant down to one, so both have to be accepted.
    it.each(['2026-01-31', '2026-01-31T10:00:00Z'])(
      'should accept %s on DATE_TIME IS',
      (value) => {
        expectAccepted(
          { filterType: 'DATE_TIME', operand: ViewFilterOperand.IS },
          value,
        );
      },
    );

    it('should reject a plain date on DATE_TIME IS_AFTER', () => {
      expectRejected(
        { filterType: 'DATE_TIME', operand: ViewFilterOperand.IS_AFTER },
        '2026-01-31',
      );
    });
  });

  describe('numbers', () => {
    it.each(['NUMBER', 'RATING', 'CURRENCY'] as const)(
      'should accept a numeric string on %s',
      (filterType) => {
        expectAccepted(
          { filterType, operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL },
          '30',
        );
      },
    );

    it('should reject a non numeric string on NUMBER', () => {
      expectRejected(
        { filterType: 'NUMBER', operand: ViewFilterOperand.IS },
        ISSUE_23397_VALUE,
      );
    });
  });

  describe('select', () => {
    it('should accept a stringified array of options', () => {
      expectAccepted(
        { filterType: 'SELECT', operand: ViewFilterOperand.IS },
        '["WON","LOST"]',
      );
    });

    it('should reject an object rather than an array', () => {
      expectRejected(
        { filterType: 'SELECT', operand: ViewFilterOperand.IS },
        ISSUE_23397_VALUE,
      );
    });

    it('should reject malformed json rather than throwing', () => {
      expectRejected(
        { filterType: 'MULTI_SELECT', operand: ViewFilterOperand.CONTAINS },
        '{bad json',
      );
    });
  });

  describe('relation', () => {
    it('should accept the relation filter object form', () => {
      expectAccepted(
        { filterType: 'RELATION', operand: ViewFilterOperand.IS },
        '{"selectedRecordIds":["20202020-1c25-4d02-bf25-6aeccf7ea419"]}',
      );
    });

    it('should accept a bare array of uuids', () => {
      expectAccepted(
        { filterType: 'RELATION', operand: ViewFilterOperand.IS },
        '["20202020-1c25-4d02-bf25-6aeccf7ea419"]',
      );
    });

    it('should reject a value that resolves to no record id', () => {
      expectRejected(
        { filterType: 'RELATION', operand: ViewFilterOperand.IS },
        ISSUE_23397_VALUE,
      );
    });
  });

  describe('uuid', () => {
    it('should reject a non uuid instead of silently matching nothing', () => {
      expectRejected(
        { filterType: 'UUID', operand: ViewFilterOperand.IS },
        ISSUE_23397_VALUE,
      );
    });
  });

  describe('boolean', () => {
    it.each(['true', 'false'])('should accept %s', (value) => {
      expectAccepted(
        { filterType: 'BOOLEAN', operand: ViewFilterOperand.IS },
        value,
      );
    });

    it('should reject anything else', () => {
      expectRejected(
        { filterType: 'BOOLEAN', operand: ViewFilterOperand.IS },
        ISSUE_23397_VALUE,
      );
    });
  });

  describe('composite sub fields', () => {
    it('should validate currencyCode as an array of codes', () => {
      expectAccepted(
        {
          filterType: 'CURRENCY',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currencyCode',
        },
        '["EUR"]',
      );

      expectRejected(
        {
          filterType: 'CURRENCY',
          operand: ViewFilterOperand.IS,
          subFieldName: 'currencyCode',
        },
        'EUR',
      );
    });

    it('should validate the actor source against known sources', () => {
      expectAccepted(
        {
          filterType: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'source',
        },
        '["MANUAL","API"]',
      );

      expectRejected(
        {
          filterType: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'source',
        },
        '["NOT_A_SOURCE"]',
      );
    });

    it('should validate actor workspaceMemberId as a relation value', () => {
      expectAccepted(
        {
          filterType: 'ACTOR',
          operand: ViewFilterOperand.IS,
          subFieldName: 'workspaceMemberId',
        },
        '{"selectedRecordIds":["20202020-1c25-4d02-bf25-6aeccf7ea419"]}',
      );
    });

    it('should fall back to the text contract on other actor sub fields', () => {
      expectAccepted(
        {
          filterType: 'ACTOR',
          operand: ViewFilterOperand.CONTAINS,
          subFieldName: 'name',
        },
        'Alice',
      );
    });
  });

  describe('text', () => {
    it('should reject an empty value', () => {
      expectRejected(
        { filterType: 'TEXT', operand: ViewFilterOperand.CONTAINS },
        '',
      );
    });
  });
});
