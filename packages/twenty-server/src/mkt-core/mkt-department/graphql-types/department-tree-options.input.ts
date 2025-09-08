import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';

enum SortByOptions {
  DISPLAY_ORDER = 'displayOrder',
  DEPARTMENT_NAME = 'departmentName',
  CREATED_AT = 'createdAt',
}

enum SortDirectionOptions {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortByOptions, {
  name: 'SortByOptions',
});

registerEnumType(SortDirectionOptions, {
  name: 'SortDirectionOptions',
});

@InputType()
export class DepartmentTreeOptions {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  maxDepth?: number;

  @Field({ nullable: true, defaultValue: false })
  includeInactive?: boolean;

  @Field(() => [String], { nullable: true })
  relationshipTypes?: string[];

  @Field(() => SortByOptions, {
    nullable: true,
    defaultValue: SortByOptions.DISPLAY_ORDER,
  })
  sortBy?: 'displayOrder' | 'departmentName' | 'createdAt';

  @Field(() => SortDirectionOptions, {
    nullable: true,
    defaultValue: SortDirectionOptions.ASC,
  })
  sortDirection?: 'ASC' | 'DESC';
}
