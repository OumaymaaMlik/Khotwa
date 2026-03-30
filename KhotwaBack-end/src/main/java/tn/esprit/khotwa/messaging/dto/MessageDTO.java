package tn.esprit.khotwa.messaging.dto;

import tn.esprit.khotwa.messaging.entity.MessageStatus;
import tn.esprit.khotwa.messaging.entity.MessageType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private String subject;
    private String body;
    private Long senderId;
    private Long receiverId;
    private MessageType type;
    private MessageStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fileUrl;
    private boolean deletedForAll;
    private String deletedForUsers;
}
