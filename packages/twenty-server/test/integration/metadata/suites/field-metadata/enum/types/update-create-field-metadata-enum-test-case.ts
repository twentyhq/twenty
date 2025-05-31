import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { EachTestingContext } from 'twenty-shared/testing';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export type UpdateCreateFieldMetadataSelectTestCase = EachTestingContext<{
  input: Partial<Pick<CreateOneFieldFactoryInput, 'defaultValue'>> &
    Required<Pick<CreateOneFieldFactoryInput, 'options'>>;
  expectedOptions?: FieldMetadataComplexOption[];
}>;
