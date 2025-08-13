import { type Decorator } from '@storybook/react';
import {
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

interface StrictArgs {
  [name: string]: unknown;
}
export type RouteParams = {
  [param: string]: string;
};

export const isRouteParams = (obj: any): obj is RouteParams => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return Object.keys(obj).every((key) => typeof obj[key] === 'string');
};

export const computeLocation = (
  routePath: string,
  routeParams?: RouteParams,
) => {
  return {
    pathname: routePath.replace(
      /:(\w+)/g,
      (paramName) => routeParams?.[paramName] ?? '',
    ),
  };
};

const Providers = () => (
  <ComponentStorybookLayout>
    <Outlet />
  </ComponentStorybookLayout>
);

const createRouter = ({
  Story,
  args,
  initialEntries,
  initialIndex,
}: {
  Story: () => JSX.Element;
  args: StrictArgs;
  initialEntries?: {
    pathname: string;
  }[];
  initialIndex?: number;
}) =>
  createMemoryRouter(
    createRoutesFromElements(
      <Route element={<Providers />}>
        <Route path={(args.routePath as string) ?? '*'} element={<Story />} />
      </Route>,
    ),
    { initialEntries, initialIndex },
  );

export const ComponentWithRouterDecorator: Decorator = (Story, { args }) => {
  return (
    <RouterProvider
      router={createRouter({
        Story,
        args,
        initialEntries:
          args.routePath &&
          typeof args.routePath === 'string' &&
          (args.routeParams === undefined || isRouteParams(args.routeParams))
            ? [computeLocation(args.routePath, args.routeParams)]
            : [{ pathname: '/' }],
      })}
    />
  );
};
