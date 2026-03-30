package tn.khotwa.biblio.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import tn.khotwa.biblio.enums.ResourceType;
import tn.khotwa.biblio.exception.FileStorageException;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String sauvegarder(MultipartFile fichier, ResourceType type) {
        valider(fichier, type);
        String ext  = extension(StringUtils.cleanPath(fichier.getOriginalFilename()));
        String nom  = UUID.randomUUID() + "." + ext;
        String sous = type.name().toLowerCase();
        try {
            Path dir = Paths.get(uploadDir, sous);
            Files.createDirectories(dir);
            fichier.transferTo(dir.resolve(nom));
            String chemin = sous + "/" + nom;
            log.info("Fichier sauvegardé : {}", chemin);
            return chemin;
        } catch (IOException e) {
            throw new FileStorageException("Impossible de sauvegarder le fichier", e);
        }
    }

    public void supprimer(String chemin) {
        if (chemin == null) return;
        try { Files.deleteIfExists(Paths.get(uploadDir, chemin)); }
        catch (IOException e) { log.warn("Impossible de supprimer : {}", chemin); }
    }

    public Path obtenirChemin(String chemin) {
        return Paths.get(uploadDir).resolve(chemin).normalize();
    }

    private void valider(MultipartFile f, ResourceType type) {
        if (f.isEmpty()) throw new FileStorageException("Fichier vide");
        String mime = f.getContentType();
        if (mime == null || mime.isBlank() || "application/octet-stream".equals(mime)) {
            log.warn("MIME générique reçu ({}) — validation par taille uniquement", mime);
            if (type == ResourceType.VIDEO && f.getSize() > 500L * 1024 * 1024)
                throw new FileStorageException("Vidéo trop volumineuse (max 500 MB)");
            if (type != ResourceType.VIDEO && f.getSize() > 50L * 1024 * 1024)
                throw new FileStorageException("Fichier trop volumineux (max 50 MB)");
            return;
        }

        switch (type) {
            case PDF   -> check(mime, "application/pdf");
            case VIDEO -> { check(mime, "video/mp4", "video/mpeg", "video/quicktime");
                           if (f.getSize() > 500L*1024*1024) throw new FileStorageException("Vidéo > 500 MB"); }
            case EXCEL -> check(mime,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel");
            case WORD  -> check(mime,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword");
            case IMAGE -> check(mime, "image/jpeg", "image/png", "image/webp", "image/gif");
            case LINK  -> {}
        }
        if (type != ResourceType.VIDEO && f.getSize() > 50L * 1024 * 1024)
            throw new FileStorageException("Fichier trop volumineux (max 50 MB)");
    }

    private void check(String mime, String... accepted) {
        for (String a : accepted) if (a.equals(mime)) return;
        throw new FileStorageException("Type MIME non autorisé : " + mime);
    }

    private String extension(String nom) {
        int i = nom.lastIndexOf('.');
        return i >= 0 ? nom.substring(i + 1).toLowerCase() : "bin";
    }
}
