package tn.khotwa.biblio.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tn.khotwa.biblio.projection.CategorieView;
import tn.khotwa.biblio.service.ICategorieService;

import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategorieController {

    private final ICategorieService categorieService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> lister() {
        return ResponseEntity.ok(Map.of("success", true, "data", categorieService.listerToutes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getParId(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "data", categorieService.getParId(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> creer(@RequestBody Map<String, String> body) {
        CategorieView cree = categorieService.creer( body.get("nom"), body.get("description"),
            body.get("couleur"), body.get("icone")
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("success", true, "message", "Catégorie créée", "data", cree));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> mettreAJour(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true, "data",
            categorieService.mettreAJour(id,
                body.get("nom"), body.get("description"),
                body.get("couleur"), body.get("icone"))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> supprimer(@PathVariable Long id) {
        categorieService.supprimer(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Catégorie supprimée"));
    }
}
