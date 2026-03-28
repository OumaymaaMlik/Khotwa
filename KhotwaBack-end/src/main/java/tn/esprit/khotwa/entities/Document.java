package tn.esprit.khotwa.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nomFichier;

    private String nomOriginal;

    private String typeContenu;

    @Column(nullable = false)
    private String cheminStockage;

    private Long tailleFichier;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateUpload;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tache_id", nullable = false)
    @NotNull
    private Tache tache;

    public Document() {
    }

    public Document(Long id, String nomFichier, String nomOriginal, String typeContenu, String cheminStockage, Long tailleFichier, LocalDateTime dateUpload, Tache tache) {
        this.id = id;
        this.nomFichier = nomFichier;
        this.nomOriginal = nomOriginal;
        this.typeContenu = typeContenu;
        this.cheminStockage = cheminStockage;
        this.tailleFichier = tailleFichier;
        this.dateUpload = dateUpload;
        this.tache = tache;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomFichier() {
        return nomFichier;
    }

    public void setNomFichier(String nomFichier) {
        this.nomFichier = nomFichier;
    }

    public String getNomOriginal() {
        return nomOriginal;
    }

    public void setNomOriginal(String nomOriginal) {
        this.nomOriginal = nomOriginal;
    }

    public String getTypeContenu() {
        return typeContenu;
    }

    public void setTypeContenu(String typeContenu) {
        this.typeContenu = typeContenu;
    }

    public String getCheminStockage() {
        return cheminStockage;
    }

    public void setCheminStockage(String cheminStockage) {
        this.cheminStockage = cheminStockage;
    }

    public Long getTailleFichier() {
        return tailleFichier;
    }

    public void setTailleFichier(Long tailleFichier) {
        this.tailleFichier = tailleFichier;
    }

    public LocalDateTime getDateUpload() {
        return dateUpload;
    }

    public void setDateUpload(LocalDateTime dateUpload) {
        this.dateUpload = dateUpload;
    }

    public Tache getTache() {
        return tache;
    }

    public void setTache(Tache tache) {
        this.tache = tache;
    }
}
