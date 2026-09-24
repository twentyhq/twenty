import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type ComponentDoc,
  type ParserOptions,
  type PropItem,
} from 'react-docgen-typescript';
import ts from 'typescript';

import { DESIGN_TOKENS } from '../design-tokens/designTokens';
import { collectLeaves } from '../design-tokens/pipeline/collectLeaves';
import { DOCUMENTED_COMPONENTS } from '../docs/components';
import { DocumentationParser } from '../docs/DocumentationParser';
import { formatDocumentationTokenValue } from '../docs/formatDocumentationTokenValue';
import { normalizeDocumentationDefaultValue } from '../docs/normalizeDocumentationDefaultValue';
import { normalizeDocumentationPropType } from '../docs/normalizeDocumentationPropType';
import {
  type ComponentDocumentation,
  type TokenDocumentation,
} from '../docs/types';

const HIDDEN_PROP_TAGS = ['ignore', 'internal'];
const COMPONENT_PART_NAME_PATTERN = /^[A-Z]/;

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(packageRoot, 'src');
const configurationPath = resolve(packageRoot, 'tsconfig.json');
const configuration = ts.readConfigFile(configurationPath, ts.sys.readFile);

if (configuration.error) {
  throw new Error(
    ts.flattenDiagnosticMessageText(configuration.error.messageText, '\n'),
  );
}

const { options, errors } = ts.parseJsonConfigFileContent(
  configuration.config,
  ts.sys,
  packageRoot,
);

if (errors.length > 0) {
  throw new Error(
    errors
      .map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n'))
      .join('\n'),
  );
}

const sourcePaths = DOCUMENTED_COMPONENTS.map((component) =>
  resolve(sourceRoot, component.source),
);
const program = ts.createProgram(sourcePaths, {
  ...options,
  preserveSymlinks: true,
});
const checker = program.getTypeChecker();

const isReactNativeAttribute = (prop: PropItem): boolean =>
  prop.declarations !== undefined &&
  prop.declarations.length > 0 &&
  prop.declarations.every((declaration) =>
    declaration.fileName.includes('@types/react/'),
  );

const isHiddenProp = (prop: PropItem): boolean =>
  HIDDEN_PROP_TAGS.some((tag) => tag in (prop.tags ?? {}));

const isDeclaredInTwentyUi = (prop: PropItem): boolean =>
  prop.declarations?.some((declaration) =>
    declaration.fileName.startsWith(sourceRoot),
  ) ?? false;

const parserOptions: ParserOptions = {
  shouldExtractLiteralValuesFromEnum: true,
  shouldIncludePropTagMap: true,
  propFilter: (prop) => !isReactNativeAttribute(prop) && !isHiddenProp(prop),
};
const parser = new DocumentationParser(program, parserOptions);
const documentedChildrenParser = new DocumentationParser(program, {
  ...parserOptions,
  skipChildrenPropWithoutDoc: false,
});

const extractProps = ({
  symbol,
  name,
  propDescriptions = {},
  propDefaults = {},
}: {
  symbol: ts.Symbol;
  name: string;
  propDescriptions?: Partial<Record<string, string>>;
  propDefaults?: Partial<Record<string, string>>;
}): ComponentDocumentation['props'] => {
  const declaration = symbol.valueDeclaration;

  if (!declaration) {
    throw new Error(`Could not find the declaration for ${name}`);
  }

  const componentParser =
    'children' in propDescriptions ? documentedChildrenParser : parser;
  const parsed: ComponentDoc | null = componentParser.getComponentInfo(
    symbol,
    declaration.getSourceFile(),
    () => name,
  );

  if (!parsed || Object.keys(parsed.props).length === 0) {
    throw new Error(`Could not extract props for ${name}`);
  }

  return Object.values(parsed.props)
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
    .map((prop) => {
      const description = (
        propDescriptions[prop.name] ?? prop.description
      ).trim();

      if (description.length === 0 && isDeclaredInTwentyUi(prop)) {
        throw new Error(
          `Missing description for ${name}.${prop.name}. Document the prop in its props type or documentation metadata.`,
        );
      }

      return {
        name: prop.name,
        type: normalizeDocumentationPropType({
          type: prop.type,
          required: prop.required,
        }),
        required: prop.required,
        defaultValue:
          propDefaults[prop.name] ??
          normalizeDocumentationDefaultValue(prop.defaultValue),
        description,
      };
    });
};

