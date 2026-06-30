import { type ModelsDevModel } from './models-dev-model.type';

export type ModelsDevProvider = {
  // Provider id from models.dev (e.g. `openai`).
  id: string;
  // Keys are model identifiers in that provider’s catalog (bare ids), not composite `provider/modelName` workspace ids.
  models: Record<string, ModelsDevModel>;
};
