package com.example.chat.repository;

import com.example.chat.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);
    
    @Query("SELECT m FROM ChatMessage m WHERE (m.senderEmail = :user1 AND m.receiverEmail = :user2) OR (m.senderEmail = :user2 AND m.receiverEmail = :user1) ORDER BY m.timestamp DESC")
    List<ChatMessage> findConversation(@Param("user1") String user1, @Param("user2") String user2, Pageable pageable);
    
    List<ChatMessage> findByTimestampBefore(LocalDateTime dateTime);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE m.timestamp <= :cutoffDate")
    int deleteOldMessages(@Param("cutoffDate") LocalDateTime cutoffDate);
}