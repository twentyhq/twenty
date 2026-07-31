import {
  Brackets,
  NotBrackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';

export type RecordedWhereNode =
  | { kind: 'sql'; sql: string; parameters: ObjectLiteral | undefined }
  | { kind: 'brackets'; children: RecordedWhereCall[] }
  | { kind: 'notBrackets'; children: RecordedWhereCall[] };

export type RecordedWhereCall = {
  method: 'where' | 'andWhere' | 'orWhere';
  node: RecordedWhereNode;
};

export type WhereExpressionRecorder = {
  whereExpression: WhereExpressionBuilder;
  calls: RecordedWhereCall[];
};

export const createWhereExpressionRecorder = (): WhereExpressionRecorder => {
  const calls: RecordedWhereCall[] = [];

  const recordNode = (
    condition: unknown,
    parameters: ObjectLiteral | undefined,
  ): RecordedWhereNode => {
    if (condition instanceof NotBrackets) {
      const childRecorder = createWhereExpressionRecorder();

      condition.whereFactory(childRecorder.whereExpression);

      return { kind: 'notBrackets', children: childRecorder.calls };
    }

    if (condition instanceof Brackets) {
      const childRecorder = createWhereExpressionRecorder();

      condition.whereFactory(childRecorder.whereExpression);

      return { kind: 'brackets', children: childRecorder.calls };
    }

    return { kind: 'sql', sql: String(condition), parameters };
  };

  const recordCall =
    (method: RecordedWhereCall['method']) =>
    (condition: unknown, parameters?: ObjectLiteral) => {
      calls.push({ method, node: recordNode(condition, parameters) });

      return whereExpression;
    };

  const whereExpression = {
    where: recordCall('where'),
    andWhere: recordCall('andWhere'),
    orWhere: recordCall('orWhere'),
  } as unknown as WhereExpressionBuilder;

  return { whereExpression, calls };
};
