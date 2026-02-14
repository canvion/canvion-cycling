package com.canvion.cycling.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "strava_activity_id", unique = true)
    private Long stravaActivityId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // Ride, Run, Swim, etc.

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "distance")
    private Integer distance; // En metros

    @Column(name = "moving_time")
    private Integer movingTime; // En segundos

    @Column(name = "elapsed_time")
    private Integer elapsedTime; // En segundos

    @Column(name = "total_elevation_gain")
    private Integer totalElevationGain; // En metros

    @Column(name = "average_speed")
    private Float averageSpeed; // m/s

    @Column(name = "max_speed")
    private Float maxSpeed; // m/s

    @Column(name = "average_heartrate")
    private Integer averageHeartrate;

    @Column(name = "max_heartrate")
    private Integer maxHeartrate;

    @Column(name = "average_watts")
    private Float averageWatts;

    @Column(name = "max_watts")
    private Integer maxWatts;

    @Column(name = "summary_polyline", columnDefinition = "TEXT")
    private String summaryPolyline; // Ruta GPS codificada

    @Column(name = "detailed_polyline", columnDefinition = "TEXT")
    private String detailedPolyline; // Ruta GPS detallada

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "calories")
    private Integer calories;

    @Column(name = "is_manual")
    private Boolean isManual = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isManual == null) {
            isManual = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
