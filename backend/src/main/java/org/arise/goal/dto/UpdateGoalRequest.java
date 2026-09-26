package org.arise.goal.dto;

import jakarta.validation.constraints.*;

public record UpdateGoalRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 2000) String description,
        @NotNull @Min(1) @Max(3) Short priority,
        @Size(max = 255) String nextAction) {
}
