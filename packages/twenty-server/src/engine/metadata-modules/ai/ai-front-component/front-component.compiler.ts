import { createHash } from 'crypto';
import { dirname } from 'path';

import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';
import {
  createJsxRuntimeRemoteWrapperPlugin,
  cssInjectionPlugin,
  unwrapDefineFrontComponentToDirectExport,
} from 'twenty-shared/front-component-build';

import {
  type FrontComponentDraftInput,
  type FrontComponentQuery,
} from './ai-front-component.schemas';
import { FRONT_COMPONENT_UI_IMPORTS } from './front-component-ui.constants';
import { buildFrontComponentWithLimits } from './build-front-component-with-limits.util';

export const compileFrontComponent = async (source: string) => {
  const result = await buildFrontComponentWithLimits({
    stdin: {
      contents: unwrapDefineFrontComponentToDirectExport(source),
      resolveDir: dirname(__filename),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    minify: true,
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [createJsxRuntimeRemoteWrapperPlugin(), cssInjectionPlugin],
  });
  const compiledSource = result.outputFiles[0].text;

  return {
    compiledSource,
    checksum: createHash('sha256').update(compiledSource).digest('hex'),
  };
};

export const buildFrontComponentEntrySource = async ({
  componentId,
  name,
  source,
  query,
  pageLayoutType,
}: {
  componentId: string;
  name: string;
  source: string;
  query: FrontComponentQuery;
  pageLayoutType: FrontComponentDraftInput['pageLayoutType'];
}) => {
  await buildFrontComponentWithLimits({
    stdin: {
      contents: "export { default } from 'generated-component';",
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'esm',
    jsx: 'preserve',
    logLevel: 'silent',
    plugins: [
      {
        name: 'front-component-source',
        setup(pluginBuild) {
          pluginBuild.onResolve({ filter: /^generated-component$/ }, () => ({
            path: 'generated-component',
            namespace: 'front-component',
          }));
          pluginBuild.onResolve(
            { filter: /.*/, namespace: 'front-component' },
            ({ path }) => {
              if (
                ![
                  'react',
                  'react/jsx-runtime',
                  ...FRONT_COMPONENT_UI_IMPORTS,
                ].includes(path)
              ) {
                return {
                  errors: [
                    {
                      text: `Unsupported import: ${path}. Use React and the supported twenty-ui imports.`,
                    },
                  ],
                };
              }
              return { path, external: true };
            },
          );
          pluginBuild.onLoad(
            { filter: /.*/, namespace: 'front-component' },
            () => ({ contents: source, loader: 'tsx' }),
          );
        },
      },
    ],
  });

  const sourceFile = typescript.createSourceFile(
    'component.front-component.tsx',
    source,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TSX,
  );
  const prefix = `AiComponent${componentId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const generatedName = `${prefix}View`;
  const componentName = `${prefix}Root`;
  let hasDefaultExport = false;
  const bindComponent = (expression: typescript.Expression) =>
    typescript.factory.createVariableStatement(
      undefined,
      typescript.factory.createVariableDeclarationList(
        [
          typescript.factory.createVariableDeclaration(
            generatedName,
            undefined,
            undefined,
            expression,
          ),
        ],
        typescript.NodeFlags.Const,
      ),
    );
  const statements = sourceFile.statements.flatMap(
    (statement): typescript.Statement[] => {
      if (typescript.isExportAssignment(statement)) {
        hasDefaultExport = true;
        return [bindComponent(statement.expression)];
      }
      if (
        typescript.isFunctionDeclaration(statement) &&
        statement.modifiers?.some(
          (modifier) => modifier.kind === typescript.SyntaxKind.DefaultKeyword,
        )
      ) {
        hasDefaultExport = true;
        const functionName =
          statement.name ?? typescript.factory.createIdentifier(generatedName);
        const declaration = typescript.factory.updateFunctionDeclaration(
          statement,
          statement.modifiers.filter(
            (modifier) =>
              ![
                typescript.SyntaxKind.ExportKeyword,
                typescript.SyntaxKind.DefaultKeyword,
              ].includes(modifier.kind),
          ),
          statement.asteriskToken,
          functionName,
          statement.typeParameters,
          statement.parameters,
          statement.type,
          statement.body,
        );
        return statement.name
          ? [declaration, bindComponent(functionName)]
          : [declaration];
      }
      if (
        typescript.isExportDeclaration(statement) &&
        isDefined(statement.exportClause) &&
        typescript.isNamedExports(statement.exportClause)
      ) {
        const defaultExport = statement.exportClause.elements.find(
          (element) => element.name.text === 'default',
        );
        if (isDefined(defaultExport)) {
          hasDefaultExport = true;
          const remaining = statement.exportClause.elements.filter(
            (element) => element !== defaultExport,
          );
          return [
            ...(remaining.length
              ? [
                  typescript.factory.updateExportDeclaration(
                    statement,
                    statement.modifiers,
                    statement.isTypeOnly,
                    typescript.factory.updateNamedExports(
                      statement.exportClause,
                      remaining,
                    ),
                    statement.moduleSpecifier,
                    statement.attributes,
                  ),
                ]
              : []),
            bindComponent(
              typescript.factory.createIdentifier(
                (defaultExport.propertyName ?? defaultExport.name).text,
              ),
            ),
          ];
        }
      }
      return [statement];
    },
  );
  if (!hasDefaultExport) {
    throw new Error('Default-export a React function component.');
  }
  const componentSource = typescript
    .createPrinter({ removeComments: true })
    .printFile(typescript.factory.updateSourceFile(sourceFile, statements));

  return {
    source: `import { defineFrontComponent } from 'twenty-sdk/define';
import type { ComponentProps as ${prefix}Props } from 'react';
import { ThemeProvider as ${prefix}Theme } from 'twenty-ui/theme';
import { PageLayoutType as ${prefix}PageLayoutType } from 'twenty-shared/types';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
${componentSource}
const ${prefix}Query = ${JSON.stringify(query)};
export { ${prefix}Query as componentQuery };
function ${componentName}(props: ${prefix}Props<typeof ${generatedName}>) {
  return <${prefix}Theme colorScheme="light"><${generatedName} {...props} /></${prefix}Theme>;
}
export default defineFrontComponent({
  universalIdentifier: ${JSON.stringify(componentId)},
  name: ${JSON.stringify(name)},
  component: ${componentName},
  widgetAvailability: { pageLayoutType: ${prefix}PageLayoutType.${pageLayoutType} },
});
`,
    componentName,
  };
};
