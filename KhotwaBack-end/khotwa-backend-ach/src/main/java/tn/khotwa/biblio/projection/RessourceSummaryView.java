package tn.khotwa.biblio.projection;

import tn.khotwa.biblio.enums.AccessLevel;
import tn.khotwa.biblio.enums.ResourceType;


public interface RessourceSummaryView {

    Long getId();
    String getTitre();
    ResourceType getType();
    AccessLevel getNiveauAcces();
    Long getTailleFichierOctets();
    Boolean getPublie();
    Integer getVues();
    String getCheminFichier();
    String getUrlExterne();
    CategorieView getCategorie();

    default String getTailleFormatee() {
        Long octets = getTailleFichierOctets();
        if (octets == null) return null;
        if (octets < 1_024)         return octets + " B";
        if (octets < 1_048_576)     return String.format("%.1f KB", octets / 1_024.0);
        if (octets < 1_073_741_824) return String.format("%.1f MB", octets / 1_048_576.0);
        return String.format("%.1f GB", octets / 1_073_741_824.0);
    }

    default String getUrlFichier() {
        return getCheminFichier() != null
            ? "/khotwa/api/ressources/" + getId() + "/download"
            : getUrlExterne();
    }
}
