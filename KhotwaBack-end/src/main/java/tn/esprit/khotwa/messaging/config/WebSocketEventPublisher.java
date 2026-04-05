package tn.esprit.khotwa.messaging.config;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import tn.esprit.khotwa.messaging.dto.MessageDTO;
import tn.esprit.khotwa.messaging.dto.NotificationDTO;

@Component
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishNewMessage(MessageDTO message) {
        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getReceiverId(),
                message
        );
    }

    public void publishMessageUpdate(MessageDTO message) {
        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getReceiverId(),
                message
        );
        messagingTemplate.convertAndSend(
                "/topic/messages/" + message.getSenderId(),
                message
        );
    }

    public void publishNotification(NotificationDTO notification) {
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + notification.getRecipientId(),
                notification
        );
    }

    public void publishTyping(Long senderId, Long receiverId, boolean isTyping) {
        messagingTemplate.convertAndSend(
                "/topic/typing/" + receiverId,
                new TypingEvent(senderId, isTyping)
        );
    }

    public void publishOnlineStatus(Long userId, boolean isOnline) {
        System.out.println("Publishing online status for user " + userId + " isOnline: " + isOnline);
        messagingTemplate.convertAndSend(
                "/topic/status",
                new StatusEvent(userId, isOnline)
        );
    }

    public record TypingEvent(Long userId, boolean typing) {}
    public record StatusEvent(Long userId, boolean online) {}
}