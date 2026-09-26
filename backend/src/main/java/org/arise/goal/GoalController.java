package org.arise.goal;

import jakarta.validation.Valid;
import org.arise.goal.dto.CreateGoalRequest;
import org.arise.goal.dto.GoalResponse;
import org.arise.goal.dto.UpdateGoalRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/goals")
public class GoalController {
        private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalResponse create(@Valid @RequestBody CreateGoalRequest request) {
        return goalService.create(request);
    }

    @GetMapping("/{id}")
    public GoalResponse get(@PathVariable Long id) {
        return goalService.get(id);
    }

    @GetMapping
    public List<GoalResponse> list() {
        return goalService.list();
    }

    @PutMapping("/{id}")
    public GoalResponse update(@PathVariable Long id, @Valid @RequestBody UpdateGoalRequest request) {
        return goalService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        goalService.delete(id);
    }
}
