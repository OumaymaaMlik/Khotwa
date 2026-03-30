package tn.esprit.khotwa.messaging.dto;

import tn.esprit.khotwa.messaging.entity.Message;
import tn.esprit.khotwa.messaging.entity.Notification;

public class MessageMapper {

    public static MessageDTO toMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSubject(message.getSubject());
        dto.setBody(message.getBody());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setType(message.getType());
        dto.setStatus(message.getStatus());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        dto.setFileUrl(message.getFileUrl());
        dto.setDeletedForAll(message.isDeletedForAll());
        dto.setDeletedForUsers(message.getDeletedForUsers());
        return dto;
    }

    public static NotificationDTO toNotificationDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setRecipientId(notification.getRecipientId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setType(notification.getType());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
