package com.canvion.cycling;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CyclingApplication {

    public static void main(String[] args) {
        SpringApplication.run(CyclingApplication.class, args);
        System.out.println("🚴 Canvion Cycling API is running!");
        System.out.println("📍 Server started on: http://localhost:8080");
    }
}
