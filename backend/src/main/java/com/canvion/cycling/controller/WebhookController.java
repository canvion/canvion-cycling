package com.canvion.cycling.controller;

import com.canvion.cycling.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;

    @Value("${strava.webhook.verify-token:canvion_webhook_secret}")
    private String verifyToken;

    // Strava llama a esto UNA VEZ cuando registras el webhook
    // para verificar que el servidor existe y responde bien
    @GetMapping("/strava")
    public ResponseEntity<Map<String, String>> verify(
            @RequestParam("hub.mode")          String mode,
            @RequestParam("hub.verify_token")  String token,
            @RequestParam("hub.challenge")     String challenge
    ) {
        log.info("Strava solicita verificación del webhook");

        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            log.info("Webhook verificado correctamente");
            return ResponseEntity.ok(Map.of("hub.challenge", challenge));
        }

        log.warn("Verificación fallida: token incorrecto");
        return ResponseEntity.status(403).build();
    }

    // Strava llama a esto cada vez que hay una actividad nueva, editada o borrada
    @PostMapping("/strava")
    public ResponseEntity<Void> receiveEvent(@RequestBody Map<String, Object> event) {
        log.info("Evento de Strava recibido");
        webhookService.processEvent(event);
        return ResponseEntity.ok().build();
    }
}