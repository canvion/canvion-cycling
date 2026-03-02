package com.canvion.cycling.controller;

import com.canvion.cycling.dto.zones.ActivityZonesResponse;
import com.canvion.cycling.dto.zones.ZoneConfigRequest;
import com.canvion.cycling.service.TrainingZonesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class TrainingZonesController {

    private final TrainingZonesService trainingZonesService;

    // GET /api/zones/config → ver FC máxima guardada
    @GetMapping("/config")
    public ResponseEntity<Map<String, Integer>> getConfig() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Integer maxHR = trainingZonesService.getMaxHeartrate(username);
        return ResponseEntity.ok(Map.of("maxHeartrate", maxHR != null ? maxHR : 0));
    }

    // POST /api/zones/config → guardar FC máxima
    @PostMapping("/config")
    public ResponseEntity<Map<String, String>> saveConfig(@Valid @RequestBody ZoneConfigRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        trainingZonesService.saveMaxHeartrate(username, request.getMaxHeartrate());
        return ResponseEntity.ok(Map.of("message", "FC máxima guardada correctamente"));
    }

    // GET /api/zones/activity/{id} → zonas de una actividad
    @GetMapping("/activity/{id}")
    public ResponseEntity<ActivityZonesResponse> getActivityZones(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ActivityZonesResponse response = trainingZonesService.getZonesForActivity(id, username);
        return ResponseEntity.ok(response);
    }
}