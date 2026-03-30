package tn.khotwa.biblio.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import tn.khotwa.biblio.enums.AccessLevel;
import tn.khotwa.biblio.enums.ResourceType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "ressources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ressource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 200)
    private String titre;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessLevel niveauAcces;

    @Column(length = 512)
    private String cheminFichier;

    @Column(length = 255)
    private String nomFichierOriginal;

    @Column(length = 100)
    private String mimeType;

    private Long tailleFichierOctets;

    @Column(length = 2048)
    private String urlExterne;


    private Integer dureeSec;
    private Integer nombrePages;

    @Column(nullable = false)
    @Builder.Default
    private Boolean publie = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer vues = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer telechargements = 0;


    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    private Categorie categorie;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "ressource_tags")
    @Builder.Default
    @ToString.Exclude
    private List<Tag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "ressource", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<ProgressionUtilisateur> progressions = new ArrayList<>();

    @Column(name = "createur_id")
    private Long createurId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
