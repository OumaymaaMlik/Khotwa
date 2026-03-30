package tn.esprit.khotwa.messaging.controller;

import tn.esprit.khotwa.messaging.dto.MessageDTO;
import tn.esprit.khotwa.messaging.entity.Message;
import tn.esprit.khotwa.messaging.entity.MessageStatus;
import tn.esprit.khotwa.messaging.entity.MessageType;
import tn.esprit.khotwa.messaging.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
    }

    @GetMapping("/inbox/{receiverId}")
    public ResponseEntity<Page<MessageDTO>> getInbox(
            @PathVariable Long receiverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(messageService.getInbox(receiverId, page, size));
    }

    @GetMapping("/sent/{senderId}")
    public ResponseEntity<Page<MessageDTO>> getSent(
            @PathVariable Long senderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(messageService.getSent(senderId, page, size));
    }

    @GetMapping("/inbox/{receiverId}/filter")
    public ResponseEntity<List<MessageDTO>> getInboxByType(
            @PathVariable Long receiverId,
            @RequestParam MessageType type) {
        return ResponseEntity.ok(messageService.getInboxByType(receiverId, type));
    }

    @GetMapping("/inbox/{receiverId}/active")
    public ResponseEntity<Page<MessageDTO>> getActiveInbox(
            @PathVariable Long receiverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(messageService.getActiveInbox(receiverId, page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MessageDTO> updateStatus(@PathVariable Long id, @RequestParam MessageStatus status) {
        return ResponseEntity.ok(messageService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<MessageDTO> archiveMessage(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.archiveMessage(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/delete-for-all")
    public ResponseEntity<MessageDTO> deleteForAll(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.deleteForAll(id));
    }

    @DeleteMapping("/{id}/delete-for-me")
    public ResponseEntity<MessageDTO> deleteForMe(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(messageService.deleteForMe(id, userId));
    }
}