import { setupI18n } from '@lingui/core';
import { PageLayoutType } from 'twenty-shared/types';

import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { FrontComponentException } from 'src/engine/metadata-modules/front-component/front-component.exception';
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
    ['getQuery()', 'Component query must be a static object literal.'],
    [
      '{ ...otherQuery }',
      'Component query must contain only literal properties.',
    ],
    [
      '{ objectName: "company", select: [fieldName], limit: 20 }',
      'Component query arrays must contain only strings.',
    ],
    [
      '{ objectName: "company", select: ["name"], limit: getLimit() }',
      'Component query must contain only literal values.',
    ],
  ])('rejects dynamic query %s with a translatable error', (query, message) => {
    let error: unknown;

    try {
      readFrontComponentQueryOrThrow(`export const componentQuery = ${query};`);
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(FrontComponentException);
    if (!(error instanceof FrontComponentException)) {
      throw error;
    }
    expect(
      setupI18n({ locale: 'en', messages: { en: {} } })._(
        error.userFriendlyMessage,
      ),
    ).toBe(message);
  });

  it('rejects query limits outside the allowed range', () => {
    expect(() =>
      readFrontComponentQueryOrThrow(
        'export const componentQuery = { objectName: "company", select: ["name"], limit: 101 };',
      ),
    ).toThrow();
  });
});
