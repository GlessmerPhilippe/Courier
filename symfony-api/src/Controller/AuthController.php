<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use OpenApi\Attributes as OA;

#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    #[OA\Post(
        path: '/api/register',
        summary: 'Register a new user',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                properties: [
                    'email' => new OA\Property(property: 'email', type: 'string', format: 'email'),
                    'password' => new OA\Property(property: 'password', type: 'string'),
                    'name' => new OA\Property(property: 'name', type: 'string')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'User created successfully',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        'message' => new OA\Property(property: 'message', type: 'string'),
                        'user' => new OA\Property(property: 'user', type: 'object')
                    ]
                )
            )
        ]
    )]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'], $data['name'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }

        // Check if user already exists
        $existingUser = $this->entityManager->getRepository(User::class)
            ->findOneBy(['email' => $data['email']]);

        if ($existingUser) {
            return $this->json(['error' => 'User already exists'], 409);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));

        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'User created successfully',
            'user' => $this->serializer->serialize($user, 'json', ['groups' => ['user:read']])
        ], 201);
    }

    #[Route('/profile', name: 'api_profile', methods: ['GET'])]
    #[OA\Get(
        path: '/api/profile',
        summary: 'Get current user profile',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profile',
                content: new OA\JsonContent(type: 'object')
            )
        ]
    )]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();
        
        return $this->json(
            $this->serializer->serialize($user, 'json', ['groups' => ['user:read']]),
            200,
            [],
            true
        );
    }
}