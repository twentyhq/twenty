export const CASES: Record<string, RegExp | undefined> = {
  'kebab-case': /^[a-z]+(-[a-z]+)*$/,
  'kebab-case-with-numbers': /^[a-z0-9]+(-[a-z0-9]+)*$/,
  camelCase: /^[a-z][a-zA-Z]*(V\d+)?(_[a-z]+)?$/,
  snake_case: /^[a-z]+(_[a-z]+)*$/,
  snake_case_with_numbers: /^[a-z0-9]+(_[a-z0-9]+)*$/,
  StrictPascalCase: /^[A-Z][a-zA-Z0-9]*(V[0-9]+)?([A-Z][a-zA-Z0-9]*)*$/,
};

export type ExtensionsType =
  | 'ts'
  | 'tsx'
  | 'perf.stories.tsx'
  | 'stories.tsx'
  | 'test.ts'
  | 'utils.test.ts'
  | 'utils.ts'
  | 'util.ts'
  | 'interface.ts'
  | 'test.tsx'
  | 'svg'
  | 'png'
  | 'factory.test.ts'
  | 'enum.ts'
  | 'd.ts'
  | 'factory.ts'
  | 'util.test.ts'
  | 'docs.mdx'
  | 'css'
  | 'js'
  | 'html'
  | 'json'
  | 'sh'
  | 'config.js';

export type NameType = keyof typeof CASES | string;
interface ValidationObject {
  prefix?: string[] | string;
  suffix?: string[] | string;
  namePattern?: NameType[] | NameType;
  extension?: ExtensionsType[] | ExtensionsType;
}

export type NameValidationType = ValidationObject | NameType;

export const stringifyConfig = (configs: FolderRule[]) => {
  const getStringOrArrayValue = (validator: string | string[]) => {
    if (!validator) return undefined;
    if (typeof validator === 'string') {
      return validator;
    } else {
      return validator.sort().join(', ');
    }
  };

  const result = configs
    .map((config) => {
      const namePattern =
        !config.name || typeof config.name === 'string'
          ? config.name
          : getStringOrArrayValue(config.name.namePattern);
      const extension =
        !config.name || typeof config.name === 'string'
          ? undefined
          : getStringOrArrayValue(config.name.extension);
      const prefix =
        !config.name || typeof config.name === 'string'
          ? undefined
          : getStringOrArrayValue(config.name.prefix);
      const suffix =
        !config.name || typeof config.name === 'string'
          ? undefined
          : getStringOrArrayValue(config.name.suffix);
      return { namePattern, extension, prefix, suffix };
    })
    .filter((formattedConfig, index, arr) => {
      return (
        index ===
        arr.findIndex((config) =>
          ['namePattern', 'prefix', 'suffix', 'extension'].every(
            (key) => formattedConfig[key] === config[key],
          ),
        )
      );
    });
  return JSON.stringify(result);
};

