declare module '__real_react__' {
  type ElementFactory = (...elementArguments: unknown[]) => unknown;

  const React: {
    createElement: ElementFactory;
    cloneElement: ElementFactory;
  };

  export default React;
}

declare module '__real_react_jsx_runtime__' {
  type JsxFactory = (type: unknown, props: unknown, key?: unknown) => unknown;

  export const jsx: JsxFactory;
  export const jsxs: JsxFactory;
  export const Fragment: unknown;
}

declare module '__jsx_shared_helpers__' {
  export * from '@/front-component-build/internal/jsx-runtime/jsx-shared-helpers';
}

declare module '__uses_preact__' {
  export const USES_PREACT: boolean;
}
