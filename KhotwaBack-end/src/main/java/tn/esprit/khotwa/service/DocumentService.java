package tn.esprit.khotwa.service;

import tn.esprit.khotwa.GlobalExceptionHandler.BusinessRuleException;
import tn.esprit.khotwa.GlobalExceptionHandler.ResourceNotFoundException;
import tn.esprit.khotwa.entities.Document;
import tn.esprit.khotwa.entities.Tache;
import tn.esprit.khotwa.repository.DocumentRepository;
import tn.esprit.khotwa.repository.TacheRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class DocumentService {

    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/png", "image/jpeg");
    private static final String STORAGE_DIR = "uploads/documents/";

    private final DocumentRepository documentRepository;
    private final TacheRepository tacheRepository;

    public DocumentService(DocumentRepository documentRepository, TacheRepository tacheRepository) {
        this.documentRepository = documentRepository;
        this.tacheRepository = tacheRepository;
    }

    @PostConstruct
    public void initStorage() {
        try {
            Files.createDirectories(Paths.get(STORAGE_DIR));
        } catch (IOException e) {
            throw new BusinessRuleException("Impossible de creer le dossier de stockage des documents.");
        }
    }

    public record DocumentResponse(
            Long id,
            String nomFichier,
            String nomOriginal,
            String typeContenu,
            Long tailleFichier,
            LocalDateTime dateUpload,
            Long tacheId
    ) {
    }

    public DocumentResponse uploadDocument(Long tacheId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("Le fichier est obligatoire.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessRuleException("Type MIME invalide. Types autorises: application/pdf, image/png, image/jpeg.");
        }

        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable avec l'id: " + tacheId));

        String originalName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String extension = extractExtension(originalName);
        String uniqueFilename = UUID.randomUUID() + extension;

        Path storagePath = Paths.get(STORAGE_DIR).resolve(uniqueFilename).normalize();

        try {
            Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessRuleException("Echec lors de l'upload du fichier.");
        }

        Document document = new Document();
        document.setNomFichier(uniqueFilename);
        document.setNomOriginal(originalName);
        document.setTypeContenu(contentType);
        document.setCheminStockage(storagePath.toString());
        document.setTailleFichier(file.getSize());
        document.setTache(tache);

        return toResponse(documentRepository.save(document));
    }

    public Resource telechargerDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable avec l'id: " + id));

        try {
            Resource resource = new UrlResource(Paths.get(document.getCheminStockage()).toUri());
            if (!resource.exists()) {
                throw new ResourceNotFoundException("Fichier physique introuvable pour le document id: " + id);
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new BusinessRuleException("Chemin de fichier invalide pour le document id: " + id);
        }
    }

    public List<DocumentResponse> getDocumentsByTache(Long tacheId) {
        return documentRepository.findByTacheId(tacheId)
                .stream()
                .map(DocumentService::toResponse)
                .toList();
    }

    public void supprimerDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable avec l'id: " + id));

        Path filePath = Paths.get(document.getCheminStockage());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new BusinessRuleException("Impossible de supprimer le fichier physique du document id: " + id);
        }

        documentRepository.delete(document);
    }

    public DocumentResponse getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable avec l'id: " + id));
        return toResponse(document);
    }

    public static DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getNomFichier(),
                document.getNomOriginal(),
                document.getTypeContenu(),
                document.getTailleFichier(),
                document.getDateUpload(),
                document.getTache() != null ? document.getTache().getId() : null
        );
    }

    private String extractExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot);
    }
}
