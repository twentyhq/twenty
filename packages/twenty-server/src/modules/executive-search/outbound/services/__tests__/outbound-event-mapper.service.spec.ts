import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { OutboundEventMapperService } from 'src/modules/executive-search/outbound/services/outbound-event-mapper.service';

describe('OutboundEventMapperService', () => {
  let service: OutboundEventMapperService;

  beforeEach(() => {
    service = new OutboundEventMapperService();
  });

  describe('mapCompanyEvent', () => {
    const allowlistedRecord = {
      id: 'company-1',
      name: 'Acme Corp',
      domainName: 'acme.com',
      description: 'A company that makes things',
      industry: 'Manufacturing',
      address: '123 Main St, Springfield, USA',
      logo: 'https://example.com/logo.png',
      updatedAt: '2026-07-15T12:00:00Z',
    };

    const fullRecord = {
      ...allowlistedRecord,
      accountStrategy: 'Enterprise up-sell',
      fees: 50000,
      stakeholders: ['John Doe', 'Jane Smith'],
      conflicts: 'Competitor conflict',
      offLimits: true,
      valuation: 1000000000,
      revenue: 500000000,
      employees: 1000,
      foundedYear: 2000,
      linkedinUrl: 'https://linkedin.com/company/acme',
      twitterUrl: 'https://twitter.com/acme',
      facebookUrl: 'https://facebook.com/acme',
      crunchbaseUrl: 'https://crunchbase.com/organization/acme',
    };

    describe('CREATED action', () => {
      it('should return eventType "company.projection_updated"', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.CREATED,
          allowlistedRecord,
        );

        expect(result.eventType).toBe('company.projection_updated');
      });

      it('should include allowlisted fields in payload', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.CREATED,
          allowlistedRecord,
        );

        expect(result.payload).toMatchObject({
          id: 'company-1',
          name: 'Acme Corp',
          domainName: 'acme.com',
          website: 'acme.com',
          description: 'A company that makes things',
          industry: 'Manufacturing',
          address: '123 Main St, Springfield, USA',
          logo: 'https://example.com/logo.png',
          updatedAt: '2026-07-15T12:00:00Z',
        });
      });

      it('should exclude confidential fields from payload', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.CREATED,
          fullRecord,
        );

        expect(result.payload).not.toHaveProperty('accountStrategy');
        expect(result.payload).not.toHaveProperty('fees');
        expect(result.payload).not.toHaveProperty('stakeholders');
        expect(result.payload).not.toHaveProperty('conflicts');
        expect(result.payload).not.toHaveProperty('offLimits');
        expect(result.payload).not.toHaveProperty('valuation');
        expect(result.payload).not.toHaveProperty('revenue');
        expect(result.payload).not.toHaveProperty('employees');
        expect(result.payload).not.toHaveProperty('foundedYear');
        expect(result.payload).not.toHaveProperty('linkedinUrl');
        expect(result.payload).not.toHaveProperty('twitterUrl');
        expect(result.payload).not.toHaveProperty('facebookUrl');
        expect(result.payload).not.toHaveProperty('crunchbaseUrl');
      });

      it('should always include id and updatedAt', () => {
        const minimalRecord = { id: 'c-1', updatedAt: '2026-01-01T00:00:00Z' };
        const result = service.mapCompanyEvent(
          DatabaseEventAction.CREATED,
          minimalRecord,
        );

        expect(result.payload).toHaveProperty('id', 'c-1');
        expect(result.payload).toHaveProperty(
          'updatedAt',
          '2026-01-01T00:00:00Z',
        );
      });
    });

    describe('UPDATED action', () => {
      it('should return eventType "company.projection_updated"', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.UPDATED,
          allowlistedRecord,
        );

        expect(result.eventType).toBe('company.projection_updated');
      });

      it('should include allowlisted fields and map domainName to website', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.UPDATED,
          allowlistedRecord,
        );

        expect(result.payload).toMatchObject({
          id: 'company-1',
          name: 'Acme Corp',
          domainName: 'acme.com',
          website: 'acme.com',
        });
      });

      it('should exclude confidential fields', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.UPDATED,
          fullRecord,
        );

        expect(result.payload).not.toHaveProperty('fees');
        expect(result.payload).not.toHaveProperty('accountStrategy');
      });
    });

    describe('DELETED action', () => {
      it('should return eventType "company.projection_deleted"', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.DELETED,
          { id: 'company-1' },
        );

        expect(result.eventType).toBe('company.projection_deleted');
      });

      it('should return payload with only id', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.DELETED,
          { id: 'company-1' },
        );

        expect(result.payload).toEqual({ id: 'company-1' });
        expect(Object.keys(result.payload)).toEqual(['id']);
      });
    });

    describe('DESTROYED action', () => {
      it('should return eventType "company.projection_deleted"', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.DESTROYED,
          { id: 'company-2' },
        );

        expect(result.eventType).toBe('company.projection_deleted');
      });

      it('should return payload with only id', () => {
        const result = service.mapCompanyEvent(
          DatabaseEventAction.DESTROYED,
          { id: 'company-2' },
        );

        expect(result.payload).toEqual({ id: 'company-2' });
        expect(Object.keys(result.payload)).toEqual(['id']);
      });
    });

    describe('error handling', () => {
      it('should throw on null record.id', () => {
        expect(() =>
          service.mapCompanyEvent(DatabaseEventAction.CREATED, {
            id: null,
          } as unknown as Record<string, unknown>),
        ).toThrow('record.id is null or undefined');
      });

      it('should throw on undefined record.id', () => {
        expect(() =>
          service.mapCompanyEvent(DatabaseEventAction.CREATED, {}),
        ).toThrow('record.id is null or undefined');
      });

      it('should throw on unknown DatabaseEventAction', () => {
        expect(() =>
          service.mapCompanyEvent(
            'UNKNOWN_ACTION' as DatabaseEventAction,
            { id: 'c-1' },
          ),
        ).toThrow('unknown DatabaseEventAction');
      });

      it('should throw on RESTORED action', () => {
        expect(() =>
          service.mapCompanyEvent(
            DatabaseEventAction.RESTORED,
            { id: 'c-1' },
          ),
        ).toThrow('unknown DatabaseEventAction');
      });

      it('should throw on UPSERTED action', () => {
        expect(() =>
          service.mapCompanyEvent(
            DatabaseEventAction.UPSERTED,
            { id: 'c-1' },
          ),
        ).toThrow('unknown DatabaseEventAction');
      });
    });
  });

  describe('mapOpportunitySourceEvent', () => {
    it('should throw "Not implemented — pending BQ1 resolution"', () => {
      expect(() => service.mapOpportunitySourceEvent()).toThrow(
        'Not implemented — pending BQ1 resolution',
      );
    });
  });
});
