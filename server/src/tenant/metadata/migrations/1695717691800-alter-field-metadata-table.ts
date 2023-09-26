import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFieldMetadataTable1695717691800
  implements MigrationInterface
{
  name = 'AlterFieldMetadataTable1695717691800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."tenant_migrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "migrations" jsonb, "applied_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb644cbc7f5092850f25eecb465" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "enums" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "is_nullable" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TYPE "metadata"."data_source_metadata_type_enum" RENAME TO "data_source_metadata_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "metadata"."data_source_metadata_type_enum" AS ENUM('postgres')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "type" TYPE "metadata"."data_source_metadata_type_enum" USING "type"::"text"::"metadata"."data_source_metadata_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "type" SET DEFAULT 'postgres'`,
    );
    await queryRunner.query(
      `DROP TYPE "metadata"."data_source_metadata_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "metadata"."data_source_metadata_type_enum_old" AS ENUM('postgres', 'mysql')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "type" TYPE "metadata"."data_source_metadata_type_enum_old" USING "type"::"text"::"metadata"."data_source_metadata_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "type" SET DEFAULT 'postgres'`,
    );
    await queryRunner.query(
      `DROP TYPE "metadata"."data_source_metadata_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "metadata"."data_source_metadata_type_enum_old" RENAME TO "data_source_metadata_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "is_nullable"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "enums"`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."tenant_migrations"`);
  }
}
