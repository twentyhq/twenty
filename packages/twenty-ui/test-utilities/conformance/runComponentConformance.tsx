import { render, screen } from '@testing-library/react';
import { cloneElement, createRef, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ComponentConformanceCase } from './types/ComponentConformanceCase';
import { type ComponentConformanceOptions } from './types/ComponentConformanceOptions';

const CONFORMANCE_TEST_ID = 'conformance-root';
const CONFORMANCE_CLASS_NAME = 'conformance-consumer-class';
const CONFORMANCE_DATA_ATTRIBUTE_VALUE = 'conformance-data-value';
const CONFORMANCE_ARIA_LABEL = 'conformance-aria-label';
const CONFORMANCE_STYLE = { marginTop: '7px' };
const SERVER_HIDDEN_GLOBALS = ['window', 'document', 'navigator'] as const;

export const runComponentConformance = ({
  name,
  element,
  refInstanceOf,
  wrapper: Wrapper,
  ownClassName,
  skip = [],
}: ComponentConformanceOptions) => {
  const compose = (probeProps: Record<string, unknown>): ReactElement => {
    const probe = cloneElement(element, {
      'data-testid': CONFORMANCE_TEST_ID,
      ...probeProps,
    });

    return (
      <ThemeProvider colorScheme="light">
        {isDefined(Wrapper) ? <Wrapper>{probe}</Wrapper> : probe}
      </ThemeProvider>
    );
  };

  const itUnlessSkipped = (
    conformanceCase: ComponentConformanceCase,
    title: string,
    run: () => void,
  ) => {
    const register = skip.includes(conformanceCase) ? it.skip : it;

    register(title, run);
  };

  describe(`${name} conformance`, () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
      consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    itUnlessSkipped('consoleOutput', 'renders without console output', () => {
      render(compose({}));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    itUnlessSkipped('ref', 'forwards ref to the root DOM node', () => {
      const ref = createRef<Element>();

      render(compose({ ref }));

      expect(ref.current).toBeInstanceOf(refInstanceOf);
      expect(ref.current).toBe(screen.getByTestId(CONFORMANCE_TEST_ID));
    });

    itUnlessSkipped('dataAttributes', 'passes data attributes through', () => {
      render(compose({ 'data-conformance': CONFORMANCE_DATA_ATTRIBUTE_VALUE }));

      expect(screen.getByTestId(CONFORMANCE_TEST_ID)).toHaveAttribute(
        'data-conformance',
        CONFORMANCE_DATA_ATTRIBUTE_VALUE,
      );
    });

    itUnlessSkipped('ariaAttributes', 'passes aria attributes through', () => {
      render(compose({ 'aria-label': CONFORMANCE_ARIA_LABEL }));

      expect(screen.getByTestId(CONFORMANCE_TEST_ID)).toHaveAttribute(
        'aria-label',
        CONFORMANCE_ARIA_LABEL,
      );
    });

    itUnlessSkipped('className', 'merges the consumer className', () => {
      render(compose({ className: CONFORMANCE_CLASS_NAME }));

      const rootNode = screen.getByTestId(CONFORMANCE_TEST_ID);

      expect(rootNode).toHaveClass(CONFORMANCE_CLASS_NAME);

      if (isDefined(ownClassName)) {
        expect(rootNode).toHaveClass(ownClassName);
      }
    });

    itUnlessSkipped('style', 'merges the consumer style', () => {
      render(compose({ style: CONFORMANCE_STYLE }));

      expect(screen.getByTestId(CONFORMANCE_TEST_ID)).toHaveStyle(
        CONFORMANCE_STYLE,
      );
    });

    itUnlessSkipped('unmount', 'unmounts cleanly', () => {
      const { unmount } = render(compose({}));

      expect(() => unmount()).not.toThrow();
      expect(screen.queryByTestId(CONFORMANCE_TEST_ID)).toBeNull();
    });

    itUnlessSkipped('serverRender', 'renders to a string without a DOM', () => {
      for (const globalName of SERVER_HIDDEN_GLOBALS) {
        vi.stubGlobal(globalName, undefined);
      }

      try {
        expect(() => renderToString(compose({}))).not.toThrow();
      } finally {
        vi.unstubAllGlobals();
      }

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
};
