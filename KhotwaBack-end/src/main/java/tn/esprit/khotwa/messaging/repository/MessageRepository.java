package tn.esprit.khotwa.messaging.repository;

import tn.esprit.khotwa.messaging.entity.Message;
import tn.esprit.khotwa.messaging.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import tn.esprit.khotwa.messaging.entity.MessageType;
import tn.esprit.khotwa.messaging.entity.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiverId(Long receiverId);
    List<Message> findBySenderId(Long senderId);
    List<Message> findByReceiverIdAndStatus(Long receiverId, MessageStatus status);
    List<Message> findByReceiverIdAndType(Long receiverId, MessageType type);
    List<Message> findByReceiverIdAndStatusNot(Long receiverId, MessageStatus status);
    Page<Message> findByReceiverId(Long receiverId, Pageable pageable);
    Page<Message> findBySenderId(Long senderId, Pageable pageable);
    Page<Message> findByReceiverIdAndStatusNot(Long receiverId, MessageStatus status, Pageable pageable);
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId OR m.receiverId = :userId) AND LOWER(m.body) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Message> searchMessages(@Param("userId") Long userId, @Param("query") String query);
}