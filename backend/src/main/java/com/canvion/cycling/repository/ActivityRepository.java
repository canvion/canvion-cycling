package com.canvion.cycling.repository;

import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // Método original (sin paginación)
    List<Activity> findByUserOrderByStartDateDesc(User user);

    // NUEVO - Método con paginación
    Page<Activity> findByUserId(Long userId, Pageable pageable);

    boolean existsByStravaActivityId(Long stravaActivityId);

    // Buscar actividades de un usuario entre dos fechas
    List<Activity> findByUserIdAndStartDateBetween(Long userId, LocalDateTime from, LocalDateTime to);
}