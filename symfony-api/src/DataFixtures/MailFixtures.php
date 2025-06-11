<?php

namespace App\DataFixtures;

use App\Entity\Mail;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class MailFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $adminUser = $this->getReference('admin-user');
        $normalUser = $this->getReference('normal-user');

        // Courriers pour l'admin principal (glessmer@live.fr)
        $this->createMailsForUser($manager, $adminUser, [
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
                'sender' => 'Mairie de Paris',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Convocation élections municipales',
                'status' => 'completed',
                'receivedDate' => new \DateTime('-10 days'),
                'notes' => 'Bureau de vote: École primaire Jean Jaurès'
            ],
            [
                'type' => 'bank',
                'sender' => 'Crédit Agricole',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Relevé de compte décembre 2023',
                'status' => 'in_progress',
                'receivedDate' => new \DateTime('-15 days'),
                'notes' => 'Vérification des opérations en cours'
            ],
            [
                'type' => 'insurance',
                'sender' => 'Allianz',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Renouvellement assurance auto',
                'status' => 'pending',
                'receivedDate' => new \DateTime('-3 days'),
                'dueDate' => new \DateTime('+15 days'),
                'actionRequired' => 'Signature et retour du contrat',
                'notes' => 'Nouvelle prime: 850€/an'
            ],
            [
                'type' => 'utility',
                'sender' => 'Veolia',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Facture eau Q4 2023',
                'status' => 'completed',
                'receivedDate' => new \DateTime('-20 days'),
                'notes' => 'Payé par prélèvement automatique'
            ],
            [
                'type' => 'medical',
                'sender' => 'Dr. Martin',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Résultats analyses sanguines',
                'status' => 'archived',
                'receivedDate' => new \DateTime('-30 days'),
                'notes' => 'Tout est normal, prochain contrôle dans 6 mois'
            ],
            [
                'type' => 'legal',
                'sender' => 'Notaire Dupont',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Acte de vente appartement',
                'status' => 'completed',
                'receivedDate' => new \DateTime('-45 days'),
                'notes' => 'Transaction finalisée, clés remises'
            ],
            [
                'type' => 'invoice',
                'sender' => 'Orange',
                'recipient' => 'Guillaume Lessmer',
                'subject' => 'Facture mobile janvier 2024',
                'status' => 'pending',
                'receivedDate' => new \DateTime('-2 days'),
                'dueDate' => new \DateTime('+28 days'),
                'actionRequired' => 'Vérifier consommation data',
                'notes' => 'Dépassement forfait data ce mois-ci'
            ]
        ]);

        // Courriers pour l'utilisateur normal
        $this->createMailsForUser($manager, $normalUser, [
            [
                'type' => 'invoice',
                'sender' => 'GRDF',
                'recipient' => 'Famille Martin',
                'subject' => 'Facture gaz janvier 2024',
                'status' => 'pending',
                'receivedDate' => new \DateTime('-7 days'),
                'dueDate' => new \DateTime('+23 days'),
                'actionRequired' => 'Paiement en ligne',
                'notes' => 'Montant: 89€'
            ],
            [
                'type' => 'administrative',
                'sender' => 'CAF',
                'recipient' => 'Famille Martin',
                'subject' => 'Révision droits allocations',
                'status' => 'in_progress',
                'receivedDate' => new \DateTime('-12 days'),
                'dueDate' => new \DateTime('+18 days'),
                'actionRequired' => 'Fournir justificatifs revenus',
                'notes' => 'Documents à envoyer avant le 15/02'
            ]
        ]);

        $manager->flush();
    }

    private function createMailsForUser(ObjectManager $manager, $user, array $mailsData): void
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

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }
}