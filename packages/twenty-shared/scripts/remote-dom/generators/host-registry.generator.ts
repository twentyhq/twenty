import type { Project, SourceFile } from 'ts-morph';

import { CUSTOM_ELEMENT_NAMES } from './constants';
import { type ComponentSchema } from './schemas';
import { addFileHeader, addStatement } from './utils';

const generateRuntimeUtilities = (
  eventToReactMapping: Record<string, string>,
): string => {
  const eventMapEntries = Object.entries(eventToReactMapping)
    .map(([domEvent, reactProp]) => `  on${domEvent}: '${reactProp}',`)
    .join('\n');

  return `const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const EVENT_NAME_MAP: Record<string, string> = {
${eventMapEntries}
};

const parseStyle = (styleString: string | undefined): React.CSSProperties | undefined => {
  if (!styleString || typeof styleString !== 'string') {
    return styleString as React.CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    style[camelProperty] = value;
  }

  return style;
};

const wrapEventHandler = (handler: () => void) => {
  return (_event: unknown) => {
    handler();
  };
};

const filterProps = (props: Record<string, unknown>) => {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || value === undefined) continue;

    if (key === 'style') {
      filtered.style = parseStyle(value as string | undefined);
    } else {
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;
      if (normalizedKey.startsWith('on') && typeof value === 'function') {
        filtered[normalizedKey] = wrapEventHandler(value as () => void);
      } else {
        filtered[normalizedKey] = value;
      }
    }
  }
  return filtered;
};`;
};

const generateWrapperComponent = (component: ComponentSchema): string => {
  return `const ${component.name}Wrapper = ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('${component.htmlTag}', filterProps(props), children);
};`;
};

const generateRegistryMap = (components: ComponentSchema[]): string => {
  const entries = components
    .map(
      (component) =>
        `  ['${component.customElementName}', createRemoteComponentRenderer(${component.name}Wrapper)],`,
    )
    .join('\n');

  return `export const componentRegistry = new Map<string, ReturnType<typeof createRemoteComponentRenderer>>([
${entries}
  ['${CUSTOM_ELEMENT_NAMES.FRAGMENT}', RemoteFragmentRenderer],
]);`;
};

export const generateHostRegistry = (
  project: Project,
  components: ComponentSchema[],
  eventToReactMapping: Record<string, string>,
): SourceFile => {
  const sourceFile = project.createSourceFile(
    'host-component-registry.ts',
    '',
    { overwrite: true },
  );

  sourceFile.addImportDeclaration({
    moduleSpecifier: 'react',
    defaultImport: 'React',
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/react/host',
    namedImports: ['RemoteFragmentRenderer', 'createRemoteComponentRenderer'],
  });

  addStatement(sourceFile, generateRuntimeUtilities(eventToReactMapping));

  for (const component of components) {
    addStatement(sourceFile, generateWrapperComponent(component));
  }

  addStatement(sourceFile, generateRegistryMap(components));

  addFileHeader(sourceFile);

  return sourceFile;
};
