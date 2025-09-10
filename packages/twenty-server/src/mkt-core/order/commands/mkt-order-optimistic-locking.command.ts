import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

type Options = {
  workspaceId?: string;
};

@Command({
  name: 'workspace:order:opt-locking',
  description:
    'Create/replace trigger to touch mktOrder.updatedAt when mktOrderItem changes for a specific workspace',
})
export class EnsureOrderUpdatedAtTriggerCommand extends CommandRunner {
  private readonly logger = new Logger(EnsureOrderUpdatedAtTriggerCommand.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'Workspace ID to apply the trigger to',
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(_passedParam: string[], options: Options): Promise<void> {
    if (!options.workspaceId) {
      this.logger.error('Missing --workspace-id');

      return;
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: options.workspaceId },
    });

    if (!workspace) {
      this.logger.error(`Workspace ${options.workspaceId} not found`);

      return;
    }

    const schema = getWorkspaceSchemaName(options.workspaceId);
    const ds = await this.workspaceDataSourceService.connectToMainDataSource();

    this.logger.log(
      `Applying trigger in schema ${schema} for workspace ${options.workspaceId}`,
    );

    // Create/replace trigger function
    await ds.query(`
      CREATE OR REPLACE FUNCTION "${schema}".trg_touch_mkt_order_updated_at()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_order_id uuid;
      BEGIN
        IF TG_OP = 'INSERT' THEN
          v_order_id := NEW."mktOrderId";
        ELSIF TG_OP = 'UPDATE' THEN
          v_order_id := COALESCE(NEW."mktOrderId", OLD."mktOrderId");
        ELSIF TG_OP = 'DELETE' THEN
          v_order_id := OLD."mktOrderId";
        END IF;

        IF v_order_id IS NOT NULL THEN
          EXECUTE format('UPDATE %I."mktOrder" SET "updatedAt" = NOW() WHERE "id" = $1', TG_TABLE_SCHEMA)
          USING v_order_id;
        END IF;

        RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
      END;
      $$;
    `);

    // Drop old trigger if any
    await ds.query(
      `DROP TRIGGER IF EXISTS trg_touch_mkt_order_on_item ON "${schema}"."mktOrderItem";`,
    );

    // Create trigger
    await ds.query(`
      CREATE TRIGGER trg_touch_mkt_order_on_item
      AFTER INSERT OR UPDATE OR DELETE ON "${schema}"."mktOrderItem"
      FOR EACH ROW EXECUTE FUNCTION "${schema}".trg_touch_mkt_order_updated_at();
    `);

    this.logger.log('Done.');
  }
}
