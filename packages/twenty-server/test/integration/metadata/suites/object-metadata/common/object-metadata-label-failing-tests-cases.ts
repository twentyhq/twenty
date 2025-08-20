import { type EachTestingContext } from 'twenty-shared/testing';

import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export const OBJECT_METADATA_LABEL_FAILING_TEST_CASES: EachTestingContext<
  Partial<Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>>
>[] = [
  {
    title: 'when labelSingular is empty',
    context: { labelSingular: '' },
  },
  {
    title: 'when labelPlural is empty',
    context: { labelPlural: '' },
  },
  {
    title: 'when labelSingular exceeds maximum length',
    context: { labelSingular: 'A'.repeat(64) },
  },
  {
    title: 'when labelPlural exceeds maximum length',
    context: { labelPlural: 'A'.repeat(64) },
  },
  {
    title: 'when labelSingular contains only whitespace',
    context: { labelSingular: '   ' },
  },
  {
    title: 'when labelPlural contains only whitespace',
    context: { labelPlural: '   ' },
  },
  {
    title: 'when labels are identical',
    context: {
      labelPlural: 'fooBar',
      labelSingular: 'fooBar',
    },
  },
  {
    title: 'when labels with whitespaces result to be identical',
    context: {
      labelPlural: '      fooBar               ',
      labelSingular: 'fooBar',
    },
  },
];
