from django.urls import path

from .views import ChatMessageAPIView, ConversationBySessionAPIView, ConversationDetailAPIView

urlpatterns = [
    path("messages/", ChatMessageAPIView.as_view(), name="chat-message"),
    path("conversations/session/<str:session_id>/", ConversationBySessionAPIView.as_view(), name="conversation-by-session"),
    path("conversations/<int:pk>/", ConversationDetailAPIView.as_view(), name="conversation-detail"),
]
