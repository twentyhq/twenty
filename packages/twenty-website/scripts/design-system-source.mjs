// Reads the site's source as the TypeScript compiler does (AST), for
// generate-design-system-data.mjs: imports, exports, components, JSX.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const createSourceReader = (sourceRoot) => {
  const cache = new Map();

  const parse = (file) => {
    if (!cache.has(file)) {
      const absolute = path.join(sourceRoot, file);
      cache.set(
        file,
        ts.createSourceFile(
          absolute,
          fs.readFileSync(absolute, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
          file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
        ),
      );
    }
    return cache.get(file);
  };

  // '@/x' and './x' to a file under src/, as the bundler resolves them.
  const resolveModule = (fromFile, specifier) => {
    let base;
    if (specifier.startsWith('@/')) base = specifier.slice(2);
    else if (specifier.startsWith('.'))
      base = path.join(path.dirname(fromFile), specifier);
    else return null;
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}/index.ts`,
      `${base}/index.tsx`,
    ]) {
      const absolute = path.join(sourceRoot, candidate);
      if (fs.existsSync(absolute) && fs.statSync(absolute).isFile())
        return path.normalize(candidate);
    }
    return null;
  };

  const exportsCache = new Map();
  // Every value a module exports: name -> { file, local } where it is defined,
  // following `export { X } from './X'` through index files.
  const exportsOf = (file) => {
    if (exportsCache.has(file)) return exportsCache.get(file);
    const result = new Map();
    exportsCache.set(file, result);
    const source = parse(file);
    for (const statement of source.statements) {
      if (ts.isExportDeclaration(statement)) {
        if (statement.isTypeOnly) continue;
        const target = statement.moduleSpecifier
          ? resolveModule(file, statement.moduleSpecifier.text)
          : file;
        if (!statement.exportClause) {
          if (target)
            for (const [name, entry] of exportsOf(target))
              result.set(name, entry);
          continue;
        }
        if (!ts.isNamedExports(statement.exportClause)) continue;
        for (const element of statement.exportClause.elements) {
          if (element.isTypeOnly) continue;
          const exported = element.name.text;
          const local = (element.propertyName ?? element.name).text;
          if (statement.moduleSpecifier) {
            if (!target) continue;
            const inner = exportsOf(target).get(local);
            result.set(exported, inner ?? { file: target, local });
          } else {
            result.set(exported, { file, local });
          }
        }
        continue;
      }
      const isExported = ts
        .getModifiers?.(statement)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExported) continue;
      if (ts.isFunctionDeclaration(statement) && statement.name)
        result.set(statement.name.text, { file, local: statement.name.text });
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name))
            result.set(declaration.name.text, {
              file,
              local: declaration.name.text,
            });
    }
    return result;
  };

  // Value imports of a file: local name -> { from, file, imported, defined }
  // where `defined` is the file and name that really declare it.
  const importsOf = (file) => {
    const result = new Map();
    for (const statement of parse(file).statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      const clause = statement.importClause;
      if (!clause || clause.isTypeOnly) continue;
      const from = statement.moduleSpecifier.text;
      const target = resolveModule(file, from);
      if (clause.name)
        result.set(clause.name.text, {
          from,
          file: target,
          imported: 'default',
          defined: target ? { file: target, local: 'default' } : null,
        });
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        for (const element of bindings.elements) {
          if (element.isTypeOnly) continue;
          const imported = (element.propertyName ?? element.name).text;
          result.set(element.name.text, {
            from,
            file: target,
            imported,
            defined: target ? (exportsOf(target).get(imported) ?? null) : null,
          });
        }
    }
    return result;
  };

  // Top-level declarations by name: function declarations and consts.
  const declarationsOf = (file) => {
    const result = new Map();
    for (const statement of parse(file).statements) {
      if (ts.isFunctionDeclaration(statement) && statement.name)
        result.set(statement.name.text, statement);
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name))
            result.set(declaration.name.text, declaration);
    }
    return result;
  };

  // The declaration behind `export default`.
  const defaultExportOf = (file) => {
    for (const statement of parse(file).statements) {
      const modifiers = ts.getModifiers?.(statement) ?? [];
      const isDefault =
        modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
        modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
      if (isDefault && ts.isFunctionDeclaration(statement)) return statement;
      if (
        ts.isExportAssignment(statement) &&
        ts.isIdentifier(statement.expression)
      )
        return declarationsOf(file).get(statement.expression.text) ?? null;
    }
    return null;
  };

  // A component's function: the declaration itself, or a const's arrow/function.
  const functionOf = (declaration) => {
    if (!declaration) return null;
    if (ts.isFunctionDeclaration(declaration)) return declaration;
    const initializer = declaration.initializer;
    if (
      initializer &&
      (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
    )
      return initializer;
    return null;
  };

  const tagName = (node) => {
    const name = node.tagName;
    return ts.isIdentifier(name) ? name.text : name.getText();
  };

  const attributesOf = (node) => {
    const result = {};
    for (const attribute of node.attributes.properties) {
      if (!ts.isJsxAttribute(attribute)) continue;
      const name = attribute.name.getText();
      const initializer = attribute.initializer;
      if (!initializer) result[name] = { kind: 'true' };
      else if (ts.isStringLiteral(initializer))
        result[name] = { kind: 'string', value: initializer.text };
      else if (
        ts.isJsxExpression(initializer) &&
        initializer.expression &&
        ts.isStringLiteralLike(initializer.expression)
      )
        result[name] = { kind: 'string', value: initializer.expression.text };
      else
        result[name] = {
          kind: 'expression',
          text: initializer.expression?.getText() ?? '',
          expression: initializer.expression ?? null,
        };
    }
    return result;
  };

  // Every JSX element under a node, in source order, with its JSX ancestors.
  const jsxElementsIn = (root) => {
    const result = [];
    const visit = (node, ancestors) => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const element = {
          tag: tagName(opening),
          attributes: attributesOf(opening),
          node,
          ancestors,
        };
        result.push(element);
        ts.forEachChild(node, (child) => visit(child, [...ancestors, element]));
        return;
      }
      ts.forEachChild(node, (child) => visit(child, ancestors));
    };
    visit(root, []);
    return result;
  };

  // The elements a component returns at its top level: the returned element,
  // or the outermost elements inside a returned fragment.
  const rootElementsOf = (fn) => {
    if (!fn?.body) return [];
    const unwrap = (expression) => {
      let current = expression;
      while (current && ts.isParenthesizedExpression(current))
        current = current.expression;
      return current;
    };
    let returned = null;
    if (ts.isBlock(fn.body)) {
      for (const statement of fn.body.statements)
        if (ts.isReturnStatement(statement))
          returned = unwrap(statement.expression);
    } else returned = unwrap(fn.body);
    if (!returned) return [];
    const outermost = (node) =>
      jsxElementsIn(node).filter((element) => element.ancestors.length === 0);
    if (ts.isJsxFragment(returned))
      return returned.children.flatMap((child) => outermost(child));
    return outermost(returned);
  };

  // `{ scheme = 'light' }` in a component's props: the default of one prop.
  const propDefaultOf = (fn, prop) => {
    const parameter = fn?.parameters?.[0];
    if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return null;
    for (const element of parameter.name.elements) {
      const name = (element.propertyName ?? element.name).getText();
      if (name !== prop) continue;
      if (element.initializer && ts.isStringLiteralLike(element.initializer))
        return {
          value: element.initializer.text,
          local: element.name.getText(),
        };
      return { value: null, local: element.name.getText() };
    }
    return null;
  };

  // `// lines` right above a declaration's statement.
  const leadingCommentOf = (file, declaration) => {
    let statement = declaration;
    while (statement && !ts.isSourceFile(statement.parent))
      statement = statement.parent;
    if (!statement) return null;
    const text = parse(file).getFullText();
    const ranges =
      ts.getLeadingCommentRanges(text, statement.getFullStart()) ?? [];
    const lines = ranges
      .filter((range) => range.kind === ts.SyntaxKind.SingleLineCommentTrivia)
      .map((range) => text.slice(range.pos + 2, range.end).trim());
    return lines.join(' ').trim() || null;
  };

  // Calls to an imported helper (spacing, radius…) with literal arguments.
  const callsTo = (file, helper, fromModule) => {
    const imported = importsOf(file).get(helper);
    if (!imported || !imported.from.startsWith(fromModule)) return [];
    const result = [];
    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === helper
      )
        result.push(node);
      ts.forEachChild(node, visit);
    };
    visit(parse(file));
    return result;
  };

  return {
    ts,
    parse,
    resolveModule,
    exportsOf,
    importsOf,
    declarationsOf,
    defaultExportOf,
    functionOf,
    jsxElementsIn,
    rootElementsOf,
    propDefaultOf,
    leadingCommentOf,
    callsTo,
  };
};
