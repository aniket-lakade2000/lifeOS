package org.arise.ifthenplan;

import jakarta.validation.Valid;
import org.arise.ifthenplan.dto.CreateIfThenPlanRequest;
import org.arise.ifthenplan.dto.IfThenPlanResponse;
import org.arise.ifthenplan.dto.UpdateIfThenPlanRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals/{goalId}/if-then-plans")
public class IfThenPlanController {
    private final IfThenPlanService ifThenPlanService;

    public IfThenPlanController(IfThenPlanService ifThenPlanService) {
        this.ifThenPlanService = ifThenPlanService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IfThenPlanResponse create(@PathVariable Long goalId, @Valid @RequestBody CreateIfThenPlanRequest r) {
        return ifThenPlanService.create(goalId, r);
    }

    @GetMapping
    public List<IfThenPlanResponse> list(@PathVariable Long goalId) {
        return ifThenPlanService.list(goalId);
    }

    @GetMapping("/{planId}")
    public IfThenPlanResponse get(@PathVariable Long goalId, @PathVariable Long planId) {
        return ifThenPlanService.get(goalId, planId);
    }

    @PutMapping("/{planId}")
    public IfThenPlanResponse update(@PathVariable Long goalId, @PathVariable Long planId,
                                     @Valid @RequestBody UpdateIfThenPlanRequest r) {
        return ifThenPlanService.update(goalId, planId, r);
    }

    @DeleteMapping("/{planId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long goalId, @PathVariable Long planId) {
        ifThenPlanService.delete(goalId, planId);
    }
}