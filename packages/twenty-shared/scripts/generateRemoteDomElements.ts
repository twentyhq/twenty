/**
 * Remote DOM Element Generator
 *
 * Generates remote-dom element definitions for HTML elements to add them
 * to the allow list of the remote DOM sandbox.
 *
 * Uses:
 * - ALLOWED_HTML_ELEMENTS from constants/AllowedHtmlElements.ts
 * - COMMON_HTML_EVENTS from constants/CommonHtmlEvents.ts
 *
 * Run with: npx tsx scripts/generateRemoteDomElements.ts
 */

// @ts-ignore
import prettier from '@prettier/sync';
import * as fs from 'fs';
import * as path from 'path';
import { Options } from 'prettier';

import { ALLOWED_HTML_ELEMENTS } from '../src/front-component/constants/AllowedHtmlElements';
import { COMMON_HTML_EVENTS } from '../src/front-component/constants/CommonHtmlEvents';

// ============================================================================
// Configuration
// ============================================================================

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const PACKAGE_PATH = path.resolve(SCRIPT_DIR, '..');
const FRONT_COMPONENT_PATH = path.join(PACKAGE_PATH, 'src/front-component');
const HOST_GENERATED_DIR = path.join(FRONT_COMPONENT_PATH, 'host/generated');
const REMOTE_GENERATED_DIR = path.join(FRONT_COMPONENT_PATH, 'remote/generated');

// ============================================================================
// Types
// ============================================================================

type PropertySchema = {
  type: 'string' | 'number' | 'boolean';
  optional: boolean;
};

type ComponentSchema = {
  name: string;
  tagName: string;
  customElementName: string;
  properties: Record<string, PropertySchema>;
  events: readonly string[];
  isHtmlElement: boolean;
  htmlTag: string;
};

// ============================================================================
// Common properties for all HTML elements
// ============================================================================

const HTML_COMMON_PROPERTIES: Record<string, PropertySchema> = {
  id: { type: 'string', optional: true },
  className: { type: 'string', optional: true },
  style: { type: 'string', optional: true },
  title: { type: 'string', optional: true },
  tabIndex: { type: 'number', optional: true },
  role: { type: 'string', optional: true },
  'aria-label': { type: 'string', optional: true },
  'aria-hidden': { type: 'boolean', optional: true },
  'data-testid': { type: 'string', optional: true },
};

// ============================================================================
// Prettier Setup
// ============================================================================

const prettierConfigFile = prettier.resolveConfigFile();
if (prettierConfigFile == null) {
  throw new Error('Prettier config file not found');
}
const prettierConfiguration = prettier.resolveConfig(prettierConfigFile);

const prettierFormat = (str: string, parser: Options['parser']) =>
  prettier.format(str, {
    ...prettierConfiguration,
    parser,
  });

const FILE_HEADER = `/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \\ \\ /\\ / / _ \\ '_ \\| __| | | | Auto-generated file
 *  | |  \\ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \\_/\\_/ \\___|_| |_|\\__|\\__, |
 *                              |___/
 */`;

// ============================================================================
// Schema Conversion
// ============================================================================

const getHtmlElementSchemas = (): ComponentSchema[] => {
  return ALLOWED_HTML_ELEMENTS.map(({ tag, name, properties }) => ({
    name,
    tagName: tag,
    customElementName: `remote-${tag}`,
    properties: { ...HTML_COMMON_PROPERTIES, ...properties } as Record<
      string,
      PropertySchema
    >,
    events: COMMON_HTML_EVENTS,
    isHtmlElement: true,
    htmlTag: tag,
  }));
};

// ============================================================================
// Code Generation
// ============================================================================

