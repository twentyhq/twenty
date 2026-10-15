import { findNestedTranslatablePropertyContext } from '@/i18n/find-nested-translatable-property-context';
import { listManifestTranslatableValues } from '@/i18n/list-manifest-translatable-values';
import { mapManifestTranslatableValues } from '@/i18n/map-manifest-translatable-values';
import {
  buildTranslatablePropertyPath,
  listTranslatablePropertyPathValues,
  mapTranslatablePropertyPathValues,
  matchTranslatablePropertyPath,
} from '@/i18n/translatable-property-path';

describe('translatable property paths', () => {
  const optionId = '9a1c1f5e-0b7e-4c43-8f3a-1b8f0f0c0a01';

  it('builds a stored key by filling item ids into the pattern', () => {
    expect(
      buildTranslatablePropertyPath({
        pattern: 'options.*.label',
        itemIds: [optionId],
      }),
    ).toBe(`options.${optionId}.label`);
  });

  it('matches a stored key and returns its item ids', () => {
    expect(
      matchTranslatablePropertyPath({
        pattern: 'options.*.label',
        property: `options.${optionId}.label`,
      }),
    ).toEqual([optionId]);
  });

  it.each([
    'label',
    'options.label',
    `options.${optionId}.color`,
    'options..label',
  ])('does not match %s', (property) => {
    expect(
      matchTranslatablePropertyPath({ pattern: 'options.*.label', property }),
    ).toBeUndefined();
  });

  it('lists the keys and values a pattern reaches through items keyed by id', () => {
    expect(
      listTranslatablePropertyPathValues({
        pattern: 'options.*.label',
        value: {
          options: [
            { id: optionId, label: 'Week' },
            { label: 'Without id' },
            { id: 'month', label: 'Month' },
          ],
        },
      }),
    ).toEqual([
      { property: `options.${optionId}.label`, value: 'Week' },
      { property: 'options.month.label', value: 'Month' },
    ]);
  });

  it('finds the catalog context of a nested translatable property', () => {
    expect(
      findNestedTranslatablePropertyContext({
        metadataName: 'fieldMetadata',
        property: `options.${optionId}.label`,
      }),
    ).toBe('fieldMetadata.label');
    expect(
      findNestedTranslatablePropertyContext({
        metadataName: 'objectMetadata',
        property: `options.${optionId}.label`,
      }),
    ).toBeUndefined();
  });

  it('maps every value a pattern reaches through array items and record values', () => {
    expect(
      mapTranslatablePropertyPathValues({
        pattern: 'operations.*.label',
        value: {
          operations: {
            print: { label: 'Print', amount: 1 },
            mail: { amount: 2 },
          },
        },
        mapValue: (value) => `${value}!`,
      }),
    ).toEqual({
      operations: {
        print: { label: 'Print!', amount: 1 },
        mail: { amount: 2 },
      },
    });
    expect(
      mapTranslatablePropertyPathValues({
        pattern: 'options.*.label',
        value: { options: [{ label: 'Week' }, { label: 'Month' }] },
        mapValue: (value) => `${value}!`,
      }),
    ).toEqual({ options: [{ label: 'Week!' }, { label: 'Month!' }] });
  });

  it('maps the translatable values of a manifest entity with their catalog context', () => {
    expect(
      mapManifestTranslatableValues({
        entity: 'applicationVariable',
        value: {
          description: 'Default shipping region',
          options: [{ label: 'Europe', value: 'eu' }],
          value: { label: 'not translatable' },
        },
        mapValue: ({ value, context }) => `${value} [${context}]`,
      }),
    ).toEqual({
      description: 'Default shipping region [applicationVariable.description]',
      options: [{ label: 'Europe [applicationVariable.label]', value: 'eu' }],
      value: { label: 'not translatable' },
    });
  });

  it('lists the translatable values of a manifest entity with their catalog context', () => {
    expect(
      listManifestTranslatableValues({
        entity: 'application',
        value: {
          displayName: 'Rich App',
          billing: {
            recurring: { SEAT: { label: 'Seat', period: 'MONTH' } },
            operations: {
              ENRICH: { label: 'Enrichment', operationType: 'CODE_EXECUTION' },
            },
          },
          universalIdentifier: 'not translatable',
        },
      }),
    ).toEqual([
      { value: 'Rich App', context: 'application.displayName' },
      { value: 'Seat', context: 'application.billing.recurring.label' },
      { value: 'Enrichment', context: 'application.billing.operations.label' },
    ]);
  });
});
