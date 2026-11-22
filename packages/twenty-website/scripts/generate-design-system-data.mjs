// Reads the site's source and writes what /design-system renders from:
// src/platform/design-system/component-docs.json, and the two preview
// registries in src/app/[locale]/design-system/. Code is read as an AST
// (scripts/design-system-source.mjs) and props with react-docgen-typescript,
// like twenty-ui's generateDocsData. Nothing is guessed: a value the reader
// cannot resolve is listed under `unresolved`, and --check fails on it.
//   node scripts/generate-design-system-data.mjs           write
//   node scripts/generate-design-system-data.mjs --check   fail if stale
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withCustomConfig } from 'react-docgen-typescript';

import {
  auditFile,
  illustrationFiles,
  readTokenScales,
} from './design-system-findings.mjs';
import { adviceFor, solutionsFor } from './design-system-fixes.mjs';
import { createSourceReader } from './design-system-source.mjs';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const sourceRoot = path.join(packageRoot, 'src');
const outputPath = path.join(
  sourceRoot,
  'platform/design-system/component-docs.json',
);
const routeDir = 'app/[locale]/design-system';
const previewsPath = path.join(sourceRoot, routeDir, 'section-previews.ts');
const pagesPreviewPath = path.join(sourceRoot, routeDir, 'page-previews.ts');
const findingsPath = path.join(
  sourceRoot,
  'platform/design-system/code-findings.json',
);
const sourcesPath = path.join(
  sourceRoot,
  'platform/design-system/component-sources.json',
);

const reader = createSourceReader(sourceRoot);
const { ts } = reader;
const unresolved = [];
const flag = (where, what) => unresolved.push({ where, what });

const isComponentName = (name) => /^[A-Z]/.test(name);
const keyOf = (defined) => `${defined.file}#${defined.local}`;
const moduleOf = (file) =>
  `@/${file.replace(/\.tsx?$/, '').replace(/\/index$/, '')}`;

// Every source file of the site except this design-system page itself.
const siteFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['locales', 'design-system'].includes(entry.name)) walk(full);
    } else if (/\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name)) {
      siteFiles.push(path.relative(sourceRoot, full));
    }
  }
};
walk(sourceRoot);

