export const CASES: Record<string, RegExp | undefined> = {
  'kebab-case': /^[a-z]+(-[a-z]+)*$/,
  StrictCamelCase: /^[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?$/,
  StrictPascalCase: /^[A-Z](([a-z0-9]+[A-Z]?)*)$/,
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
  | 'docs.mdx';

export type NameType = keyof typeof CASES | string;
interface ValidationObject {
  prefix?: string[] | string;
  suffix?: string[] | string;
  namePattern?: NameType[] | NameType;
  extension?: ExtensionsType[] | ExtensionsType;
}

const SUB_FOLDER_NAME_CONSTRAINT = 'sub-folder-is-not-allowed';

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
  StorybookFolder: {
    name: '__stories__',
    children: [
      {
        name: {
          extension: [
            'ts',
            'tsx',
            'stories.tsx',
            'perf.stories.tsx',
            'docs.mdx',
          ],
        },
      },
      { name: SUB_FOLDER_NAME_CONSTRAINT, children: [] },
    ],
  },
  ComponentFolderWithStories: {
    name: 'components',
    children: [
      { ruleId: 'StorybookFolder' },
      {
        name: {
          extension: ['tsx', 'ts'],
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
              extension: ['test.ts', 'utils.test.ts', 'util.test.ts'],
            },
          },
        ],
      },
      {
        name: {
          extension: ['ts', 'utils.ts', 'util.ts'],
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
          extension: ['ts'],
          prefix: 'use',
        },
      },

      {
        name: '__tests__',
        children: [
          {
            name: {
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
          {
            name: { extension: ['ts', 'tsx'] },
          },
        ],
      },
    ],
  },
  ConstantsFolder: {
    name: 'constants',
    children: [{ name: { extension: ['ts'] } }],
  },
  ServicesFolder: {
    name: 'services',
    children: [
      {
        name: '__tests__',
        children: [
          {
            name: {
              extension: ['test.ts', 'factory.test.ts'],
            },
          },
        ],
      },
      {
        name: {
          extension: ['ts', 'factory.test.ts', 'factory.ts'],
        },
      },
    ],
  },
  StatesFolder: {
    name: 'states',
    children: [
      { name: { extension: 'ts' } },
      {
        name: 'kebab-case',
        children: [
          {
            name: {
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
            name: { extension: ['ts', 'tsx'] },
          },
        ],
      },
      { name: { extension: ['ts', 'tsx'] } },
    ],
  },
  MocksFolder: {
    name: '__mocks__',
    children: [
      {
        name: {
          extension: ['ts', 'tsx'],
        },
      },
    ],
  },
  ThemesFolder: {
    name: 'theme',
    children: [{ name: { extension: ['ts', 'tsx'] } }],
  },
  TestsFolder: {
    name: '__tests__',
    children: [
      {
        name: {
          extension: ['test.ts', 'utils.test.ts'],
        },
      },
    ],
  },
  EnumsFolder: {
    name: 'enums',
    children: [{ name: { extension: 'enum.ts' } }],
  },
  ModulesFolder: {
    name: 'kebab-case',
    reservedFolders: [
      'components',
      'hooks',
      'constants',
      'types',
      'utils',
      'states',
      'assets',
      'scope',
      'services',
      'mocks',
      'themes',
      '__tests__',
      'enums',
      'context',
      'graphql',
      'queries',
      '__stories__',
      '__mocks__',
    ],
    children: [
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
      { ruleId: 'StorybookFolder' },
      { ruleId: 'EnumsFolder' },
      {
        name: 'context',
        children: [{ name: { extension: 'ts' } }],
      },
      {
        name: 'graphql',
        children: [
          {
            name: 'kebab-case',
            children: [
              {
                name: {
                  extension: 'ts',
                },
              },
              {
                name: 'kebab-case',
                children: [
                  {
                    name: {
                      extension: 'ts',
                    },
                  },
                ],
              },
            ],
          },
          { name: { extension: 'ts' } },
          { ruleId: 'TypesFolder' },
          { ruleId: 'UtilsFolder' },
        ],
      },
      {
        name: 'queries',
        children: [
          { name: { extension: 'ts' } },
          {
            name: 'kebab-case',
            children: [{ name: { extension: 'ts' } }],
          },
          { ruleId: 'TestsFolder' },
        ],
      },
      {
        name: {
          extension: ['ts', 'tsx'],
        },
      },
      {
        ruleId: 'ModulesFolder',
      },
    ],
  },
};

export type FolderRule = {
  name?: NameValidationType;
  children?: FolderRule[];
  ruleId?: keyof typeof RULES;
  reservedFolders?: string[];
};
export const configs: FolderRule = {
  name: 'src',
  children: [
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
          children: [
            { ruleId: 'StorybookFolder' },
            { name: { extension: 'tsx' } },
          ],
        },
      ],
    },
    { name: '*', children: [] },
  ],
};
