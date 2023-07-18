import { registerEnumType } from '@nestjs/graphql';

export enum AttachmentType {
    Image = "Image",
    Audio = "Audio",
    Video = "Video",
    TextDocument = "TextDocument",
    Spreadsheet = "Spreadsheet",
    Archive = "Archive",
    Other = "Other"
}


registerEnumType(AttachmentType, { name: 'AttachmentType', description: undefined })
