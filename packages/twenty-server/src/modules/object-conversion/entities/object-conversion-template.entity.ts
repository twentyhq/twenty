import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface FieldMappingRule {
  sourceField: string;
  targetField: string;
  transformationRule?: string;
}

export interface ConversionSettings {
  keepOriginalObject: boolean;
  createRelations: boolean;
  markAsConverted: boolean;
}

export interface TemplateMatchingRule {
  fieldName: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
  value: any;
}

@Entity('object_conversion_templates')
export class ObjectConversionTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: false })
  sourceObjectMetadataId: string;

  @Column({ type: 'uuid', nullable: false })
  targetObjectMetadataId: string;

  @Column({ type: 'jsonb', nullable: false })
  fieldMappingRules: FieldMappingRule[];

  @Column({ type: 'jsonb', nullable: false })
  conversionSettings: ConversionSettings;

  @Column({ type: 'jsonb', nullable: true })
  matchingRules: TemplateMatchingRule[];

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'integer', nullable: false })
  orderIndex: number;

  @Column({ type: 'uuid', nullable: false })
  workspaceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
