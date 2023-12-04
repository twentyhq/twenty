import {
  addDefaultConjunctionIfMissing,
  checkFilterQuery,
  formatFieldValue,
  parseFilterQueryContent,
  parseSimpleFilterString,
  parseStringFilter,
} from 'src/core/api-rest/utils/filter-query.utils';
import { objectMetadataItem } from 'src/core/api-rest/utils/__tests__/utils';

describe('filter-query.utils', () => {
  describe('addDefaultConjunctionIfMissing', () => {
    it('should add default conjunction if missing', () => {
      expect(addDefaultConjunctionIfMissing('field[eq]:1')).toEqual(
        'and(field[eq]:1)',
      );
    });
    it('should not add default conjunction if not missing', () => {
      expect(addDefaultConjunctionIfMissing('and(field[eq]:1)')).toEqual(
        'and(field[eq]:1)',
      );
    });
  });
  describe('checkFilterQuery', () => {
    it('should check filter query', () => {
      expect(() => checkFilterQuery('(')).toThrow();
      expect(() => checkFilterQuery(')')).toThrow();
      expect(() => checkFilterQuery('(()')).toThrow();
      expect(() => checkFilterQuery('())')).toThrow();
      expect(() =>
        checkFilterQuery(
          'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2)),fieldNumber[eq]:3)',
        ),
      ).toThrow();
      expect(() =>
        checkFilterQuery(
          'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2),fieldNumber[eq]:3)',
        ),
      ).not.toThrow();
    });
  });
  describe('parseFilterQueryContent', () => {
    it('should parse query filter test 1', () => {
      expect(parseFilterQueryContent('and(fieldNumber[eq]:1)')).toEqual([
        'fieldNumber[eq]:1',
      ]);
    });
    it('should parse query filter test 2', () => {
      expect(
        parseFilterQueryContent('and(fieldNumber[eq]:1,fieldNumber[eq]:2)'),
      ).toEqual(['fieldNumber[eq]:1', 'fieldNumber[eq]:2']);
    });
    it('should parse query filter test 3', () => {
      expect(
        parseFilterQueryContent(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
        ),
      ).toEqual([
        'fieldNumber[eq]:1',
        'or(fieldNumber[eq]:2,fieldNumber[eq]:3)',
      ]);
    });
    it('should parse query filter test 4', () => {
      expect(
        parseFilterQueryContent(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,not(fieldNumber[eq]:3)),fieldNumber[eq]:4,not(fieldNumber[eq]:5))',
        ),
      ).toEqual([
        'fieldNumber[eq]:1',
        'or(fieldNumber[eq]:2,not(fieldNumber[eq]:3))',
        'fieldNumber[eq]:4',
        'not(fieldNumber[eq]:5)',
      ]);
    });
    it('should parse query filter test 5', () => {
      expect(
        parseFilterQueryContent('and(fieldNumber[in]:[1,2],fieldNumber[eq]:4)'),
      ).toEqual(['fieldNumber[in]:[1,2]', 'fieldNumber[eq]:4']);
    });
  });
  describe('parseSimpleFilterString', () => {
    it('should parse simple filter string test 1', () => {
      expect(parseSimpleFilterString('price[lte]:100')).toEqual({
        fields: ['price'],
        comparator: 'lte',
        value: '100',
      });
    });
    it('should parse simple filter string test 2', () => {
      expect(
        parseSimpleFilterString('date[gt]:2023-12-01T14:23:23.914Z'),
      ).toEqual({
        fields: ['date'],
        comparator: 'gt',
        value: '2023-12-01T14:23:23.914Z',
      });
    });
    it('should parse simple filter string test 3', () => {
      expect(
        parseSimpleFilterString('fieldNumber[gt]:valStart]:[valEnd'),
      ).toEqual({
        fields: ['fieldNumber'],
        comparator: 'gt',
        value: 'valStart]:[valEnd',
      });
    });
    it('should parse simple filter string test 4', () => {
      expect(
        parseSimpleFilterString(
          'person.createdAt[gt]:"2023-12-01T14:23:23.914Z"',
        ),
      ).toEqual({
        fields: ['person', 'createdAt'],
        comparator: 'gt',
        value: '"2023-12-01T14:23:23.914Z"',
      });
    });
    it('should parse simple filter string test 5', () => {
      expect(
        parseSimpleFilterString(
          'person.createdAt[in]:["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
        ),
      ).toEqual({
        fields: ['person', 'createdAt'],
        comparator: 'in',
        value: '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
      });
    });
  });
  describe('formatFieldValue', () => {
    it('should format fieldNumber value', () => {
      expect(formatFieldValue('1', 'NUMBER')).toEqual(1);
      expect(formatFieldValue('a', 'NUMBER')).toEqual(NaN);
      expect(formatFieldValue('true', 'BOOLEAN')).toEqual(true);
      expect(formatFieldValue('True', 'BOOLEAN')).toEqual(true);
      expect(formatFieldValue('false', 'BOOLEAN')).toEqual(false);
      expect(formatFieldValue('value', 'TEXT')).toEqual('value');
      expect(formatFieldValue('"value"', 'TEXT')).toEqual('value');
      expect(formatFieldValue("'value'", 'TEXT')).toEqual('value');
      expect(formatFieldValue('value', 'DATE_TIME')).toEqual('value');
      expect(formatFieldValue('"value"', 'DATE_TIME')).toEqual('value');
      expect(formatFieldValue("'value'", 'DATE_TIME')).toEqual('value');
      expect(
        formatFieldValue(
          '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
          null,
          'in',
        ),
      ).toEqual(['2023-12-01T14:23:23.914Z', '2024-12-01T14:23:23.914Z']);
      expect(formatFieldValue('[1,2]', 'NUMBER', 'in')).toEqual([1, 2]);
      expect(() =>
        formatFieldValue('2024-12-01T14:23:23.914Z', null, 'in'),
      ).toThrow();
    });
  });
  describe('parseStringFilter', () => {
    it('should parse string filter test 1', () => {
      expect(
        parseStringFilter(
          'and(fieldNumber[eq]:1,fieldNumber[eq]:2)',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [{ fieldNumber: { eq: 1 } }, { fieldNumber: { eq: 2 } }],
      });
    });
    it('should parse string filter test 2', () => {
      expect(
        parseStringFilter(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          { or: [{ fieldNumber: { eq: 2 } }, { fieldNumber: { eq: 3 } }] },
        ],
      });
    });
    it('should parse string filter test 3', () => {
      expect(
        parseStringFilter(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3,and(fieldNumber[eq]:6,fieldNumber[eq]:7)),or(fieldNumber[eq]:4,fieldNumber[eq]:5))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          {
            or: [
              { fieldNumber: { eq: 2 } },
              { fieldNumber: { eq: 3 } },
              { and: [{ fieldNumber: { eq: 6 } }, { fieldNumber: { eq: 7 } }] },
            ],
          },
          { or: [{ fieldNumber: { eq: 4 } }, { fieldNumber: { eq: 5 } }] },
        ],
      });
    });
    it('should parse string filter test 4', () => {
      expect(
        parseStringFilter(
          'and(fieldString[gt]:"value",or(fieldNumber[is]:NOT_NULL,not(fieldString[startsWith]:"val"),and(fieldNumber[eq]:6,fieldString[ilike]:"%val%")),or(fieldNumber[eq]:4,fieldString[is]:NULL))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldString: { gt: 'value' } },
          {
            or: [
              { fieldNumber: { is: 'NOT_NULL' } },
              { not: { fieldString: { startsWith: 'val' } } },
              {
                and: [
                  { fieldNumber: { eq: 6 } },
                  { fieldString: { ilike: '%val%' } },
                ],
              },
            ],
          },
          { or: [{ fieldNumber: { eq: 4 } }, { fieldString: { is: 'NULL' } }] },
        ],
      });
    });
    it('should handler not', () => {
      expect(
        parseStringFilter(
          'and(fieldNumber[eq]:1,not(fieldNumber[eq]:2))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          {
            not: { fieldNumber: { eq: 2 } },
          },
        ],
      });
    });
  });
});
