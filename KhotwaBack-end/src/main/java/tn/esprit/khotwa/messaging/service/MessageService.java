package tn.esprit.khotwa.messaging.service;

import tn.esprit.khotwa.messaging.dto.MessageDTO;
import tn.esprit.khotwa.messaging.dto.MessageMapper;
import tn.esprit.khotwa.messaging.entity.Message;
import tn.esprit.khotwa.messaging.entity.MessageStatus;
import tn.esprit.khotwa.messaging.entity.MessageType;
import tn.esprit.khotwa.messaging.entity.NotificationType;
import tn.esprit.khotwa.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final NotificationService notificationService;

    public MessageDTO sendMessage(Message message) {
        Message saved = messageRepository.save(message);
        notificationService.createNotification(
                saved.getReceiverId(),
                "You have a new message: " + saved.getSubject(),
                NotificationType.NEW_MESSAGE
        );
        return MessageMapper.toMessageDTO(saved);
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
            notificationService.createNotification(
                    message.getSenderId(),
                    "Your message was read: " + message.getSubject(),
                    NotificationType.STATUS_UPDATED
            );
        } else if (currentStatus == MessageStatus.READ && newStatus == MessageStatus.RESOLVED) {
            message.setStatus(MessageStatus.RESOLVED);
            notificationService.createNotification(
                    message.getSenderId(),
                    "Your ticket has been resolved: " + message.getSubject(),
                    NotificationType.TICKET_RESOLVED
            );
        } else {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        return MessageMapper.toMessageDTO(messageRepository.save(message));
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
        return MessageMapper.toMessageDTO(messageRepository.save(message));
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
        return MessageMapper.toMessageDTO(messageRepository.save(message));
    }
}