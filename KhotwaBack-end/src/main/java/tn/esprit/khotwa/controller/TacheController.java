package tn.esprit.khotwa.controller;

import tn.esprit.khotwa.service.TacheService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/taches")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Taches")
public class TacheController {

    private final TacheService tacheService;

    public TacheController(TacheService tacheService) {
        this.tacheService = tacheService;
    }

    @GetMapping("/projet/{projetId}")
    @Operation(summary = "Recuperer les taches d'un projet")
    public List<TacheService.TacheResponse> getTachesParProjet(@PathVariable Long projetId) {
        return tacheService.getTachesParProjet(projetId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Recuperer une tache par son id")
    public TacheService.TacheResponse getTacheById(@PathVariable Long id) {
        return tacheService.getTacheById(id);
    }

    @PostMapping("/projet/{projetId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajouter une tache a un projet")
    public TacheService.TacheResponse ajouterTache(@PathVariable Long projetId,
                                                   @RequestBody @Valid TacheService.TacheRequest request) {
        return tacheService.ajouterTache(projetId, request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre a jour une tache")
    public TacheService.TacheResponse mettreAJourTache(@PathVariable Long id,
                                                       @RequestBody @Valid TacheService.TacheRequest request) {
        return tacheService.mettreAJourTache(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer une tache")
    public void supprimerTache(@PathVariable Long id) {
        tacheService.supprimerTache(id);
    }
}
