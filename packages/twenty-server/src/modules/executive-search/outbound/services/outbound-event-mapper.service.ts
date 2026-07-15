import { Injectable } from '@nestjs/common';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

/**
 * Allowlisted fields for company outbound events.
 *
 * Per `docs/executive-search/directus-field-ownership.csv` rows 9-10:
 *   Row 9 (companies, outbound): Public brand/name/logo/description/website/industry/headquarters
 *     → Twenty fields: name, domainName (→ website), description, industry, address, logo
 *   Row 10 (companies, None_outbound): Client stakeholders, account strategy, etc. → EXCLUDED
 *
 * Only the following fields may be published in outbound company events:
 *   name, domainName (mapped to both domainName and website in payload), description,
 *   industry, address, logo, id, updatedAt
 *
 * All other fields (accountStrategy, fees, stakeholders, conflicts, offLimits,
 * valuation, revenue, employees, foundedYear, linkedinUrl, twitterUrl,
 * facebookUrl, crunchbaseUrl, etc.) are strictly excluded.
 */
const ALLOWLISTED_COMPANY_FIELDS = new Set([
  'name',
  'domainName',
  'description',
  'industry',
  'address',
  'logo',
  'id',
  'updatedAt',
]);

/**
 * Maps internal Twenty database events to outbound event types and payloads
 * for the Directus integration. Pure synchronous mapper with no DB access.
 */
@Injectable()
export class OutboundEventMapperService {
  /**
   * Maps a company database event to an outbound event with allowlisted payload.
   *
   * @param action - The database event action (CREATED, UPDATED, DELETED, DESTROYED)
   * @param record - The record data from the event
   * @returns An object with eventType and payload for the outbound event
   * @throws Error if action is unknown or record.id is null/undefined
   */
  mapCompanyEvent(
    action: DatabaseEventAction,
    record: Record<string, unknown>,
  ): { eventType: string; payload: Record<string, unknown> } {
    if (record.id == null) {
      throw new Error(
        `OutboundEventMapperService: record.id is null or undefined`,
      );
    }

    switch (action) {
      case DatabaseEventAction.CREATED:
      case DatabaseEventAction.UPDATED:
        return this.buildProjectionUpdated(record);
      case DatabaseEventAction.DELETED:
      case DatabaseEventAction.DESTROYED:
        return {
          eventType: 'company.projection_deleted',
          payload: { id: record.id },
        };
      default:
        throw new Error(
          `OutboundEventMapperService: unknown DatabaseEventAction "${action}" for company event`,
        );
    }
  }

  /**
   * Builds a `company.projection_updated` event payload with only allowlisted fields.
   * Maps domainName to both domainName and website keys in the payload.
   */
  private buildProjectionUpdated(
    record: Record<string, unknown>,
  ): { eventType: string; payload: Record<string, unknown> } {
    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      if (ALLOWLISTED_COMPANY_FIELDS.has(key)) {
        payload[key] = value;
      }
    }

    // Map domainName → website for Directus compatibility
    if (payload.domainName !== undefined) {
      payload.website = payload.domainName;
    }

    return {
      eventType: 'company.projection_updated',
      payload,
    };
  }

  /**
   * STUB: Maps an opportunity source event to an outbound event.
   * Will be implemented once the BQ1 decision (which entity to use
   * as the opportunity source) is resolved.
   */
  mapOpportunitySourceEvent(): never {
    throw new Error('Not implemented — pending BQ1 resolution');
  }
}
