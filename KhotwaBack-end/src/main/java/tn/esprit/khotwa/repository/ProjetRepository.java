package tn.esprit.khotwa.repository;

import tn.esprit.khotwa.entities.Projet;
import tn.esprit.khotwa.entities.StatutProjet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet, Long> {

    List<Projet> findByStatut(StatutProjet statut);

    long countByIdIn(List<Long> ids);
}
