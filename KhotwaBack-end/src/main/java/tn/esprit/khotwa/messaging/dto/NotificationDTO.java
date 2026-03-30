package tn.esprit.khotwa.messaging.dto;

import tn.esprit.khotwa.messaging.entity.NotificationType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long recipientId;
    private String message;
    private boolean isRead;
    private NotificationType type;
    private LocalDateTime createdAt;
}