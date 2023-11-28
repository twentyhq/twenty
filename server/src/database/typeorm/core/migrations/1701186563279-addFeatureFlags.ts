import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureFlags1701186563279 implements MigrationInterface {
  name = 'AddFeatureFlags1701186563279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."featureFlag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "workspaceId" uuid NOT NULL, "value" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "IndexOnKeyAndWorkspaceIdUnique" UNIQUE ("key", "workspaceId"), CONSTRAINT "PK_894efa1b1822de801f3b9e04069" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."featureFlag"`);
  }
}
