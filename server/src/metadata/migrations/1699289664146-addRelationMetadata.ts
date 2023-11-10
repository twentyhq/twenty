import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationMetadata1699289664146 implements MigrationInterface {
  name = 'AddRelationMetadata1699289664146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."relationMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "relationType" character varying NOT NULL, "fromObjectMetadataId" uuid NOT NULL, "toObjectMetadataId" uuid NOT NULL, "fromFieldMetadataId" uuid NOT NULL, "toFieldMetadataId" uuid NOT NULL, "workspaceId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_3deb257254145a3bdde9575e7d" UNIQUE ("fromFieldMetadataId"), CONSTRAINT "REL_9dea8f90d04edbbf9c541a95c3" UNIQUE ("toFieldMetadataId"), CONSTRAINT "PK_2724f60cb4f17a89481a7e8d7d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_f2a0acd3a548ee446a1a35df44d" FOREIGN KEY ("fromObjectMetadataId") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_0f781f589e5a527b8f3d3a4b824" FOREIGN KEY ("toObjectMetadataId") REFERENCES "metadata"."object_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_3deb257254145a3bdde9575e7d6" FOREIGN KEY ("fromFieldMetadataId") REFERENCES "metadata"."field_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_9dea8f90d04edbbf9c541a95c3b" FOREIGN KEY ("toFieldMetadataId") REFERENCES "metadata"."field_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_9dea8f90d04edbbf9c541a95c3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_3deb257254145a3bdde9575e7d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_0f781f589e5a527b8f3d3a4b824"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_f2a0acd3a548ee446a1a35df44d"`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."relationMetadata"`);
  }
}
