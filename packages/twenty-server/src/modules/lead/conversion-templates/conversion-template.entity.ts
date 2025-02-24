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
  keepOriginalLead: boolean;
  createRelations: boolean;
  markAsConverted: boolean;
}

export interface TemplateMatchingRule {
  fieldName: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
  value: any;
}

@Entity('conversion_templates')
export class ConversionTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  sourceLeadType: string;

  @Column({ nullable: false })
  targetObjectType: string;

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

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