export const RULES: Record<string, FolderRule> = {
  ComponentsGroup: {
    children: [{ name: { namePattern: 'StrictPascalCase', extension: 'tsx' } }],
  },

  StorybookFolder: {
    name: '__stories__',
    children: [
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase'],
          extension: [
            'ts',
            'tsx',
            'stories.tsx',
            'perf.stories.tsx',
            'docs.mdx',
          ],
        },
      },
      // TODO: edge cases for subfolders of __stories__ that are also stories folders
      /* 
        - /src/pages/settings/developers/__stories__/api-keys
        - /src/pages/settings/developers/__stories__/webhooks 
        - /src/pages/settings/data-model/__stories__/SettingsObjectNewField
        
        */
      // should we enforce StrictPascalCase?
      { name: 'kebab-case', ruleId: 'StorybookFolder' },
      { name: 'StrictPascalCase', ruleId: 'StorybookFolder' },
      { name: 'perf', ruleId: 'StorybookFolder' },
      { ruleId: 'StorybookFolder' },
    ],
  },
  ComponentFolderWithStories: {
    name: 'components',
    children: [
      { ruleId: 'StorybookFolder' },
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase', 'kebab-case'],
          // TODO:  SVG extensions is a edge case for list-view-grip.svg
          extension: ['tsx', 'ts', 'svg'],
        },
      },
      {
        name: { namePattern: ['kebab-case', 'StrictPascalCase'] },
        ruleId: 'ComponentFolderWithStories',
      },
    ],
  },
  UtilsFolder: {
    name: 'utils',
    children: [
      // TODO: what is the correct rule for utils?
      {
        name: '__tests__',
        children: [
          {
            name: {
              namePattern: ['StrictPascalCase', 'camelCase', 'kebab-case'],
              // TODO: test.tsx extensions is a edge case, because the files that end with test.tsx, infact do not use tsx
              extension: [
                'test.ts',
                'utils.test.ts',
                'util.test.ts',
                'test.tsx',
              ],
            },
          },
        ],
      },
      {
        name: '__test__',
        children: [
          {
            name: {
              namePattern: ['StrictPascalCase', 'camelCase', 'kebab-case'],
              extension: ['test.ts', 'utils.test.ts', 'util.test.ts'],
            },
          },
        ],
      },
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase', 'kebab-case'],
          // TODO: getFiledButtonIcon.tsx, assertWorkflowWithCurrentVersionIsDefined.tsx extensions is a edge case, because the files that end .tsx, infact do not use tsx
          extension: ['ts', 'tsx', 'utils.ts', 'util.ts'],
        },
      },
      { name: 'kebab-case', ruleId: 'UtilsFolder' },
    ],
  },
  TypesFolder: {
    name: 'types',
    children: [
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase', 'kebab-case'],
          extension: ['ts', 'tsx', 'interface.ts', 'd.ts'],
        },
      },
      { name: 'kebab-case', ruleId: 'TypesFolder' },
    ],
  },
  HooksFolder: {
    name: 'hooks',
    children: [
      {
        name: {
          namePattern: 'StrictPascalCase',
          extension: ['ts', 'tsx'],
          prefix: 'use',
        },
      },

      {
        name: '__tests__',
        children: [
          // TODO: edge case, this should start with use
          { name: 'isMobile.test.tsx' },
          {
            name: {
              namePattern: 'StrictPascalCase',
              extension: ['ts', 'tsx', 'test.ts', 'test.tsx', 'util.test.ts'],
              prefix: 'use',
            },
          },
        ],
      },
      {
        name: '__test__',
        children: [
          {
            name: {
              namePattern: 'StrictPascalCase',
              extension: ['ts', 'tsx', 'test.ts', 'test.tsx', 'util.test.ts'],
              prefix: 'use',
            },
          },
        ],
      },
      {
        ruleId: 'MocksFolder',
      },
      {
        name: 'kebab-case',
        children: [
          { name: { namePattern: 'camelCase', extension: ['ts', 'tsx'] } },
        ],
      },
    ],
  },
  ConstantsFolder: {
    name: 'constants',
    children: [
      { name: { namePattern: 'StrictPascalCase', extension: ['ts'] } },
    ],
  },
  ServicesFolder: {
    name: 'services',
    children: [
      {
        name: '__tests__',
        children: [
          {
            name: {
              namePattern: ['StrictPascalCase', 'camelCase'],
              extension: ['test.ts', 'factory.test.ts'],
            },
          },
        ],
      },
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase'],
          extension: ['ts', 'factory.test.ts', 'factory.ts'],
        },
      },
    ],
  },
  StatesFolder: {
    name: 'states',
    children: [
      { name: { namePattern: 'camelCase', extension: 'ts' } },
      {
        name: 'kebab-case',
        children: [
          {
            name: {
              namePattern: ['StrictPascalCase', 'camelCase'],
              extension: 'ts',
            },
          },
        ],
      },
    ],
  },
  assetsFolder: {
    name: 'assets',
    children: [
      {
        name: {
          namePattern: ['StrictPascalCase', 'snake_case', 'kebab-case'],
          extension: ['png', 'svg'],
        },
      },
    ],
  },
  ScopeFolder: {
    name: 'scopes',
    children: [
      {
        name: 'kebab-case',
        children: [
          {
            name: { namePattern: 'StrictPascalCase', extension: ['ts', 'tsx'] },
          },
        ],
      },
      { name: { namePattern: 'StrictPascalCase', extension: ['ts', 'tsx'] } },
    ],
  },
  MocksFolder: {
    name: '__mocks__',
    children: [
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase'],
          extension: ['ts', 'tsx'],
        },
      },
    ],
  },
  ThemesFolder: {
    name: 'theme',
    children: [
      { name: { namePattern: ['StrictPascalCase'], extension: ['ts', 'tsx'] } },
    ],
  },
  TestFolder: {
    name: 'tests',
    children: [
      {
        name: { namePattern: ['camelCase'], extension: ['ts', 'tsx'] },
      },
    ],
  },
  TestsFolder: {
    name: '__tests__',
    children: [
      {
        name: {
          namePattern: ['StrictPascalCase', 'camelCase', 'kebab-case'],
          extension: ['test.ts', 'utils.test.ts', 'test.tsx'],
        },
      },
    ],
  },
  EnumsFolder: {
    name: 'enums',
    children: [
      { name: { namePattern: 'StrictPascalCase', extension: 'enum.ts' } },
    ],
  },
  ModulesFolder: {
    name: 'kebab-case',
    children: [
      { ruleId: 'TimelineActivitiesFolder' },
      { ruleId: 'ComponentFolderWithStories' },
      { ruleId: 'HooksFolder' },
      { ruleId: 'ConstantsFolder' },
      { ruleId: 'TypesFolder' },
      { ruleId: 'UtilsFolder' },
      { ruleId: 'StatesFolder' },
      { ruleId: 'assetsFolder' },
      { ruleId: 'ScopeFolder' },
      { ruleId: 'ServicesFolder' },
      { ruleId: 'MocksFolder' },
      { ruleId: 'ThemesFolder' },
      { ruleId: 'TestsFolder' },
      { ruleId: 'TestFolder' },
      { ruleId: 'StorybookFolder' },
      { ruleId: 'EnumsFolder' },
      {
        name: 'context',
        children: [{ name: 'StrictPascalCase' }],
      },
      {
        name: 'graphql',
        children: [
          {
            name: 'kebab-case',
            children: [
              {
                name: {
                  namePattern: ['camelCase', 'StrictPascalCase'],
                  extension: 'ts',
                },
              },
              {
                name: 'kebab-case',
                children: [
                  {
                    name: {
                      namePattern: ['camelCase', 'StrictPascalCase'],
                      extension: 'ts',
                    },
                  },
                ],
              },
            ],
          },
          { name: { namePattern: 'camelCase', extension: 'ts' } },
          { ruleId: 'TypesFolder' },
          { ruleId: 'UtilsFolder' },
        ],
      },
      {
        name: 'queries',
        children: [
          { name: { namePattern: 'camelCase', extension: 'ts' } },
          {
            name: 'kebab-case',
            children: [{ name: { namePattern: 'camelCase', extension: 'ts' } }],
          },
          { ruleId: 'TestsFolder' },
        ],
      },
      {
        name: {
          namePattern: ['camelCase', 'StrictPascalCase', 'StrictPascalCase'],
          extension: ['ts', 'tsx', 'test.tsx'],
        },
      },
      {
        ruleId: 'ModulesFolder',
      },
    ],
  },
  TimelineActivitiesFolder: {
    name: {
      namePattern: 'timelineActivities',
    },
    children: [
      { ruleId: 'StorybookFolder' },
      { ruleId: 'UtilsFolder' },
      {
        name: {
          namePattern: 'StrictPascalCase',
          extension: ['ts', 'tsx'],
        },
      },
      {
        name: {
          namePattern: 'camelCase',
          extension: ['ts', 'tsx'],
        },
      },
      { ruleId: 'HooksFolder' },
      {
        name: 'kebab-case',
        ruleId: 'TimelineActivitiesFolder',
      },
    ],
  },
  ImagesFolder: {
    children: [
      {
        name: {
          namePattern: [
            'StrictPascalCase',
            'snake_case_with_numbers',
            'kebab-case-with-numbers',
          ],
          extension: ['png', 'svg'],
        },
      },
      {
        name: {
          prefix: [
            'Square150x150Logo.',
            'Square44x44Logo.altform-lightunplated_targetsize-',
            'Square44x44Logo.altform-unplated_targetsize-',
            'Square44x44Logo.',
            'StoreLogo.',
            'Wide310x150Logo.',
            'SmallTile.',
            'SplashScreen.',
            'LargeTile.',
          ],
          namePattern: [
            'StrictPascalCase',
            'snake_case_with_numbers',
            'kebab-case-with-numbers',
          ],
          extension: ['png', 'svg'],
        },
      },
      { ruleId: 'ImagesFolder' },
    ],
  },
};