const generateRemoteElements = (htmlElements: ComponentSchema[]): string => {
  const generatePropertyInterface = (comp: ComponentSchema) => {
    const props = Object.entries(comp.properties)
      .map(([name, schema]) => {
        const tsType =
          schema.type === 'boolean'
            ? 'boolean'
            : schema.type === 'number'
              ? 'number'
              : 'string';
        const optional = schema.optional ? '?' : '';
        return `  '${name}'${optional}: ${tsType};`;
      })
      .join('\n');
    return `export type ${comp.name}Properties = {\n${props}\n};`;
  };

  const generateElementDef = (comp: ComponentSchema) => {
    const hasEvents = comp.events.length > 0;
    const hasProps = Object.keys(comp.properties).length > 0;

    const propsType = hasProps ? `${comp.name}Properties` : 'Record<string, never>';
    const eventsType = hasEvents
      ? `{ ${comp.events.map((e) => `${e}(event: RemoteEvent): void`).join('; ')} }`
      : 'Record<string, never>';

    const propsConfig = hasProps
      ? Object.entries(comp.properties)
          .map(([name, schema]) => {
            const tsType =
              schema.type === 'boolean'
                ? 'Boolean'
                : schema.type === 'number'
                  ? 'Number'
                  : 'String';
            return `    '${name}': { type: ${tsType} },`;
          })
          .join('\n')
      : '';

    const configParts: string[] = [];
    if (propsConfig) {
      configParts.push(`  properties: {\n${propsConfig}\n  },`);
    }
    if (hasEvents) {
      configParts.push(
        `  events: [${comp.events.map((e) => `'${e}'`).join(', ')}],`,
      );
    }

    return `export const ${comp.name}Element = createRemoteElement<
  ${propsType},
  Record<string, never>,
  Record<string, never>,
  ${eventsType}
>({
${configParts.join('\n')}
});`;
  };

  const htmlInterfaces = htmlElements.map(generatePropertyInterface).join('\n\n');
  const htmlDefs = htmlElements.map(generateElementDef).join('\n\n');

  const htmlRegistrations = htmlElements
    .map(
      (comp) =>
        `customElements.define('${comp.customElementName}', ${comp.name}Element);`,
    )
    .join('\n');

  const htmlTagMap = htmlElements
    .map(
      (comp) =>
        `    '${comp.customElementName}': InstanceType<typeof ${comp.name}Element>;`,
    )
    .join('\n');

  return `${FILE_HEADER}

import {
  createRemoteElement,
  RemoteRootElement,
  RemoteFragmentElement,
  type RemoteEvent,
} from '@remote-dom/core/elements';

// =============================================================================
// HTML Element Property Types
// =============================================================================

${htmlInterfaces}

// =============================================================================
// HTML Element Definitions
// =============================================================================

${htmlDefs}

// =============================================================================
// Register All Elements
// =============================================================================

${htmlRegistrations}

// Core elements
customElements.define('remote-root', RemoteRootElement);
customElements.define('remote-fragment', RemoteFragmentElement);

export { RemoteRootElement, RemoteFragmentElement };

declare global {
  interface HTMLElementTagNameMap {
    // HTML Elements
${htmlTagMap}
    // Core
    'remote-root': InstanceType<typeof RemoteRootElement>;
    'remote-fragment': InstanceType<typeof RemoteFragmentElement>;
  }
}
`;
};

const generateRemoteComponents = (htmlElements: ComponentSchema[]): string => {
  const htmlImports = htmlElements.map((c) => `${c.name}Element`).join(',\n  ');

  const generateComponentDef = (comp: ComponentSchema) => {
    const hasEvents = comp.events.length > 0;

    if (hasEvents) {
      const eventProps = comp.events
        .map((e) => {
          const propName = `on${e.charAt(0).toUpperCase()}${e.slice(1)}`;
          return `    ${propName}: { event: '${e}' },`;
        })
        .join('\n');

      return `export const ${comp.name} = createRemoteComponent('${comp.customElementName}', ${comp.name}Element, {
  eventProps: {
${eventProps}
  },
});`;
    }

    return `export const ${comp.name} = createRemoteComponent('${comp.customElementName}', ${comp.name}Element);`;
  };

  const htmlDefs = htmlElements.map(generateComponentDef).join('\n\n');

  return `${FILE_HEADER}

import { createRemoteComponent } from '@remote-dom/react';

import {
  ${htmlImports},
} from './elements';

// =============================================================================
// HTML Element Remote Components
// =============================================================================

${htmlDefs}
`;
};

// Map DOM event names to React event handler names
const EVENT_TO_REACT: Record<string, string> = {
  click: 'onClick',
  dblclick: 'onDoubleClick',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mouseover: 'onMouseOver',
  mouseout: 'onMouseOut',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  keydown: 'onKeyDown',
  keyup: 'onKeyUp',
  keypress: 'onKeyPress',
  focus: 'onFocus',
  blur: 'onBlur',
  change: 'onChange',
  input: 'onInput',
  submit: 'onSubmit',
  scroll: 'onScroll',
  wheel: 'onWheel',
  contextmenu: 'onContextMenu',
  drag: 'onDrag',
};

