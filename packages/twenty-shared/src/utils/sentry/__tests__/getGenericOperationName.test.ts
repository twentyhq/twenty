import { getGenericOperationName } from '@/utils/sentry/getGenericOperationName';

describe('getGenericOperationName', () => {
  it('should extract the first word from a PascalCase name', () => {
    expect(getGenericOperationName('FindOnePerson')).toBe('Find');
  });

  it('should extract the first word from another PascalCase name', () => {
    expect(getGenericOperationName('AggregateCompanies')).toBe('Aggregate');
  });

  it('should return undefined for undefined input', () => {
    expect(getGenericOperationName(undefined)).toBeUndefined();
  });

  it('should handle single word', () => {
    expect(getGenericOperationName('Create')).toBe('Create');
  });
});
