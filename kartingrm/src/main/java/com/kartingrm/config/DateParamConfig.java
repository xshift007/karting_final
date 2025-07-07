package com.kartingrm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDate;

@Configuration
public class DateParamConfig implements WebMvcConfigurer {
    @Override
    public void addFormatters(FormatterRegistry r) {
        r.addConverter(String.class, LocalDate.class,
                s -> LocalDate.parse(s.substring(0, 10))); // acepta "2025-07-09" o "2025-07-09T00:00:00Z"
    }
}
