from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("id", "sender", "content", "timestamp")
        read_only_fields = fields


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ("id", "session_id", "user_id", "created_at", "updated_at", "messages")
        read_only_fields = fields


class ChatMessageRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000, trim_whitespace=True)
    conversation_id = serializers.IntegerField(required=False)
    session_id = serializers.CharField(max_length=128, required=False, allow_blank=True)
    user_id = serializers.CharField(max_length=128, required=False, allow_blank=True)
