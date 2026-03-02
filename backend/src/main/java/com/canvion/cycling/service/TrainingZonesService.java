package com.canvion.cycling.service;

import com.canvion.cycling.dto.zones.ActivityZonesResponse;
import com.canvion.cycling.dto.zones.ZoneResult;
import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import com.canvion.cycling.repository.ActivityRepository;
import com.canvion.cycling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingZonesService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    // ─────────────────────────────────────────
    // Guardar FC máxima del usuario
    // ─────────────────────────────────────────
    public void saveMaxHeartrate(String username, Integer maxHeartrate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setMaxHeartrate(maxHeartrate);
        userRepository.save(user);
    }

    // ─────────────────────────────────────────
    // Obtener FC máxima configurada
    // ─────────────────────────────────────────
    public Integer getMaxHeartrate(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return user.getMaxHeartrate();
    }

    // ─────────────────────────────────────────
    // Calcular zonas de una actividad concreta
    // ─────────────────────────────────────────
    public ActivityZonesResponse getZonesForActivity(Long activityId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario tiene FC máxima configurada
        if (user.getMaxHeartrate() == null) {
            throw new RuntimeException("Configura tu FC máxima antes en /api/zones/config");
        }

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

        // Verificar que la actividad pertenece al usuario
        if (!activity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No tienes permiso para ver esta actividad");
        }

        // Verificar que la actividad tiene datos de FC
        if (activity.getAverageHeartrate() == null) {
            throw new RuntimeException("Esta actividad no tiene datos de frecuencia cardíaca");
        }

        return calcularZonas(activity, user.getMaxHeartrate());
    }

    // ─────────────────────────────────────────
    // Lógica de cálculo de zonas (privado)
    // ─────────────────────────────────────────
    private ActivityZonesResponse calcularZonas(Activity activity, int maxHR) {

        // Construir las 5 zonas con sus rangos según % de FC máxima
        List<ZoneResult> zonas = new ArrayList<>();
        zonas.add(new ZoneResult(1, "Recuperación",   0,                  (int)(maxHR * 0.60), "Recuperación activa, muy baja intensidad"));
        zonas.add(new ZoneResult(2, "Base aeróbica",  (int)(maxHR * 0.60), (int)(maxHR * 0.70), "Quema de grasa, resistencia base"));
        zonas.add(new ZoneResult(3, "Tempo",           (int)(maxHR * 0.70), (int)(maxHR * 0.80), "Ritmo de carrera sostenido"));
        zonas.add(new ZoneResult(4, "Umbral",          (int)(maxHR * 0.80), (int)(maxHR * 0.90), "Mejora del rendimiento, esfuerzo alto"));
        zonas.add(new ZoneResult(5, "Máximo",          (int)(maxHR * 0.90), maxHR,               "Sprint, VO2max, esfuerzo máximo"));

        int fcMedia = activity.getAverageHeartrate();
        int zonaActiva = 1;
        String nombreZonaActiva = "Recuperación";

        // Determinar en qué zona estuvo el usuario
        for (ZoneResult zona : zonas) {
            if (fcMedia >= zona.getMinBpm() && fcMedia <= zona.getMaxBpm()) {
                zona.setActive(true);
                zonaActiva = zona.getZoneNumber();
                nombreZonaActiva = zona.getZoneName();
                break;
            }
        }

        // Construir respuesta
        ActivityZonesResponse response = new ActivityZonesResponse();
        response.setActivityId(activity.getId());
        response.setActivityName(activity.getName());
        response.setAverageHeartrate(fcMedia);
        response.setMaxHeartrateUsed(maxHR);
        response.setActiveZone(zonaActiva);
        response.setActiveZoneName(nombreZonaActiva);
        response.setAllZones(zonas);

        return response;
    }
}