import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1695198840363 implements MigrationInterface {
  name = 'Migrations1695198840363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."data_source_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying, "schema" character varying, "type" "metadata"."data_source_metadata_type_enum" NOT NULL DEFAULT 'postgres', "name" character varying, "is_remote" boolean NOT NULL DEFAULT false, "workspace_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_923752b7e62a300a4969bd0e038" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."field_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "object_id" uuid NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "is_custom" boolean NOT NULL DEFAULT false, "workspace_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c75db587904cad6af109b5c65f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."object_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data_source_id" character varying NOT NULL, "name" character varying NOT NULL, "is_custom" boolean NOT NULL DEFAULT false, "workspace_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c8c5f885767b356949c18c201c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "FK_38179b299795e48887fc99f937a" FOREIGN KEY ("object_id") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "FK_38179b299795e48887fc99f937a"`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."object_metadata"`);
    await queryRunner.query(`DROP TABLE "metadata"."field_metadata"`);
    await queryRunner.query(`DROP TABLE "metadata"."data_source_metadata"`);
  }
}
