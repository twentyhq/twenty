import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameAndIsCustomToTenantMigration1697622715467
  implements MigrationInterface
{
  name = 'AddNameAndIsCustomToTenantMigration1697622715467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "applied_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "isCustom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "appliedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "workspaceId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "workspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "appliedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "isCustom"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ADD "applied_at" TIMESTAMP`,
    );
  }
}
