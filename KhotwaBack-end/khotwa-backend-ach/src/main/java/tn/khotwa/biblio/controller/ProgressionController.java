package tn.khotwa.biblio.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.khotwa.biblio.enums.ProgressStatus;
import tn.khotwa.biblio.service.IProgressionService;

import java.util.Map;

@RestController
@RequestMapping("/api/progressions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProgressionController {

    private final IProgressionService progressionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> mettreAJour(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, Object> body) {

        return ResponseEntity.ok(Map.of("success", true, "data",
            progressionService.mettreAJour(
                userId,
                Long.parseLong(body.get("ressourceId").toString()),
                ProgressStatus.valueOf((String) body.get("statut")),
                body.get("pourcentage")      != null ? Integer.parseInt(body.get("pourcentage").toString())      : null,
                body.get("positionVideoSec") != null ? Integer.parseInt(body.get("positionVideoSec").toString()) : null
            )));
    }

    @PostMapping("/{ressourceId}/terminer")
    public ResponseEntity<Map<String, Object>> terminer(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long ressourceId) {

        return ResponseEntity.ok(Map.of("success", true, "message", "Ressource terminée",
            "data", progressionService.marquerCommeTermine(userId, ressourceId)));
    }

    @GetMapping("/mes")
    public ResponseEntity<Map<String, Object>> mesProgressions(
            @RequestHeader("X-User-Id") Long userId) {

        return ResponseEntity.ok(Map.of("success", true,
            "data", progressionService.getMesProgressions(userId)));
    }
}
