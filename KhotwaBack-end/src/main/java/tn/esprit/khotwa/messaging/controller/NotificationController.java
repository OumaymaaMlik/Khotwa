package tn.esprit.khotwa.messaging.controller;

import tn.esprit.khotwa.messaging.dto.NotificationDTO;
import tn.esprit.khotwa.messaging.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{recipientId}")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable Long recipientId) {
        return ResponseEntity.ok(notificationService.getNotifications(recipientId));
    }

    @GetMapping("/{recipientId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long recipientId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(recipientId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/bulk/read")
    public ResponseEntity<List<NotificationDTO>> markBulkRead(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(notificationService.markBulkRead(ids));
    }

    @PatchMapping("/bulk/unread")
    public ResponseEntity<List<NotificationDTO>> markBulkUnread(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(notificationService.markBulkUnread(ids));
    }

    @DeleteMapping("/bulk/delete")
    public ResponseEntity<Void> deleteBulk(@RequestBody List<Long> ids) {
        notificationService.deleteBulk(ids);
        return ResponseEntity.noContent().build();
    }
}