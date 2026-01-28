/* eslint-disable no-console */
import * as prettier from '@prettier/sync';
import * as fs from 'fs';
import * as path from 'path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';

import { ALLOWED_HTML_ELEMENTS } from '../src/front-component/constants/AllowedHtmlElements';
import { COMMON_HTML_EVENTS } from '../src/front-component/constants/CommonHtmlEvents';
import { EVENT_TO_REACT } from '../src/front-component/constants/EventToReact';
import { HTML_COMMON_PROPERTIES } from '../src/front-component/constants/HtmlCommonProperties';

import {
  type ComponentSchema,
  type PropertySchema,
  extractHtmlTag,
  generateHostRegistry,
  generateRemoteComponents,
  generateRemoteElements,
  HtmlElementConfigArrayZ,
} from './generators';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const PACKAGE_PATH = path.resolve(SCRIPT_DIR, '..');
const FRONT_COMPONENT_PATH = path.join(PACKAGE_PATH, 'src/front-component');
const HOST_GENERATED_DIR = path.join(FRONT_COMPONENT_PATH, 'host/generated');
const REMOTE_GENERATED_DIR = path.join(
  FRONT_COMPONENT_PATH,
  'remote/generated',
);

const getHtmlElementSchemas = (): ComponentSchema[] => {
  const validatedElements = HtmlElementConfigArrayZ.parse(
    ALLOWED_HTML_ELEMENTS,
  );

  return validatedElements.map((element) => ({
    name: element.name,
    tagName: element.name,
    customElementName: element.tag,
    properties: {
      ...HTML_COMMON_PROPERTIES,
      ...element.properties,
    } as Record<string, PropertySchema>,
    events: COMMON_HTML_EVENTS,
    isHtmlElement: true,
    htmlTag: extractHtmlTag(element.tag),
  }));
};

const createProject = (): Project => {
  return new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
  });
};

const writeGeneratedFile = (
  dir: string,
  filename: string,
  content: string,
): void => {
  const filePath = path.join(dir, filename);
  const formattedContent = prettier.format(content, {
    parser: 'typescript',
    filepath: filePath,
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
  });
  fs.writeFileSync(filePath, formattedContent, 'utf-8');
  console.log(`✓ Generated ${filePath}`);
};

const ensureDirectoriesExist = (): void => {
  if (!fs.existsSync(HOST_GENERATED_DIR)) {
    fs.mkdirSync(HOST_GENERATED_DIR, { recursive: true });
  }
  if (!fs.existsSync(REMOTE_GENERATED_DIR)) {
    fs.mkdirSync(REMOTE_GENERATED_DIR, { recursive: true });
  }
};

const main = (): void => {
  console.log('📖 Generating remote DOM elements...\n');

  let htmlElements: ComponentSchema[];
  try {
    htmlElements = getHtmlElementSchemas();
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }

  console.log(`HTML Elements: ${htmlElements.length} elements`);
  console.log(
    `  Tags: ${htmlElements.map((element) => element.htmlTag).join(', ')}`,
  );
  console.log(
    `  Events: ${COMMON_HTML_EVENTS.length} common events per element`,
  );
  console.log('');

  ensureDirectoriesExist();

  const project = createProject();

  console.log('Host files:');
  const hostRegistry = generateHostRegistry(
    project,
    htmlElements,
    EVENT_TO_REACT,
  );
  writeGeneratedFile(
    HOST_GENERATED_DIR,
    'host-component-registry.ts',
    hostRegistry.getFullText(),
  );

  console.log('\nRemote files:');
  const remoteElements = generateRemoteElements(project, htmlElements);
  writeGeneratedFile(
    REMOTE_GENERATED_DIR,
    'remote-elements.ts',
    remoteElements.getFullText(),
  );

  const remoteComponents = generateRemoteComponents(project, htmlElements);
  writeGeneratedFile(
    REMOTE_GENERATED_DIR,
    'remote-components.ts',
    remoteComponents.getFullText(),
  );

  console.log('\n✅ All generated files created');
  console.log(`   Host: ${HOST_GENERATED_DIR}`);
  console.log(`   Remote: ${REMOTE_GENERATED_DIR}`);
};

main();
