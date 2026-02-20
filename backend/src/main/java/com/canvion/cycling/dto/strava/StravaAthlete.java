package com.canvion.cycling.dto.strava;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StravaAthlete {

    private Long id;

    @JsonProperty("firstname")
    private String firstName;

    @JsonProperty("lastname")
    private String lastName;

    private String username;

    @JsonProperty("profile")
    private String profileImageUrl;

    private String city;

    private String state;

    private String country;
}