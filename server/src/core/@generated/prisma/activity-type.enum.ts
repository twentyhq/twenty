import { registerEnumType } from '@nestjs/graphql';

export enum ActivityType {
    Note = "Note",
    Task = "Task"
}


registerEnumType(ActivityType, { name: 'ActivityType', description: undefined })
