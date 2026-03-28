package tn.esprit.khotwa.service;

import tn.esprit.khotwa.entities.StatutTache;
import tn.esprit.khotwa.entities.Tache;
import tn.esprit.khotwa.repository.TacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AlerteSLAService {

    private static final Logger log = LoggerFactory.getLogger(AlerteSLAService.class);

    private final TacheRepository tacheRepository;

    public AlerteSLAService(TacheRepository tacheRepository) {
        this.tacheRepository = tacheRepository;
    }

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void verifierTachesBloquees() {
        LocalDateTime seuil = LocalDateTime.now().minusDays(15);
        List<Tache> tachesBloquees = tacheRepository.findByStatutAndDateMiseAJourBefore(StatutTache.BLOQUEE, seuil);

        tachesBloquees.forEach(tache -> log.warn(
            "[ALERTE SLA] Tâche #{} '{}' bloquée depuis +15 jours — Projet: {}",
                tache.getId(),
                tache.getTitre(),
                tache.getProjet() != null ? tache.getProjet().getNom() : "N/A"
        ));
    }
}
