import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMetadataSoftDelete1698308729020
  implements MigrationInterface
{
  name = 'RemoveMetadataSoftDelete1698308729020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "FK_38179b299795e48887fc99f937a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "FK_38179b299795e48887fc99f937a" FOREIGN KEY ("object_id") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "FK_38179b299795e48887fc99f937a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "FK_38179b299795e48887fc99f937a" FOREIGN KEY ("object_id") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."tenant_migrations" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "deleted_at" TIMESTAMP`,
    );
  }
}
