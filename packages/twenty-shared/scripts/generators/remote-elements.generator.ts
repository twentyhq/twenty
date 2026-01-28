import {
  type Project,
  type SourceFile,
  VariableDeclarationKind,
  type WriterFunction,
} from 'ts-morph';

import { type ComponentSchema, type PropertySchema } from './schemas';
import {
  addFileHeader,
  schemaTypeToConstructor,
  schemaTypeToTs,
} from './utils';

const getElementSpecificProperties = (
  component: ComponentSchema,
  commonPropertyNames: Set<string>,
): Record<string, PropertySchema> => {
  const specific: Record<string, PropertySchema> = {};
  for (const [name, schema] of Object.entries(component.properties)) {
    if (!commonPropertyNames.has(name)) {
      specific[name] = schema;
    }
  }
  return specific;
};

const generatePropertyEntries = (
  properties: Record<string, PropertySchema>,
): string[] => {
  return Object.entries(properties).map(([name, schema]) => {
    const tsType = schemaTypeToTs(schema.type);
    const optional = schema.optional ? '?' : '';
    return `'${name}'${optional}: ${tsType}`;
  });
};

const generateCommonPropertiesType = (
  sourceFile: SourceFile,
  commonProperties: Record<string, PropertySchema>,
): void => {
  const entries = generatePropertyEntries(commonProperties);

  sourceFile.addTypeAlias({
    isExported: true,
    name: 'HtmlCommonProperties',
    type: (writer) => {
      writer.block(() => {
        for (const entry of entries) {
          writer.writeLine(`${entry};`);
        }
      });
    },
  });
};

const generateCommonEventsType = (
  sourceFile: SourceFile,
  events: readonly string[],
): void => {
  if (events.length === 0) {
    return;
  }

  sourceFile.addTypeAlias({
    isExported: true,
    name: 'HtmlCommonEvents',
    type: (writer) => {
      writer.block(() => {
        for (const event of events) {
          writer.writeLine(`${event}(event: RemoteEvent): void;`);
        }
      });
    },
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'HTML_COMMON_EVENTS_ARRAY',
        initializer: (writer) => {
          writer.write('[');
          writer.newLine();
          writer.indent(() => {
            for (const event of events) {
              writer.writeLine(`'${event}',`);
            }
          });
          writer.write('] as const');
        },
      },
    ],
  });
};

const generateCommonPropertiesConfig = (
  sourceFile: SourceFile,
  commonProperties: Record<string, PropertySchema>,
): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'HTML_COMMON_PROPERTIES_CONFIG',
        initializer: (writer) => {
          writer.block(() => {
            for (const [name, schema] of Object.entries(commonProperties)) {
              const constructorType = schemaTypeToConstructor(schema.type);
              writer.writeLine(`'${name}': { type: ${constructorType} },`);
            }
          });
        },
      },
    ],
  });
};

const generateElementPropertyType = (
  sourceFile: SourceFile,
  component: ComponentSchema,
  specificProperties: Record<string, PropertySchema>,
): void => {
  const hasSpecificProps = Object.keys(specificProperties).length > 0;

  if (hasSpecificProps) {
    const entries = generatePropertyEntries(specificProperties);
    sourceFile.addTypeAlias({
      isExported: true,
      name: `${component.name}Properties`,
      type: (writer) => {
        writer.write('HtmlCommonProperties & ');
        writer.block(() => {
          for (const entry of entries) {
            writer.writeLine(`${entry};`);
          }
        });
      },
    });
  }
};

const generatePropertiesConfigWriter = (
  properties: Record<string, PropertySchema>,
): WriterFunction => {
  return (writer) => {
    writer.block(() => {
      for (const [name, schema] of Object.entries(properties)) {
        const constructorType = schemaTypeToConstructor(schema.type);
        writer.writeLine(`'${name}': { type: ${constructorType} },`);
      }
    });
  };
};