const parser = withCustomConfig(path.join(packageRoot, 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
});
const unquote = (value) => value.replace(/^['"]|['"]$/g, '');
const docgenCache = new Map();
// react-docgen skips a component that takes no props: that is not a failure.
const propsOf = (file, name) => {
  if (!docgenCache.has(file))
    docgenCache.set(file, parser.parse(path.join(sourceRoot, file)));
  const doc = docgenCache.get(file).find((entry) => entry.displayName === name);
  if (!doc) {
    const fn = reader.functionOf(reader.declarationsOf(file).get(name));
    return fn && fn.parameters.length === 0 ? [] : null;
  }
  return Object.values(doc.props ?? {})
    .map((prop) => ({
      name: prop.name,
      type: prop.type.raw ?? prop.type.name,
      required: prop.required,
      default:
        prop.defaultValue?.value === undefined
          ? null
          : unquote(String(prop.defaultValue.value)),
      values:
        prop.type.name === 'enum' && Array.isArray(prop.type.value)
          ? prop.type.value.map((option) => unquote(String(option.value)))
          : null,
      description: prop.description || null,
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

// Where a JSX tag in a file comes from: its import, or a declaration in the file.
const resolveTag = (file, tag) => {
  const imported = reader.importsOf(file).get(tag);
  if (imported) return imported.defined;
  if (reader.declarationsOf(file).has(tag)) return { file, local: tag };
  return null;
};
const declarationOf = (defined) =>
  defined
    ? (reader.declarationsOf(defined.file).get(defined.local) ?? null)
    : null;

// JSX a component renders, with same-file helper components expanded in place.
const renderedElements = (file, fn, ancestors = [], depth = 0) => {
  if (!fn?.body || depth > 6) return [];
  return reader.jsxElementsIn(fn.body).flatMap((found) => {
    const chain = ancestors.concat(found.ancestors);
    const element = found;
    element.ancestors = chain;
    element.file = file;
    const local =
      isComponentName(element.tag) &&
      !reader.importsOf(file).has(element.tag) &&
      reader.functionOf(reader.declarationsOf(file).get(element.tag));
    if (local)
      return [element].concat(renderedElements(file, local, chain, depth + 1));
    return [element];
  });
};

// Level 1 to 4: what src/ui exports.
const SECTION_SHELL = 'ui/SectionShell.tsx#SectionShell';
const components = [...reader.exportsOf('ui/index.ts')]
  .filter(
    ([name, defined]) => isComponentName(name) && defined.file.endsWith('.tsx'),
  )
  .map(([name, defined]) => {
    const props = propsOf(defined.file, defined.local);
    if (!props) flag(defined.file, `react-docgen found no ${name}`);
    return {
      name,
      file: defined.file,
      description: reader.leadingCommentOf(
        defined.file,
        declarationOf(defined),
      ),
      props: props ?? [],
      defined,
    };
  });

const importersOf = (defined) =>
  siteFiles.filter(
    (file) =>
      file !== defined.file &&
      [...reader.importsOf(file).values()].some(
        (entry) => entry.defined && keyOf(entry.defined) === keyOf(defined),
      ),
  );

for (const component of components) {
  const declaration = declarationOf(component.defined);
  const fn = reader.functionOf(declaration);
  const users = importersOf(component.defined);
  const usedBy = users.filter((file) => file.startsWith('ui/'));
  const usedOutsideFiles = users
    .filter((file) => !file.startsWith('ui/'))
    .toSorted();
  // A styled element: `export const X = styled.tag` or `styled(Component)`.
  const initializer = declaration?.initializer;
  const tagRoot = (node) => {
    let current = node;
    while (current && !ts.isIdentifier(current))
      current =
        ts.isPropertyAccessExpression(current) || ts.isCallExpression(current)
          ? current.expression
          : null;
    return current?.text;
  };
  const isStyled =
    initializer &&
    ts.isTaggedTemplateExpression(initializer) &&
    tagRoot(initializer.tag) === 'styled' &&
    reader.importsOf(component.file).get('styled')?.from === '@linaria/react';
  const rendersShell = renderedElements(component.file, fn).some((element) => {
    const defined = resolveTag(element.file, element.tag);
    return defined && keyOf(defined) === SECTION_SHELL;
  });
  // Decor: everything the component returns is hidden from assistive tech.
  const roots = reader.rootElementsOf(fn);
  const isDecor =
    roots.length > 0 && roots.every((root) => root.attributes['aria-hidden']);
  component.usage = {
    usedBy,
    usedOutside: usedOutsideFiles.length,
    usedOutsideFiles,
  };
  component.kind =
    rendersShell && keyOf(component.defined) !== SECTION_SHELL
      ? 'section'
      : isStyled
        ? 'layout'
        : usedBy.length > 0 && usedOutsideFiles.length <= usedBy.length
          ? 'internal'
          : isDecor
            ? 'decor'
            : 'component';
}

// Tokens: literal arguments of the helpers the site calls.
const usedSteps = (helper) => {
  const steps = new Set();
  for (const file of siteFiles)
    for (const call of reader.callsTo(file, helper, '@/tokens')) {
      const argument = call.arguments[0];
      if (argument && ts.isNumericLiteral(argument))
        steps.add(Number(argument.text));
    }
  return [...steps].toSorted((a, b) => a - b);
};

const rootFontSizeNode = reader
  .declarationsOf('tokens/type-ramp-declarations.ts')
  .get('ROOT_FONT_SIZE_PX')?.initializer;
const rootFontSizePx =
  rootFontSizeNode && ts.isNumericLiteral(rootFontSizeNode)
    ? Number(rootFontSizeNode.text)
    : null;
if (rootFontSizePx === null)
  flag(
    'tokens/type-ramp-declarations.ts',
    'ROOT_FONT_SIZE_PX is not a number literal',
  );

const fontFamilies = [];
const visitFamilies = (node) => {
  if (
    ts.isPropertyAssignment(node) &&
    ts.isStringLiteralLike(node.initializer) &&
    node.initializer.text.startsWith('var(--font-')
  )
    fontFamilies.push(node.name.getText());
  ts.forEachChild(node, visitFamilies);
};
visitFamilies(reader.parse('tokens/font-family.ts'));
if (fontFamilies.length === 0)
  flag('tokens/font-family.ts', 'no font family read');

// Each type ramp, the families its styled templates pair it with. When one
// template pairs it with several (Heading's data-family), the component's
// `family` prop default is the one it renders without that prop.
const rampFamily = {};
for (const file of siteFiles) {
  const owner = components.find((component) => component.file === file);
  const familyDefault =
    owner?.props.find((prop) => prop.name === 'family')?.default ?? null;
  const visit = (node) => {
    if (ts.isTaggedTemplateExpression(node)) {
      const ramps = [];
      const families = new Set();
      const scan = (inner) => {
        if (ts.isCallExpression(inner) && ts.isIdentifier(inner.expression)) {
          const argument = inner.arguments[0];
          if (inner.expression.text === 'typeRampDeclarations') {
            if (argument && ts.isStringLiteralLike(argument))
              ramps.push(argument.text);
            else flag(file, 'typeRampDeclarations with a non-literal ramp');
          }
          if (
            inner.expression.text === 'fontFamily' &&
            argument &&
            ts.isStringLiteralLike(argument)
          )
            families.add(argument.text);
        }
        ts.forEachChild(inner, scan);
      };
      scan(node.template);
      for (const ramp of ramps) {
        rampFamily[ramp] ??= { family: null, families: [] };
        const entry = rampFamily[ramp];
        entry.families = [
          ...new Set([...entry.families, ...families]),
        ].toSorted();
        if (file.startsWith('ui/') && entry.family === null)
          entry.family =
            families.size === 1 ? [...families][0] : (familyDefault ?? null);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(reader.parse(file));
}
for (const entry of Object.values(rampFamily))
  if (entry.family === null && entry.families.length === 1)
    entry.family = entry.families[0];

// Rules cited in the page content as (File.tsx:12-14): fingerprint the cited
// lines so --check fails when the code under a citation changes.
const citations = {};
// Citations live in the content files and in the doc's own pages.
const docRoot = path.join(sourceRoot, 'platform/design-system');
const citingFiles = [
  ...fs
    .readdirSync(path.join(docRoot, 'content'))
    .map((name) => `content/${name}`),
  ...fs.readdirSync(docRoot).filter((name) => name.endsWith('.tsx')),
];
for (const entry of citingFiles) {
  const text = fs.readFileSync(path.join(docRoot, entry), 'utf8');
  for (const [, name, ranges] of text.matchAll(
    /\(([\w.-]+\.(?:tsx?|mjs)):([\d,\s-]+)\)/g,
  )) {
    const key = `${name}:${ranges.replace(/\s/g, '')}`;
    // A citation names a file by its basename: it must match exactly one file.
    const matches = [
      ...siteFiles
        .filter((file) => path.basename(file) === name)
        .map((file) => path.join(sourceRoot, file)),
      ...[path.join(packageRoot, 'scripts', name)].filter((file) =>
        fs.existsSync(file),
      ),
    ];
    if (matches.length !== 1) {
      citations[key] = matches.length ? 'ambiguous file' : 'missing file';
      flag(entry, `citation ${key}: ${citations[key]}`);
      continue;
    }
    const lines = fs.readFileSync(matches[0], 'utf8').split('\n');
    const cited = ranges.split(',').flatMap((range) => {
      const [start, end = start] = range.trim().split('-').map(Number);
      return lines.slice(start - 1, end);
    });
    citations[key] = createHash('sha1')
      .update(cited.join('\n'))
      .digest('hex')
      .slice(0, 12);
  }
}

// Level 5: the sections, as each sections/<dir>/index.ts exports them and as
// the pages import them.
const sectionsByKey = new Map();
const addSection = (name, defined) => {
  if (!defined?.file.startsWith('sections/') || !isComponentName(name)) return;
  if (!defined.file.endsWith('.tsx')) return;
  sectionsByKey.set(keyOf(defined), {
    name,
    dir: defined.file.split('/')[1],
    file: defined.file,
    defined,
  });
};
for (const dir of fs.readdirSync(path.join(sourceRoot, 'sections'))) {
  const indexFile = `sections/${dir}/index.ts`;
  if (!fs.existsSync(path.join(sourceRoot, indexFile))) continue;
  for (const [name, defined] of reader.exportsOf(indexFile))
    addSection(name, defined);
}

// Level 6: the pages, read from their default export.
const routeRoot = 'app/[locale]/(site)/';
// Left out of the doc on purpose: the partner pages for integrators and creators.
const EXCLUDED_ROUTES = ['partners/creators/', 'partners/integrators/'];
const pageFiles = siteFiles.filter(
  (file) =>
    file.startsWith(routeRoot) &&
    /\/(page|layout)\.tsx$/.test(file) &&
    !EXCLUDED_ROUTES.some((route) =>
      file.slice(routeRoot.length).startsWith(route),
    ),
);
for (const file of pageFiles)
  for (const [name, entry] of reader.importsOf(file))
    addSection(
      entry.imported === 'default' ? name : entry.imported,
      entry.defined,
    );

const sectionOfTag = (file, tag) => {
  const defined = resolveTag(file, tag);
  return defined ? (sectionsByKey.get(keyOf(defined)) ?? null) : null;
};
// A wrapper is an imported component around a section: a context root,
// Suspense… anything that is neither HTML nor a section nor a local helper.
const wrapperOf = (file, element) => {
  if (!isComponentName(element.tag)) return null;
  const imported = reader.importsOf(file).get(element.tag);
  if (!imported || sectionOfTag(file, element.tag)) return null;
  return {
    name: element.tag,
    from: imported.file ? moduleOf(imported.file) : imported.from,
  };
};
const uniqueWrappers = (wrappers) => [
  ...new Map(wrappers.map((wrapper) => [wrapper.name, wrapper])).values(),
];

const toRoute = (file) =>
  `/${file.slice(routeRoot.length).replace(/\/?(page|layout)\.tsx$/, '')}${file.endsWith('layout.tsx') ? '*' : ''}`.replace(
    '//',
    '/',
  );
const pages = pageFiles
  .map((file) => {
    const fn = reader.functionOf(reader.defaultExportOf(file));
    if (!fn) flag(file, 'no default export component');
    const elements = renderedElements(file, fn);
    const sections = elements.flatMap((element) => {
      const section = sectionOfTag(file, element.tag);
      if (!section) return [];
      return [
        {
          name: section.name,
          dir: section.dir,
          scheme:
            element.attributes.scheme?.kind === 'string'
              ? element.attributes.scheme.value
              : null,
          // Whether the page passes it content between its tags.
          withContent:
            ts.isJsxElement(element.node) &&
            element.node.children.some(
              (child) => !ts.isJsxText(child) || child.text.trim() !== '',
            ),
          // The section it is placed inside, when the page nests it.
          inside:
            element.ancestors
              .toReversed()
              .map((ancestor) => sectionOfTag(file, ancestor.tag)?.name)
              .find(Boolean) ?? null,
          wrappers: uniqueWrappers(
            element.ancestors
              .map((ancestor) => wrapperOf(file, ancestor))
              .filter(Boolean),
          ),
        },
      ];
    });
    // In a layout, the page goes where `{children}` is: its wrappers wrap every page.
    let childrenWrappers = [];
    if (file.endsWith('layout.tsx') && fn?.body) {
      const visit = (node) => {
        if (
          ts.isJsxExpression(node) &&
          node.expression &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'children'
        ) {
          const chain = [];
          for (
            let parent = node.parent;
            parent && parent !== fn;
            parent = parent.parent
          )
            if (ts.isJsxElement(parent))
              chain.unshift({ tag: parent.openingElement.tagName.getText() });
          childrenWrappers = chain
            .map((element) => wrapperOf(file, element))
            .filter(Boolean);
        }
        ts.forEachChild(node, visit);
      };
      visit(fn.body);
    }
    return {
      route: toRoute(file),
      file,
      layout: file.endsWith('layout.tsx'),
      dynamic: toRoute(file).includes('['),
      staticParams: reader.exportsOf(file).has('generateStaticParams'),
      childrenWrappers,
      sections,
    };
  })
  .toSorted((a, b) => a.route.localeCompare(b.route));
const layoutPage = pages.find((page) => page.layout);

// The scheme a section's SectionShell gets: a literal, the default of the
// section's own `scheme` prop, SectionShell's default, or what it passes
// to the shared section it renders.
const shellPropDefault = (name) =>
  components
    .find((component) => keyOf(component.defined) === SECTION_SHELL)
    ?.props.find((prop) => prop.name === name)?.default ?? null;
const shellSchemeDefault = components
  .find((component) => keyOf(component.defined) === SECTION_SHELL)
  ?.props.find((prop) => prop.name === 'scheme')?.default;
const schemeFromAttribute = (fn, attribute) => {
  if (!attribute) return null;
  if (attribute.kind === 'string')
    return { value: attribute.value, source: 'literal' };
  const ownProp = reader.propDefaultOf(fn, 'scheme');
  if (ownProp && attribute.text === ownProp.local)
    return ownProp.value
      ? { value: ownProp.value, source: 'prop-default' }
      : { value: null, source: 'prop', text: attribute.text };
  return { value: null, source: 'expression', text: attribute.text };
};
const isSectionLike = (owner, target) =>
  target.file !== owner.file &&
  (target.file.startsWith(`sections/${owner.file.split('/')[1]}/`) ||
    components.some(
      (component) =>
        component.kind === 'section' &&
        keyOf(component.defined) === keyOf(target),
    ));
const resolveScheme = (defined, depth = 0) => {
  const fn = reader.functionOf(declarationOf(defined));
  if (!fn || depth > 4) return { value: null, source: 'none' };
  const elements = renderedElements(defined.file, fn);
  const shell = elements.find((element) => {
    const target = resolveTag(element.file, element.tag);
    return target && keyOf(target) === SECTION_SHELL;
  });
  if (shell) {
    // The props SectionShell's adjacency rule reads: two same-scheme sections
    // in a row lose the top padding unless the first is flush or the second
    // keeps its top rhythm.
    const rhythm = shell.attributes.rhythm;
    const keeps = shell.attributes.keepsTopRhythm;
    const shellProps = {
      rhythm: !rhythm
        ? (shellPropDefault('rhythm') ?? null)
        : rhythm.kind === 'string'
          ? rhythm.value
          : null,
      keepsTopRhythm: !keeps ? false : keeps.kind === 'true' ? true : null,
    };
    return {
      ...(schemeFromAttribute(fn, shell.attributes.scheme) ?? {
        value: shellSchemeDefault ?? null,
        source: 'shell-default',
      }),
      shell: shellProps,
    };
  }
  for (const element of elements) {
    const target = resolveTag(element.file, element.tag);
    if (!target || !isSectionLike(defined, target)) continue;
    const inner = resolveScheme(target, depth + 1);
    if (inner.source === 'none' || inner.source === 'data-scheme') continue;
    // The shell below reads that component's scheme prop: this tag decides it.
    if (inner.source === 'prop-default' || inner.source === 'prop') {
      const passed = schemeFromAttribute(fn, element.attributes.scheme);
      if (passed) return { ...passed, via: element.tag };
    }
    return { ...inner, via: element.tag };
  }
  // No SectionShell: the section may set data-scheme on its own elements.
  const direct = [];
  const collect = (owner, ownerFn, level) => {
    if (!ownerFn || level > 4) return;
    for (const element of renderedElements(owner.file, ownerFn)) {
      const found = schemeFromAttribute(
        ownerFn,
        element.attributes['data-scheme'],
      );
      if (found) direct.push(found);
      const target = resolveTag(element.file, element.tag);
      if (target && isSectionLike(owner, target))
        collect(target, reader.functionOf(declarationOf(target)), level + 1);
    }
  };
  collect(defined, fn, depth);
  if (direct.length)
    return {
      value: null,
      source: 'data-scheme',
      values: [
        ...new Set(
          direct.filter((entry) => entry.value).map((entry) => entry.value),
        ),
      ],
      runtime: [
        ...new Set(
          direct.filter((entry) => !entry.value).map((entry) => entry.text),
        ),
      ],
    };
  return { value: null, source: 'none' };
};

// The src/ui components a section uses: its file and the files of its own
// folder it imports, followed import by import.
const uiUsedBy = (file) => {
  const dir = file.split('/').slice(0, 2).join('/');
  const seen = new Set();
  const used = new Set();
  const follow = (current) => {
    if (seen.has(current)) return;
    seen.add(current);
    for (const entry of reader.importsOf(current).values()) {
      if (!entry.defined) continue;
      const component = components.find(
        (candidate) => keyOf(candidate.defined) === keyOf(entry.defined),
      );
      if (component) used.add(component.name);
      if (entry.file?.startsWith(`${dir}/`)) follow(entry.file);
    }
  };
  follow(file);
  return [...used].toSorted();
};

const sections = [...sectionsByKey.values()]
  .map(({ name, dir, file, defined }) => {
    const props = propsOf(file, defined.local);
    if (!props) flag(file, `react-docgen found no ${name}`);
    const placements = pages.flatMap((page) =>
      page.sections
        .filter((placed) => placed.name === name && placed.dir === dir)
        .map((placed) => ({ route: page.route, placed })),
    );
    return {
      name,
      dir,
      file,
      description: reader.leadingCommentOf(file, declarationOf(defined)),
      scheme: resolveScheme(defined),
      requiredProps: (props ?? [])
        .filter((prop) => prop.required)
        .map((prop) => prop.name)
        .toSorted(),
      uiUsed: uiUsedBy(file),
      files: siteFiles
        .filter((other) => other.startsWith(`sections/${dir}/`))
        .toSorted(),
      pages: [...new Set(placements.map((placement) => placement.route))],
      // Sections the pages always place inside another one: content styled
      // by that parent (LegalDocument's prose), never shown on its own.
      nestedIn: [
        ...new Set(placements.map((placement) => placement.placed.inside)),
      ].filter(Boolean),
      // Sections the pages fill with content (PartnerDirectory and its list):
      // empty on their own, so shown in their page too.
      takesContent: placements.some(
        (placement) => placement.placed.withContent,
      ),
      // Context roots its first page wraps it in, the layout's outermost.
      wrappers: uniqueWrappers([
        ...(placements[0] && placements[0].route !== '/*'
          ? (layoutPage?.childrenWrappers ?? [])
          : []),
        ...(placements[0]?.placed.wrappers ?? []),
      ]),
    };
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

const data = {
  components: components.map((component) => ({
    name: component.name,
    file: component.file,
    description: component.description,
    props: component.props,
    usage: component.usage,
    kind: component.kind,
  })),
  sections,
  pages,
  tokens: {
    rootFontSizePx,
    fontFamilies,
    spacingSteps: usedSteps('spacing'),
    radiusSteps: usedSteps('radius'),
    fontSizeSteps: usedSteps('fontSize'),
    rampFamily: Object.fromEntries(
      Object.entries(rampFamily).toSorted(([a], [b]) => a.localeCompare(b)),
    ),
  },
  citations: Object.fromEntries(
    Object.entries(citations).toSorted(([a], [b]) => a.localeCompare(b)),
  ),
  unresolved,
};
// What each page and section renders, file by file (its imports, followed
// down to src/ui; tokens and i18n plumbing are the system itself), and the
// hand-written values in those files.
const closureOf = (start) => {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const imported of reader.importsOf(file).values()) {
      // The file that declares the name, not the index that re-exports it.
      const target = imported.defined?.file ?? imported.file;
      if (
        target &&
        !/^(tokens|platform\/i18n)\//.test(target) &&
        !target.startsWith('app/')
      )
        visit(target);
    }
  };
  visit(start);
  return [...seen].toSorted();
};
const scales = readTokenScales(reader);
for (const [name, value] of Object.entries(scales))
  if (!value) flag('tokens', `could not read the ${name} scale`);
const renderedFiles = {
  pages: Object.fromEntries(
    pages.map((page) => [page.route, closureOf(page.file)]),
  ),
  sections: Object.fromEntries(
    sections.map((section) => [
      `${section.dir}/${section.name}`,
      closureOf(section.file),
    ]),
  ),
  components: Object.fromEntries(
    components.map((component) => [component.name, closureOf(component.file)]),
  ),
};
const auditedFiles = [
  ...new Set([
    ...Object.values(renderedFiles.pages).flat(),
    ...Object.values(renderedFiles.sections).flat(),
    ...Object.values(renderedFiles.components).flat(),
  ]),
].toSorted();
const illustrations = illustrationFiles(reader, sourceRoot, siteFiles);
const codeFindings = {
  rendered: renderedFiles,
  files: Object.fromEntries(
    auditedFiles.map((file) => {
      const audit = auditFile(reader, file, scales);
      for (const finding of audit.findings)
        finding.solutions = solutionsFor(
          finding,
          finding.styled ? audit.styled[finding.styled] : null,
          scales,
        );
      return [
        file,
        {
          illustration: illustrations.has(file),
          findings: audit.findings,
          styled: audit.styled,
        },
      ];
    }),
  ),
};
const findingsOutput = `${JSON.stringify(codeFindings)}\n`;

// Problem counts for the doc's indexes: a component counts its own file, a
// section the files of its folder; illustrations are left out.
const countProblems = (files) => {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const file of files) {
    const entry = codeFindings.files[file];
    if (!entry || entry.illustration) continue;
    for (const finding of entry.findings) counts[finding.severity] += 1;
  }
  return counts;
};
for (const component of data.components)
  component.problems = countProblems([component.file]);

// What a component page shows under Motion, Responsive, Accessibility and
// Related, read from the component's own file.
const behaviorOf = (file) => {
  const imports = reader.importsOf(file);
  const styled = codeFindings.files[file]?.styled ?? {};
  const motion = Object.entries(styled).flatMap(([part, details]) =>
    details.declarations
      .filter((declaration) =>
        /^(transition|animation)/.test(declaration.property),
      )
      .map((declaration) => ({
        part,
        property: declaration.property,
        value: declaration.value,
        kind: declaration.kind,
      })),
  );
  const breakpoints = [
    ...new Set(
      reader
        .callsTo(file, 'mediaUp', '@/tokens')
        .map((call) => call.arguments[0])
        .filter(
          (argument) => argument && reader.ts.isStringLiteralLike(argument),
        )
        .map((argument) => argument.text),
    ),
  ];
  const seen = new Set();
  const accessibility = reader
    .jsxElementsIn(reader.parse(file))
    .flatMap((element) =>
      Object.entries(element.attributes)
        .filter(([name]) => /^(aria-|role$|alt$|tabIndex$)/.test(name))
        .map(([name, attribute]) => ({
          tag: element.tag,
          attribute: name,
          value:
            attribute.kind === 'string'
              ? attribute.value
              : attribute.kind === 'true'
                ? 'true'
                : `{${attribute.text}}`,
        })),
    )
    .filter((entry) => {
      const key = `${entry.tag}|${entry.attribute}|${entry.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const uses = [...imports.values()]
    .filter((entry) => entry.defined?.file?.startsWith('ui/'))
    .map((entry) => entry.imported)
    .filter((name) => data.components.some((other) => other.name === name))
    .toSorted();
  return {
    motion,
    reducedMotion: imports.has('REDUCED_MOTION'),
    breakpoints,
    accessibility,
    uses: [...new Set(uses)],
  };
};
for (const component of data.components)
  component.behavior = behaviorOf(component.file);

// The component's styled parts, each declaration with its source line and the
// audit's verdict, for the page's Code section and its X-ray.
// How often each hand-written value appears across src/ui: a value that
// repeats is a candidate for a token.
const handRepeats = new Map();
for (const component of data.components)
  for (const details of Object.values(
    codeFindings.files[component.file]?.styled ?? {},
  ))
    for (const declaration of details.declarations)
      if (declaration.kind === 'hand') {
        const key = `${declaration.property}|${declaration.value}`;
        handRepeats.set(key, (handRepeats.get(key) ?? 0) + 1);
      }
const codeOf = (file) => {
  const entry = codeFindings.files[file];
  if (!entry) return { parts: [], other: [] };
  const matched = new Set();
  const findingOf = new Map(
    entry.findings.map((finding) => [
      `${finding.styled}|${finding.property}|${finding.value}`,
      finding,
    ]),
  );
  const parts = Object.entries(entry.styled).map(([part, details]) => ({
    part,
    line: details.line,
    declarations: details.declarations
      .filter((declaration) => declaration.kind !== 'css')
      .map((declaration) => {
        const key = `${part}|${declaration.property}|${declaration.value.replace(/\$\{[^}]*\}/g, '__TOKEN__')}`;
        const finding = findingOf.get(key);
        if (finding) matched.add(key);
        return {
          property: declaration.property,
          value: declaration.value,
          kind: declaration.kind,
          line: declaration.line,
          severity: finding?.severity ?? null,
          rule: finding?.rule ?? null,
          fix: finding?.fix ?? null,
          advice:
            declaration.kind === 'hand'
              ? adviceFor(
                  declaration,
                  finding,
                  scales,
                  handRepeats.get(
                    `${declaration.property}|${declaration.value}`,
                  ) ?? 1,
                )
              : null,
        };
      }),
  }));
  const other = entry.findings
    .filter(
      (finding) =>
        !matched.has(`${finding.styled}|${finding.property}|${finding.value}`),
    )
    .map((finding) => ({
      line: finding.line,
      property: finding.property,
      value: finding.value,
      severity: finding.severity,
      rule: finding.rule,
      fix: finding.fix,
    }));
  return { parts, other };
};
for (const component of data.components)
  component.code = codeOf(component.file);

// Each component's source, line by line, cut into runs the compiler classes:
// keyword, string, comment, number or plain. The Code tab draws it as is.
const sourceLinesOf = (file) => {
  const source = reader.parse(file);
  const text = source.getFullText();
  const classes = Array.from({ length: text.length }, () => 'p');
  const paint = (start, end, kind) => {
    for (let index = start; index < end; index += 1) classes[index] = kind;
  };
  const kindOf = (node) => {
    if (
      node.kind >= ts.SyntaxKind.FirstKeyword &&
      node.kind <= ts.SyntaxKind.LastKeyword
    )
      return 'k';
    const isTemplatePart =
      ts.isNoSubstitutionTemplateLiteral(node) ||
      node.kind === ts.SyntaxKind.TemplateHead ||
      node.kind === ts.SyntaxKind.TemplateMiddle ||
      node.kind === ts.SyntaxKind.TemplateTail;
    // A tagged template (styled.div`…`, css`…`) holds CSS, read as code.
    if (isTemplatePart) {
      let owner = node.parent;
      while (
        owner &&
        !ts.isTaggedTemplateExpression(owner) &&
        (ts.isTemplateExpression(owner) || ts.isTemplateSpan(owner))
      )
        owner = owner.parent;
      return owner && ts.isTaggedTemplateExpression(owner) ? 'p' : 's';
    }
    if (ts.isStringLiteral(node)) return 's';
    if (ts.isNumericLiteral(node)) return 'n';
    return 'p';
  };
  const visit = (node) => {
    for (const range of ts.getLeadingCommentRanges(text, node.getFullStart()) ??
      [])
      paint(range.pos, range.end, 'c');
    const children = node.getChildren(source);
    if (children.length === 0) {
      paint(node.getStart(source), node.getEnd(), kindOf(node));
      return;
    }
    for (const child of children) visit(child);
  };
  visit(source);
  const lines = [[]];
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\n') {
      lines.push([]);
      continue;
    }
    const line = lines[lines.length - 1];
    const last = line[line.length - 1];
    if (last && last[0] === classes[index]) last[1] += character;
    else line.push([classes[index], character]);
  }
  if (lines.length > 1 && lines[lines.length - 1].length === 0) lines.pop();
  return lines;
};
const sources = Object.fromEntries(
  data.components.map((component) => [
    component.file,
    sourceLinesOf(component.file),
  ]),
);
const sourcesOutput = `${JSON.stringify(sources)}\n`;
for (const section of data.sections)
  section.problems = countProblems(
    renderedFiles.sections[`${section.dir}/${section.name}`].filter((file) =>
      file.startsWith(`sections/${section.dir}/`),
    ),
  );
const output = `${JSON.stringify(data, null, 2)}\n`;

// Sections that need no props render as is: imported through the module the
// pages use (their folder index when it exports them), with their context roots.
const previewable = sections.filter(
  (section) =>
    section.requiredProps.length === 0 &&
    section.nestedIn.length === 0 &&
    !section.takesContent,
);
const sectionModule = (section) =>
  reader.exportsOf(`sections/${section.dir}/index.ts`).has(section.name)
    ? `@/sections/${section.dir}`
    : moduleOf(section.file);
const importLines = new Map();
const addImport = (from, name) =>
  importLines.set(from, new Set([...(importLines.get(from) ?? []), name]));
for (const section of previewable) {
  addImport(sectionModule(section), section.name);
  for (const wrapper of section.wrappers) addImport(wrapper.from, wrapper.name);
}
const previewsOutput = [
  '// Generated by scripts/generate-design-system-data.mjs, do not edit.',
  '// Each section with the context roots its first page wraps it in, outermost first.',
  "import { type ElementType } from 'react';",
  '',
  ...[...importLines.entries()]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(
      ([from, names]) =>
        `import { ${[...names].toSorted().join(', ')} } from '${from}';`,
    ),
  '',
  'export const SECTION_PREVIEWS: Record<',
  '  string,',
  '  { Section: ElementType; wrappers: ElementType[] }',
  '> = {',
  ...previewable.map(
    (section) =>
      `  '${section.dir}/${section.name}': { Section: ${section.name}, wrappers: [${section.wrappers
        .map((wrapper) => wrapper.name)
        .join(', ')}] },`,
  ),
  '};',
  '',
].join('\n');

// Every page module and the (site) layout, to render a page as the site does.
// Dynamic routes render their first static param, when they declare any.
const toIdentifier = (route) =>
  `${
    route
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('') || 'Home'
  }Route`;
const routePages = pages.filter((page) => !page.layout);
const pagesPreviewOutput = [
  '// Generated by scripts/generate-design-system-data.mjs, do not edit.',
  "import { type ElementType } from 'react';",
  '',
  ...(layoutPage
    ? [`import SiteLayout from '${moduleOf(layoutPage.file)}';`]
    : []),
  ...routePages.map((page) =>
    page.staticParams
      ? `import ${toIdentifier(page.route)}, { generateStaticParams as ${toIdentifier(page.route)}Params } from '${moduleOf(page.file)}';`
      : `import ${toIdentifier(page.route)} from '${moduleOf(page.file)}';`,
  ),
  '',
  'export const PAGE_PREVIEWS: {',
  '  layout: ElementType | null;',
  '  pages: Record<',
  '    string,',
  '    {',
  '      Page: ElementType;',
  '      staticParams?: () => Promise<Array<Record<string, string>>>;',
  '    }',
  '  >;',
  '} = {',
  `  layout: ${layoutPage ? 'SiteLayout' : 'null'},`,
  '  pages: {',
  ...routePages.map((page) =>
    page.staticParams
      ? `    '${page.route}': { Page: ${toIdentifier(page.route)}, staticParams: ${toIdentifier(page.route)}Params },`
      : `    '${page.route}': { Page: ${toIdentifier(page.route)} },`,
  ),
  '  },',
  '};',
  '',
].join('\n');

// Prettier reflows the generated imports and adds trailing commas.
const normalize = (text) => text.replace(/\s+/g, '').replace(/,([}\]])/g, '$1');
const readOr = (file) =>
  fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

if (process.argv.includes('--check')) {
  // Compared as data: the formatter may reflow the file.
  const current = readOr(outputPath)
    ? JSON.stringify(JSON.parse(readOr(outputPath)))
    : '';
  const stale =
    current !== JSON.stringify(data) ||
    normalize(readOr(previewsPath)) !== normalize(previewsOutput) ||
    normalize(readOr(pagesPreviewPath)) !== normalize(pagesPreviewOutput) ||
    readOr(findingsPath) !== findingsOutput ||
    readOr(sourcesPath) !== sourcesOutput;
  if (stale)
    process.stderr.write(
      'The design-system data is stale: the components, sections, pages, tokens or the code under a cited rule changed. Check the cited rules, then run node scripts/generate-design-system-data.mjs\n',
    );
  if (unresolved.length)
    process.stderr.write(
      `The reader could not resolve ${unresolved.length} value(s):\n${unresolved.map((entry) => `  ${entry.where}: ${entry.what}`).join('\n')}\n`,
    );
  if (stale || unresolved.length) process.exitCode = 1;
} else {
  fs.writeFileSync(outputPath, output);
  // Prettier may reflow these; --check compares them without whitespace.
  fs.writeFileSync(previewsPath, previewsOutput);
  fs.writeFileSync(pagesPreviewPath, pagesPreviewOutput);
  fs.writeFileSync(findingsPath, findingsOutput);
  fs.writeFileSync(sourcesPath, sourcesOutput);
  process.stdout.write(
    `Wrote ${components.length} components, ${sections.length} sections, ${pages.length} pages and ${Object.keys(citations).length} citations to ${path.relative(packageRoot, outputPath)}${unresolved.length ? `, ${unresolved.length} unresolved` : ''}\n`,
  );
}
