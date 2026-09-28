package org.arise.ifthenplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateIfThenPlanRequest(
        @NotBlank @Size(max = 255) String planTrigger,
        @NotBlank @Size(max = 255) String response
) {}