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

  it('should apply complex filter with multiple conditions', () => {
    const complexFilter = [
      {
        name: {
          firstName: {
            ilike: '%t%',
          },
        },
      },
      {
        companyId: {
          in: ['20202020-171e-4bcc-9cf7-43448d6fb278'],
        },
      },
      {
        or: [
          {
            emails: {
              primaryEmail: {
                ilike: '%t%',
              },
            },
          },
        ],
      },
      {
        or: [
          {
            city: {
              ilike: '',
            },
          },
          {
            city: {
              is: 'NULL',
            },
          },
        ],
      },
    ];

    const result = applyFilter(testData, complexFilter);

    expect(result).toEqual([
      {
        name: { firstName: 'Tom', lastName: 'Cruise' },
        companyId: '20202020-171e-4bcc-9cf7-43448d6fb278',
        emails: { primaryEmail: 'tom.cruise@example.com' },
        city: '',
        age: 40,
        tags: ['manager', 'senior'],
        metadata: { lastLogin: '2024-03-20', isActive: true },
      },
    ]);
  });

  it('should handle basic comparison operators', () => {
    const filter = {
      age: {
        gt: 30,
      },
    };

    const result = applyFilter(testData, filter);

    expect(result).toEqual([
      {
        name: { firstName: 'Tom', lastName: 'Cruise' },
        companyId: '20202020-171e-4bcc-9cf7-43448d6fb278',
        emails: { primaryEmail: 'tom.cruise@example.com' },
        city: '',
        age: 40,
        tags: ['manager', 'senior'],
        metadata: { lastLogin: '2024-03-20', isActive: true },
      },
    ]);
  });

  it('should handle nested boolean conditions', () => {
    const filter = {
      metadata: {
        isActive: {
          eq: true,
        },
      },
    };

    const result = applyFilter(testData, filter);

    expect(result).toEqual([
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
        name: { firstName: 'Tom', lastName: 'Cruise' },
        companyId: '20202020-171e-4bcc-9cf7-43448d6fb278',
        emails: { primaryEmail: 'tom.cruise@example.com' },
        city: '',
        age: 40,
        tags: ['manager', 'senior'],
        metadata: { lastLogin: '2024-03-20', isActive: true },
      },
    ]);
  });

  it('should handle AND conditions', () => {
    const filter = {
      and: [
        {
          age: {
            gt: 25,
          },
        },
        {
          metadata: {
            isActive: {
              eq: true,
            },
          },
        },
      ],
    };

    const result = applyFilter(testData, filter);

    expect(result).toEqual([
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
        name: { firstName: 'Tom', lastName: 'Cruise' },
        companyId: '20202020-171e-4bcc-9cf7-43448d6fb278',
        emails: { primaryEmail: 'tom.cruise@example.com' },
        city: '',
        age: 40,
        tags: ['manager', 'senior'],
        metadata: { lastLogin: '2024-03-20', isActive: true },
      },
    ]);
  });

  it('should handle NOT conditions', () => {
    const filter = {
      not: {
        metadata: {
          isActive: {
            eq: true,
          },
        },
      },
    };

    const result = applyFilter(testData, filter);

    expect(result).toEqual([
      {
        name: { firstName: 'Jane', lastName: 'Smith' },
        companyId: '30303030-171e-4bcc-9cf7-43448d6fb278',
        emails: { primaryEmail: 'jane.smith@test.com' },
        city: null,
        age: 25,
        tags: ['designer', 'junior'],
        metadata: { lastLogin: '2024-03-10', isActive: false },
      },
    ]);
  });

  it('should handle empty filter', () => {
    const filter = {};

    const result = applyFilter(testData, filter);

    expect(result).toEqual(testData);
  });

  it('should handle empty array input', () => {
    const filter = {
      age: {
        gt: 30,
      },
    };

    const result = applyFilter([], filter);

    expect(result).toEqual([]);
  });
});
