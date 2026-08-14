import uuid

from django.db import models


class Conversation(models.Model):
    session_id = models.CharField(max_length=128, unique=True, default=uuid.uuid4)
    user_id = models.CharField(max_length=128, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self):
        return f"Conversation {self.id} ({self.session_id})"


class Message(models.Model):
    class Sender(models.TextChoices):
        USER = "user", "User"
        BOT = "bot", "Bot"

    conversation = models.ForeignKey(Conversation, related_name="messages", on_delete=models.CASCADE)
    sender = models.CharField(max_length=8, choices=Sender.choices)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("timestamp",)
        indexes = [
            models.Index(fields=["conversation", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.sender}: {self.content[:40]}"
