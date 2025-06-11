<?php

namespace App\Controller;

use App\Entity\Attachment;
use App\Entity\Mail;
use App\Repository\AttachmentRepository;
use App\Repository\MailRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;
use OpenApi\Attributes as OA;

#[Route('/api')]
#[OA\Tag(name: 'Attachments')]
class AttachmentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SluggerInterface $slugger,
        private MailRepository $mailRepository,
        private AttachmentRepository $attachmentRepository,
        private string $uploadDirectory
    ) {}

    #[Route('/mails/{mailId}/attachments', name: 'api_attachments_upload', methods: ['POST'])]
    #[OA\Post(
        path: '/api/mails/{mailId}/attachments',
        summary: 'Upload attachment to a mail',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'mailId', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: [
                        'file' => new OA\Property(property: 'file', type: 'string', format: 'binary')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Attachment uploaded successfully'),
            new OA\Response(response: 400, description: 'Invalid file'),
            new OA\Response(response: 404, description: 'Mail not found')
        ]
    )]
    public function upload(int $mailId, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $mail = $this->mailRepository->findOneBy(['id' => $mailId, 'createdBy' => $user]);

        if (!$mail) {
            return $this->json(['error' => 'Mail not found'], 404);
        }

        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile) {
            return $this->json(['error' => 'No file uploaded'], 400);
        }

        // Validate file
        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($uploadedFile->getSize() > $maxSize) {
            return $this->json(['error' => 'File too large (max 10MB)'], 400);
        }

        $allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
            return $this->json(['error' => 'File type not allowed'], 400);
        }

        $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $uploadedFile->guessExtension();

        try {
            $uploadedFile->move($this->uploadDirectory, $newFilename);
        } catch (FileException $e) {
            return $this->json(['error' => 'Failed to upload file'], 500);
        }

        $attachment = new Attachment();
        $attachment->setName($uploadedFile->getClientOriginalName());
        $attachment->setFilename($newFilename);
        $attachment->setMimeType($uploadedFile->getMimeType());
        $attachment->setSize($uploadedFile->getSize());
        $attachment->setMail($mail);

        $this->entityManager->persist($attachment);
        $this->entityManager->flush();

        return $this->json([
            'id' => $attachment->getId(),
            'name' => $attachment->getName(),
            'url' => $attachment->getUrl(),
            'size' => $attachment->getSize(),
            'mimeType' => $attachment->getMimeType(),
            'uploadedAt' => $attachment->getUploadedAt()->format('c')
        ], 201);
    }

    #[Route('/attachments/{id}', name: 'api_attachments_download', methods: ['GET'])]
    #[OA\Get(
        path: '/api/attachments/{id}',
        summary: 'Download an attachment',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'File download'),
            new OA\Response(response: 404, description: 'Attachment not found')
        ]
    )]
    public function download(int $id): Response
    {
        $user = $this->getUser();
        $attachment = $this->attachmentRepository->createQueryBuilder('a')
            ->join('a.mail', 'm')
            ->where('a.id = :id')
            ->andWhere('m.createdBy = :user')
            ->setParameter('id', $id)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$attachment) {
            return $this->json(['error' => 'Attachment not found'], 404);
        }

        $filePath = $this->uploadDirectory . '/' . $attachment->getFilename();

        if (!file_exists($filePath)) {
            return $this->json(['error' => 'File not found on disk'], 404);
        }

        return new BinaryFileResponse(
            $filePath,
            200,
            [
                'Content-Type' => $attachment->getMimeType(),
                'Content-Disposition' => 'attachment; filename="' . $attachment->getName() . '"'
            ]
        );
    }

    #[Route('/attachments/{id}', name: 'api_attachments_delete', methods: ['DELETE'])]
    #[OA\Delete(
        path: '/api/attachments/{id}',
        summary: 'Delete an attachment',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Attachment deleted successfully'),
            new OA\Response(response: 404, description: 'Attachment not found')
        ]
    )]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        $attachment = $this->attachmentRepository->createQueryBuilder('a')
            ->join('a.mail', 'm')
            ->where('a.id = :id')
            ->andWhere('m.createdBy = :user')
            ->setParameter('id', $id)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$attachment) {
            return $this->json(['error' => 'Attachment not found'], 404);
        }

        // Delete file from disk
        $filePath = $this->uploadDirectory . '/' . $attachment->getFilename();
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $this->entityManager->remove($attachment);
        $this->entityManager->flush();

        return $this->json(null, 204);
    }
}