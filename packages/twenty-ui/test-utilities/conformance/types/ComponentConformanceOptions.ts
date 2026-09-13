import {
  type ComponentType,
  type JSX,
  type ReactElement,
  type ReactNode,
} from 'react';

import { type ComponentConformanceCase } from './ComponentConformanceCase';

export type ComponentConformanceOptions = {
  name: string;
  element: ReactElement<Record<string, unknown>>;
  refInstanceOf: new () => Element;
  wrapper?: ComponentType<{ children: ReactNode }>;
  ownClassName?: string;
  renderPropTagName?: keyof JSX.IntrinsicElements;
  skip?: ComponentConformanceCase[];
};
