package org.arise.common.exception;

import org.springframework.validation.FieldError;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> fieldErrors
) {
    public record FieldError(String field, String message) {}

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ErrorResponse ofFieldErrors(int status, String error, String path, List<FieldError> fieldErrors) {
        return new ErrorResponse(Instant.now(), status, error, "Validation failed", path, fieldErrors);
    }

}
