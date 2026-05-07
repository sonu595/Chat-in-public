package com.example.chat.service;

import com.example.chat.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Slf4j
@Service
@EnableScheduling
public class MessageCleanupService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Value("${chat.message.retention-days:3}")
    private int retentionDays;
    
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOldMessages() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        log.info("Deleting messages older than: {}", cutoffDate);
        
        int deletedCount = chatMessageRepository.deleteOldMessages(cutoffDate);
        log.info("Deleted {} old messages", deletedCount);
    }
}