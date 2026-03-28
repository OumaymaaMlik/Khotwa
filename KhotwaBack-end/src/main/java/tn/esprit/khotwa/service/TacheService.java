package tn.esprit.khotwa.service;

import tn.esprit.khotwa.GlobalExceptionHandler.BusinessRuleException;
import tn.esprit.khotwa.GlobalExceptionHandler.ResourceNotFoundException;
import tn.esprit.khotwa.entities.PrioriteTache;
import tn.esprit.khotwa.entities.Projet;
import tn.esprit.khotwa.entities.StatutTache;
import tn.esprit.khotwa.entities.Tache;
import tn.esprit.khotwa.repository.ProjetRepository;
import tn.esprit.khotwa.repository.TacheRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class TacheService {

    private final TacheRepository tacheRepository;
    private final ProjetRepository projetRepository;

        public TacheService(TacheRepository tacheRepository, ProjetRepository projetRepository) {
                this.tacheRepository = tacheRepository;
                this.projetRepository = projetRepository;
        }

    public record TacheRequest(
            @NotBlank @Size(max = 200) String titre,
            @Size(max = 1000) String description,
            PrioriteTache priorite,
            StatutTache statut,
            LocalDate dateLimite
    ) {
    }

    public record TacheResponse(
            Long id,
            String titre,
            String description,
            PrioriteTache priorite,
            StatutTache statut,
            LocalDate dateLimite,
            LocalDateTime dateMiseAJour,
            Long projetId,
            List<DocumentService.DocumentResponse> documents
    ) {
    }

    public TacheResponse ajouterTache(Long projetId, TacheRequest request) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id: " + projetId));

        Tache tache = new Tache();
        tache.setTitre(request.titre());
        tache.setDescription(request.description());
        tache.setPriorite(request.priorite() != null ? request.priorite() : PrioriteTache.MOYENNE);
        tache.setStatut(request.statut() != null ? request.statut() : StatutTache.A_FAIRE);
        tache.setDateLimite(request.dateLimite());
        tache.setProjet(projet);

        return toResponse(tacheRepository.save(tache));
    }

    @Transactional(readOnly = true)
    public List<TacheResponse> getTachesParProjet(Long projetId) {
        projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id: " + projetId));

        return tacheRepository.findByProjetId(projetId)
                .stream()
                .map(TacheService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TacheResponse getTacheById(Long id) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable avec l'id: " + id));
        return toResponse(tache);
    }

    public TacheResponse mettreAJourTache(Long id, TacheRequest request) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable avec l'id: " + id));

        tache.setTitre(request.titre());
        tache.setDescription(request.description());
        tache.setPriorite(request.priorite() != null ? request.priorite() : PrioriteTache.MOYENNE);
        tache.setStatut(request.statut() != null ? request.statut() : StatutTache.A_FAIRE);
        tache.setDateLimite(request.dateLimite());

        return toResponse(tacheRepository.save(tache));
    }

    public void supprimerTache(Long id) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable avec l'id: " + id));

        long count = tacheRepository.countByProjetId(tache.getProjet().getId());
        if (count <= 1) {
                        throw new BusinessRuleException("Impossible de supprimer : le projet doit conserver au moins une tâche.");
        }

        tacheRepository.delete(tache);
    }

    public static TacheResponse toResponse(Tache tache) {
        List<DocumentService.DocumentResponse> documents = tache.getDocuments() == null
                ? Collections.emptyList()
                : tache.getDocuments().stream().map(DocumentService::toResponse).toList();

        return new TacheResponse(
                tache.getId(),
                tache.getTitre(),
                tache.getDescription(),
                tache.getPriorite(),
                tache.getStatut(),
                tache.getDateLimite(),
                tache.getDateMiseAJour(),
                tache.getProjet() != null ? tache.getProjet().getId() : null,
                documents
        );
    }
}
