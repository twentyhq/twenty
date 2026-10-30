import { PageLayoutType } from 'twenty-shared/types';

import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { readFrontComponentQueryOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-query-or-throw.util';

const QUERY = { objectName: 'company', select: ['name'], limit: 20 };

describe('readFrontComponentQueryOrThrow', () => {
  it('reads the query from the saved SDK component without executing its code', () => {
    const source = buildFrontComponentEntrySource({
      componentId: 'component',
      name: 'Companies',
      query: QUERY,
      pageLayoutType: PageLayoutType.DASHBOARD,
      source:
        'export const Component = () => <div />; throw new Error("Must never execute");',
    });
    expect(readFrontComponentQueryOrThrow(source)).toEqual(QUERY);
  });

  it('continues reading previously generated query aliases', () => {
    expect(
      readFrontComponentQueryOrThrow(
        `const AiComponent123Query = ${JSON.stringify(QUERY)}; export { AiComponent123Query as componentQuery };`,
      ),
    ).toEqual(QUERY);
  });

  it.each([
    'getQuery()',
    '{ objectName: "company", select: ["name"], limit: getLimit() }',
    '{ objectName: "company", select: ["name"], limit: 101 }',
    '{ ...otherQuery }',
  ])('rejects dynamic or invalid query %s', (query) => {
    expect(() =>
      readFrontComponentQueryOrThrow(`export const componentQuery = ${query};`),
    ).toThrow();
  });
});
