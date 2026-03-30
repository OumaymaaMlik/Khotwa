package tn.khotwa.biblio.projection;

import tn.khotwa.biblio.enums.ProgressStatus;

import java.time.LocalDateTime;


public interface ProgressionView {

    Long getId();
    Long getUtilisateurId();
    ProgressStatus getStatut();
    Integer getPourcentage();
    Integer getPositionVideoSec();
    LocalDateTime getPremierAcces();
    LocalDateTime getDernierAcces();
    LocalDateTime getDateCompletion();

    RessourceResume getRessource();

    interface RessourceResume {
        Long getId();
        String getTitre();
    }

    default boolean estComplete() {
        return getStatut() == ProgressStatus.COMPLETED;
    }
}
