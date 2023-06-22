import { registerEnumType } from '@nestjs/graphql';

export enum JsonNullValueFilter {
    DbNull = "DbNull",
    JsonNull = "JsonNull",
    AnyNull = "AnyNull"
}


registerEnumType(JsonNullValueFilter, { name: 'JsonNullValueFilter', description: undefined })
