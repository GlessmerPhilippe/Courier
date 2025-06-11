<?php

namespace App\Entity;

use App\Repository\MailRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MailRepository::class)]
class Mail
{
    public const TYPE_INVOICE = 'invoice';
    public const TYPE_LETTER = 'letter';
    public const TYPE_ADMINISTRATIVE = 'administrative';
    public const TYPE_BANK = 'bank';
    public const TYPE_INSURANCE = 'insurance';
    public const TYPE_UTILITY = 'utility';
    public const TYPE_MEDICAL = 'medical';
    public const TYPE_LEGAL = 'legal';
    public const TYPE_OTHER = 'other';

    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_ARCHIVED = 'archived';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['mail:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: [
        self::TYPE_INVOICE,
        self::TYPE_LETTER,
        self::TYPE_ADMINISTRATIVE,
        self::TYPE_BANK,
        self::TYPE_INSURANCE,
        self::TYPE_UTILITY,
        self::TYPE_MEDICAL,
        self::TYPE_LEGAL,
        self::TYPE_OTHER
    ])]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $type = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $sender = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $recipient = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Assert\NotNull]
    #[Groups(['mail:read', 'mail:write'])]
    private ?\DateTimeInterface $receivedDate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['mail:read', 'mail:write'])]
    private ?\DateTimeInterface $sentDate = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: [
        self::STATUS_PENDING,
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
        self::STATUS_ARCHIVED
    ])]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $status = null;

    #[ORM\Column(length: 500)]
    #[Assert\NotBlank]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $subject = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $notes = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['mail:read', 'mail:write'])]
    private ?\DateTimeInterface $dueDate = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['mail:read', 'mail:write'])]
    private ?string $actionRequired = null;

    #[ORM\Column]
    #[Groups(['mail:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['mail:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'mails')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['mail:read'])]
    private ?User $createdBy = null;

    #[ORM\OneToMany(mappedBy: 'mail', targetEntity: Attachment::class, orphanRemoval: true, cascade: ['persist', 'remove'])]
    #[Groups(['mail:read', 'mail:write'])]
    private Collection $attachments;

    public function __construct()
    {
        $this->attachments = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getSender(): ?string
    {
        return $this->sender;
    }

    public function setSender(string $sender): static
    {
        $this->sender = $sender;
        return $this;
    }

    public function getRecipient(): ?string
    {
        return $this->recipient;
    }

    public function setRecipient(string $recipient): static
    {
        $this->recipient = $recipient;
        return $this;
    }

    public function getReceivedDate(): ?\DateTimeInterface
    {
        return $this->receivedDate;
    }

    public function setReceivedDate(\DateTimeInterface $receivedDate): static
    {
        $this->receivedDate = $receivedDate;
        return $this;
    }

    public function getSentDate(): ?\DateTimeInterface
    {
        return $this->sentDate;
    }

    public function setSentDate(?\DateTimeInterface $sentDate): static
    {
        $this->sentDate = $sentDate;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getSubject(): ?string
    {
        return $this->subject;
    }

    public function setSubject(string $subject): static
    {
        $this->subject = $subject;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getDueDate(): ?\DateTimeInterface
    {
        return $this->dueDate;
    }

    public function setDueDate(?\DateTimeInterface $dueDate): static
    {
        $this->dueDate = $dueDate;
        return $this;
    }

    public function getActionRequired(): ?string
    {
        return $this->actionRequired;
    }

    public function setActionRequired(?string $actionRequired): static
    {
        $this->actionRequired = $actionRequired;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;
        return $this;
    }

    /**
     * @return Collection<int, Attachment>
     */
    public function getAttachments(): Collection
    {
        return $this->attachments;
    }

    public function addAttachment(Attachment $attachment): static
    {
        if (!$this->attachments->contains($attachment)) {
            $this->attachments->add($attachment);
            $attachment->setMail($this);
        }
        return $this;
    }

    public function removeAttachment(Attachment $attachment): static
    {
        if ($this->attachments->removeElement($attachment)) {
            if ($attachment->getMail() === $this) {
                $attachment->setMail(null);
            }
        }
        return $this;
    }

    #[ORM\PreUpdate]
    public function preUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}