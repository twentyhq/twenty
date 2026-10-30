import { PageLayoutType } from 'twenty-shared/types';
import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
  registerEnumType,
} from '@nestjs/graphql';
import { parse, validate, validateSchema } from 'graphql';

import { AiFrontComponentResolver } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.resolver';
import { FrontComponentResolver } from 'src/engine/metadata-modules/front-component/front-component.resolver';

registerEnumType(PageLayoutType, { name: 'PageLayoutType' });

it('exposes the AI component discriminator in metadata queries', async () => {
  const application = await NestFactory.createApplicationContext(
    GraphQLSchemaBuilderModule,
    { logger: false },
  );

  try {
    const schema = await application
      .get(GraphQLSchemaFactory)
      .create([FrontComponentResolver, AiFrontComponentResolver]);

    expect(validateSchema(schema)).toEqual([]);
    expect(
      validate(
        schema,
        parse(`
      query {
        frontComponent(id: "f63b3106-066a-4b29-913f-570308b6e999") {
          id
          isAiComponent
        }
      }
    `),
      ),
    ).toEqual([]);
  } finally {
    await application.close();
  }
});
