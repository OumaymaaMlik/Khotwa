package tn.esprit.khotwa.messaging.controller;

import tn.esprit.khotwa.messaging.config.OnlineUserStore;
import tn.esprit.khotwa.messaging.dto.MessageDTO;
import tn.esprit.khotwa.messaging.entity.Message;
import tn.esprit.khotwa.messaging.entity.MessageStatus;
import tn.esprit.khotwa.messaging.entity.MessageType;
import tn.esprit.khotwa.messaging.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import tn.esprit.khotwa.messaging.config.WebSocketEventPublisher;


@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final WebSocketEventPublisher eventPublisher;
    private final OnlineUserStore onlineUserStore;

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

    @GetMapping("/search")
    public ResponseEntity<List<MessageDTO>> searchMessages(
            @RequestParam Long userId,
            @RequestParam String query) {
        return ResponseEntity.ok(messageService.searchMessages(userId, query));
    }


    @PostMapping("/presence/{userId}/online")
    public ResponseEntity<List<Long>> goOnline(@PathVariable Long userId) {
        onlineUserStore.addUser(userId);
        System.out.println("User " + userId + " is online. Broadcasting all online users: " + onlineUserStore.getOnlineUsers());
        onlineUserStore.getOnlineUsers().forEach(onlineUserId ->
                eventPublisher.publishOnlineStatus(onlineUserId, true)
        );
        return ResponseEntity.ok(new ArrayList<>(onlineUserStore.getOnlineUsers()));
    }

    @PostMapping("/presence/{userId}/offline")
    public ResponseEntity<Void> goOffline(@PathVariable Long userId) {
        onlineUserStore.removeUser(userId);
        eventPublisher.publishOnlineStatus(userId, false);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/presence/all-online")
    public ResponseEntity<List<Long>> getOnlineUsers() {
        return ResponseEntity.ok(new ArrayList<>(onlineUserStore.getOnlineUsers()));
    }

}