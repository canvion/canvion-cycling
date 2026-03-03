package com.canvion.cycling.repository;

import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // Solo actividades no borradas
    List<Activity> findByUserAndDeletedFalseOrderByStartDateDesc(User user);

    Page<Activity> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);

    List<Activity> findByUserIdAndDeletedFalseAndStartDateBetween(Long userId, LocalDateTime from, LocalDateTime to);

    Optional<Activity> findByStravaActivityIdAndDeletedFalse(Long stravaActivityId);

    boolean existsByStravaActivityId(Long stravaActivityId);

    Optional<Activity> findByStravaActivityId(Long stravaActivityId);
}