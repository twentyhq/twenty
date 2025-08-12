// Ambient module declarations to help TypeScript resolve subpath types in workspace consumers

declare module 'twenty-shared' {
  export * from './dist/index';
}

declare module 'twenty-shared/constants' {
  export * from './dist/constants/index';
}

declare module 'twenty-shared/testing' {
  export * from './dist/testing/index';
}

declare module 'twenty-shared/translations' {
  export * from './dist/translations/index';
}

declare module 'twenty-shared/types' {
  export * from './dist/types/index';
}

declare module 'twenty-shared/utils' {
  export * from './dist/utils/index';
}

declare module 'twenty-shared/workflow' {
  export * from './dist/workflow/index';
}

declare module 'twenty-shared/workspace' {
  export * from './dist/workspace/index';
}


