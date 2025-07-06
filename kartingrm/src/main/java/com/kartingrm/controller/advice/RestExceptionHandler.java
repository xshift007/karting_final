package com.kartingrm.controller.advice;

import com.kartingrm.exception.OverlapException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(OverlapException.class)
    public ResponseEntity<ApiError> handleOverlap(OverlapException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError("SESSION_OVERLAP", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex){
        boolean sd = ex.getFieldErrors().stream()
                .anyMatch(f -> f.getDefaultMessage()
                        .toLowerCase()
                        .contains("specialday"));
        return ResponseEntity.badRequest()
                .body(new ApiError(sd ? "SPECIAL_DAY_MISMATCH" : "BAD_REQUEST",
                        ex.getFieldErrors().get(0).getDefaultMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex){

        /* Códigos específicos para la UI */
        String code =
                ex.getMessage().contains("Capacidad de la sesión")
                        ? "CAPACITY_EXCEEDED"
                : ex.getMessage().contains("Horario no disponible")
                        ? "SESSION_OVERLAP"
                : "CONFLICT";

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(code, ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> duplicate(DataIntegrityViolationException ex){
        if (ex.getMessage().contains("reservation_code")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiError("DUPLICATE_CODE","El código ya existe"));
        }
        return ResponseEntity.internalServerError()
                .body(new ApiError("INTERNAL_ERROR","Error interno"));
    }
}
