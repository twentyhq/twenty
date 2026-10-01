import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { printType, validateSchema } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionResolver } from 'src/engine/metadata-modules/logic-function/logic-function.resolver';

it('exposes the function name and universal identifier on logic function logs', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );

  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([LogicFunctionResolver]);
    const logicFunctionLogsType = schema.getType('LogicFunctionLogs');

    if (!isDefined(logicFunctionLogsType)) {
      throw new Error('LogicFunctionLogs is missing from the schema');
    }

    expect(validateSchema(schema)).toEqual([]);
    expect(printType(logicFunctionLogsType)).toBe(
      [
        'type LogicFunctionLogs {',
        '  """Execution Logs"""',
        '  logs: String!',
        '  name: String',
        '  universalIdentifier: UUID',
        '}',
      ].join('\n'),
    );
    expect(
      String(schema.getSubscriptionType()?.getFields().logicFunctionLogs?.type),
    ).toBe('LogicFunctionLogs!');
  } finally {
    await application.close();
  }
});
