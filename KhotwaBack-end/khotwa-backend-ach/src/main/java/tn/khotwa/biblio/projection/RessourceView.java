package tn.khotwa.biblio.projection;

import tn.khotwa.biblio.enums.AccessLevel;
import tn.khotwa.biblio.enums.ResourceType;

import java.time.LocalDateTime;


public interface RessourceView {

    Long getId();
    String getTitre();
    String getDescription();
    ResourceType getType();
    AccessLevel getNiveauAcces();
    String getCheminFichier();
    String getUrlExterne();
    String getNomFichierOriginal();
    String getMimeType();
    Long getTailleFichierOctets();
    Integer getDureeSec();
    Integer getNombrePages();
    Boolean getPublie();
    Integer getVues();
    Integer getTelechargements();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();

    CategorieView getCategorie();

    default String getTailleFormatee() {
        Long octets = getTailleFichierOctets();
        if (octets == null) return null;
        if (octets < 1_024)           return octets + " B";
        if (octets < 1_048_576)       return String.format("%.1f KB", octets / 1_024.0);
        if (octets < 1_073_741_824)   return String.format("%.1f MB", octets / 1_048_576.0);
        return String.format("%.1f GB", octets / 1_073_741_824.0);
    }

    default String getUrlFichier() {
        return getCheminFichier() != null
            ? "/khotwa/api/ressources/" + getId() + "/download"
            : getUrlExterne();
    }
}
