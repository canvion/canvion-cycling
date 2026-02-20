package com.canvion.cycling.controller;

import com.canvion.cycling.model.Activity;
import com.canvion.cycling.service.StravaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/strava")
@RequiredArgsConstructor
public class StravaController {

    private final StravaService stravaService;

    @GetMapping("/connect")
    public ResponseEntity<Map<String, String>> getConnectionUrl() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        String authUrl = stravaService.getAuthorizationUrl(username);

        Map<String, String> response = new HashMap<>();
        response.put("authorizationUrl", authUrl);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/callback")
    public ResponseEntity<String> handleCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String username,
            @RequestParam(value = "scope", required = false) String scope
    ) {
        try {
            if (username == null || username.isEmpty()) {
                return ResponseEntity.ok(
                        "<html><body>" +
                                "<h2>Error: No se pudo identificar al usuario</h2>" +
                                "<p>Inténtalo de nuevo desde la aplicación.</p>" +
                                "</body></html>"
                );
            }

            stravaService.connectStrava(code, username);

            return ResponseEntity.ok(
                    "<html><body>" +
                            "<h2>¡Strava conectado exitosamente!</h2>" +
                            "<p>Puedes cerrar esta ventana y volver a la aplicación.</p>" +
                            "<script>window.close();</script>" +
                            "</body></html>"
            );
        } catch (Exception e) {
            return ResponseEntity.ok(
                    "<html><body>" +
                            "<h2>Error al conectar con Strava</h2>" +
                            "<p>" + e.getMessage() + "</p>" +
                            "</body></html>"
            );
        }
    }

    @PostMapping("/disconnect")
    public ResponseEntity<Map<String, String>> disconnect() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            stravaService.disconnectStrava(username);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Strava desconectado exitosamente");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error al desconectar Strava: " + e.getMessage());
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncActivities() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            List<Activity> newActivities = stravaService.syncActivities(username);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sincronización completada");
            response.put("newActivitiesCount", newActivities.size());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error al sincronizar actividades: " + e.getMessage());
        }
    }
}