<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Utilisateur admin principal
        $admin = new User();
        $admin->setEmail('glessmer@live.fr');
        $admin->setName('Guillaume Lessmer');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
        $manager->persist($admin);

        // Utilisateur admin de test
        $adminTest = new User();
        $adminTest->setEmail('admin@family.com');
        $adminTest->setName('Admin Famille');
        $adminTest->setRoles(['ROLE_ADMIN']);
        $adminTest->setPassword($this->passwordHasher->hashPassword($adminTest, 'admin123'));
        $manager->persist($adminTest);

        // Utilisateur normal de test
        $user = new User();
        $user->setEmail('user@family.com');
        $user->setName('Utilisateur Famille');
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($this->passwordHasher->hashPassword($user, 'user123'));
        $manager->persist($user);

        // Utilisateur demo
        $demo = new User();
        $demo->setEmail('demo@mailmanager.com');
        $demo->setName('Compte Démo');
        $demo->setRoles(['ROLE_USER']);
        $demo->setPassword($this->passwordHasher->hashPassword($demo, 'demo123'));
        $manager->persist($demo);

        $manager->flush();

        // Références pour les autres fixtures
        $this->addReference('admin-user', $admin);
        $this->addReference('admin-test', $adminTest);
        $this->addReference('normal-user', $user);
        $this->addReference('demo-user', $demo);
    }
}