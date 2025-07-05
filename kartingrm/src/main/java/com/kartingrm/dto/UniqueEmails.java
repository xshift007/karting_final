package com.kartingrm.dto;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmails {
    String message() default "Los correos electrónicos de los participantes deben ser únicos";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
