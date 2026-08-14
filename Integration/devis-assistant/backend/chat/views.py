from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ChatMessageRequestSerializer, ConversationSerializer
from .services.openai_client import build_chat_response


class ChatMessageAPIView(APIView):
    """POST /api/chat/messages/ — endpoint public utilisé par le widget de chat du site."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ChatMessageRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        conversation = self._resolve_conversation(data)
        user_message = Message.objects.create(
            conversation=conversation,
            sender=Message.Sender.USER,
            content=data["message"],
        )

        recent_messages = list(
            conversation.messages.order_by("-timestamp")[: settings.CHAT_CONTEXT_MESSAGE_LIMIT]
        )
        recent_messages.reverse()

        assistant_content = build_chat_response(recent_messages)
        assistant_message = Message.objects.create(
            conversation=conversation,
            sender=Message.Sender.BOT,
            content=assistant_content,
        )

        return Response(
            {
                "conversation": ConversationSerializer(conversation).data,
                "user_message": {
                    "id": user_message.id,
                    "sender": user_message.sender,
                    "content": user_message.content,
                    "timestamp": user_message.timestamp,
                },
                "assistant_message": {
                    "id": assistant_message.id,
                    "sender": assistant_message.sender,
                    "content": assistant_message.content,
                    "timestamp": assistant_message.timestamp,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    def _resolve_conversation(self, data):
        conversation_id = data.get("conversation_id")
        if conversation_id:
            return get_object_or_404(Conversation, pk=conversation_id)

        session_id = data.get("session_id")
        if session_id:
            conversation, _ = Conversation.objects.get_or_create(
                session_id=session_id,
                defaults={"user_id": data.get("user_id") or None},
            )
            return conversation

        return Conversation.objects.create(user_id=data.get("user_id") or None)


class ConversationDetailAPIView(APIView):
    """Accès admin (authentification requise) à l'historique d'une conversation."""

    def get(self, request, pk):
        conversation = get_object_or_404(Conversation.objects.prefetch_related("messages"), pk=pk)
        return Response(ConversationSerializer(conversation).data)


class ConversationBySessionAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, session_id):
        conversation = get_object_or_404(
            Conversation.objects.prefetch_related("messages"),
            session_id=session_id,
        )
        return Response(ConversationSerializer(conversation).data)
