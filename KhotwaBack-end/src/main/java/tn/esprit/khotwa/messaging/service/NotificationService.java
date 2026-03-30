package tn.esprit.khotwa.messaging.service;

import tn.esprit.khotwa.messaging.dto.NotificationDTO;
import tn.esprit.khotwa.messaging.dto.MessageMapper;
import tn.esprit.khotwa.messaging.entity.Notification;
import tn.esprit.khotwa.messaging.entity.NotificationType;
import tn.esprit.khotwa.messaging.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(Long recipientId, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public List<NotificationDTO> getNotifications(Long recipientId) {
        return notificationRepository.findByRecipientId(recipientId)
                .stream().map(MessageMapper::toNotificationDTO).collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long recipientId) {
        return notificationRepository.findByRecipientIdAndIsRead(recipientId, false)
                .stream().map(MessageMapper::toNotificationDTO).collect(Collectors.toList());
    }

    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return MessageMapper.toNotificationDTO(notificationRepository.save(notification));
    }

    public List<NotificationDTO> markBulkRead(List<Long> ids) {
        return ids.stream().map(id -> {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            notification.setRead(true);
            return MessageMapper.toNotificationDTO(notificationRepository.save(notification));
        }).collect(Collectors.toList());
    }

    public List<NotificationDTO> markBulkUnread(List<Long> ids) {
        return ids.stream().map(id -> {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            notification.setRead(false);
            return MessageMapper.toNotificationDTO(notificationRepository.save(notification));
        }).collect(Collectors.toList());
    }

    public void deleteBulk(List<Long> ids) {
        ids.forEach(id -> {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            notificationRepository.delete(notification);
        });
    }
}