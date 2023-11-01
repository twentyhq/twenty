import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMetadataSoftDelete1698328717102
  implements MigrationInterface
{
  name = 'RemoveMetadataSoftDelete1698328717102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "FK_38179b299795e48887fc99f937a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "FK_38179b299795e48887fc99f937a" FOREIGN KEY ("object_id") REFERENCES "metadata"."object_metadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "FK_38179b299795e48887fc99f937a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "FK_38179b299795e48887fc99f937a" FOREIGN KEY ("object_id") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
