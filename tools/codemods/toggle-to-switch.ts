import { spawnSync } from 'node:child_process';
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ skipAddingFilesFromTsConfig: true });
const searchResult = spawnSync(
  'rg',
  [
    '-l',
    '\\bToggle\\b',
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

if (searchResult.error) {
  throw searchResult.error;
}

if (searchResult.status !== 0 && searchResult.status !== 1) {
  throw new Error(searchResult.stderr || 'Could not find Toggle consumers');
}

const files = searchResult.stdout.trim().split('\n').filter(Boolean).sort();

for (const file of files) {
  const source = project.addSourceFileAtPath(file);
  const imports = source
    .getImportDeclarations()
    .filter((declaration) =>
      [
        'twenty-ui',
        'twenty-ui/input',
        '@ui/input',
        '@ui/input/Toggle/Toggle',
      ].includes(declaration.getModuleSpecifierValue()),
    );
  const toggleImport = imports
    .flatMap((declaration) => declaration.getNamedImports())
    .find((specifier) => specifier.getName() === 'Toggle');
  if (!toggleImport) {
    continue;
  }
  if (source.getFilePath().includes('/input/Toggle/')) {
    continue;
  }
  const localName = toggleImport.getAliasNode()?.getText() ?? 'Toggle';
  for (const element of source
    .getDescendants()
    .filter(
      (node) =>
        node.isKind(SyntaxKind.JsxSelfClosingElement) ||
        node.isKind(SyntaxKind.JsxOpeningElement),
    )) {
    if (element.getTagNameNode().getText() !== localName) {
      continue;
    }
    const styleProperties: string[] = [];
    for (const attribute of element.getAttributes()) {
      if (attribute.isKind(SyntaxKind.JsxSpreadAttribute)) {
        throw new Error(`Migrate spread props manually: ${file}`);
      }
      const name = attribute.getNameNode().getText();
      const initializer = attribute.getInitializer();
      if (name === 'value' || name === 'onChange') {
        attribute.setName(name === 'value' ? 'checked' : 'onCheckedChange');
      } else if (name === 'toggleSize') {
        const value = initializer?.getText();
        if (value !== '"small"' && value !== '"medium"') {
          throw new Error(`Migrate dynamic size manually: ${file}`);
        }
        attribute.setName('size');
        attribute.setInitializer(value === '"small"' ? '"sm"' : '"md"');
      } else if (name === 'color' || name === 'centered') {
        if (file.startsWith('packages/twenty-front/')) {
          throw new Error(
            `Migrate ${name} to a Linaria styled component manually: ${file}`,
          );
        }
        const value = initializer?.isKind(SyntaxKind.JsxExpression)
          ? initializer.getExpression()?.getText()
          : initializer?.getText();
        styleProperties.push(
          name === 'color'
            ? `color: ${value}`
            : `alignSelf: ${value ? `${value} ? 'center' : undefined` : "'center'"}`,
        );
        attribute.remove();
      }
    }
    if (styleProperties.length) {
      if (element.getAttribute('style')) {
        throw new Error(`Merge style manually: ${file}`);
      }
      element.addAttribute({
        name: 'style',
        initializer: `{{ ${styleProperties.join(', ')} }}`,
      });
    }
  }
  if (!toggleImport.getAliasNode()) {
    toggleImport.renameAlias('Switch');
    toggleImport.setName('Switch');
    toggleImport.removeAlias();
  } else {
    toggleImport.setName('Switch');
  }
  for (const declaration of imports) {
    if (declaration.getModuleSpecifierValue() === '@ui/input/Toggle/Toggle') {
      declaration.setModuleSpecifier('@ui/input/Switch/Switch');
    }
  }
}

project.saveSync();
