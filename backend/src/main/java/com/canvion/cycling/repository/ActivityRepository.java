package com.canvion.cycling.repository;

import com.canvion.cycling.model.Activity;
import com.canvion.cycling.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    List<Activity> findByUserOrderByStartDateDesc(User user);
    
    List<Activity> findByUserAndTypeOrderByStartDateDesc(User user, String type);
    
    List<Activity> findByUserAndStartDateBetweenOrderByStartDateDesc(
            User user, 
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    Optional<Activity> findByStravaActivityId(Long stravaActivityId);
    
    Boolean existsByStravaActivityId(Long stravaActivityId);
    
    Long countByUser(User user);
}
