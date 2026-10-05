package org.arise.checkin;

import jakarta.validation.Valid;
import org.arise.checkin.dto.CreateCheckInRequest;
import org.arise.checkin.dto.CheckInResponse;
import org.arise.checkin.dto.UpdateCheckInRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/goals/{goalId}/check-ins")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CheckInResponse create(@PathVariable Long goalId, @Valid @RequestBody CreateCheckInRequest r) {
        return checkInService.create(goalId, r);
    }

    @GetMapping
    public List<CheckInResponse> list(
            @PathVariable Long goalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return checkInService.list(goalId, from, to);
    }

    @GetMapping("/{id}")
    public CheckInResponse get(@PathVariable Long goalId, @PathVariable Long id) {
        return checkInService.get(goalId, id);
    }

    @PutMapping("/{id}")
    public CheckInResponse update(@PathVariable Long goalId, @PathVariable Long id,
                                  @Valid @RequestBody UpdateCheckInRequest r) {
        return checkInService.update(goalId, id, r);
    }
}
