import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureFlags1701194529853 implements MigrationInterface {
  name = 'AddFeatureFlags1701194529853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."featureFlag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "workspaceId" uuid NOT NULL, "value" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "IndexOnKeyAndWorkspaceIdUnique" UNIQUE ("key", "workspaceId"), CONSTRAINT "PK_894efa1b1822de801f3b9e04069" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD CONSTRAINT "FK_6be7761fa8453f3a498aab6e72b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP CONSTRAINT "FK_6be7761fa8453f3a498aab6e72b"`,
    );
    await queryRunner.query(`DROP TABLE "core"."featureFlag"`);
  }
}
