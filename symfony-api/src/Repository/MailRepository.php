<?php

namespace App\Repository;

use App\Entity\Mail;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Mail>
 */
class MailRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Mail::class);
    }

    public function findByUserWithFilters(User $user, array $filters = [], int $page = 1, int $limit = 20): array
    {
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('m.attachments', 'a')
            ->addSelect('a')
            ->where('m.createdBy = :user')
            ->setParameter('user', $user)
            ->orderBy('m.receivedDate', 'DESC');

        $this->applyFilters($qb, $filters);

        $qb->setFirstResult(($page - 1) * $limit)
           ->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    public function countByUserWithFilters(User $user, array $filters = []): int
    {
        $qb = $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.createdBy = :user')
            ->setParameter('user', $user);

        $this->applyFilters($qb, $filters);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findOverdueByUser(User $user): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.createdBy = :user')
            ->andWhere('m.dueDate < :now')
            ->andWhere('m.status != :completed')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->setParameter('completed', Mail::STATUS_COMPLETED)
            ->orderBy('m.dueDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function getStatsByUser(User $user): array
    {
        $qb = $this->createQueryBuilder('m')
            ->select('m.status, COUNT(m.id) as count')
            ->where('m.createdBy = :user')
            ->setParameter('user', $user)
            ->groupBy('m.status');

        $results = $qb->getQuery()->getResult();
        
        $stats = [
            'total' => 0,
            'pending' => 0,
            'in_progress' => 0,
            'completed' => 0,
            'archived' => 0,
            'overdue' => 0
        ];

        foreach ($results as $result) {
            $stats[$result['status']] = (int) $result['count'];
            $stats['total'] += (int) $result['count'];
        }

        // Count overdue
        $overdueCount = $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.createdBy = :user')
            ->andWhere('m.dueDate < :now')
            ->andWhere('m.status != :completed')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->setParameter('completed', Mail::STATUS_COMPLETED)
            ->getQuery()
            ->getSingleScalarResult();

        $stats['overdue'] = (int) $overdueCount;

        return $stats;
    }

    private function applyFilters(QueryBuilder $qb, array $filters): void
    {
        if (!empty($filters['type'])) {
            $qb->andWhere('m.type = :type')
               ->setParameter('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $qb->andWhere('m.status = :status')
               ->setParameter('status', $filters['status']);
        }

        if (!empty($filters['sender'])) {
            $qb->andWhere('m.sender LIKE :sender')
               ->setParameter('sender', '%' . $filters['sender'] . '%');
        }

        if (!empty($filters['recipient'])) {
            $qb->andWhere('m.recipient LIKE :recipient')
               ->setParameter('recipient', '%' . $filters['recipient'] . '%');
        }

        if (!empty($filters['search'])) {
            $qb->andWhere('(m.subject LIKE :search OR m.sender LIKE :search OR m.recipient LIKE :search OR m.notes LIKE :search)')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['dateFrom'])) {
            $qb->andWhere('m.receivedDate >= :dateFrom')
               ->setParameter('dateFrom', new \DateTime($filters['dateFrom']));
        }

        if (!empty($filters['dateTo'])) {
            $qb->andWhere('m.receivedDate <= :dateTo')
               ->setParameter('dateTo', new \DateTime($filters['dateTo']));
        }
    }
}