import {MigrationInterface, QueryRunner} from "typeorm";

export class SiteSettingsAccountHeading1756298957062 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "accountHeading" character varying NOT NULL DEFAULT 'My Account'`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "accountHeading"`, undefined);
   }

}
