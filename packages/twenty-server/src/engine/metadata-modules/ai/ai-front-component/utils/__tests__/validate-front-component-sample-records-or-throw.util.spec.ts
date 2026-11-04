import { validateFrontComponentSampleRecordsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-sample-records-or-throw.util';

it('allows selected fields and record IDs', () => {
  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [{ id: 'record', name: 'Example' }],
      selectedFields: ['name'],
    }),
  ).not.toThrow();
});

it('allows null and falsy values for selected fields', () => {
  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [
        { employees: 0, idealCustomerProfile: false, city: null },
      ],
      selectedFields: ['employees', 'idealCustomerProfile', 'city'],
    }),
  ).not.toThrow();
});

it('rejects samples missing a selected field', () => {
  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [{ name: 'Acme', employees: 50 }, { name: 'Nova' }],
      selectedFields: ['name', 'employees'],
    }),
  ).toThrow('Sample records must include every selected field.');
});

it('rejects a field outside the query selection', () => {
  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [{ name: 'Example' }, { secret: 'not selected' }],
      selectedFields: ['name'],
    }),
  ).toThrow('Sample records must only contain selected fields and id.');
});

it('accepts exactly 100 KB of serialized mock records', () => {
  const overhead = JSON.stringify([{ name: '' }]).length;

  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [{ name: 'a'.repeat(100000 - overhead) }],
      selectedFields: ['name'],
    }),
  ).not.toThrow();
});

it('rejects mock records exceeding 100 KB', () => {
  const overhead = JSON.stringify([{ name: '' }]).length;

  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [{ name: 'a'.repeat(100001 - overhead) }],
      selectedFields: ['name'],
    }),
  ).toThrow('Sample records exceed 100 KB.');
});

it('counts UTF-8 bytes for non-ASCII mock records', () => {
  expect(() =>
    validateFrontComponentSampleRecordsOrThrow({
      sampleRecords: [{ name: 'é'.repeat(50000) }],
      selectedFields: ['name'],
    }),
  ).toThrow('Sample records exceed 100 KB.');
});
