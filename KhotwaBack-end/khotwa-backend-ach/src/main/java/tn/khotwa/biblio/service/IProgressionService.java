package tn.khotwa.biblio.service;

import tn.khotwa.biblio.enums.ProgressStatus;
import tn.khotwa.biblio.projection.ProgressionView;

import java.util.List;

public interface IProgressionService {

    ProgressionView mettreAJour(
        Long userId, Long ressourceId, ProgressStatus statut,
        Integer pourcentage, Integer positionVideoSec
    );

    ProgressionView marquerCommeTermine(Long userId, Long ressourceId);

    List<ProgressionView> getMesProgressions(Long userId);
}
