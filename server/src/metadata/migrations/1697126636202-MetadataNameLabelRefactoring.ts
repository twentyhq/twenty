import { MigrationInterface, QueryRunner } from 'typeorm';

export class MetadataNameLabelRefactoring1697126636202
  implements MigrationInterface
{
  name = 'MetadataNameLabelRefactoring1697126636202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" RENAME COLUMN "display_name" TO "label"`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."tenant_migrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "migrations" jsonb, "applied_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cb644cbc7f5092850f25eecb465" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "display_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "display_name_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "display_name_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "display_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "target_column_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "name_singular" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD CONSTRAINT "UQ_8b063d2a685474dbae56cd685d2" UNIQUE ("name_singular")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "name_plural" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD CONSTRAINT "UQ_a2387e1b21120110b7e3db83da1" UNIQUE ("name_plural")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "label_singular" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "label_plural" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "name_singular" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "name_plural" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "label_singular" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "label_plural" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "FK_38179b299795e48887fc99f937a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ALTER COLUMN "target_column_map" SET NOT NULL`,
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
      `ALTER TABLE "metadata"."field_metadata" ALTER COLUMN "target_column_map" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "FK_38179b299795e48887fc99f937a" FOREIGN KEY ("object_id") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "label_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "label_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "name_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "name_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "label_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "label_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP CONSTRAINT "UQ_a2387e1b21120110b7e3db83da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "name_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP CONSTRAINT "UQ_8b063d2a685474dbae56cd685d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "name_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "target_column_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "display_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "display_name_plural" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "display_name_singular" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "display_name" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."tenant_migrations"`);
    await queryRunner.query(
      `ALTER TABLE "metadata"."data_source_metadata" RENAME COLUMN "label" TO "display_name"`,
    );
  }
}
