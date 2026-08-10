import { isEntitySchemaRecipe } from 'src/engine/twenty-orm/global-workspace-datasource/utils/is-entity-schema-recipe.util';

describe('isEntitySchemaRecipe', () => {
  it('should recognise an EntitySchema recipe, whose columns are keyed by property', () => {
    expect(
      isEntitySchemaRecipe({
        name: 'company',
        tableName: 'company',
        columns: { id: { type: 'uuid', primary: true } },
      }),
    ).toBe(true);
  });

  it('should recognise a recipe that survived a JSON round trip', () => {
    const recipe = {
      name: 'company',
      columns: { id: { type: 'uuid', primary: true } },
      relations: {},
    };

    expect(isEntitySchemaRecipe(JSON.parse(JSON.stringify(recipe)))).toBe(true);
  });

  it('should not mistake a built EntityMetadata, whose columns are an array', () => {
    expect(
      isEntitySchemaRecipe({
        name: 'company',
        tablePath: 'workspace_x.company',
        columns: [{ propertyName: 'id' }],
      }),
    ).toBe(false);
  });

  it('should treat a recipe with no columns at all as a recipe', () => {
    expect(isEntitySchemaRecipe({ name: 'company' })).toBe(true);
  });

  it('should reject values that are not objects', () => {
    expect(isEntitySchemaRecipe(null)).toBe(false);
    expect(isEntitySchemaRecipe(undefined)).toBe(false);
    expect(isEntitySchemaRecipe('company')).toBe(false);
  });
});
