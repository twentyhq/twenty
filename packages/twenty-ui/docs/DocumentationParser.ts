import { Parser, type ParserOptions } from 'react-docgen-typescript';
import type ts from 'typescript';

type DocComment = ReturnType<Parser['findDocComment']>;

const hasDocComment = (comment: DocComment): boolean =>
  comment.fullComment.length > 0 || comment.tags.default !== undefined;

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
}