const generateHostRegistry = (htmlElements: ComponentSchema[]): string => {
  // Generate wrapper components for HTML elements
  const htmlWrapperComponents =
    `// Filter out remote-dom internal props that shouldn't be passed to DOM elements
const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

// Map event names to proper React camelCase
const EVENT_NAME_MAP: Record<string, string> = {
${Object.entries(EVENT_TO_REACT)
  .map(([dom, react]) => `  on${dom}: '${react}',`)
  .join('\n')}
};

// Convert CSS string to React style object
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

    // Convert kebab-case to camelCase
    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    style[camelProperty] = value;
  }

  return style;
};

// Wrap event handlers to prevent passing non-serializable event objects
const wrapEventHandler = (handler: () => void) => {
  return (_event: unknown) => {
    // Call handler without the event - it can't be serialized to the worker
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
      // Normalize event handler names to React camelCase
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;
      // Wrap event handlers to prevent passing non-serializable events
      if (normalizedKey.startsWith('on') && typeof value === 'function') {
        filtered[normalizedKey] = wrapEventHandler(value as () => void);
      } else {
        filtered[normalizedKey] = value;
      }
    }
  }
  return filtered;
};

` +
    htmlElements
      .map((comp) => {
        return `const ${comp.name}Wrapper = ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('${comp.htmlTag}', filterProps(props), children);
};`;
      })
      .join('\n\n');

  const htmlEntries = htmlElements
    .map(
      (comp) =>
        `  ['${comp.customElementName}', createRemoteComponentRenderer(${comp.name}Wrapper)],`,
    )
    .join('\n');

  return `${FILE_HEADER}

import React from 'react';
import {
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';

// =============================================================================
// HTML Element Wrapper Components
// =============================================================================

${htmlWrapperComponents}

// =============================================================================
// Component Registry
// =============================================================================

export const componentRegistry = new Map<string, ReturnType<typeof createRemoteComponentRenderer>>([
  // HTML Elements
${htmlEntries}
  // Core
  ['remote-fragment', RemoteFragmentRenderer],
]);
`;
};

const generateHostIndex = (): string => {
  return `${FILE_HEADER}

export { componentRegistry } from './component-registry';
`;
};

const generateRemoteIndex = (): string => {
  return `${FILE_HEADER}

export * from './elements';
export * from './components';
`;
};

// ============================================================================
// File Writing
// ============================================================================

const writeGeneratedFile = (dir: string, filename: string, content: string) => {
  const formattedContent = prettierFormat(content, 'typescript');
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, formattedContent, 'utf-8');
  console.log(`✓ Generated ${filePath}`);
};

// ============================================================================
// Main
// ============================================================================

const main = () => {
  console.log('📖 Generating remote DOM elements...\n');

  const htmlElements = getHtmlElementSchemas();

  console.log(`HTML Elements: ${htmlElements.length} elements`);
  console.log(`  Tags: ${htmlElements.map((e) => e.htmlTag).join(', ')}`);
  console.log(
    `  Events: ${COMMON_HTML_EVENTS.length} common events per element`,
  );
  console.log('');

  // Ensure generated directories exist
  if (!fs.existsSync(HOST_GENERATED_DIR)) {
    fs.mkdirSync(HOST_GENERATED_DIR, { recursive: true });
  }
  if (!fs.existsSync(REMOTE_GENERATED_DIR)) {
    fs.mkdirSync(REMOTE_GENERATED_DIR, { recursive: true });
  }

  // Generate host files
  console.log('Host files:');
  writeGeneratedFile(
    HOST_GENERATED_DIR,
    'component-registry.ts',
    generateHostRegistry(htmlElements),
  );
  writeGeneratedFile(HOST_GENERATED_DIR, 'index.ts', generateHostIndex());

  // Generate remote files
  console.log('\nRemote files:');
  writeGeneratedFile(
    REMOTE_GENERATED_DIR,
    'elements.ts',
    generateRemoteElements(htmlElements),
  );
  writeGeneratedFile(
    REMOTE_GENERATED_DIR,
    'components.ts',
    generateRemoteComponents(htmlElements),
  );
  writeGeneratedFile(REMOTE_GENERATED_DIR, 'index.ts', generateRemoteIndex());

  console.log('\n✅ All generated files created');
  console.log(`   Host: ${HOST_GENERATED_DIR}`);
  console.log(`   Remote: ${REMOTE_GENERATED_DIR}`);
};

main();