const generateElementDefinition = (
  sourceFile: SourceFile,
  component: ComponentSchema,
  specificProperties: Record<string, PropertySchema>,
  useSharedEvents: boolean,
  useSharedPropertiesConfig: boolean,
): void => {
  const hasEvents = component.events.length > 0;
  const hasSpecificProps = Object.keys(specificProperties).length > 0;
  const hasProps = Object.keys(component.properties).length > 0;

  const propsType = hasSpecificProps
    ? `${component.name}Properties`
    : hasProps
      ? 'HtmlCommonProperties'
      : 'Record<string, never>';

  const eventsType =
    hasEvents && useSharedEvents ? 'HtmlCommonEvents' : 'Record<string, never>';

  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: `${component.name}Element`,
        initializer: (writer) => {
          writer.write('createRemoteElement<');
          writer.newLine();
          writer.indent(() => {
            writer.writeLine(`${propsType},`);
            writer.writeLine('Record<string, never>,');
            writer.writeLine('Record<string, never>,');
            writer.write(eventsType);
          });
          writer.newLine();
          writer.write('>');

          const hasConfig = hasProps || hasEvents;
          if (!hasConfig) {
            writer.write('({})');
            return;
          }

          writer.write('(');
          writer.block(() => {
            if (hasProps) {
              if (hasSpecificProps) {
                writer.write('properties: ');
                writer.block(() => {
                  writer.writeLine('...HTML_COMMON_PROPERTIES_CONFIG,');
                  for (const [name, schema] of Object.entries(
                    specificProperties,
                  )) {
                    const constructorType = schemaTypeToConstructor(
                      schema.type,
                    );
                    writer.writeLine(
                      `'${name}': { type: ${constructorType} },`,
                    );
                  }
                });
                writer.write(',');
                writer.newLine();
              } else if (useSharedPropertiesConfig) {
                writer.write('properties: HTML_COMMON_PROPERTIES_CONFIG,');
                writer.newLine();
              } else {
                writer.write('properties: ');
                generatePropertiesConfigWriter(component.properties)(writer);
                writer.write(',');
                writer.newLine();
              }
            }
            if (hasEvents) {
              writer.write(
                useSharedEvents
                  ? 'events: [...HTML_COMMON_EVENTS_ARRAY],'
                  : `events: [${component.events.map((event) => `'${event}'`).join(', ')}],`,
              );
              writer.newLine();
            }
          });
          writer.write(')');
        },
      },
    ],
  });
};

const generateCustomElementRegistrations = (
  sourceFile: SourceFile,
  components: ComponentSchema[],
): void => {
  for (const component of components) {
    sourceFile.addStatements(
      `customElements.define('${component.customElementName}', ${component.name}Element);`,
    );
  }
  sourceFile.addStatements(
    `customElements.define('remote-root', RemoteRootElement);`,
  );
  sourceFile.addStatements(
    `customElements.define('remote-fragment', RemoteFragmentElement);`,
  );
};

const generateTagNameMapDeclaration = (
  sourceFile: SourceFile,
  components: ComponentSchema[],
): void => {
  sourceFile.addStatements((writer) => {
    writer.writeLine('declare global {');
    writer.indent(() => {
      writer.writeLine('interface HTMLElementTagNameMap {');
      writer.indent(() => {
        for (const component of components) {
          writer.writeLine(
            `'${component.customElementName}': InstanceType<typeof ${component.name}Element>;`,
          );
        }
        writer.writeLine(
          `'remote-root': InstanceType<typeof RemoteRootElement>;`,
        );
        writer.writeLine(
          `'remote-fragment': InstanceType<typeof RemoteFragmentElement>;`,
        );
      });
      writer.writeLine('}');
    });
    writer.writeLine('}');
  });
};

export const generateRemoteElements = (
  project: Project,
  components: ComponentSchema[],
  commonProperties: Record<string, PropertySchema>,
  commonEvents: readonly string[] = [],
): SourceFile => {
  const sourceFile = project.createSourceFile('remote-elements.ts', '', {
    overwrite: true,
  });

  const useSharedEvents = commonEvents.length > 0;

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/core/elements',
    namedImports: [
      'createRemoteElement',
      'RemoteRootElement',
      'RemoteFragmentElement',
      { name: 'RemoteEvent', isTypeOnly: true },
    ],
  });

  const commonPropertyNames = new Set(Object.keys(commonProperties));

  generateCommonPropertiesType(sourceFile, commonProperties);

  if (useSharedEvents) {
    generateCommonEventsType(sourceFile, commonEvents);
  }

  const useSharedPropertiesConfig = Object.keys(commonProperties).length > 0;
  if (useSharedPropertiesConfig) {
    generateCommonPropertiesConfig(sourceFile, commonProperties);
  }

  for (const component of components) {
    const specificProps = getElementSpecificProperties(
      component,
      commonPropertyNames,
    );
    generateElementPropertyType(sourceFile, component, specificProps);
  }

  for (const component of components) {
    const specificProps = getElementSpecificProperties(
      component,
      commonPropertyNames,
    );
    generateElementDefinition(
      sourceFile,
      component,
      specificProps,
      useSharedEvents,
      useSharedPropertiesConfig,
    );
  }

  generateCustomElementRegistrations(sourceFile, components);

  sourceFile.addExportDeclaration({
    namedExports: ['RemoteRootElement', 'RemoteFragmentElement'],
  });

  generateTagNameMapDeclaration(sourceFile, components);

  addFileHeader(sourceFile);

  return sourceFile;
};
