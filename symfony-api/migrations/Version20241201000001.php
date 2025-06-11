<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241201000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial database schema for mail management';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE attachment (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, mail_id INTEGER NOT NULL, name VARCHAR(255) NOT NULL, filename VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL, size INTEGER NOT NULL, uploaded_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        , CONSTRAINT FK_795FD9BB63BD6D0 FOREIGN KEY (mail_id) REFERENCES mail (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_795FD9BB63BD6D0 ON attachment (mail_id)');
        $this->addSql('CREATE TABLE mail (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, created_by_id INTEGER NOT NULL, type VARCHAR(50) NOT NULL, sender VARCHAR(255) NOT NULL, recipient VARCHAR(255) NOT NULL, received_date DATETIME NOT NULL, sent_date DATETIME DEFAULT NULL, status VARCHAR(50) NOT NULL, subject VARCHAR(500) NOT NULL, notes CLOB DEFAULT NULL, due_date DATETIME DEFAULT NULL, action_required VARCHAR(500) DEFAULT NULL, created_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        , updated_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        , CONSTRAINT FK_5126AC48B03A8386 FOREIGN KEY (created_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_5126AC48B03A8386 ON mail (created_by_id)');
        $this->addSql('CREATE TABLE "user" (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles CLOB NOT NULL --(DC2Type:json)
        , password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL --(DC2Type:datetime_immutable)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON "user" (email)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE attachment');
        $this->addSql('DROP TABLE mail');
        $this->addSql('DROP TABLE "user"');
    }
}