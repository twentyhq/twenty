import { registerEnumType } from '@nestjs/graphql';

export enum QueryMode {
    'default' = "default",
    insensitive = "insensitive"
}


registerEnumType(QueryMode, { name: 'QueryMode', description: undefined })