const components: ComponentDocumentation[] = DOCUMENTED_COMPONENTS.map(
  (component) => {
    const source = program.getSourceFile(resolve(sourceRoot, component.source));
    const moduleSymbol = source && checker.getSymbolAtLocation(source);
    const symbol =
      moduleSymbol &&
      checker
        .getExportsOfModule(moduleSymbol)
        .find((candidate) => candidate.name === component.name);

    if (!symbol?.valueDeclaration) {
      throw new Error(`Could not find the export for ${component.name}`);
    }

    const type = checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration,
    );
    const metadata = {
      name: component.name,
      entryPoint: component.entryPoint,
      slug: component.slug,
    };

    const props =
      type.getCallSignatures().length > 0
        ? extractProps({
            symbol,
            name: component.name,
            propDescriptions:
              'propDescriptions' in component
                ? component.propDescriptions
                : undefined,
            propDefaults:
              'propDefaults' in component ? component.propDefaults : undefined,
          })
        : [];

    const partNames: readonly string[] | undefined =
      'parts' in component ? component.parts : undefined;
    const partPropDescriptions: Partial<
      Record<string, Partial<Record<string, string>>>
    > =
      'partPropDescriptions' in component ? component.partPropDescriptions : {};
    const partPropDefaults: Partial<
      Record<string, Partial<Record<string, string>>>
    > = 'partPropDefaults' in component ? component.partPropDefaults : {};
    const componentParts = type
      .getProperties()
      .filter((part) => COMPONENT_PART_NAME_PATTERN.test(part.name))
      .filter((part) => partNames?.includes(part.name) ?? props.length === 0);
    const parts = componentParts.map((part) => {
      const declaration = part.valueDeclaration;

      if (!declaration || !ts.isPropertyAssignment(declaration)) {
        throw new Error(`Could not resolve ${component.name}.${part.name}`);
      }

      let partSymbol = checker.getSymbolAtLocation(declaration.initializer);

      if (!partSymbol) {
        throw new Error(`Could not find ${component.name}.${part.name}`);
      }

      if (partSymbol.flags & ts.SymbolFlags.Alias) {
        partSymbol = checker.getAliasedSymbol(partSymbol);
      }

      return {
        name: part.name,
        props: extractProps({
          symbol: partSymbol,
          name: `${component.name}.${part.name}`,
          propDescriptions: partPropDescriptions[part.name],
          propDefaults: partPropDefaults[part.name],
        }),
      };
    });

    if (props.length === 0 && parts.length === 0) {
      throw new Error(`Could not extract parts for ${component.name}`);
    }

    return {
      ...metadata,
      props,
      ...(parts.length > 0 ? { parts } : {}),
    };
  },
);

const tokens: TokenDocumentation[] = collectLeaves(DESIGN_TOKENS)
  .map((leaf) => ({
    path: leaf.path.join('.'),
    cssVariable: leaf.varName,
    light: formatDocumentationTokenValue(leaf.light),
    dark: formatDocumentationTokenValue(leaf.dark),
    isNumber: leaf.unit === 'number',
  }))
  .sort((left, right) =>
    left.path.localeCompare(right.path, 'en', { numeric: true }),
  );

const outputs = [
  { name: 'components.docs.json', data: components },
  { name: 'tokens.docs.json', data: tokens },
];
const isCheckMode = process.argv.includes('--check');

for (const output of outputs) {
  const outputPath = resolve(packageRoot, 'generated', output.name);
  const content = `${JSON.stringify(output.data, null, 2)}\n`;

  if (isCheckMode) {
    if (
      !existsSync(outputPath) ||
      readFileSync(outputPath, 'utf8') !== content
    ) {
      process.stderr.write(
        `Stale documentation data: ${relative(packageRoot, outputPath)}. Run npx nx generate:ui twenty-docs.\n`,
      );
      process.exitCode = 1;
    }
  } else {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, content);
  }
}
