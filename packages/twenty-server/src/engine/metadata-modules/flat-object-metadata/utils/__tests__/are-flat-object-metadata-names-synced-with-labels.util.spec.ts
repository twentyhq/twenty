import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const THIRD_PARTY_BUILD_OPTIONS: WorkspaceMigrationBuilderOptions = {
  isSystemBuild: false,
  applicationUniversalIdentifier: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
};

const TWENTY_STANDARD_BUILD_OPTIONS: WorkspaceMigrationBuilderOptions = {
  isSystemBuild: false,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION.universalIdentifier,
};

describe('areFlatObjectMetadataNamesSyncedWithLabels', () => {
  it('should return true when names match computed names from labels', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'ticket',
        namePlural: 'tickets',
        labelSingular: 'Ticket',
        labelPlural: 'Tickets',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(true);
  });

  it('should return false when singular name does not match', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'wrongName',
        namePlural: 'tickets',
        labelSingular: 'Ticket',
        labelPlural: 'Tickets',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(false);
  });

  it('should return false when plural name does not match', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'ticket',
        namePlural: 'wrongPlural',
        labelSingular: 'Ticket',
        labelPlural: 'Tickets',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(false);
  });

  it('should apply custom suffix for reserved words when caller is a third-party app', () => {
    // "Event" computes to "event" which is reserved, so suffix "Custom" is appended
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'eventCustom',
        namePlural: 'eventsCustom',
        labelSingular: 'Event',
        labelPlural: 'Events',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(true);
  });

  it('should return false for reserved words without custom suffix when caller is a third-party app', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'event',
        namePlural: 'events',
        labelSingular: 'Event',
        labelPlural: 'Events',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(false);
  });

  it('should not apply custom suffix for reserved words when caller is the Twenty Standard app', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'event',
        namePlural: 'events',
        labelSingular: 'Event',
        labelPlural: 'Events',
      },
      buildOptions: TWENTY_STANDARD_BUILD_OPTIONS,
    });

    expect(result).toBe(true);
  });

  it('should handle multi-word labels by computing camelCase names', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'supportTicket',
        namePlural: 'supportTickets',
        labelSingular: 'Support Ticket',
        labelPlural: 'Support Tickets',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(true);
  });

  it('should return false when both names do not match', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'foo',
        namePlural: 'bar',
        labelSingular: 'Ticket',
        labelPlural: 'Tickets',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(false);
  });

  it('should return true with complex labels', () => {
    const result = areFlatObjectMetadataNamesSyncedWithLabels({
      flatObjectMetadata: {
        nameSingular: 'wrongCreatedAtObject',
        namePlural: 'wrongCreatedAtObjects',
        labelSingular: 'Wrong CreatedAt Object',
        labelPlural: 'Wrong CreatedAt Objects',
      },
      buildOptions: THIRD_PARTY_BUILD_OPTIONS,
    });

    expect(result).toBe(true);
  });
});
