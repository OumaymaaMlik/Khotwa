package tn.khotwa.biblio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.khotwa.biblio.entity.ProgressionUtilisateur;
import tn.khotwa.biblio.enums.ProgressStatus;
import tn.khotwa.biblio.projection.ProgressionView;

import java.util.List;
import java.util.Optional;

public interface ProgressionRepository extends JpaRepository<ProgressionUtilisateur, Long> {

    Optional<ProgressionView> findProjectedByUtilisateurIdAndRessourceId(
        Long utilisateurId, Long ressourceId
    );

    List<ProgressionView> findByUtilisateurId(Long utilisateurId);

    Optional<ProgressionUtilisateur> findByUtilisateurIdAndRessourceId(
        Long utilisateurId, Long ressourceId
    );

    long countByUtilisateurIdAndStatut(Long utilisateurId, ProgressStatus statut);

    @Query("""
        SELECT p FROM ProgressionUtilisateur p
        WHERE p.utilisateurId = :userId
          AND p.ressource.id IN :ressourceIds
    """)
    List<ProgressionView> findByUtilisateurIdAndRessourceIds(
        @Param("userId")       Long userId,
        @Param("ressourceIds") List<Long> ressourceIds
    );
}
