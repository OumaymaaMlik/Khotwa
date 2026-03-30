package tn.khotwa.biblio.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import tn.khotwa.biblio.entity.*;
import tn.khotwa.biblio.enums.*;
import tn.khotwa.biblio.exception.ResourceNotFoundException;
import tn.khotwa.biblio.projection.*;
import tn.khotwa.biblio.repository.*;

import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RessourceService implements IRessourceService {

    private final RessourceRepository   ressourceRepo;
    private final CategorieRepository   categorieRepo;
    private final TagRepository         tagRepo;
    private final ProgressionRepository progressionRepo;
    private final FileStorageService    fileService;
    private final AccessControlService  accessControl;


    @Override
    public Page<RessourceSummaryView> lister(
            UserRole role, boolean incube, boolean premium,
            Long userId, ResourceType type, Long catId,
            String tag, String recherche, int page, int size) {

        List<AccessLevel> niveauxAccessibles = accessControl.getNiveauxAccessibles(role, incube, premium);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (role == UserRole.ADMIN) {
            return ressourceRepo.findToutesAvecFiltres(
                niveauxAccessibles, type, catId, tag, recherche, pageable
            );
        }

        return ressourceRepo.findPubliesAvecFiltres(
            niveauxAccessibles, type, catId, tag, recherche, pageable
        );
    }

    @Override
    public EnrichedRessource getParId(Long id, Long userId, UserRole role, boolean incube, boolean premium) {
        RessourceView vue = ressourceRepo.findProjectedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", id));

        accessControl.verifierAcces(role, incube, premium, vue.getNiveauAcces());
        ressourceRepo.incrementerVues(id);

        List<TagView> tags = ressourceRepo.findTagsByRessourceId(id);

        ProgressionView progression = null;
        if (userId != null) {
            progression = progressionRepo
                .findProjectedByUtilisateurIdAndRessourceId(userId, id)
                .orElse(null);
        }

        return new EnrichedRessource(vue, tags, progression);
    }


    @Override
    public RessourceView creer(
            String titre, String description, ResourceType type,
            AccessLevel niveauAcces, Long categorieId, List<String> tags,
            String urlExterne, Integer dureeSec, Integer nombrePages,
            Boolean publie, MultipartFile fichier, Long adminId) {

        Ressource ressource = construireRessource(
            titre, description, type, niveauAcces,
            dureeSec, nombrePages, publie, adminId
        );

        gererContenu(ressource, fichier, urlExterne, type);
        gererCategorie(ressource, categorieId);
        gererTags(ressource, tags);

        Ressource sauvegardee = ressourceRepo.save(ressource);
        log.info("Ressource créée — id={} titre={}", sauvegardee.getId(), sauvegardee.getTitre());

        return ressourceRepo.findProjectedById(sauvegardee.getId()).orElseThrow();
    }


    @Override
    public RessourceView mettreAJour(
            Long id, String titre, String description, AccessLevel niveauAcces,
            Long categorieId, List<String> tags, Integer dureeSec,
            Integer nombrePages, Boolean publie) {

        Ressource ressource = ressourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", id));

        if (titre       != null) ressource.setTitre(titre);
        if (description != null) ressource.setDescription(description);
        if (niveauAcces != null) ressource.setNiveauAcces(niveauAcces);
        if (dureeSec    != null) ressource.setDureeSec(dureeSec);
        if (nombrePages != null) ressource.setNombrePages(nombrePages);
        if (publie      != null) ressource.setPublie(publie);
        if (categorieId != null) gererCategorie(ressource, categorieId);
        if (tags        != null) gererTags(ressource, tags);

        ressourceRepo.save(ressource);
        return ressourceRepo.findProjectedById(id).orElseThrow();
    }

    @Override
    public RessourceView remplacerFichier(Long id, MultipartFile fichier) {
        Ressource ressource = ressourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", id));

        fileService.supprimer(ressource.getCheminFichier());
        ressource.setCheminFichier(fileService.sauvegarder(fichier, ressource.getType()));
        ressource.setNomFichierOriginal(fichier.getOriginalFilename());
        ressource.setMimeType(fichier.getContentType());
        ressource.setTailleFichierOctets(fichier.getSize());

        ressourceRepo.save(ressource);
        return ressourceRepo.findProjectedById(id).orElseThrow();
    }

    @Override
    public RessourceView togglePublie(Long id) {
        Ressource ressource = ressourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", id));

        ressource.setPublie(!ressource.getPublie());
        ressourceRepo.save(ressource);
        return ressourceRepo.findProjectedById(id).orElseThrow();
    }

    @Override
    public void supprimer(Long id) {
        Ressource ressource = ressourceRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", id));

        fileService.supprimer(ressource.getCheminFichier());
        ressourceRepo.delete(ressource);
        log.info("Ressource supprimée — id={}", id);
    }

    @Override
    public Path obtenirCheminFichier(Long id, UserRole role, boolean incube, boolean premium) {
        RessourceView vue = ressourceRepo.findProjectedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ressource", id));

        accessControl.verifierAcces(role, incube, premium, vue.getNiveauAcces());

        if (vue.getCheminFichier() == null) {
            throw new ResourceNotFoundException("Aucun fichier attaché à cette ressource");
        }

        ressourceRepo.incrementerTelechargements(id);
        return fileService.obtenirChemin(vue.getCheminFichier());
    }


    @Override
    public Map<String, Object> getStats(Long userId) {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("totalRessources",     ressourceRepo.count());
        stats.put("ressourcesPubliees",   ressourceRepo.countByPublieTrue());
        stats.put("publiques",  ressourceRepo.countByNiveauAcces(AccessLevel.PUBLIC));
        stats.put("incubes",    ressourceRepo.countByNiveauAcces(AccessLevel.INCUBES));
        stats.put("payantes",   ressourceRepo.countByNiveauAcces(AccessLevel.PAYANT));

        Map<String, Long> parType = new LinkedHashMap<>();
        for (ResourceType type : ResourceType.values()) {
            parType.put(type.name(), ressourceRepo.countByType(type));
        }
        stats.put("parType", parType);

        if (userId != null) {
            stats.put("mesConsultees",
                progressionRepo.countByUtilisateurIdAndStatut(userId, ProgressStatus.IN_PROGRESS));
            stats.put("mesCompletees",
                progressionRepo.countByUtilisateurIdAndStatut(userId, ProgressStatus.COMPLETED));
        }

        return stats;
    }


    private Ressource construireRessource(
            String titre, String description, ResourceType type, AccessLevel niveauAcces,
            Integer dureeSec, Integer nombrePages, Boolean publie, Long adminId) {

        Ressource r = new Ressource();
        r.setTitre(titre);
        r.setDescription(description);
        r.setType(type);
        r.setNiveauAcces(niveauAcces);
        r.setDureeSec(dureeSec);
        r.setNombrePages(nombrePages);
        r.setPublie(publie != null ? publie : false);
        r.setCreateurId(adminId);
        return r;
    }

    private void gererContenu(Ressource r, MultipartFile fichier, String urlExterne, ResourceType type) {
        if (fichier != null && !fichier.isEmpty()) {
            r.setCheminFichier(fileService.sauvegarder(fichier, type));
            r.setNomFichierOriginal(fichier.getOriginalFilename());
            r.setMimeType(fichier.getContentType());
            r.setTailleFichierOctets(fichier.getSize());
        }
        if (StringUtils.hasText(urlExterne)) {
            r.setUrlExterne(urlExterne.trim());
        }
    }

    private void gererCategorie(Ressource r, Long categorieId) {
        if (categorieId != null) {
            Categorie cat = categorieRepo.findById(categorieId)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie", categorieId));
            r.setCategorie(cat);
        }
    }

    private void gererTags(Ressource r, List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) return;

        List<Tag> tagList = tagNames.stream()
            .filter(StringUtils::hasText)
            .map(nom -> tagRepo.findByNom(nom.trim())
                .orElseGet(() -> tagRepo.save(Tag.builder().nom(nom.trim()).build())))
            .collect(Collectors.toList());

        r.setTags(tagList);
    }
}
