package tn.khotwa.biblio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.khotwa.biblio.entity.Tag;
import tn.khotwa.biblio.projection.TagView;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    List<TagView> findAllProjectedBy();

    Optional<Tag> findByNom(String nom);
}
