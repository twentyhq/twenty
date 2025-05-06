import { applyFilter } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/apply-filter.util';

describe('applyFilter', () => {
  const testData = [
    {
      name: { firstName: 'John', lastName: 'Doe' },
      companyId: '20202020-171e-4bcc-9cf7-43448d6fb278',
      emails: { primaryEmail: 'john.doe@example.com' },
      city: 'New York',
      age: 30,
      tags: ['developer', 'senior'],
      metadata: { lastLogin: '2024-03-15', isActive: true },
    },
    {
      name: { firstName: 'Jane', lastName: 'Smith' },
      companyId: '30303030-171e-4bcc-9cf7-43448d6fb278',
      emails: { primaryEmail: 'jane.smith@test.com' },
      city: null,
      age: 25,
      tags: ['designer', 'junior'],
      metadata: { lastLogin: '2024-03-10', isActive: false },
    },
    {
      name: { firstName: 'Tom', lastName: 'Cruise' },
      companyId: '20202020-171e-4bcc-9cf7-43448d6fb278',
      emails: { primaryEmail: 'tom.cruise@example.com' },
      city: '',
      age: 40,
      tags: ['manager', 'senior'],
      metadata: { lastLogin: '2024-03-20', isActive: true },
    },
  ];

  describe('Logical Operators', () => {
    it('should handle AND conditions', () => {
      const filter = {
        and: [{ age: { gt: 25 } }, { metadata: { isActive: { eq: true } } }],
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([
        testData[0], // John Doe
        testData[2], // Tom Cruise
      ]);
    });

    it('should handle OR conditions', () => {
      const filter = {
        or: [{ age: { lt: 30 } }, { city: { is: 'NULL' } }],
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([
        testData[1], // Jane Smith
      ]);
    });

    it('should handle NOT conditions', () => {
      const filter = {
        not: {
          metadata: { isActive: { eq: true } },
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([
        testData[1], // Jane Smith
      ]);
    });

    it('should handle complex nested logical operators', () => {
      const filter = {
        and: [
          {
            or: [{ age: { gt: 35 } }, { city: { is: 'NULL' } }],
          },
          {
            not: {
              metadata: { isActive: { eq: false } },
            },
          },
        ],
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([
        testData[2], // Tom Cruise
      ]);
    });
  });

  describe('Comparison Operators', () => {
    it('should handle eq operator', () => {
      const filter = {
        age: { eq: 30 },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0]]);
    });

    it('should handle ne operator', () => {
      const filter = {
        age: { ne: 30 },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[1], testData[2]]);
    });

    it('should handle gt operator', () => {
      const filter = {
        age: { gt: 35 },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[2]]);
    });

    it('should handle gte operator', () => {
      const filter = {
        age: { gte: 30 },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[2]]);
    });

    it('should handle lt operator', () => {
      const filter = {
        age: { lt: 30 },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[1]]);
    });

    it('should handle lte operator', () => {
      const filter = {
        age: { lte: 30 },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[1]]);
    });
  });

  describe('String Operators', () => {
    it('should handle like operator', () => {
      const filter = {
        name: {
          firstName: { like: 'J%' },
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[1]]);
    });

    it('should handle ilike operator', () => {
      const filter = {
        name: {
          firstName: { ilike: 'j%' },
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[1]]);
    });

    it('should handle like with multiple wildcards', () => {
      const filter = {
        emails: {
          primaryEmail: { like: '%@example.com' },
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[2]]);
    });
  });

  describe('Array and Null Operators', () => {
    it('should handle in operator', () => {
      const filter = {
        companyId: {
          in: ['20202020-171e-4bcc-9cf7-43448d6fb278'],
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[2]]);
    });

    it('should handle is NULL operator', () => {
      const filter = {
        city: { is: 'NULL' },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[1]]);
    });

    it('should handle array contains', () => {
      const filter = {
        tags: {
          in: ['senior'],
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0], testData[2]]);
    });
  });

  describe('Nested Object Conditions', () => {
    it('should handle deeply nested conditions', () => {
      const filter = {
        and: [
          {
            name: {
              firstName: { like: 'J%' },
              lastName: { like: 'D%' },
            },
          },
          {
            metadata: {
              isActive: { eq: true },
              lastLogin: { like: '2024-03-15' },
            },
          },
        ],
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[0]]);
    });

    it('should handle multiple levels of nesting', () => {
      const filter = {
        and: [
          {
            name: {
              firstName: { like: 'T%' },
            },
          },
          {
            metadata: {
              isActive: { eq: true },
            },
          },
          {
            emails: {
              primaryEmail: { like: '%@example.com' },
            },
          },
        ],
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([testData[2]]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty filter', () => {
      const filter = {};

      const result = applyFilter(testData, filter);

      expect(result).toEqual(testData);
    });

    it('should handle empty array input', () => {
      const filter = {
        age: { gt: 30 },
      };

      const result = applyFilter([], filter);

      expect(result).toEqual([]);
    });

    it('should handle non-existent fields', () => {
      const filter = {
        nonExistentField: { eq: 'value' },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual([]);
    });

    it('should handle null values in nested objects', () => {
      const filter = {
        metadata: {
          nonExistentField: { is: 'NULL' },
        },
      };

      const result = applyFilter(testData, filter);

      expect(result).toEqual(testData);
    });
  });
});
