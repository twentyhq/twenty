import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser, type ComponentDoc } from 'react-docgen-typescript';
import ts from 'typescript';

import { DESIGN_TOKENS } from '../design-tokens/designTokens';
import { collectLeaves } from '../design-tokens/pipeline/collectLeaves';
import { DOCUMENTED_COMPONENTS } from '../docs/components';
import {
  type ComponentDocumentation,
  type TokenDocumentation,
} from '../docs/types';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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
  resolve(packageRoot, 'src', component.source),
);
const program = ts.createProgram(sourcePaths, {
  ...options,
  preserveSymlinks: true,
});
const checker = program.getTypeChecker();
const parser = new Parser(program, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  // React's native attributes remain available without overwhelming each reference.
  propFilter: (prop) =>
    !prop.declarations?.every((declaration) =>
      declaration.fileName.includes('@types/react/'),
    ),
});

const extractProps = (
  symbol: ts.Symbol,
  name: string,
): ComponentDocumentation['props'] => {
  const declaration = symbol.valueDeclaration;

  if (!declaration) {
    throw new Error(`Could not find the declaration for ${name}`);
  }

  const parsed: ComponentDoc | null = parser.getComponentInfo(
    symbol,
    declaration.getSourceFile(),
    () => name,
  );

  if (!parsed || Object.keys(parsed.props).length === 0) {
    throw new Error(`Could not extract props for ${name}`);
  }

  return Object.values(parsed.props)
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
    .map((prop) => ({
      name: prop.name,
      type:
        prop.type.name === 'enum'
          ? prop.type.value
              .map((value: { value: string }) => value.value)
              .join(' | ')
          : prop.type.name,
      required: prop.required,
      defaultValue:
        prop.defaultValue === null ? null : String(prop.defaultValue.value),
      description: prop.description,
    }));
};

const components: ComponentDocumentation[] = DOCUMENTED_COMPONENTS.map(
  (component) => {
    const source = program.getSourceFile(
      resolve(packageRoot, 'src', component.source),
    );
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

    if (type.getCallSignatures().length > 0) {
      return { ...metadata, props: extractProps(symbol, component.name) };
    }

    const parts = type.getProperties().map((part) => {
      const declaration = part.valueDeclaration;

      if (!declaration || !ts.isPropertyAssignment(declaration)) {
        throw new Error(`Could not resolve ${component.name}.${part.name}`);
      }

      let partSymbol = checker.getSymbolAtLocation(declaration.initializer);

      if (!partSymbol) {
        throw new Error(`Could not find ${component.name}.${part.name}`);
      }

      // Follow the original declaration so wrapper defaults survive extraction.
      if (partSymbol.flags & ts.SymbolFlags.Alias) {
        partSymbol = checker.getAliasedSymbol(partSymbol);
      }

      return {
        name: part.name,
        props: extractProps(partSymbol, `${component.name}.${part.name}`),
      };
    });

    if (parts.length === 0) {
      throw new Error(`Could not extract parts for ${component.name}`);
    }

    return { ...metadata, props: [], parts };
  },
);

const tokens: TokenDocumentation[] = collectLeaves(DESIGN_TOKENS)
  .map((leaf) => ({
    path: leaf.path.join('.'),
    cssVariable: leaf.varName,
    light: leaf.light,
    dark: leaf.dark,
    isNumber: leaf.unit === 'number',
  }))
  .sort((left, right) => left.path.localeCompare(right.path, 'en'));

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
