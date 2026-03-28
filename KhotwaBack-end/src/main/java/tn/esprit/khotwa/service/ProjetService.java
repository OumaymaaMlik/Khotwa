package tn.esprit.khotwa.service;

import tn.esprit.khotwa.GlobalExceptionHandler.BusinessRuleException;
import tn.esprit.khotwa.GlobalExceptionHandler.ResourceNotFoundException;
import tn.esprit.khotwa.entities.PrioriteTache;
import tn.esprit.khotwa.entities.Projet;
import tn.esprit.khotwa.entities.StatutProjet;
import tn.esprit.khotwa.entities.StatutTache;
import tn.esprit.khotwa.entities.Tache;
import tn.esprit.khotwa.repository.ProjetRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProjetService {

    private final ProjetRepository projetRepository;

        public ProjetService(ProjetRepository projetRepository) {
                this.projetRepository = projetRepository;
        }

    public record ProjetRequest(
            @NotBlank @Size(max = 150) String nom,
            @Size(max = 500) String description,
            StatutProjet statut,
            @Valid List<TacheRequest> tachesInitiales
    ) {
    }

    public record TacheRequest(
            @NotBlank @Size(max = 200) String titre,
            @Size(max = 1000) String description,
            PrioriteTache priorite,
            StatutTache statut,
            java.time.LocalDate dateLimite
    ) {
    }

    public record ProjetResponse(
            Long id,
            String nom,
            String description,
            StatutProjet statut,
            LocalDateTime dateCreation,
            LocalDateTime dateMiseAJour,
            List<TacheService.TacheResponse> taches
    ) {
    }

    public ProjetResponse creerProjet(ProjetRequest request) {
        if (request.tachesInitiales() == null || request.tachesInitiales().isEmpty()) {
                        throw new BusinessRuleException("Un projet doit avoir au minimum une tâche.");
        }

        Projet projet = new Projet();
        projet.setNom(request.nom());
        projet.setDescription(request.description());
        projet.setStatut(request.statut() != null ? request.statut() : StatutProjet.EN_COURS);

        List<Tache> taches = request.tachesInitiales().stream()
                .map(t -> {
                    Tache tache = new Tache();
                    tache.setTitre(t.titre());
                    tache.setDescription(t.description());
                    tache.setPriorite(t.priorite() != null ? t.priorite() : PrioriteTache.MOYENNE);
                    tache.setStatut(t.statut() != null ? t.statut() : StatutTache.A_FAIRE);
                    tache.setDateLimite(t.dateLimite());
                    tache.setProjet(projet);
                    return tache;
                })
                .toList();

        projet.setTaches(taches);

        return toResponse(projetRepository.save(projet));
    }

    @Transactional(readOnly = true)
    public List<ProjetResponse> getTousLesProjets() {
        return projetRepository.findAll().stream().map(ProjetService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjetResponse getProjetById(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id: " + id));
        return toResponse(projet);
    }

    public ProjetResponse mettreAJourStatut(Long id, StatutProjet statut) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id: " + id));

        projet.setStatut(statut);
        return toResponse(projetRepository.save(projet));
    }

    public void supprimerProjet(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id: " + id));
        projetRepository.delete(projet);
    }

    public static ProjetResponse toResponse(Projet projet) {
        return new ProjetResponse(
                projet.getId(),
                projet.getNom(),
                projet.getDescription(),
                projet.getStatut(),
                projet.getDateCreation(),
                projet.getDateMiseAJour(),
                projet.getTaches().stream().map(TacheService::toResponse).toList()
        );
    }
}
