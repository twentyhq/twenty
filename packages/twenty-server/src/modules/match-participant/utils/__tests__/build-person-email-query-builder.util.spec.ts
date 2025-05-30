import { SelectQueryBuilder } from 'typeorm';

import { buildPersonEmailQueryBuilder } from 'src/modules/match-participant/utils/build-person-email-query-builder.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('buildPersonEmailQueryBuilder', () => {
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<PersonWorkspaceEntity>>;

  beforeEach(() => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should build query for single email without exclusions', () => {
    const emails = ['test@example.com'];

    const result = buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

    expect(mockQueryBuilder.select).toHaveBeenCalledWith([
      'person.id',
      'person.emailsPrimaryEmail',
      'person.emailsAdditionalEmails',
    ]);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'LOWER(person.emailsPrimaryEmail) IN (:...emails)',
      { emails: ['test@example.com'] },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email0::jsonb',
      { email0: JSON.stringify(['test@example.com']) },
    );

    expect(result).toBe(mockQueryBuilder);
  });

  it('should build query for multiple emails without exclusions', () => {
    const emails = ['test@example.com', 'contact@company.com'];

    buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'LOWER(person.emailsPrimaryEmail) IN (:...emails)',
      { emails: ['test@example.com', 'contact@company.com'] },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email0::jsonb',
      { email0: JSON.stringify(['test@example.com']) },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email1::jsonb',
      { email1: JSON.stringify(['contact@company.com']) },
    );
  });

  it('should build query with person ID exclusions', () => {
    const emails = ['test@example.com'];
    const excludePersonIds = ['person-1', 'person-2'];

    buildPersonEmailQueryBuilder(mockQueryBuilder, emails, excludePersonIds);

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds)',
      { excludePersonIds },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds) AND person.emailsAdditionalEmails @> :email0::jsonb',
      {
        excludePersonIds,
        email0: JSON.stringify(['test@example.com']),
      },
    );
  });

  it('should build query for multiple emails with exclusions', () => {
    const emails = ['test@example.com', 'contact@company.com'];
    const excludePersonIds = ['person-1'];

    buildPersonEmailQueryBuilder(mockQueryBuilder, emails, excludePersonIds);

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds)',
      { excludePersonIds },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds) AND person.emailsAdditionalEmails @> :email0::jsonb',
      {
        excludePersonIds,
        email0: JSON.stringify(['test@example.com']),
      },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds) AND person.emailsAdditionalEmails @> :email1::jsonb',
      {
        excludePersonIds,
        email1: JSON.stringify(['contact@company.com']),
      },
    );
  });

  it('should handle empty emails array', () => {
    const emails: string[] = [];

    buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'LOWER(person.emailsPrimaryEmail) IN (:...emails)',
      { emails: [] },
    );

    expect(mockQueryBuilder.orWhere).not.toHaveBeenCalled();
  });

  it('should handle empty exclusion array', () => {
    const emails = ['test@example.com'];
    const excludePersonIds: string[] = [];

    buildPersonEmailQueryBuilder(mockQueryBuilder, emails, excludePersonIds);

    expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email0::jsonb',
      { email0: JSON.stringify(['test@example.com']) },
    );
  });

  it('should maintain query builder chain', () => {
    const emails = ['test@example.com'];

    const result = buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

    expect(mockQueryBuilder.select).toHaveReturnedWith(mockQueryBuilder);
    expect(mockQueryBuilder.where).toHaveReturnedWith(mockQueryBuilder);
    expect(mockQueryBuilder.orWhere).toHaveReturnedWith(mockQueryBuilder);

    expect(result).toBe(mockQueryBuilder);
  });

  it('should create unique parameter names for each email', () => {
    const emails = [
      'email1@example.com',
      'email2@example.com',
      'email3@example.com',
    ];

    buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email0::jsonb',
      { email0: JSON.stringify(['email1@example.com']) },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email1::jsonb',
      { email1: JSON.stringify(['email2@example.com']) },
    );

    expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
      'person.emailsAdditionalEmails @> :email2::jsonb',
      { email2: JSON.stringify(['email3@example.com']) },
    );
  });

  describe('case-insensitive email matching', () => {
    it('should normalize emails to lowercase for primary email matching', () => {
      const emails = ['Test@Example.COM', 'CONTACT@Company.com'];

      buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(person.emailsPrimaryEmail) IN (:...emails)',
        { emails: ['test@example.com', 'contact@company.com'] },
      );
    });

    it('should normalize emails to lowercase for additional email matching', () => {
      const emails = ['Test@Example.COM'];

      buildPersonEmailQueryBuilder(mockQueryBuilder, emails);

      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(
        'person.emailsAdditionalEmails @> :email0::jsonb',
        { email0: JSON.stringify(['test@example.com']) },
      );
    });
  });
});
