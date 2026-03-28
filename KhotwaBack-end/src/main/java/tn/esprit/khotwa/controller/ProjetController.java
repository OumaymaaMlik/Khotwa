package tn.esprit.khotwa.controller;

import tn.esprit.khotwa.entities.StatutProjet;
import tn.esprit.khotwa.service.ProjetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projets")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Projets")
public class ProjetController {

    private final ProjetService projetService;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
    }

    @GetMapping
    @Operation(summary = "Recuperer tous les projets")
    public List<ProjetService.ProjetResponse> getTousLesProjets() {
        return projetService.getTousLesProjets();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Recuperer un projet par son id")
    public ProjetService.ProjetResponse getProjetById(@PathVariable Long id) {
        return projetService.getProjetById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Creer un projet")
    public ProjetService.ProjetResponse creerProjet(@RequestBody @Valid ProjetService.ProjetRequest request) {
        return projetService.creerProjet(request);
    }

    @PutMapping("/{id}/statut")
    @Operation(summary = "Mettre a jour le statut d'un projet")
    public ProjetService.ProjetResponse mettreAJourStatut(@PathVariable Long id, @RequestParam StatutProjet statut) {
        return projetService.mettreAJourStatut(id, statut);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer un projet")
    public void supprimerProjet(@PathVariable Long id) {
        projetService.supprimerProjet(id);
    }
}
