import type { Project, SourceFile } from 'ts-morph';

import { type ComponentSchema } from './schemas';
import {
  addExportedConst,
  addExportedType,
  addFileHeader,
  addStatement,
  schemaTypeToConstructor,
  schemaTypeToTs,
} from './utils';

const generatePropertyInterface = (
  sourceFile: SourceFile,
  component: ComponentSchema,
): void => {
  const entries = Object.entries(component.properties);
  if (entries.length === 0) {
    return;
  }

  const props = entries
    .map(([name, schema]) => {
      const tsType = schemaTypeToTs(schema.type);
      const optional = schema.optional ? '?' : '';
      return `  '${name}'${optional}: ${tsType};`;
    })
    .join('\n');

  addExportedType(sourceFile, `${component.name}Properties`, `{\n${props}\n}`);
};

const generateElementDefinition = (
  sourceFile: SourceFile,
  component: ComponentSchema,
): void => {
  const hasEvents = component.events.length > 0;
  const hasProps = Object.keys(component.properties).length > 0;

  const propsType = hasProps
    ? `${component.name}Properties`
    : 'Record<string, never>';

  const eventsType = hasEvents
    ? `{ ${component.events.map((event) => `${event}(event: RemoteEvent): void`).join('; ')} }`
    : 'Record<string, never>';

  const configParts: string[] = [];

  if (hasProps) {
    const propsConfig = Object.entries(component.properties)
      .map(([name, schema]) => {
        const constructorType = schemaTypeToConstructor(schema.type);
        return `    '${name}': { type: ${constructorType} },`;
      })
      .join('\n');
    configParts.push(`  properties: {\n${propsConfig}\n  },`);
  }

  if (hasEvents) {
    const eventsArray = component.events
      .map((event) => `'${event}'`)
      .join(', ');
    configParts.push(`  events: [${eventsArray}],`);
  }

  const config =
    configParts.length > 0 ? `{\n${configParts.join('\n')}\n}` : '{}';

  const initializer = `createRemoteElement<
  ${propsType},
  Record<string, never>,
  Record<string, never>,
  ${eventsType}
>(${config})`;

  addExportedConst(sourceFile, `${component.name}Element`, initializer);
};

const generateCustomElementRegistrations = (
  sourceFile: SourceFile,
  components: ComponentSchema[],
): void => {
  const registrations = components
    .map(
      (component) =>
        `customElements.define('${component.customElementName}', ${component.name}Element);`,
    )
    .join('\n');

  addStatement(sourceFile, registrations);
  addStatement(
    sourceFile,
    `customElements.define('remote-root', RemoteRootElement);`,
  );
  addStatement(
    sourceFile,
    `customElements.define('remote-fragment', RemoteFragmentElement);`,
  );
};

const generateTagNameMapDeclaration = (
  sourceFile: SourceFile,
  components: ComponentSchema[],
): void => {
  const entries = components
    .map(
      (component) =>
        `    '${component.customElementName}': InstanceType<typeof ${component.name}Element>;`,
    )
    .join('\n');

  const declaration = `declare global {
  interface HTMLElementTagNameMap {
${entries}
    'remote-root': InstanceType<typeof RemoteRootElement>;
    'remote-fragment': InstanceType<typeof RemoteFragmentElement>;
  }
}`;

  addStatement(sourceFile, declaration);
};

export const generateRemoteElements = (
  project: Project,
  components: ComponentSchema[],
): SourceFile => {
  const sourceFile = project.createSourceFile('remote-elements.ts', '', {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/core/elements',
    namedImports: [
      'createRemoteElement',
      'RemoteRootElement',
      'RemoteFragmentElement',
      { name: 'RemoteEvent', isTypeOnly: true },
    ],
  });

  for (const component of components) {
    generatePropertyInterface(sourceFile, component);
  }

  for (const component of components) {
    generateElementDefinition(sourceFile, component);
  }

  generateCustomElementRegistrations(sourceFile, components);

  sourceFile.addExportDeclaration({
    namedExports: ['RemoteRootElement', 'RemoteFragmentElement'],
  });

  generateTagNameMapDeclaration(sourceFile, components);

  addFileHeader(sourceFile);

  return sourceFile;
};
