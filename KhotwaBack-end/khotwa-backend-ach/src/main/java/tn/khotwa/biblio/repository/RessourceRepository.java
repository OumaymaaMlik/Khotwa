package tn.khotwa.biblio.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.khotwa.biblio.entity.Ressource;
import tn.khotwa.biblio.enums.AccessLevel;
import tn.khotwa.biblio.enums.ResourceType;
import tn.khotwa.biblio.projection.RessourceSummaryView;
import tn.khotwa.biblio.projection.RessourceView;
import tn.khotwa.biblio.projection.TagView;

import java.util.List;
import java.util.Optional;

public interface RessourceRepository extends JpaRepository<Ressource, Long> {


    Optional<RessourceView> findProjectedById(Long id);


    long countByPublieTrue();
    long countByNiveauAcces(AccessLevel niveauAcces);
    long countByType(ResourceType type);


    @Query("SELECT t.id AS id, t.nom AS nom FROM Ressource r JOIN r.tags t WHERE r.id = :id")
    List<TagView> findTagsByRessourceId(@Param("id") Long id);


    // Pour les utilisateurs : seulement les ressources publiées + niveaux accessibles
    @Query("""
        SELECT DISTINCT r FROM Ressource r
        LEFT JOIN r.tags t
        WHERE r.publie = true
          AND r.niveauAcces IN :niveaux
          AND (:type      IS NULL OR r.type = :type)
          AND (:catId     IS NULL OR r.categorie.id = :catId)
          AND (:tagNom    IS NULL OR t.nom = :tagNom)
          AND (:recherche IS NULL
               OR LOWER(r.titre)       LIKE LOWER(CONCAT('%', :recherche, '%'))
               OR LOWER(r.description) LIKE LOWER(CONCAT('%', :recherche, '%')))
    """)
    Page<RessourceSummaryView> findPubliesAvecFiltres(
        @Param("niveaux")    List<AccessLevel> niveaux,
        @Param("type")       ResourceType type,
        @Param("catId")      Long catId,
        @Param("tagNom")     String tagNom,
        @Param("recherche")  String recherche,
        Pageable pageable
    );

    @Query("""
        SELECT DISTINCT r FROM Ressource r
        LEFT JOIN r.tags t
        WHERE r.niveauAcces IN :niveaux
          AND (:type      IS NULL OR r.type = :type)
          AND (:catId     IS NULL OR r.categorie.id = :catId)
          AND (:tagNom    IS NULL OR t.nom = :tagNom)
          AND (:recherche IS NULL
               OR LOWER(r.titre)       LIKE LOWER(CONCAT('%', :recherche, '%'))
               OR LOWER(r.description) LIKE LOWER(CONCAT('%', :recherche, '%')))
    """)
    Page<RessourceSummaryView> findToutesAvecFiltres(
        @Param("niveaux")    List<AccessLevel> niveaux,
        @Param("type")       ResourceType type,
        @Param("catId")      Long catId,
        @Param("tagNom")     String tagNom,
        @Param("recherche")  String recherche,
        Pageable pageable
    );


    @Modifying
    @Query("UPDATE Ressource r SET r.vues = r.vues + 1 WHERE r.id = :id")
    void incrementerVues(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Ressource r SET r.telechargements = r.telechargements + 1 WHERE r.id = :id")
    void incrementerTelechargements(@Param("id") Long id);
}
