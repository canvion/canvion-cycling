package com.canvion.cycling.controller;

import com.canvion.cycling.dto.activity.ActivityRequest;
import com.canvion.cycling.dto.activity.ActivityResponse;
import com.canvion.cycling.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // ========================================
    // NUEVO - Endpoint con paginación
    // ========================================
    @GetMapping
    public ResponseEntity<Page<ActivityResponse>> getActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Validar tamaño máximo por página
        if (size > 100) {
            size = 100;
        }

        // Validar página negativa
        if (page < 0) {
            page = 0;
        }

        Page<ActivityResponse> activities = activityService.getActivitiesPaginated(
                username, page, size, sortBy, direction
        );

        return ResponseEntity.ok(activities);
    }

    // ========================================
    // OPCIONAL - Endpoint legacy sin paginación
    // Mantener para compatibilidad si lo necesitas
    // ========================================
    @GetMapping("/all")
    public ResponseEntity<List<ActivityResponse>> getAllActivities() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ActivityResponse> activities = activityService.getUserActivities(username);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ActivityResponse activity = activityService.getActivityById(id, username);
        return ResponseEntity.ok(activity);
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(@Valid @RequestBody ActivityRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ActivityResponse activity = activityService.createActivity(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(activity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request
    ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ActivityResponse activity = activityService.updateActivity(id, request, username);
        return ResponseEntity.ok(activity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        activityService.deleteActivity(id, username);
        return ResponseEntity.noContent().build();
    }
}