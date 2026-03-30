package tn.khotwa.biblio.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.khotwa.biblio.entity.*;
import tn.khotwa.biblio.enums.*;
import tn.khotwa.biblio.repository.*;

import java.util.List;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategorieRepository categorieRepo;
    private final TagRepository        tagRepo;
    private final RessourceRepository  ressourceRepo;

    @Override
    public void run(String... args) {
        if (categorieRepo.count() > 0) {
            log.info("Base déjà initialisée — DataInitializer ignoré.");
            return;
        }

        // Catégories
        Categorie strategie = categorieRepo.save(Categorie.builder().nom("Stratégie").couleur("#E8622A").icone("📁").build());
        Categorie juridique = categorieRepo.save(Categorie.builder().nom("Juridique").couleur("#7C5CBF").icone("⚖️").build());
        Categorie formation = categorieRepo.save(Categorie.builder().nom("Formation").couleur("#2ABFBF").icone("🎓").build());
        Categorie outils    = categorieRepo.save(Categorie.builder().nom("Outils").couleur("#27AE7A").icone("🛠️").build());

        // Tags
        Tag bmc   = tagRepo.save(Tag.builder().nom("BMC").build());
        Tag pitch = tagRepo.save(Tag.builder().nom("Pitch").build());
        Tag sarl  = tagRepo.save(Tag.builder().nom("SARL").build());
        Tag excel = tagRepo.save(Tag.builder().nom("Excel").build());

        // Ressources de démonstration
        ressourceRepo.save(Ressource.builder()
            .titre("Guide Business Plan")
            .description("Modèle complet adapté aux startups tunisiennes.")
            .type(ResourceType.PDF)
            .niveauAcces(AccessLevel.INCUBES)
            .nomFichierOriginal("bp.pdf")
            .mimeType("application/pdf")
            .tailleFichierOctets(2_400_000L)
            .nombrePages(45)
            .publie(true)
            .categorie(strategie)
            .tags(List.of(bmc))
            .createurId(1L)
            .build());

        ressourceRepo.save(Ressource.builder()
            .titre("Template BMC Excel")
            .description("Fichier interactif pour construire votre Business Model Canvas.")
            .type(ResourceType.EXCEL)
            .niveauAcces(AccessLevel.PUBLIC)
            .nomFichierOriginal("bmc.xlsx")
            .mimeType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            .tailleFichierOctets(850_000L)
            .publie(true)
            .categorie(outils)
            .tags(List.of(bmc, excel))
            .createurId(1L)
            .build());

        ressourceRepo.save(Ressource.builder()
            .titre("Masterclass : Pitcher sa Startup")
            .description("Vidéo 45 min — Dr. Ben Salem explique comment captiver les investisseurs.")
            .type(ResourceType.VIDEO)
            .niveauAcces(AccessLevel.PAYANT)
            .nomFichierOriginal("pitch.mp4")
            .mimeType("video/mp4")
            .tailleFichierOctets(250_000_000L)
            .dureeSec(2700)
            .publie(true)
            .categorie(formation)
            .tags(List.of(pitch))
            .createurId(1L)
            .build());

        ressourceRepo.save(Ressource.builder()
            .titre("Guide SARL Tunisie")
            .description("Les 7 étapes légales pour immatriculer votre société en Tunisie.")
            .type(ResourceType.PDF)
            .niveauAcces(AccessLevel.INCUBES)
            .nomFichierOriginal("sarl.pdf")
            .mimeType("application/pdf")
            .tailleFichierOctets(1_200_000L)
            .nombrePages(28)
            .publie(true)
            .categorie(juridique)
            .tags(List.of(sarl))
            .createurId(1L)
            .build());

        log.info("✓ Données de démonstration créées : 4 catégories, 4 tags, 4 ressources.");
    }
}
