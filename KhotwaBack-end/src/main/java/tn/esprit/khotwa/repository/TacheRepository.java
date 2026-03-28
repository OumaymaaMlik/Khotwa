package tn.esprit.khotwa.repository;

import tn.esprit.khotwa.entities.StatutTache;
import tn.esprit.khotwa.entities.Tache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {

    List<Tache> findByProjetId(Long projetId);

    List<Tache> findByStatut(StatutTache statut);

    long countByProjetId(Long projetId);

    List<Tache> findByStatutAndDateMiseAJourBefore(StatutTache statut, LocalDateTime date);
}
