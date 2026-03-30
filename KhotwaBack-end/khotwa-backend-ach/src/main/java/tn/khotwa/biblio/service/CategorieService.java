package tn.khotwa.biblio.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.khotwa.biblio.entity.Categorie;
import tn.khotwa.biblio.exception.ResourceNotFoundException;
import tn.khotwa.biblio.projection.CategorieView;
import tn.khotwa.biblio.repository.CategorieRepository;

import java.util.List;

@Service @RequiredArgsConstructor @Transactional
public class CategorieService implements ICategorieService {

    private final CategorieRepository repo;

    @Override public List<CategorieView> listerToutes() { return repo.findAllProjectedBy(); }

    @Override public CategorieView getParId(Long id) {
        return repo.findProjectedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
    }

    @Override public CategorieView creer(String nom, String description, String couleur, String icone) {
        Categorie saved = repo.save(Categorie.builder()
            .nom(nom).description(description).couleur(couleur).icone(icone).build());
        return repo.findProjectedById(saved.getId()).orElseThrow();
    }

    @Override public CategorieView mettreAJour(Long id, String nom, String description,
                                               String couleur, String icone) {
        Categorie c = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
        if (nom         != null) c.setNom(nom);
        if (description != null) c.setDescription(description);
        if (couleur     != null) c.setCouleur(couleur);
        if (icone       != null) c.setIcone(icone);
        repo.save(c);
        return repo.findProjectedById(id).orElseThrow();
    }

    @Override public void supprimer(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Catégorie", id);
        repo.deleteById(id);
    }
}
