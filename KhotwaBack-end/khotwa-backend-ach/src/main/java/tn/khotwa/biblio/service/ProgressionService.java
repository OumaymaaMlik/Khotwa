package tn.khotwa.biblio.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.khotwa.biblio.entity.ProgressionUtilisateur;
import tn.khotwa.biblio.entity.Ressource;
import tn.khotwa.biblio.enums.ProgressStatus;
import tn.khotwa.biblio.exception.ResourceNotFoundException;
import tn.khotwa.biblio.projection.ProgressionView;
import tn.khotwa.biblio.repository.ProgressionRepository;
import tn.khotwa.biblio.repository.RessourceRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProgressionService implements IProgressionService {

    private final ProgressionRepository progressionRepo;
    private final RessourceRepository   ressourceRepo;

    @Override
    public ProgressionView mettreAJour(
            Long userId, Long ressourceId, ProgressStatus statut,
            Integer pourcentage, Integer positionVideoSec) {

        Ressource ressource = ressourceRepo.findById(ressourceId)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", ressourceId));

        ProgressionUtilisateur prog = progressionRepo
            .findByUtilisateurIdAndRessourceId(userId, ressourceId)
            .orElseGet(() -> ProgressionUtilisateur.builder()
                .utilisateurId(userId)
                .ressource(ressource)
                .premierAcces(LocalDateTime.now())
                .build());

        prog.setStatut(statut);
        if (pourcentage      != null) prog.setPourcentage(pourcentage);
        if (positionVideoSec != null) prog.setPositionVideoSec(positionVideoSec);
        if (prog.getPourcentage() >= 100 || statut == ProgressStatus.COMPLETED) {
            prog.setStatut(ProgressStatus.COMPLETED);
            prog.setPourcentage(100);
            if (prog.getDateCompletion() == null) {
                prog.setDateCompletion(LocalDateTime.now());
            }
            log.info("Ressource {} complétée par user {}", ressourceId, userId);
        }

        progressionRepo.save(prog);
        return progressionRepo
            .findProjectedByUtilisateurIdAndRessourceId(userId, ressourceId)
            .orElseThrow();
    }

    @Override
    public ProgressionView marquerCommeTermine(Long userId, Long ressourceId) {
        return mettreAJour(userId, ressourceId, ProgressStatus.COMPLETED, 100, null);
    }

    @Override
    public List<ProgressionView> getMesProgressions(Long userId) {
        return progressionRepo.findByUtilisateurId(userId);
    }
}
