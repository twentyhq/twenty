import { spawnSync } from 'node:child_process';
import { Node, Project } from 'ts-morph';

const ENUM_VALUES: Record<string, Record<string, string>> = {
  CheckboxVariant: {
    Primary: 'solid',
    Secondary: 'outline',
    Tertiary: 'outline',
  },
  CheckboxSize: { Small: 'sm', Large: 'md' },
  CheckboxShape: { Squared: 'square', Rounded: 'round' },
  CheckboxAccent: { Blue: 'accent', Orange: 'warning' },
};

const project = new Project({ skipAddingFilesFromTsConfig: true });
const search = spawnSync(
  'rg',
  [
    '-l',
    '\\bCheckbox(?:Variant|Size|Shape|Accent)?\\b',
    'packages',
    '--glob',
    '*.tsx',
    '--glob',
    '*.ts',
    '--glob',
    '!**/generated/**',
  ],
  { encoding: 'utf8' },
);

if (search.error) {
  throw search.error;
}
if (search.status !== 0 && search.status !== 1) {
  throw new Error(search.stderr || 'Could not find Checkbox consumers');
}

const problems: string[] = [];
const editedSources: ReturnType<Project['addSourceFileAtPath']>[] = [];

for (const file of search.stdout.split('\n').filter(Boolean).sort()) {
  if (file.includes('/input/Checkbox/')) {
    continue;
  }
  const source = project.addSourceFileAtPath(file);
  editedSources.push(source);
  const imports = source
    .getImportDeclarations()
    .filter((declaration) =>
      [
        'twenty-ui',
        'twenty-ui/input',
        '@ui/input',
        '@ui/input/Checkbox/Checkbox',
      ].includes(declaration.getModuleSpecifierValue()),
    );
  const specifiers = imports.flatMap((declaration) =>
    declaration.getNamedImports(),
  );
  const checkboxImport = specifiers.find(
    (specifier) => specifier.getName() === 'Checkbox',
  );

  if (checkboxImport) {
    const localName = checkboxImport.getAliasNode()?.getText() ?? 'Checkbox';
    for (const element of source
      .getDescendants()
      .filter(
        (node) =>
          Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node),
      )) {
      if (element.getTagNameNode().getText() !== localName) {
        continue;
      }
      for (const attribute of element.getAttributes()) {
        if (Node.isJsxSpreadAttribute(attribute)) {
          problems.push(`${file}: migrate spread props manually`);
          continue;
        }
        const name = attribute.getNameNode().getText();
        if (name === 'accent') {
          if (element.getAttribute('color')) {
            problems.push(`${file}: reconcile accent and color manually`);
          } else {
            attribute.setName('color');
          }
        }
        if (name !== 'onChange') {
          continue;
        }
        const initializer = attribute.getInitializer();
        const handler = Node.isJsxExpression(initializer)
          ? initializer.getExpression()
          : undefined;
        if (
          element.getAttribute('onCheckedChange') ||
          !Node.isArrowFunction(handler) ||
          handler.getParameters().length > 0
        ) {
          problems.push(
            `${file}: migrate onChange to onCheckedChange manually (use the boolean argument and eventDetails.event when needed)`,
          );
          continue;
        }
        attribute.setName('onCheckedChange');
      }
    }
  }

  for (const specifier of specifiers) {
    const values = ENUM_VALUES[specifier.getName()];
    if (
      !values ||
      specifier.isTypeOnly() ||
      specifier.getImportDeclaration().isTypeOnly()
    ) {
      continue;
    }
    const identifier = specifier.getAliasNode() ?? specifier.getNameNode();
    if (!Node.isIdentifier(identifier)) {
      continue;
    }
    for (const reference of identifier.findReferencesAsNodes()) {
      if (
        reference.getSourceFile() !== source ||
        Node.isImportSpecifier(reference.getParent())
      ) {
        continue;
      }
      const parent = reference.getParent();
      if (
        !Node.isPropertyAccessExpression(parent) ||
        parent.getExpression() !== reference ||
        !values[parent.getName()]
      ) {
        problems.push(
          `${file}: migrate ${specifier.getName()} reference manually`,
        );
        continue;
      }
      if (
        specifier.getName() === 'CheckboxVariant' &&
        parent.getName() === 'Tertiary'
      ) {
        problems.push(
          `${file}: migrate the tertiary border styling manually before replacing it with outline`,
        );
      }
      parent.replaceWithText(`'${values[parent.getName()]}'`);
    }
    specifier.remove();
  }
  for (const declaration of imports) {
    if (
      !declaration.getNamedImports().length &&
      !declaration.getDefaultImport() &&
      !declaration.getNamespaceImport()
    ) {
      declaration.remove();
    }
  }
}

if (problems.length) {
  throw new Error(`No files written.\n${[...new Set(problems)].join('\n')}`);
}

for (const source of editedSources) {
  source.saveSync();
}
