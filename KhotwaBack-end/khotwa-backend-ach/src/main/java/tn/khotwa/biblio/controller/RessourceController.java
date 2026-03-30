package tn.khotwa.biblio.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.*;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.khotwa.biblio.enums.*;
import tn.khotwa.biblio.projection.*;
import tn.khotwa.biblio.service.IRessourceService;
import tn.khotwa.biblio.service.IRessourceService.EnrichedRessource;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ressources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RessourceController {

    private final IRessourceService ressourceService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> lister(
            @RequestHeader(value = "X-User-Id",      required = false) Long userId,
            @RequestHeader(value = "X-User-Role",    required = false) String role,
            @RequestHeader(value = "X-User-Incube",  defaultValue = "false") boolean incube,
            @RequestHeader(value = "X-User-Premium", defaultValue = "false") boolean premium,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<RessourceSummaryView> resultat = ressourceService.lister(
            parseRole(role), incube, premium, userId, type, categorieId, tag, search, page, size
        );

        return ResponseEntity.ok(Map.of(
            "success",       true,
            "data",          resultat.getContent(),
            "totalElements", resultat.getTotalElements(),
            "totalPages",    resultat.getTotalPages(),
            "page",          resultat.getNumber()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getParId(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id",      required = false) Long userId,
            @RequestHeader(value = "X-User-Role",    required = false) String role,
            @RequestHeader(value = "X-User-Incube",  defaultValue = "false") boolean incube,
            @RequestHeader(value = "X-User-Premium", defaultValue = "false") boolean premium) {

        EnrichedRessource enriched = ressourceService.getParId(id, userId, parseRole(role), incube, premium);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "ressource",     enriched.ressource(),
                "tags",          enriched.tags(),
                "maProgression", enriched.maProgression() != null ? enriched.maProgression() : Map.of()
            )
        ));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> creer(
            @RequestParam("titre")                                  String titre,
            @RequestParam("type")                                   String type,
            @RequestParam("niveauAcces")                            String niveauAcces,
            @RequestParam(value = "description",   required = false) String description,
            @RequestParam(value = "categorieId",   required = false) String categorieId,
            @RequestParam(value = "tags",          required = false) List<String> tags,
            @RequestParam(value = "urlExterne",    required = false) String urlExterne,
            @RequestParam(value = "dureeSec",      required = false) String dureeSec,
            @RequestParam(value = "nombrePages",   required = false) String nombrePages,
            @RequestParam(value = "publie",        required = false) String publie,
            @RequestParam(value = "fichier",       required = false) MultipartFile fichier,
            @RequestHeader("X-User-Id") Long adminId) {

        RessourceView cree = ressourceService.creer(
            titre, description,
            ResourceType.valueOf(type),
            AccessLevel.valueOf(niveauAcces),
            categorieId   != null ? Long.parseLong(categorieId)     : null,
            tags,
            urlExterne,
            dureeSec      != null ? Integer.parseInt(dureeSec)      : null,
            nombrePages   != null ? Integer.parseInt(nombrePages)    : null,
            publie        != null ? Boolean.parseBoolean(publie)     : false,
            fichier, adminId
        );

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("success", true, "message", "Ressource créée", "data", cree));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> mettreAJour(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        RessourceView maj = ressourceService.mettreAJour(
            id,
            (String) body.get("titre"),
            (String) body.get("description"),
            body.get("niveauAcces") != null ? AccessLevel.valueOf((String) body.get("niveauAcces")) : null,
            body.get("categorieId") != null ? Long.parseLong(body.get("categorieId").toString()) : null,
            (List<String>) body.get("tags"),
            body.get("dureeSec")    != null ? Integer.parseInt(body.get("dureeSec").toString()) : null,
            body.get("nombrePages") != null ? Integer.parseInt(body.get("nombrePages").toString()) : null,
            body.get("publie")      != null ? (Boolean) body.get("publie") : null
        );

        return ResponseEntity.ok(Map.of("success", true, "data", maj));
    }

    @PatchMapping(value = "/{id}/fichier", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> remplacerFichier(
            @PathVariable Long id,
            @RequestPart("fichier") MultipartFile fichier) {

        return ResponseEntity.ok(Map.of("success", true, "data",
            ressourceService.remplacerFichier(id, fichier)));
    }

    @PatchMapping("/{id}/toggle-publie")
    public ResponseEntity<Map<String, Object>> togglePublie(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "data",
            ressourceService.togglePublie(id)));
    }

    // DELETE /api/ressources/{id} — supprimer
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> supprimer(@PathVariable Long id) {
        ressourceService.supprimer(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Ressource supprimée"));
    }

    // GET /api/ressources/{id}/download — télécharger le fichier
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> telecharger(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role",    required = false) String role,
            @RequestHeader(value = "X-User-Incube",  defaultValue = "false") boolean incube,
            @RequestHeader(value = "X-User-Premium", defaultValue = "false") boolean premium) {
        try {
            Path chemin = ressourceService.obtenirCheminFichier(id, parseRole(role), incube, premium);
            Resource ressource = new UrlResource(chemin.toUri());
            String contentType = java.nio.file.Files.probeContentType(chemin);
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                    contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + chemin.getFileName() + "\"")
                .body(ressource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET /api/ressources/stats — statistiques
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(Map.of("success", true, "data",
            ressourceService.getStats(userId)));
    }

    private UserRole parseRole(String role) {
        if (role == null) return null;
        try { return UserRole.valueOf(role.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }
}