export type FolderRule = {
  name?: NameValidationType;
  children?: FolderRule[];
  ruleId?: keyof typeof RULES;
};
export const configs: FolderRule = {
  name: 'twenty-front',
  children: [
    {
      name: 'src',
      children: [
        // src/__stories__/App.stories.tsx
        {
          name: '__stories__',
          children: [
            { name: { namePattern: 'AppRouter', extension: 'stories.tsx' } },
          ],
        },
        // src/config/index.ts
        {
          name: 'config',
          children: [{ name: { namePattern: 'index', extension: 'ts' } }],
        },
        // src/generated/graphql.tsx
        {
          name: 'generated',
          children: [{ name: { namePattern: 'graphql', extension: 'tsx' } }],
        },
        // src/generated-metadata
        {
          name: 'generated-metadata',
          children: [
            {
              name: {
                namePattern: ['gql', 'graphql', 'index'],
                extension: 'ts',
              },
            },
          ],
        },
        // src/hooks
        {
          ruleId: 'HooksFolder',
        },
        // src/loading/
        {
          name: 'loading',
          children: [
            // src/loading/components
            {
              name: 'components',
              children: [
                {
                  name: {
                    namePattern: 'StrictPascalCase',
                    suffix: 'Loader',
                    extension: 'tsx',
                  },
                },
                // src/loading/__stories__
                {
                  name: '__stories__',
                  // TODO: should we also include the Loader Suffix here? we have PrefetchLoading.stories in the folder
                  children: [
                    {
                      name: {
                        namePattern: 'StrictPascalCase',
                        extension: 'stories.tsx',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'hooks',
              ruleId: 'HooksFolder',
            },
          ],
        },
        // src/modules
        {
          name: 'modules',

          ruleId: 'ModulesFolder',
        },
        // src/pages
        {
          name: 'pages',
          children: [
            {
              name: 'kebab-case',
              ruleId: 'ComponentFolderWithStories',
            },
            {
              name: 'settings',
              children: [
                {
                  name: 'kebab-case',
                  ruleId: 'ComponentFolderWithStories',
                },
                { ruleId: 'StorybookFolder' },
                // TODO: this is an edge case for ComponentFolderWithStories
                // This is the only folder that breaks the recursive rule for page/settings
                {
                  name: 'data-model',
                  children: [
                    { ruleId: 'UtilsFolder' },
                    { ruleId: 'TypesFolder' },
                    { ruleId: 'HooksFolder' },
                    { ruleId: 'ConstantsFolder' },
                    { ruleId: 'StorybookFolder' },
                    {
                      name: 'SettingsObjectNewField',
                      ruleId: 'ComponentsGroup',
                    },
                    { ruleId: 'ComponentsGroup' },
                  ],
                },
                // TODO: Edge case because SettingsCRMMigration is a folder and does not pass on StrictPascalCase
                // This folder should be able to be passed on ComponentFolderWithStories rule
                {
                  name: 'crm-migration',
                  children: [
                    {
                      name: {
                        namePattern: 'SettingsCRMMigration',
                        extension: 'tsx',
                      },
                    },
                  ],
                },
                { ruleId: 'ComponentsGroup' },
              ],
            },
          ],
        },
        // src/testing
        {
          name: 'testing',
          children: [
            {
              ruleId: 'ConstantsFolder',
            },
            {
              name: 'decorators',
              children: [
                {
                  name: {
                    namePattern: 'StrictPascalCase',
                    suffix: 'Decorator',
                    extension: 'tsx',
                  },
                },
                {
                  name: {
                    namePattern: 'camelCase',
                    suffix: 'Decorator',
                    extension: 'tsx',
                  },
                },
              ],
            },
            {
              ruleId: 'HooksFolder',
            },
            {
              name: 'jest',
              children: [
                {
                  name: {
                    namePattern: 'StrictPascalCase',
                    extension: 'tsx',
                  },
                },
                {
                  name: {
                    namePattern: 'camelCase',
                    extension: ['tsx', 'ts'],
                  },
                },
              ],
            },
            {
              name: 'mock-data',
              children: [
                {
                  name: 'generated',
                  children: [
                    {
                      name: {
                        namePattern: 'kebab-case',
                        prefix: 'mock-',
                        extension: 'ts',
                      },
                    },
                  ],
                },
                {
                  name: {
                    namePattern: 'kebab-case',
                    extension: 'ts',
                  },
                },
                {
                  name: {
                    namePattern: 'camelCase',
                    extension: 'ts',
                  },
                },
                {
                  name: {
                    namePattern: 'camelCase',
                    prefix: 'mock-',
                    extension: 'ts',
                  },
                },
              ],
            },
            {
              name: 'profiling',
              children: [
                {
                  name: 'components',
                  children: [
                    {
                      name: {
                        namePattern: 'StrictPascalCase',
                        extension: 'tsx',
                      },
                    },
                  ],
                },
                { ruleId: 'StatesFolder' },
                { ruleId: 'ConstantsFolder' },
                { ruleId: 'TypesFolder' },
                { ruleId: 'UtilsFolder' },
              ],
            },
            {
              name: {
                namePattern: 'StrictPascalCase',
                extension: 'tsx',
              },
            },
            {
              name: {
                namePattern: 'camelCase',
                extension: ['tsx', 'ts'],
              },
            },
          ],
        },
        // src/types
        {
          ruleId: 'TypesFolder',
        },
        // src/utils
        { ruleId: 'UtilsFolder' },
        // TODO: is it fine the way we are handling this?
        {
          name: {
            namePattern: 'kebab-case',
            extension: 'd.ts',
          },
        },
        {
          name: {
            namePattern: 'index',
            extension: 'css',
          },
        },
        {
          name: {
            namePattern: 'index',
            extension: 'tsx',
          },
        },
        {
          name: {
            namePattern: 'App',
            extension: 'tsx',
          },
        },
        {
          name: {
            namePattern: 'SettingsRoutes',
            extension: 'tsx',
          },
        },
      ],
    },
    {
      name: {
        namePattern: '__mocks__',
      },
      children: [
        {
          name: {
            namePattern: 'hex-rgb',
            extension: 'js',
          },
        },
        {
          name: {
            namePattern: 'camelCase',
            extension: 'js',
          },
        },
      ],
    },
    {
      name: '.storybook',
      children: [
        {
          name: {
            namePattern: 'kebab-case',
            extension: ['js', 'ts', 'html', 'tsx', 'config.js'],
          },
        },
      ],
    },
    {
      name: 'public',
      children: [
        {
          name: 'icons',
          children: [
            {
              name: {
                namePattern: [
                  'kebab-case',
                  'StrictPascalCase',
                  // TODO: Edge case for windows11 folder
                  'kebab-case-with-numbers',
                ],
              },
              ruleId: 'ImagesFolder',
            },
            {
              ruleId: 'ImagesFolder',
            },
          ],
        },
        {
          name: 'images',
          children: [
            {
              ruleId: 'ImagesFolder',
            },
          ],
        },
        {
          name: {
            namePattern: 'env-config',
            extension: 'js',
          },
        },
        {
          name: {
            namePattern: 'manifest',
            extension: 'json',
          },
        },
        {
          name: {
            namePattern: 'mockServiceWorker',
            extension: 'js',
          },
        },
      ],
    },
    {
      name: 'scripts',
      children: [
        {
          name: {
            namePattern: 'kebab-case',
            extension: 'sh',
          },
        },
      ],
    },
    { name: '*' },
  ],
};
