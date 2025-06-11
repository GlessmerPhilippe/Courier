<?php

namespace App\Controller;

use App\Repository\MailRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[Route('/api/export')]
#[OA\Tag(name: 'Export')]
class ExportController extends AbstractController
{
    public function __construct(
        private MailRepository $mailRepository
    ) {}

    #[Route('/csv', name: 'api_export_csv', methods: ['GET'])]
    #[OA\Get(
        path: '/api/export/csv',
        summary: 'Export mails to CSV',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'type', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'dateFrom', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'dateTo', in: 'query', schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'CSV file',
                content: new OA\MediaType(mediaType: 'text/csv')
            )
        ]
    )]
    public function exportCsv(Request $request): Response
    {
        $user = $this->getUser();
        
        $filters = array_filter([
            'type' => $request->query->get('type'),
            'status' => $request->query->get('status'),
            'dateFrom' => $request->query->get('dateFrom'),
            'dateTo' => $request->query->get('dateTo'),
        ]);

        $mails = $this->mailRepository->findByUserWithFilters($user, $filters, 1, 10000);

        $csv = "Subject,Type,Sender,Recipient,Received Date,Status,Due Date,Action Required,Notes\n";
        
        foreach ($mails as $mail) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                str_replace('"', '""', $mail->getSubject()),
                $mail->getType(),
                str_replace('"', '""', $mail->getSender()),
                str_replace('"', '""', $mail->getRecipient()),
                $mail->getReceivedDate()->format('Y-m-d'),
                $mail->getStatus(),
                $mail->getDueDate() ? $mail->getDueDate()->format('Y-m-d') : '',
                str_replace('"', '""', $mail->getActionRequired() ?? ''),
                str_replace('"', '""', $mail->getNotes() ?? '')
            );
        }

        $response = new Response($csv);
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="mails-export-' . date('Y-m-d') . '.csv"');

        return $response;
    }

    #[Route('/pdf', name: 'api_export_pdf', methods: ['GET'])]
    #[OA\Get(
        path: '/api/export/pdf',
        summary: 'Export mails to PDF',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'type', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'dateFrom', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'dateTo', in: 'query', schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'PDF file',
                content: new OA\MediaType(mediaType: 'application/pdf')
            )
        ]
    )]
    public function exportPdf(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        $filters = array_filter([
            'type' => $request->query->get('type'),
            'status' => $request->query->get('status'),
            'dateFrom' => $request->query->get('dateFrom'),
            'dateTo' => $request->query->get('dateTo'),
        ]);

        $mails = $this->mailRepository->findByUserWithFilters($user, $filters, 1, 10000);
        $stats = $this->mailRepository->getStatsByUser($user);

        // For now, return JSON data that can be used by frontend to generate PDF
        // In a real implementation, you would use a PDF library like TCPDF or DomPDF
        return $this->json([
            'mails' => array_map(function($mail) {
                return [
                    'subject' => $mail->getSubject(),
                    'type' => $mail->getType(),
                    'sender' => $mail->getSender(),
                    'recipient' => $mail->getRecipient(),
                    'receivedDate' => $mail->getReceivedDate()->format('Y-m-d'),
                    'status' => $mail->getStatus(),
                    'dueDate' => $mail->getDueDate() ? $mail->getDueDate()->format('Y-m-d') : null,
                    'actionRequired' => $mail->getActionRequired(),
                    'notes' => $mail->getNotes()
                ];
            }, $mails),
            'stats' => $stats,
            'exportDate' => date('Y-m-d H:i:s'),
            'user' => $user->getName()
        ]);
    }
}