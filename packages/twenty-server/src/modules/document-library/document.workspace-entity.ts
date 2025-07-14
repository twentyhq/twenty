import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';

@WorkspaceEntity({
  name: 'document',
  namePlural: 'documents',
  labelSingular: msg`Document`,
  labelPlural: msg`Documents`,
  description: msg`A document`,
  icon: 'IconFile',
})
export class DocumentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The document name`,
    icon: 'IconFile',
  })
  name: string;

  @WorkspaceField({
    type: FieldMetadataType.FILE,
    label: msg`File`,
    description: msg`The document file`,
    icon: 'IconFile',
  })
  file: any;

  @WorkspaceField({
    type: FieldMetadataType.SELECT,
    label: msg`Category`,
    description: msg`The document category`,
    icon: 'IconCategory',
    options: [
      { value: 'CONTRACT', label: 'Contract', position: 0, color: 'blue' },
      { value: 'BROCHURE', label: 'Brochure', position: 1, color: 'green' },
      { value: 'OTHER', label: 'Other', position: 2, color: 'gray' },
    ],
    defaultValue: "'OTHER'",
  })
  category: string;
}
