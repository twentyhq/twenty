import { type ComponentType, type ReactElement, type ReactNode } from 'react';

import { type ComponentConformanceCase } from './ComponentConformanceCase';

export type ComponentConformanceOptions = {
  name: string;
  element: ReactElement<Record<string, unknown>>;
  refInstanceOf: new () => Element;
  wrapper?: ComponentType<{ children: ReactNode }>;
  ownClassName?: string;
  skip?: ComponentConformanceCase[];
};
