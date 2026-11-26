import COMPONENT_DOCS from './component-docs.json';

export type DocProp =
  (typeof COMPONENT_DOCS.components)[number]['props'][number];

// The values a prop can take on a page: its union, or both booleans.
export const axisValues = (prop: DocProp): unknown[] =>
  prop.values ?? (prop.type === 'boolean' ? [false, true] : []);

// Every combination of the given props' values, one object per render.
export const combinations = (props: DocProp[]): Record<string, unknown>[] =>
  props.reduce<Record<string, unknown>[]>(
    (rows, prop) =>
      rows.flatMap((row) =>
        axisValues(prop).map((value) =>
          Object.fromEntries([...Object.entries(row), [prop.name, value]]),
        ),
      ),
    [{}],
  );
