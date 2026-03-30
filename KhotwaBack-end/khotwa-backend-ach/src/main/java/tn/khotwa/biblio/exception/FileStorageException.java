package tn.khotwa.biblio.exception;
public class FileStorageException extends RuntimeException {
    public FileStorageException(String msg) { super(msg); }
    public FileStorageException(String msg, Throwable c) { super(msg, c); }
}
