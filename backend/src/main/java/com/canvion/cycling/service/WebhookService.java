package com.canvion.cycling.service;

import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import com.canvion.cycling.repository.ActivityRepository;
import com.canvion.cycling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final StravaService stravaService;

    // Punto de entrada — Strava nos manda un evento y lo procesamos aquí
    public void processEvent(Map<String, Object> event) {

        String objectType = (String) event.get("object_type"); // "activity" o "athlete"
        String aspectType = (String) event.get("aspect_type"); // "create", "update" o "delete"
        Long objectId     = getLong(event, "object_id");       // id de la actividad en Strava
        Long ownerId      = getLong(event, "owner_id");        // id del atleta en Strava

        log.info("Webhook recibido → tipo: {} acción: {} actividadId: {}", objectType, aspectType, objectId);

        // Solo nos interesan eventos de actividades
        if (!"activity".equals(objectType)) {
            log.info("Evento ignorado, no es una actividad");
            return;
        }

        if ("create".equals(aspectType)) {
            handleCreate(objectId, ownerId);
        } else if ("update".equals(aspectType)) {
            handleUpdate(objectId, ownerId);
        } else if ("delete".equals(aspectType)) {
            handleDelete(objectId);
        }
    }

    // Actividad nueva en Strava → guardarla en nuestra BD
    private void handleCreate(Long stravaActivityId, Long stravaAthleteId) {

        // Si ya existe en BD no hacemos nada (evitar duplicados)
        Optional<Activity> existing = activityRepository.findByStravaActivityId(stravaActivityId);
        if (existing.isPresent()) {
            log.info("Actividad {} ya existe, ignorando", stravaActivityId);
            return;
        }

        // Buscar el usuario por su id de atleta en Strava
        Optional<User> userOpt = userRepository.findByStravaAthleteId(stravaAthleteId);
        if (userOpt.isEmpty()) {
            log.warn("No se encontró usuario con stravaAthleteId={}", stravaAthleteId);
            return;
        }

        try {
            stravaService.fetchAndSaveActivity(userOpt.get(), stravaActivityId);
            log.info("Actividad {} guardada correctamente", stravaActivityId);
        } catch (Exception e) {
            log.error("Error al guardar actividad {}: {}", stravaActivityId, e.getMessage());
        }
    }

    // Actividad editada en Strava → actualizarla en nuestra BD
    private void handleUpdate(Long stravaActivityId, Long stravaAthleteId) {

        Optional<Activity> existingOpt = activityRepository.findByStravaActivityId(stravaActivityId);

        if (existingOpt.isPresent()) {
            Optional<User> userOpt = userRepository.findByStravaAthleteId(stravaAthleteId);
            if (userOpt.isEmpty()) {
                log.warn("No se encontró usuario con stravaAthleteId={}", stravaAthleteId);
                return;
            }
            try {
                stravaService.fetchAndUpdateActivity(userOpt.get(), stravaActivityId, existingOpt.get());
                log.info("Actividad {} actualizada correctamente", stravaActivityId);
            } catch (Exception e) {
                log.error("Error al actualizar actividad {}: {}", stravaActivityId, e.getMessage());
            }
        } else {
            // No existe todavía → la creamos directamente
            handleCreate(stravaActivityId, stravaAthleteId);
        }
    }

    // Actividad borrada en Strava → borrarla de nuestra BD
    private void handleDelete(Long stravaActivityId) {
        Optional<Activity> existing = activityRepository.findByStravaActivityId(stravaActivityId);

        if (existing.isPresent()) {
            activityRepository.delete(existing.get());
            log.info("Actividad {} borrada correctamente", stravaActivityId);
        } else {
            log.info("Actividad {} no estaba en BD, nada que borrar", stravaActivityId);
        }
    }

    // Strava a veces manda los ids como Integer y otras como Long, este helper lo resuelve
    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Long)    return (Long) value;
        return null;
    }
}