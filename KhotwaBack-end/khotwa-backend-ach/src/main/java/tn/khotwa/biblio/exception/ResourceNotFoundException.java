package tn.khotwa.biblio.exception;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
    public ResourceNotFoundException(String entity, Long id) { super(entity + " introuvable — id : " + id); }
}
