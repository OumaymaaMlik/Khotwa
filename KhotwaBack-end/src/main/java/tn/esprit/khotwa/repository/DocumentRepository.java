package tn.esprit.khotwa.repository;

import tn.esprit.khotwa.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByTacheId(Long tacheId);
}
