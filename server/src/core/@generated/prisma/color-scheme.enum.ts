import { registerEnumType } from '@nestjs/graphql';

export enum ColorScheme {
    Light = "Light",
    Dark = "Dark",
    System = "System"
}


registerEnumType(ColorScheme, { name: 'ColorScheme', description: undefined })
