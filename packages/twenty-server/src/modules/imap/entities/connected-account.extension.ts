// 扩展 ConnectedAccountObjectMetadata 以支持IMAP
// 在原有实体中添加以下字段

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const imapFields = [
  {
    name: 'imapHost',
    type: FieldMetadataType.TEXT,
    description: 'IMAP server host',
    nullable: true,
  },
  {
    name: 'imapPort',
    type: FieldMetadataType.NUMBER,
    description: 'IMAP server port',
    nullable: true,
  },
  {
    name: 'imapSecure',
    type: FieldMetadataType.BOOLEAN,
    description: 'Use TLS/SSL for IMAP connection',
    defaultValue: true,
    nullable: true,
  },
];

// 使用方法: 在 ConnectedAccountObjectMetadata 实体定义中添加这些字段
