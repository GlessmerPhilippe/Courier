<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Mail;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Créer l'utilisateur principal Guillaume
        $guillaume = new User();
        $guillaume->setEmail('glessmer@live.fr');
        $guillaume->setName('Guillaume Lessmer');
        $guillaume->setRoles(['ROLE_ADMIN']);
        $guillaume->setPassword($this->passwordHasher->hashPassword($guillaume, 'admin123'));
        $manager->persist($guillaume);

        // Créer l'utilisateur admin de test
        $admin = new User();
        $admin->setEmail('admin@family.com');
        $admin->setName('Admin Famille');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
        $manager->persist($admin);

        // Créer l'utilisateur normal
        $user = new User();
        $user->setEmail('user@family.com');
        $user->setName('Utilisateur Test');
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($this->passwordHasher->hashPassword($user, 'user123'));
        $manager->persist($user);

        // Sauvegarder les utilisateurs d'abord
        $manager->flush();

        // Créer des courriers pour Guillaume
        $this->createMailsForUser($manager, $guillaume, [
            [
                'type' => 'invoice',
                'sender' => 'EDF',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Facture électricité janvier 2024',
                'status' => 'pending',
                'receivedDate' => new \DateTime('-5 days'),
                'dueDate' => new \DateTime('+25 days'),
                'actionRequired' => 'Paiement requis avant le 30/01',
                'notes' => 'Montant: 145€ - Prélèvement automatique configuré'
            ],
            [
                'type' => 'administrative',
                'sender' => 'Mairie',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Convocation élections',
                'status' => 'completed',
                'receivedDate' => new \DateTime('-10 days'),
                'notes' => 'Bureau de vote: École Jean Jaurès'
            ],
            [
                'type' => 'bank',
                'sender' => 'Crédit Agricole',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Relevé de compte décembre',
                'status' => 'in_progress',
                'receivedDate' => new \DateTime('-15 days'),
                'notes' => 'Vérification en cours'
            ],
            [
                'type' => 'insurance',
                'sender' => 'Allianz',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Renouvellement assurance auto',
                'status' => 'pending',
                'receivedDate' => new \DateTime('-3 days'),
                'dueDate' => new \DateTime('+15 days'),
                'actionRequired' => 'Signature du contrat',
                'notes' => 'Nouvelle prime: 850€/an'
            ]
        ]);

        // Créer des courriers pour l'admin test
        $this->createMailsForUser($manager, $admin, [
            [
                'type' => 'utility',
                'sender' => 'Veolia',
                'recipient' => 'Admin Famille',
                'subject' => 'Facture eau Q4 2023',
                'status' => 'completed',
                'receivedDate' => new \DateTime('-20 days'),
                'notes' => 'Payé par prélèvement'
            ]
        ]);

        $manager->flush();
    }

    private function createMailsForUser(ObjectManager $manager, User $user, array $mailsData): void
    {
        foreach ($mailsData as $data) {
            $mail = new Mail();
            $mail->setType($data['type']);
            $mail->setSender($data['sender']);
            $mail->setRecipient($data['recipient']);
            $mail->setSubject($data['subject']);
            $mail->setStatus($data['status']);
            $mail->setReceivedDate($data['receivedDate']);
            $mail->setCreatedBy($user);
            
            if (isset($data['sentDate'])) {
                $mail->setSentDate($data['sentDate']);
            }
            
            if (isset($data['dueDate'])) {
                $mail->setDueDate($data['dueDate']);
            }
            
            if (isset($data['actionRequired'])) {
                $mail->setActionRequired($data['actionRequired']);
            }
            
            if (isset($data['notes'])) {
                $mail->setNotes($data['notes']);
            }

            $manager->persist($mail);
        }
    }
}