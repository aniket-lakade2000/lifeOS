package org.arise.goal.dto;

import jakarta.validation.constraints.*;
import org.arise.goal.Area;

public record CreateGoalRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 2000) String description,
        @NotNull Area area,
        @NotNull @Min(1) @Max(3) Short priority,
        @Size(max = 255) String nextAction
) {}
