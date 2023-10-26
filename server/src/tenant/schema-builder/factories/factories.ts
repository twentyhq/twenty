import { ArgsFactory } from './args.factory';
import { InputTypeFactory } from './input-type.factory';
import { InputTypeDefinitionFactory } from './input-type-definition.factory';
import { ObjectTypeDefinitionFactory } from './object-type-definition.factory';
import { OutputTypeFactory } from './output-type.factory';
import { QueryTypeFactory } from './query-type.factory';
import { RootTypeFactory } from './root-type.factory';

export const schemaBuilderFactories = [
  ArgsFactory,
  InputTypeFactory,
  InputTypeDefinitionFactory,
  ObjectTypeDefinitionFactory,
  OutputTypeFactory,
  RootTypeFactory,
  QueryTypeFactory,
];
