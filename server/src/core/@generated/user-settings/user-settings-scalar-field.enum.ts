import { registerEnumType } from '@nestjs/graphql';

export enum UserSettingsScalarFieldEnum {
    id = "id",
    colorScheme = "colorScheme",
    locale = "locale",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(UserSettingsScalarFieldEnum, { name: 'UserSettingsScalarFieldEnum', description: undefined })
