package tn.khotwa.biblio.service;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import tn.khotwa.biblio.enums.AccessLevel;
import tn.khotwa.biblio.enums.ResourceType;
import tn.khotwa.biblio.enums.UserRole;
import tn.khotwa.biblio.projection.ProgressionView;
import tn.khotwa.biblio.projection.RessourceSummaryView;
import tn.khotwa.biblio.projection.RessourceView;
import tn.khotwa.biblio.projection.TagView;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public interface IRessourceService {

    Page<RessourceSummaryView> lister(
        UserRole role, boolean incube, boolean premium,
        Long userId, ResourceType type, Long catId,
        String tag, String recherche, int page, int size
    );

    EnrichedRessource getParId(Long id, Long userId, UserRole role, boolean incube, boolean premium);

    RessourceView creer(
        String titre, String description, ResourceType type, AccessLevel niveauAcces,
        Long categorieId, List<String> tags, String urlExterne,
        Integer dureeSec, Integer nombrePages, Boolean publie,
        MultipartFile fichier, Long adminId
    );

    RessourceView mettreAJour(
        Long id, String titre, String description, AccessLevel niveauAcces,
        Long categorieId, List<String> tags, Integer dureeSec,
        Integer nombrePages, Boolean publie
    );

    RessourceView remplacerFichier(Long id, MultipartFile fichier);
    RessourceView togglePublie(Long id);
    void supprimer(Long id);

    Path obtenirCheminFichier(Long id, UserRole role, boolean incube, boolean premium);

    Map<String, Object> getStats(Long userId);

    record EnrichedRessource(
        RessourceView ressource,
        List<TagView> tags,
        ProgressionView maProgression
    ) {}
}
