import { Module } from '@nestjs/common';

import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { CreateFieldMetadataTool } from 'src/engine/metadata-modules/field-metadata/tools/create-field-metadata.tool';
import { CreateManyFieldMetadataTool } from 'src/engine/metadata-modules/field-metadata/tools/create-many-field-metadata.tool';
import { CreateManyRelationFieldsTool } from 'src/engine/metadata-modules/field-metadata/tools/create-many-relation-fields.tool';
import { DeleteFieldMetadataTool } from 'src/engine/metadata-modules/field-metadata/tools/delete-field-metadata.tool';
import { GetFieldMetadataTool } from 'src/engine/metadata-modules/field-metadata/tools/get-field-metadata.tool';
import { UpdateFieldMetadataTool } from 'src/engine/metadata-modules/field-metadata/tools/update-field-metadata.tool';
import { UpdateManyFieldMetadataTool } from 'src/engine/metadata-modules/field-metadata/tools/update-many-field-metadata.tool';
import { ValidateFormulaExpressionTool } from 'src/engine/metadata-modules/field-metadata/tools/validate-formula-expression.tool';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { CreateManyObjectMetadataTool } from 'src/engine/metadata-modules/object-metadata/tools/create-many-object-metadata.tool';
import { CreateObjectMetadataTool } from 'src/engine/metadata-modules/object-metadata/tools/create-object-metadata.tool';
import { DeleteObjectMetadataTool } from 'src/engine/metadata-modules/object-metadata/tools/delete-object-metadata.tool';
import { GetObjectMetadataTool } from 'src/engine/metadata-modules/object-metadata/tools/get-object-metadata.tool';
import { MetadataToolIdentifierService } from 'src/engine/metadata-modules/object-metadata/tools/services/metadata-tool-identifier.service';
import { UpdateManyObjectMetadataTool } from 'src/engine/metadata-modules/object-metadata/tools/update-many-object-metadata.tool';
import { UpdateObjectMetadataTool } from 'src/engine/metadata-modules/object-metadata/tools/update-object-metadata.tool';
import { CreateValidationRuleTool } from 'src/engine/metadata-modules/validation-rule/tools/create-validation-rule.tool';
import { GetValidationRulesTool } from 'src/engine/metadata-modules/validation-rule/tools/get-validation-rules.tool';
import { UpdateValidationRuleTool } from 'src/engine/metadata-modules/validation-rule/tools/update-validation-rule.tool';
import { ValidateValidationRuleExpressionTool } from 'src/engine/metadata-modules/validation-rule/tools/validate-validation-rule-expression.tool';
import { ValidationRuleModule } from 'src/engine/metadata-modules/validation-rule/validation-rule.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ObjectMetadataModule,
    FieldMetadataModule,
    ValidationRuleModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceCacheModule,
  ],
  providers: [
    MetadataToolIdentifierService,
    GetObjectMetadataTool,
    CreateObjectMetadataTool,
    UpdateObjectMetadataTool,
    DeleteObjectMetadataTool,
    CreateManyObjectMetadataTool,
    UpdateManyObjectMetadataTool,
    GetFieldMetadataTool,
    CreateFieldMetadataTool,
    UpdateFieldMetadataTool,
    DeleteFieldMetadataTool,
    CreateManyFieldMetadataTool,
    UpdateManyFieldMetadataTool,
    CreateManyRelationFieldsTool,
    ValidateFormulaExpressionTool,
    GetValidationRulesTool,
    ValidateValidationRuleExpressionTool,
    CreateValidationRuleTool,
    UpdateValidationRuleTool,
  ],
})
export class MetadataToolsModule {}
