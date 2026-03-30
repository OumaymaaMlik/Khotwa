package tn.khotwa.biblio.service;

import org.springframework.stereotype.Service;
import tn.khotwa.biblio.enums.AccessLevel;
import tn.khotwa.biblio.enums.UserRole;
import tn.khotwa.biblio.exception.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AccessControlService {

    public void verifierAcces(UserRole role, boolean incube, boolean premium, AccessLevel niveau) {
        switch (niveau) {
            case PUBLIC -> {}
            case INCUBES -> {
                if (role == null) throw new AccessDeniedException("Connexion requise.");
                if (role == UserRole.ENTREPRENEUR && !incube)
                    throw new AccessDeniedException("Réservé aux entrepreneurs incubés.");
            }
            case PAYANT -> {
                if (role == null) throw new AccessDeniedException("Connexion requise.");
                if (role == UserRole.ENTREPRENEUR && !premium)
                    throw new AccessDeniedException("Abonnement Premium requis.");
            }
        }
    }

    public List<AccessLevel> getNiveauxAccessibles(UserRole role, boolean incube, boolean premium) {
        if (role == null) return List.of(AccessLevel.PUBLIC);
        return switch (role) {
            case ADMIN, COACH -> List.of(AccessLevel.PUBLIC, AccessLevel.INCUBES, AccessLevel.PAYANT);
            case ENTREPRENEUR -> {
                var l = new ArrayList<AccessLevel>();
                l.add(AccessLevel.PUBLIC);
                if (incube)  l.add(AccessLevel.INCUBES);
                if (premium) l.add(AccessLevel.PAYANT);
                yield l;
            }
        };
    }
}
