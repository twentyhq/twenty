
import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { createViewFieldOperationFactory } from 'twenty-shared/mutations';
type CreateViewFieldOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewFieldEntity>;
};

export const prastoin = ({
  gqlFields,
  data = {},
}: CreateViewFieldOperationFactoryParams = {}) => ({
  query: createViewFieldOperationFactory(gqlFields),
  variables: {
    input: data,
  },
});
