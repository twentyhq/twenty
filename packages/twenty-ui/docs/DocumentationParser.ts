import { isNonEmptyArray } from '@sniptt/guards';
import {
  Parser,
  type ParserOptions,
  type Props,
} from 'react-docgen-typescript';
import ts from 'typescript';

import { isDefined } from '../src/utilities/utils/isDefined';

type DocComment = ReturnType<Parser['findDocComment']>;

const hasDocComment = (comment: DocComment): boolean =>
  comment.fullComment.length > 0 || comment.tags.default !== undefined;

const getDeclaredTypeOfTruncatedProp = ({
  checker,
  prop,
  location,
}: {
  checker: ts.TypeChecker;
  prop: ts.Symbol | undefined;
  location: ts.Node;
}): string | undefined => {
  if (!isDefined(prop)) {
    return undefined;
  }

  const propType = checker.getTypeOfSymbolAtLocation(prop, location);
  const isTruncated =
    checker.typeToString(propType) !==
    checker.typeToString(propType, undefined, ts.TypeFormatFlags.NoTruncation);
  const [declaredType, ...otherDeclaredTypes] = (
    prop.declarations ?? []
  ).flatMap((declaration) =>
    ts.isPropertySignature(declaration) && isDefined(declaration.type)
      ? [declaration.type]
      : [],
  );

  if (
    !isTruncated ||
    !isDefined(declaredType) ||
    isNonEmptyArray(otherDeclaredTypes)
  ) {
    return undefined;
  }

  return declaredType.getText();
};

export class DocumentationParser extends Parser {
  private readonly typeChecker: ts.TypeChecker;

  constructor(program: ts.Program, options: ParserOptions) {
    super(program, options);
    this.typeChecker = program.getTypeChecker();
  }

  override findDocComment(symbol: ts.Symbol): DocComment {
    const declaringSymbols = this.typeChecker
      .getRootSymbols(symbol)
      .filter((rootSymbol) => rootSymbol !== symbol);

    if (declaringSymbols.length < 2) {
      return super.findDocComment(symbol);
    }

    const mostSpecificComment = [...declaringSymbols]
      .reverse()
      .map((declaringSymbol) => super.findDocComment(declaringSymbol))
      .find(hasDocComment);

    return mostSpecificComment ?? super.findDocComment(symbol);
  }

  override getPropsInfo(
    propsSymbol: ts.Symbol,
    defaultProps?: Parameters<Parser['getPropsInfo']>[1],
  ): Props {
    const props = super.getPropsInfo(propsSymbol, defaultProps);
    const propsDeclaration = propsSymbol.valueDeclaration;

    if (!isDefined(propsDeclaration)) {
      return props;
    }

    const propsType = this.typeChecker.getTypeOfSymbolAtLocation(
      propsSymbol,
      propsDeclaration,
    );

    for (const prop of Object.values(props)) {
      const declaredType = getDeclaredTypeOfTruncatedProp({
        checker: this.typeChecker,
        prop: propsType.getProperty(prop.name),
        location: propsDeclaration,
      });

      if (isDefined(declaredType)) {
        prop.type = { name: declaredType };
      }
    }

    return props;
  }
}
