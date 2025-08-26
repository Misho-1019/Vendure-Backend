import {MigrationInterface, QueryRunner} from "typeorm";

export class SiteSettings1756140360331 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "site_settings" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "key" character varying NOT NULL DEFAULT 'default', "title" character varying NOT NULL DEFAULT 'My Store', "primaryColor" character varying NOT NULL DEFAULT '#3b82f6', "id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "UQ_e71167433328a5afb90dda43da0" UNIQUE ("key"), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "site_settings"`, undefined);
   }

}
