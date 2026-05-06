package com.example.chat.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.DTO.ChatMessageRequest;
import com.example.chat.entity.ChatMessage;
import com.example.chat.service.ChatService;
import com.example.chat.service.UserProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<ChatMessage>> getMessages1(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getMessages(roomId, page, size));
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessage>> getConversation1(
            @RequestParam String user1,
            @RequestParam String user2,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(chatService.getConversation(user1, user2, page));
    }

    @GetMapping("/conversation/{otherEmail}")
    public ResponseEntity<List<ChatMessage>> getMyConversation(
            @PathVariable String otherEmail,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(
            chatService.getConversation(userProfileService.getCurrentUserEmail(), otherEmail, page)
        );
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessage message = chatService.createDirectMessage1(
            userProfileService.getCurrentUserEmail(),
            request.getReceiverEmail(),
            request.getContent()
        );

        messagingTemplate.convertAndSend(buildInboxDestination(message.getReceiverEmail()), message);

        return ResponseEntity.ok(message);
    }

    private String buildInboxDestination(String email) {
        return "/topic/messages/" + email;
    }
}
