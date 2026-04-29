package com.example.chat.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_room_timestamp", columnList = "roomId, timestamp")
})
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String senderEmail;
    private String receiverEmail;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String roomId;
    
    @Enumerated(EnumType.STRING)
    private MessageType type;
    
    private LocalDateTime timestamp;
    private boolean isDeleted = false;
    private LocalDateTime deletedAt;
    
    public enum MessageType {
        CHAT, JOIN, LEAVE, TYPING
    }
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}