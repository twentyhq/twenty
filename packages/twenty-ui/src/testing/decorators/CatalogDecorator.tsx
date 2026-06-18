import { isNumber, isString } from '@sniptt/guards';
import { type Decorator } from '@storybook/react-vite';
import { clsx } from 'clsx';
import { type ComponentProps, type JSX } from 'react';

import styles from './CatalogDecorator.module.scss';

const emptyDimension = {
  name: '',
  values: [undefined],
  props: () => ({}),
} as CatalogDimension;

const isStringOrNumber = (term: unknown): term is string | number =>
  isString(term) || isNumber(term);

export type CatalogDimension<
  ComponentType extends React.ElementType = () => JSX.Element,
> = {
  name: string;
  values: any[];
  props: (value: any) => Partial<ComponentProps<ComponentType>>;
  labels?: (value: any) => string;
};

export type CatalogOptions = {
  elementContainer?: {
    width?: number;
    style?: React.CSSProperties;
    className?: string;
  };
};

export const CatalogDecorator: Decorator = (Story, context) => {
  const {
    catalog: { dimensions = [], options = {} } = {
      dimensions: [],
      options: {},
    },
  } = context.parameters || {};

  if (!dimensions || !Array.isArray(dimensions)) {
    return <Story />;
  }

  const [
    dimension1 = emptyDimension,
    dimension2 = emptyDimension,
    dimension3 = emptyDimension,
    dimension4 = emptyDimension,
  ] = dimensions as CatalogDimension[];

  return (
    <div className={styles.container}>
      {dimension4.values.map((value4: any, index4: number) => (
        <div className={styles.columnContainer} key={`d4-${index4}`}>
          <div className={styles.columnTitle}>
            {dimension4.labels?.(value4) ??
              (isStringOrNumber(value4) ? value4 : '')}
          </div>
          {dimension3.values.map((value3: any, index3: number) => (
            <div className={styles.rowsContainer} key={`d3-${index3}`}>
              <div className={styles.rowsTitle}>
                {dimension3.labels?.(value3) ??
                  (isStringOrNumber(value3) ? value3 : '')}
              </div>
              {dimension2.values.map((value2: any, index2: number) => (
                <div className={styles.rowContainer} key={`d2-${index2}`}>
                  <div className={styles.rowTitle}>
                    {dimension2.labels?.(value2) ??
                      (isStringOrNumber(value2) ? value2 : '')}
                  </div>
                  {dimension1.values.map((value1: any, index1: number) => {
                    return (
                      <div
                        className={styles.cellContainer}
                        key={`d1-${index1}`}
                        id={`catalog-cell-${index4}-${index3}-${index2}-${index1}`}
                      >
                        <span className={styles.elementTitle}>
                          {dimension1.labels?.(value1) ??
                            (isStringOrNumber(value1) ? value1 : '')}
                        </span>
                        <div
                          className={clsx(
                            styles.elementContainer,
                            options?.elementContainer?.className,
                          )}
                          style={{
                            minWidth: options?.elementContainer?.width
                              ? `${options.elementContainer.width}px`
                              : 'auto',
                            ...options?.elementContainer?.style,
                          }}
                        >
                          <Story
                            args={{
                              ...context.args,
                              ...dimension1.props(value1),
                              ...dimension2.props(value2),
                              ...dimension3.props(value3),
                              ...dimension4.props(value4),
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
