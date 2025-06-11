<?php

namespace App\Controller;

use App\Entity\Mail;
use App\Repository\MailRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use OpenApi\Attributes as OA;

#[Route('/api/mails')]
#[OA\Tag(name: 'Mails')]
class MailController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private MailRepository $mailRepository
    ) {}

    #[Route('/stats', name: 'api_mails_stats', methods: ['GET'])]
    #[OA\Get(
        path: '/api/mails/stats',
        summary: 'Get mail statistics for current user',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Mail statistics',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        'total' => new OA\Property(property: 'total', type: 'integer'),
                        'pending' => new OA\Property(property: 'pending', type: 'integer'),
                        'in_progress' => new OA\Property(property: 'in_progress', type: 'integer'),
                        'completed' => new OA\Property(property: 'completed', type: 'integer'),
                        'archived' => new OA\Property(property: 'archived', type: 'integer'),
                        'overdue' => new OA\Property(property: 'overdue', type: 'integer')
                    ]
                )
            )
        ]
    )]
    public function stats(): JsonResponse
    {
        $user = $this->getUser();
        $stats = $this->mailRepository->getStatsByUser($user);

        return $this->json($stats);
    }

    #[Route('/overdue', name: 'api_mails_overdue', methods: ['GET'])]
    #[OA\Get(
        path: '/api/mails/overdue',
        summary: 'Get overdue mails for current user',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'List of overdue mails')
        ]
    )]
    public function overdue(): JsonResponse
    {
        $user = $this->getUser();
        $overdueMails = $this->mailRepository->findOverdueByUser($user);

        return $this->json(
            json_decode($this->serializer->serialize($overdueMails, 'json', ['groups' => ['mail:read']]))
        );
    }

    #[Route('', name: 'api_mails_index', methods: ['GET'])]
    #[OA\Get(
        path: '/api/mails',
        summary: 'Get all mails for current user',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer', default: 20)),
            new OA\Parameter(name: 'type', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'search', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'sender', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'recipient', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'dateFrom', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'dateTo', in: 'query', schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of mails',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        'data' => new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                        'total' => new OA\Property(property: 'total', type: 'integer'),
                        'page' => new OA\Property(property: 'page', type: 'integer'),
                        'limit' => new OA\Property(property: 'limit', type: 'integer')
                    ]
                )
            )
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));

        $filters = array_filter([
            'type' => $request->query->get('type'),
            'status' => $request->query->get('status'),
            'search' => $request->query->get('search'),
            'sender' => $request->query->get('sender'),
            'recipient' => $request->query->get('recipient'),
            'dateFrom' => $request->query->get('dateFrom'),
            'dateTo' => $request->query->get('dateTo'),
        ]);

        $mails = $this->mailRepository->findByUserWithFilters($user, $filters, $page, $limit);
        $total = $this->mailRepository->countByUserWithFilters($user, $filters);

        return $this->json([
            'data' => json_decode($this->serializer->serialize($mails, 'json', ['groups' => ['mail:read']])),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]);
    }

    #[Route('', name: 'api_mails_create', methods: ['POST'])]
    #[OA\Post(
        path: '/api/mails',
        summary: 'Create a new mail',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                properties: [
                    'type' => new OA\Property(property: 'type', type: 'string'),
                    'sender' => new OA\Property(property: 'sender', type: 'string'),
                    'recipient' => new OA\Property(property: 'recipient', type: 'string'),
                    'receivedDate' => new OA\Property(property: 'receivedDate', type: 'string', format: 'date-time'),
                    'sentDate' => new OA\Property(property: 'sentDate', type: 'string', format: 'date-time'),
                    'status' => new OA\Property(property: 'status', type: 'string'),
                    'subject' => new OA\Property(property: 'subject', type: 'string'),
                    'notes' => new OA\Property(property: 'notes', type: 'string'),
                    'dueDate' => new OA\Property(property: 'dueDate', type: 'string', format: 'date-time'),
                    'actionRequired' => new OA\Property(property: 'actionRequired', type: 'string')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Mail created successfully'),
            new OA\Response(response: 400, description: 'Validation errors')
        ]
    )]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        $mail = new Mail();
        $mail->setCreatedBy($user);

        // Set basic fields
        if (isset($data['type'])) $mail->setType($data['type']);
        if (isset($data['sender'])) $mail->setSender($data['sender']);
        if (isset($data['recipient'])) $mail->setRecipient($data['recipient']);
        if (isset($data['status'])) $mail->setStatus($data['status']);
        if (isset($data['subject'])) $mail->setSubject($data['subject']);
        if (isset($data['notes'])) $mail->setNotes($data['notes']);
        if (isset($data['actionRequired'])) $mail->setActionRequired($data['actionRequired']);

        // Set dates
        if (isset($data['receivedDate'])) {
            $mail->setReceivedDate(new \DateTime($data['receivedDate']));
        }
        if (isset($data['sentDate'])) {
            $mail->setSentDate(new \DateTime($data['sentDate']));
        }
        if (isset($data['dueDate'])) {
            $mail->setDueDate(new \DateTime($data['dueDate']));
        }

        $errors = $this->validator->validate($mail);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        $this->entityManager->persist($mail);
        $this->entityManager->flush();

        return $this->json(
            json_decode($this->serializer->serialize($mail, 'json', ['groups' => ['mail:read']])),
            201
        );
    }

    #[Route('/{id}', name: 'api_mails_show', methods: ['GET'])]
    #[OA\Get(
        path: '/api/mails/{id}',
        summary: 'Get a specific mail',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Mail details'),
            new OA\Response(response: 404, description: 'Mail not found')
        ]
    )]
    public function show(string $id): JsonResponse
    {
        $user = $this->getUser();
        $mailId = (int) $id;
        $mail = $this->mailRepository->findOneBy(['id' => $mailId, 'createdBy' => $user]);

        if (!$mail) {
            return $this->json(['error' => 'Mail not found'], 404);
        }

        return $this->json(
            json_decode($this->serializer->serialize($mail, 'json', ['groups' => ['mail:read']]))
        );
    }

    #[Route('/{id}', name: 'api_mails_update', methods: ['PUT', 'PATCH'])]
    #[OA\Put(
        path: '/api/mails/{id}',
        summary: 'Update a mail',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Mail updated successfully'),
            new OA\Response(response: 404, description: 'Mail not found')
        ]
    )]
    public function update(string $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $mailId = (int) $id;
        $mail = $this->mailRepository->findOneBy(['id' => $mailId, 'createdBy' => $user]);

        if (!$mail) {
            return $this->json(['error' => 'Mail not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        // Update fields
        if (isset($data['type'])) $mail->setType($data['type']);
        if (isset($data['sender'])) $mail->setSender($data['sender']);
        if (isset($data['recipient'])) $mail->setRecipient($data['recipient']);
        if (isset($data['status'])) $mail->setStatus($data['status']);
        if (isset($data['subject'])) $mail->setSubject($data['subject']);
        if (isset($data['notes'])) $mail->setNotes($data['notes']);
        if (isset($data['actionRequired'])) $mail->setActionRequired($data['actionRequired']);

        // Update dates
        if (isset($data['receivedDate'])) {
            $mail->setReceivedDate(new \DateTime($data['receivedDate']));
        }
        if (isset($data['sentDate'])) {
            $mail->setSentDate($data['sentDate'] ? new \DateTime($data['sentDate']) : null);
        }
        if (isset($data['dueDate'])) {
            $mail->setDueDate($data['dueDate'] ? new \DateTime($data['dueDate']) : null);
        }

        $errors = $this->validator->validate($mail);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        $this->entityManager->flush();

        return $this->json(
            json_decode($this->serializer->serialize($mail, 'json', ['groups' => ['mail:read']]))
        );
    }

    #[Route('/{id}', name: 'api_mails_delete', methods: ['DELETE'])]
    #[OA\Delete(
        path: '/api/mails/{id}',
        summary: 'Delete a mail',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Mail deleted successfully'),
            new OA\Response(response: 404, description: 'Mail not found')
        ]
    )]
    public function delete(string $id): JsonResponse
    {
        $user = $this->getUser();
        $mailId = (int) $id;
        $mail = $this->mailRepository->findOneBy(['id' => $mailId, 'createdBy' => $user]);

        if (!$mail) {
            return $this->json(['error' => 'Mail not found'], 404);
        }

        $this->entityManager->remove($mail);
        $this->entityManager->flush();

        return $this->json(null, 204);
    }
}
