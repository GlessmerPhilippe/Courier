<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\MailRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use OpenApi\Attributes as OA;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
#[OA\Tag(name: 'Admin')]
class AdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private UserRepository $userRepository,
        private MailRepository $mailRepository
    ) {}

    #[Route('/users', name: 'api_admin_users_index', methods: ['GET'])]
    #[OA\Get(
        path: '/api/admin/users',
        summary: 'Get all users (Admin only)',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'List of users')
        ]
    )]
    public function getUsers(): JsonResponse
    {
        $users = $this->userRepository->findAll();
        
        $usersData = array_map(function($user) {
            $mailCount = $this->mailRepository->count(['createdBy' => $user]);
            
            return [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()->format('c'),
                'mailCount' => $mailCount,
                'isAdmin' => in_array('ROLE_ADMIN', $user->getRoles())
            ];
        }, $users);

        return $this->json($usersData);
    }

    #[Route('/users', name: 'api_admin_users_create', methods: ['POST'])]
    #[OA\Post(
        path: '/api/admin/users',
        summary: 'Create a new user (Admin only)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                properties: [
                    'email' => new OA\Property(property: 'email', type: 'string', format: 'email'),
                    'password' => new OA\Property(property: 'password', type: 'string'),
                    'name' => new OA\Property(property: 'name', type: 'string'),
                    'roles' => new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string'))
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'User created successfully'),
            new OA\Response(response: 400, description: 'Validation errors')
        ]
    )]
    public function createUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'], $data['name'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }

        // Vérifier si l'utilisateur existe déjà
        $existingUser = $this->userRepository->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return $this->json(['error' => 'User already exists'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        
        // Gérer les rôles
        $roles = $data['roles'] ?? ['ROLE_USER'];
        if (!in_array('ROLE_USER', $roles)) {
            $roles[] = 'ROLE_USER';
        }
        $user->setRoles($roles);

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()->format('c')
            ]
        ], 201);
    }

    #[Route('/users/{id}', name: 'api_admin_users_update', methods: ['PUT'])]
    #[OA\Put(
        path: '/api/admin/users/{id}',
        summary: 'Update a user (Admin only)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'User updated successfully'),
            new OA\Response(response: 404, description: 'User not found')
        ]
    )]
    public function updateUser(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['name'])) {
            $user->setName($data['name']);
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        }

        if (isset($data['roles'])) {
            $roles = $data['roles'];
            if (!in_array('ROLE_USER', $roles)) {
                $roles[] = 'ROLE_USER';
            }
            $user->setRoles($roles);
        }

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'name' => $user->getName(),
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()->format('c')
            ]
        ]);
    }

    #[Route('/users/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    #[OA\Delete(
        path: '/api/admin/users/{id}',
        summary: 'Delete a user (Admin only)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'User deleted successfully'),
            new OA\Response(response: 404, description: 'User not found')
        ]
    )]
    public function deleteUser(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // Empêcher la suppression de son propre compte
        if ($user === $this->getUser()) {
            return $this->json(['error' => 'Cannot delete your own account'], 400);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json(null, 204);
    }

    #[Route('/stats', name: 'api_admin_stats', methods: ['GET'])]
    #[OA\Get(
        path: '/api/admin/stats',
        summary: 'Get global statistics (Admin only)',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Global statistics')
        ]
    )]
    public function getGlobalStats(): JsonResponse
    {
        $totalUsers = $this->userRepository->count([]);
        $totalMails = $this->mailRepository->count([]);
        $adminUsers = $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.roles LIKE :role')
            ->setParameter('role', '%ROLE_ADMIN%')
            ->getQuery()
            ->getSingleScalarResult();

        $mailsByStatus = $this->mailRepository->createQueryBuilder('m')
            ->select('m.status, COUNT(m.id) as count')
            ->groupBy('m.status')
            ->getQuery()
            ->getResult();

        $mailsByType = $this->mailRepository->createQueryBuilder('m')
            ->select('m.type, COUNT(m.id) as count')
            ->groupBy('m.type')
            ->getQuery()
            ->getResult();

        return $this->json([
            'users' => [
                'total' => $totalUsers,
                'admins' => $adminUsers,
                'regular' => $totalUsers - $adminUsers
            ],
            'mails' => [
                'total' => $totalMails,
                'byStatus' => $mailsByStatus,
                'byType' => $mailsByType
            ]
        ]);
    }
}