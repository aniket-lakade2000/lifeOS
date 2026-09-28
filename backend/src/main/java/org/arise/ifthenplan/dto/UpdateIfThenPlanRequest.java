package org.arise.ifthenplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateIfThenPlanRequest(
        @NotBlank @Size(max = 255) String trigger,
        @NotBlank @Size(max = 255) String response
) {}