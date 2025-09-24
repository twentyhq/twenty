import { hasSubstantialRecordData } from 'src/modules/workflow/workflow-trigger/utils/has-substantial-record-data.util';

describe('hasSubstantialRecordData', () => {
  it('should return false for null input', () => {
    const result = hasSubstantialRecordData(null as any);

    expect(result).toBe(false);
  });

  it('should return false for undefined input', () => {
    const result = hasSubstantialRecordData(undefined as any);

    expect(result).toBe(false);
  });

  it('should return false for non-object input', () => {
    const result = hasSubstantialRecordData('not an object' as any);

    expect(result).toBe(false);
  });

  it('should return false for record with only system fields', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: 1,
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(false);
  });

  it('should return false for record with empty user fields', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      name: '',
      email: null,
      tags: [],
      metadata: {},
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(false);
  });

  it('should return true for record with non-empty string field', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      name: 'John Doe',
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(true);
  });

  it('should return true for record with non-empty array field', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      tags: ['important'],
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(true);
  });

  it('should return true for record with non-empty object field', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      metadata: { key: 'value' },
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(true);
  });

  it('should return true for record with boolean false value', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      isActive: false,
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(true);
  });

  it('should return true for record with numeric zero value', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      count: 0,
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(true);
  });

  it('should ignore whitespace-only strings', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      name: '   ',
      description: '\t\n',
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(false);
  });

  it('should handle mixed system and user fields correctly', () => {
    const recordData = {
      id: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
      searchVector: 'search data',
      name: 'John Doe', // This should trigger true
      email: '',
      tags: [],
    };

    const result = hasSubstantialRecordData(recordData);

    expect(result).toBe(true);
  });
});
