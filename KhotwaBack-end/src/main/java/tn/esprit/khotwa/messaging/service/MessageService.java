package tn.esprit.khotwa.messaging.service;

import tn.esprit.khotwa.messaging.config.WebSocketEventPublisher;
import tn.esprit.khotwa.messaging.dto.MessageDTO;
import tn.esprit.khotwa.messaging.dto.MessageMapper;
import tn.esprit.khotwa.messaging.dto.NotificationDTO;
import tn.esprit.khotwa.messaging.entity.Message;
import tn.esprit.khotwa.messaging.entity.MessageStatus;
import tn.esprit.khotwa.messaging.entity.MessageType;
import tn.esprit.khotwa.messaging.entity.NotificationType;
import tn.esprit.khotwa.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final NotificationService notificationService;
    private final WebSocketEventPublisher eventPublisher;

    public MessageDTO sendMessage(Message message) {
        Message saved = messageRepository.save(message);
        MessageDTO dto = MessageMapper.toMessageDTO(saved);
        eventPublisher.publishNewMessage(dto);
        NotificationDTO notif = notificationService.createNotification(
                saved.getReceiverId(),
                "You have a new message: " + saved.getSubject(),
                NotificationType.NEW_MESSAGE
        );
        eventPublisher.publishNotification(notif);
        return dto;
    }

    public Page<MessageDTO> getInbox(Long receiverId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return messageRepository.findByReceiverId(receiverId, pageable)
                .map(MessageMapper::toMessageDTO);
    }

    public Page<MessageDTO> getSent(Long senderId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return messageRepository.findBySenderId(senderId, pageable)
                .map(MessageMapper::toMessageDTO);
    }

    public List<MessageDTO> getInboxByType(Long receiverId, MessageType type) {
        return messageRepository.findByReceiverIdAndType(receiverId, type)
                .stream().map(MessageMapper::toMessageDTO).collect(Collectors.toList());
    }

    public Page<MessageDTO> getActiveInbox(Long receiverId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return messageRepository.findByReceiverIdAndStatusNot(receiverId, MessageStatus.ARCHIVED, pageable)
                .map(MessageMapper::toMessageDTO);
    }

    public MessageDTO updateStatus(Long messageId, MessageStatus newStatus) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        MessageStatus currentStatus = message.getStatus();

        if (newStatus == MessageStatus.ARCHIVED) {
            message.setStatus(MessageStatus.ARCHIVED);
        } else if (currentStatus == MessageStatus.PENDING && newStatus == MessageStatus.READ) {
            message.setStatus(MessageStatus.READ);
            NotificationDTO notif = notificationService.createNotification(
                    message.getSenderId(),
                    "Your message was read: " + message.getSubject(),
                    NotificationType.STATUS_UPDATED
            );
            eventPublisher.publishNotification(notif);
        } else if (currentStatus == MessageStatus.READ && newStatus == MessageStatus.RESOLVED) {
            message.setStatus(MessageStatus.RESOLVED);
            NotificationDTO notif = notificationService.createNotification(
                    message.getSenderId(),
                    "Your ticket has been resolved: " + message.getSubject(),
                    NotificationType.TICKET_RESOLVED
            );
            eventPublisher.publishNotification(notif);
        } else {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        MessageDTO dto = MessageMapper.toMessageDTO(messageRepository.save(message));
        eventPublisher.publishMessageUpdate(dto);
        return dto;
    }

    public MessageDTO archiveMessage(Long messageId) {
        return updateStatus(messageId, MessageStatus.ARCHIVED);
    }

    public void deleteMessage(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        messageRepository.delete(message);
    }

    public MessageDTO deleteForAll(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setDeletedForAll(true);
        message.setBody("message deleted");
        message.setFileUrl(null);
        MessageDTO dto = MessageMapper.toMessageDTO(messageRepository.save(message));
        eventPublisher.publishMessageUpdate(dto);
        return dto;
    }

    public MessageDTO deleteForMe(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        String existing = message.getDeletedForUsers();
        if (existing == null || existing.isEmpty()) {
            message.setDeletedForUsers(String.valueOf(userId));
        } else if (!existing.contains(String.valueOf(userId))) {
            message.setDeletedForUsers(existing + "," + userId);
        }
        MessageDTO dto = MessageMapper.toMessageDTO(messageRepository.save(message));
        eventPublisher.publishMessageUpdate(dto);
        return dto;
    }

    public List<MessageDTO> searchMessages(Long userId, String query) {
        return messageRepository.searchMessages(userId, query)
                .stream().map(MessageMapper::toMessageDTO).collect(Collectors.toList());
    }
}