package tn.esprit.khotwa.controller;

import tn.esprit.khotwa.service.DocumentService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/tache/{tacheId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(CREATED)
    @Operation(summary = "Uploader un document pour une tache")
    @RequestBody(
            required = true,
            content = @Content(
                    mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UploadDocumentBody.class)
            )
    )
    public DocumentService.DocumentResponse uploadDocument(@PathVariable Long tacheId,
                                                           @RequestParam("file") MultipartFile file) {
        return documentService.uploadDocument(tacheId, file);
    }

    private static class UploadDocumentBody {
        @Schema(type = "string", format = "binary")
        public String file;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Telecharger un document")
    public ResponseEntity<Resource> telechargerDocument(@PathVariable Long id) {
        Resource resource = documentService.telechargerDocument(id);
        DocumentService.DocumentResponse meta = documentService.getDocumentById(id);

        MediaType mediaType;
        try {
            mediaType = meta.typeContenu() != null ? MediaType.parseMediaType(meta.typeContenu()) : MediaType.APPLICATION_OCTET_STREAM;
        } catch (IllegalArgumentException ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        String filename = meta.nomOriginal() != null ? meta.nomOriginal() : meta.nomFichier();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(resource);
    }

    @GetMapping("/tache/{tacheId}")
    @Operation(summary = "Lister les documents d'une tache")
    public List<DocumentService.DocumentResponse> getDocumentsByTache(@PathVariable Long tacheId) {
        return documentService.getDocumentsByTache(tacheId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(NO_CONTENT)
    @Operation(summary = "Supprimer un document")
    public void supprimerDocument(@PathVariable Long id) {
        documentService.supprimerDocument(id);
    }
}
