package tn.esprit.khotwa.messaging.controller;

import tn.esprit.khotwa.messaging.config.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final WebSocketEventPublisher eventPublisher;

    @MessageMapping("/typing")
    public void handleTyping(TypingPayload payload) {
        eventPublisher.publishTyping(payload.senderId(), payload.receiverId(), payload.typing());
    }

    @MessageMapping("/status")
    public void handleStatus(StatusPayload payload) {
        System.out.println("Received status from user " + payload.userId() + " online: " + payload.online());
        eventPublisher.publishOnlineStatus(payload.userId(), payload.online());
    }

    public record TypingPayload(Long senderId, Long receiverId, boolean typing) {}
    public record StatusPayload(Long userId, boolean online) {}
}
