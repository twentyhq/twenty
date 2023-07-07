import { registerEnumType } from '@nestjs/graphql';

export enum NullsOrder {
    first = "first",
    last = "last"
}


registerEnumType(NullsOrder, { name: 'NullsOrder', description: undefined })
