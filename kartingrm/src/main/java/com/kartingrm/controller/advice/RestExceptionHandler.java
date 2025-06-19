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
        return ResponseEntity.badRequest()
                .body(new ApiError("BAD_REQUEST",
                        ex.getFieldErrors().get(0).getDefaultMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)          // 409
                .body(new ApiError("CONFLICT", ex.getMessage()));
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
