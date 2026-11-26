// Hand-written values in the site's code, read from the AST, each with a
// severity and the token to use when one exists. Used by
// generate-design-system-data.mjs for the /design-system inspect view.
//   error    a token exists for this value and the code writes it by hand
//   warning  a value outside the token scale
//   info     no token can hold it (geometry, 1px rules, local stacking)
import fs from 'node:fs';
import path from 'node:path';

// A literal value from a token file: strings, numbers, null, nested objects
// and arrays.
const literalValue = (ts, node) => {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) || ts.isSatisfiesExpression?.(current))
  )
    current = current.expression;
  if (!current) return undefined;
  if (ts.isStringLiteralLike(current)) return current.text;
  if (ts.isNumericLiteral(current)) return Number(current.text);
  if (current.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(current))
    return current.elements.map((element) => literalValue(ts, element));
  if (ts.isObjectLiteralExpression(current)) {
    const values = {};
    for (const property of current.properties)
      if (ts.isPropertyAssignment(property))
        values[property.name.getText().replace(/['"]/g, '')] = literalValue(
          ts,
          property.initializer,
        );
    return values;
  }
  return undefined;
};
const literalObject = (reader, file, name) => {
  const value = literalValue(
    reader.ts,
    reader.declarationsOf(file).get(name)?.initializer,
  );
  return value && typeof value === 'object' ? value : null;
};

// Which type ramp each size of a ui text component renders: the
// [data-size='x'] block that holds typeRampDeclarations('ramp').
const rampsBySize = (reader, file) => {
  const { ts } = reader;
  const sizes = {};
  const visit = (node) => {
    if (
      ts.isTaggedTemplateExpression(node) &&
      ts.isTemplateExpression(node.template)
    ) {
      let before = node.template.head.text;
      for (const span of node.template.templateSpans) {
        const call = span.expression;
        if (
          ts.isCallExpression(call) &&
          call.expression.getText() === 'typeRampDeclarations' &&
          ts.isStringLiteralLike(call.arguments[0])
        ) {
          const size = [...before.matchAll(/\[data-size='(\w+)'\]/g)].at(
            -1,
          )?.[1];
          if (size) sizes[size] = call.arguments[0].text;
        }
        before += span.literal.text;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(reader.parse(file));
  return sizes;
};

export const readTokenScales = (reader) => {
  const durations = literalObject(reader, 'tokens/duration.ts', 'DURATION');
  const weights = literalObject(reader, 'tokens/font-weight.ts', 'FONT_WEIGHT');
  const units = literalObject(reader, 'tokens/units.ts', 'UNITS');
  const zIndex = literalObject(reader, 'tokens/z-index.ts', 'Z_INDEX');
  const typeScale = literalObject(reader, 'tokens/type-scale.ts', 'TYPE_SCALE');
  const palette = literalObject(reader, 'tokens/palette.ts', 'PALETTE');
  const alpha = literalObject(reader, 'tokens/alpha-scale.ts', 'ALPHA_SCALE');
  const rampFile = 'tokens/type-ramp-declarations.ts';
  const rootFontSizePx = literalValue(
    reader.ts,
    reader.declarationsOf(rampFile).get('ROOT_FONT_SIZE_PX')?.initializer,
  );
  const runningLineHeight = literalValue(
    reader.ts,
    reader.declarationsOf(rampFile).get('RUNNING_TEXT_LINE_HEIGHT')
      ?.initializer,
  );
  return {
    durations,
    weights,
    units,
    zIndex,
    typeScale,
    palette,
    alpha,
    rootFontSizePx,
    runningLineHeight,
    headingSizes: rampsBySize(reader, 'ui/Heading.tsx'),
    bodySizes: rampsBySize(reader, 'ui/Body.tsx'),
  };
};

const toMs = (value) =>
  value.endsWith('ms')
    ? Number.parseFloat(value)
    : Number.parseFloat(value) * 1000;

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
const RAW_LENGTH =
  /(?<![\w$-])-?\d*\.?\d+(px|rem|em|vh|vw|vmin|vmax|svh|dvh|ch)\b/;
const RAW_TIME = /(?<![\w$-])(\d*\.?\d+)(ms|s)\b/g;
const USER_ATTRIBUTES = new Set([
  'alt',
  'aria-label',
  'title',
  'placeholder',
  'label',
  'ariaLabel',
]);

export const auditFile = (reader, file, scales) => {
  const { ts } = reader;
  const source = reader.parse(file);
  const findings = [];
  // Every declaration of each styled component, token or written by hand.
  const styledDetails = {};
  const lineOf = (position) =>
    source.getLineAndCharacterOfPosition(position).line + 1;
  const add = (position, finding) =>
    findings.push({ file, line: lineOf(position), ...finding });

  const durationEntries = Object.entries(scales.durations ?? {});
  const nearestDuration = (ms) =>
    durationEntries
      .map(([key, value]) => ({ key, ms: toMs(value) }))
      .toSorted((a, b) => Math.abs(a.ms - ms) - Math.abs(b.ms - ms))[0];
  const spacingBase = scales.units?.spacingBasePx;
  const radiusBase = scales.units?.radiusBasePx;
  const weightKey = (value) =>
    Object.entries(scales.weights ?? {}).find(
      ([, weight]) => weight === Number(value),
    )?.[0];

  // One CSS declaration, with ${…} parts already replaced by __TOKEN__.
  const judge = (position, styled, property, value) => {
    const written = value
      .replace(/__TOKEN__/g, '')
      .replace(/var\([^)]*\)/g, '')
      .replace(/(?<![\d.])0px/g, '')
      // A bare 0 resets a value: no token is needed for it.
      .replace(/(?<![\w.#-])0(?![\w.%])/g, '')
      .trim();
    if (!written || (!/[\d#]/.test(written) && property !== 'font-family'))
      return;
    const base = { styled, property, value };
    if (RAW_COLOR.test(written))
      return add(position, {
        ...base,
        severity: 'error',
        rule: 'Color written by hand',
        fix: 'color() or semanticColor',
      });
    if (property === 'font-family')
      return add(position, {
        ...base,
        severity: 'error',
        rule: 'Typeface written by hand',
        fix: "fontFamily('sans' | 'serif' | 'mono' | 'retro')",
      });
    if (property === 'font-size' && /\d/.test(written))
      return add(position, {
        ...base,
        severity: 'error',
        rule: 'Text size written by hand',
        fix: 'typeRampDeclarations() or fontSize(n)',
      });
    if (property === 'font-weight' && /^\d+$/.test(written)) {
      const key = weightKey(written);
      return add(
        position,
        key
          ? {
              ...base,
              severity: 'error',
              rule: 'Weight written by hand',
              fix: `FONT_WEIGHT.${key}`,
            }
          : {
              ...base,
              severity: 'warning',
              rule: 'Weight outside FONT_WEIGHT',
              fix: Object.keys(scales.weights ?? {})
                .map((k) => `FONT_WEIGHT.${k}`)
                .join(' / '),
            },
      );
    }
    if (/^(line-height|letter-spacing)$/.test(property) && /\d/.test(written))
      return add(position, {
        ...base,
        severity: 'warning',
        rule: `${property} by hand, outside the type ramps`,
        fix: 'typeRampDeclarations()',
      });
    if (property === 'z-index' && /\d/.test(written))
      return add(
        position,
        /^-?\d$/.test(written)
          ? {
              ...base,
              severity: 'info',
              rule: 'Local stacking order',
              fix: null,
            }
          : {
              ...base,
              severity: 'error',
              rule: 'Layer written by hand',
              fix: `Z_INDEX (${Object.keys(scales.zIndex ?? {}).join(', ')})`,
            },
      );
    if (/^(transition|animation)/.test(property)) {
      const times = [...written.matchAll(RAW_TIME)].map((match) =>
        toMs(`${match[1]}${match[2]}`),
      );
      if (times.length) {
        const exact = times.map(
          (ms) => durationEntries.find(([, token]) => toMs(token) === ms)?.[0],
        );
        if (exact.every(Boolean))
          return add(position, {
            ...base,
            severity: 'error',
            rule: 'Duration written by hand',
            fix: [...new Set(exact)].map((key) => `DURATION.${key}`).join(', '),
          });
        const off = times.filter((_, index) => !exact[index]);
        return add(position, {
          ...base,
          severity: 'warning',
          rule: 'Duration outside DURATION',
          fix: off
            .map((ms) => {
              const near = nearestDuration(ms);
              return `${ms}ms → nearest DURATION.${near.key} (${near.ms}ms)`;
            })
            .join('; '),
        });
      }
    }
    if (/cubic-bezier/.test(written))
      return add(position, {
        ...base,
        severity: 'error',
        rule: 'Easing written by hand',
        fix: 'EASING',
      });
    if (RAW_LENGTH.test(written)) {
      const pixels = [...written.matchAll(/(?<![\w.$-])(-?\d*\.?\d+)px/g)].map(
        (match) => Math.abs(Number(match[1])),
      );
      if (
        /^(border|outline|box-shadow)/.test(property) &&
        pixels.every((px) => px <= 1)
      )
        return add(position, {
          ...base,
          severity: 'info',
          rule: '1px rule',
          fix: null,
        });
      if (
        /^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)/.test(
          property,
        ) &&
        pixels.length &&
        spacingBase &&
        pixels.every((px) => px % spacingBase === 0)
      )
        return add(position, {
          ...base,
          severity: 'error',
          rule: 'Spacing written by hand',
          fix: pixels.map((px) => `spacing(${px / spacingBase})`).join(' '),
        });
      if (
        property.startsWith('border-radius') &&
        pixels.length &&
        radiusBase &&
        pixels.every((px) => px % radiusBase === 0 && px < 100)
      )
        return add(position, {
          ...base,
          severity: 'error',
          rule: 'Radius written by hand',
          fix: pixels.map((px) => `radius(${px / radiusBase})`).join(' '),
        });
      if (
        /^(width|height|max-width|min-width|max-height|min-height|flex-basis|grid-template)/.test(
          property,
        )
      )
        return add(position, {
          ...base,
          severity: 'info',
          rule: 'Size, no token',
          fix: null,
        });
      return add(position, {
        ...base,
        severity: 'info',
        rule: 'Raw value, no exact token',
        fix: null,
      });
    }
  };

  const visit = (node) => {
    if (ts.isTaggedTemplateExpression(node)) {
      const template = node.template;
      const parts = ts.isNoSubstitutionTemplateLiteral(template)
        ? [{ text: template.text, start: template.getStart() + 1 }]
        : [
            { text: template.head.text, start: template.head.getStart() + 1 },
            ...template.templateSpans.map((span) => ({
              text: `__TOKEN__${span.literal.text}`,
              start: span.literal.getStart() + 1 - '__TOKEN__'.length,
            })),
          ];
      let combined = '';
      const offsets = [];
      for (const part of parts) {
        offsets.push({ at: combined.length, start: part.start });
        combined += part.text;
      }
      const sourceAt = (index) => {
        const part = offsets.findLast((entry) => entry.at <= index);
        return part.start + (index - part.at);
      };
      // The styled component's name: Linaria prefixes its class with it.
      let owner = node.parent;
      while (
        owner &&
        !ts.isVariableDeclaration(owner) &&
        !ts.isSourceFile(owner)
      )
        owner = owner.parent;
      const styled =
        owner && ts.isVariableDeclaration(owner) ? owner.name.getText() : null;
      const clean = combined
        .replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length))
        .replace(/\/\/[^\n]*/g, (match) => ' '.repeat(match.length));
      // The source line of every declaration, in order, for the doc's links.
      const declarationLines = [];
      for (const match of clean.matchAll(
        /(?:^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+);/g,
      )) {
        const position = sourceAt(match.index + match[0].indexOf(match[1]));
        declarationLines.push({ property: match[1], line: lineOf(position) });
        judge(position, styled, match[1], match[2].replace(/\s+/g, ' ').trim());
      }
      if (styled) {
        // The same template with each ${…} kept aside, then shown as written.
        const expressions = [];
        const display = ts.isNoSubstitutionTemplateLiteral(template)
          ? template.text
          : [
              template.head.text,
              ...template.templateSpans.map((span) => {
                expressions.push(span.expression.getText());
                return `@@${expressions.length - 1}@@${span.literal.text}`;
              }),
            ].join('');
        const restore = (text) =>
          text.replace(/@@(\d+)@@/g, (_, index) => `\${${expressions[index]}}`);
        const declarations = [
          ...display
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
            .matchAll(/(?:^|[;{\s])([a-z-]+)\s*:\s*([^;{}]+);/g),
        ].map(([, property, rawValue]) => {
          const value = restore(rawValue.replace(/\s+/g, ' ').trim());
          const written = rawValue
            .replace(/@@\d+@@/g, '')
            .replace(/var\([^)]*\)/g, '')
            .replace(/(?<![\d.])0px/g, '')
            .trim();
          const zeroless = written.replace(/(?<![\w.#-])0(?![\w.%])/g, '');
          const byHand =
            /[\d#]/.test(zeroless) ||
            (property === 'font-family' && zeroless.length > 0);
          // token: built from a ${…}; hand: a number or color written out;
          // css: a plain keyword (center, none, transparent…).
          const kind = byHand ? 'hand' : value.includes('${') ? 'token' : 'css';
          return { property, value, byHand, kind };
        });
        // The size only when the declaration is exactly fontSize(n): a
        // clamp() or a calc() around it varies with the window.
        const fontSizeStep = Number(
          declarations
            .find((declaration) => declaration.property === 'font-size')
            ?.value.match(/^\$\{fontSize\(([\d.]+)\)\}$/)?.[1] ?? Number.NaN,
        );
        // Both passes read the same template in the same order: pair them,
        // and keep no line when a property does not match.
        for (const [index, declaration] of declarations.entries())
          declaration.line =
            declarationLines[index]?.property === declaration.property
              ? declarationLines[index].line
              : null;
        styledDetails[styled] = {
          line: lineOf(node.getStart()),
          tag: node.tag.getText(),
          fontSizeStep: Number.isNaN(fontSizeStep) ? null : fontSizeStep,
          declarations,
        };
      }
      const tag = node.tag.getText();
      if (
        /^styled\.(h[1-6])$/.test(tag) &&
        /font-size|line-height|letter-spacing/.test(combined) &&
        !/typeRampDeclarations/.test(combined)
      )
        add(node.getStart(), {
          styled,
          property: tag,
          value: '',
          severity: 'error',
          rule: 'Heading styled by hand',
          fix: 'Heading from @/ui',
        });
    }
    const inTrans =
      ts.isJsxText(node) &&
      ts.isJsxElement(node.parent) &&
      node.parent.openingElement.tagName.getText() === 'Trans';
    if (ts.isJsxText(node) && !inTrans && /[A-Za-z]{2,}/.test(node.text))
      add(node.getStart(), {
        styled: null,
        property: 'text',
        value: node.text.trim().slice(0, 60),
        severity: 'error',
        rule: 'Text not translated',
        fix: 'msg`…` or <Trans>',
      });
    if (ts.isJsxAttribute(node) && USER_ATTRIBUTES.has(node.name.getText())) {
      const init = node.initializer;
      if (init && ts.isStringLiteral(init) && /[A-Za-z]{2,}/.test(init.text))
        add(node.getStart(), {
          styled: null,
          property: node.name.getText(),
          value: init.text.slice(0, 50),
          severity: 'error',
          rule: 'Text not translated',
          fix: 'msg`…`',
        });
    }
    if (
      ts.isStringLiteralLike(node) &&
      /^https?:\/\//.test(node.text) &&
      !/^https?:\/\/(www\.w3\.org|schema\.org)\b/.test(node.text) &&
      file !== 'platform/site-urls.ts'
    )
      add(node.getStart(), {
        styled: null,
        property: 'url',
        value: node.text.slice(0, 80),
        severity: 'info',
        rule: 'Address written in code (SITE_URLS holds the links shown to visitors)',
        fix: null,
      });
    if (ts.isNumericLiteral(node) && /^0x[0-9a-f]{6}$/i.test(node.getText()))
      add(node.getStart(), {
        styled: null,
        property: 'color',
        value: node.getText(),
        severity: 'error',
        rule: 'Color written by hand (number)',
        fix: 'paletteColorNumber()',
      });
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { findings, styled: styledDetails };
};

// Files that draw illustrations: every component returns a decorative root
// (aria-hidden), or the file reproduces the app (app-preview/, twenty-ui's
// theme, the product typeface), or only such files import it.
export const illustrationFiles = (reader, sourceRoot, files) => {
  const textOf = (file) => fs.readFileSync(path.join(sourceRoot, file), 'utf8');
  const isDecorative = (file) => {
    const roots = [...reader.declarationsOf(file).values()]
      .map((declaration) => reader.functionOf(declaration))
      .filter(Boolean)
      .map((fn) => reader.rootElementsOf(fn))
      .filter((list) => list.length > 0);
    return (
      roots.length > 0 &&
      roots.every((list) =>
        list.every((root) => root.attributes['aria-hidden']),
      )
    );
  };
  const set = new Set(
    files.filter(
      (file) =>
        file.startsWith('app-preview/') ||
        /from 'twenty-ui\/theme'/.test(textOf(file)) ||
        /--font-product/.test(textOf(file)) ||
        (file.endsWith('.tsx') && isDecorative(file)),
    ),
  );
  const importers = new Map();
  for (const file of files)
    for (const imported of reader.importsOf(file).values())
      if (imported.file)
        importers.set(imported.file, [
          ...(importers.get(imported.file) ?? []),
          file,
        ]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const file of files) {
      const users = importers.get(file) ?? [];
      if (
        !set.has(file) &&
        users.length &&
        users.every((user) => set.has(user))
      ) {
        set.add(file);
        grew = true;
      }
    }
  }
  return set;
};
