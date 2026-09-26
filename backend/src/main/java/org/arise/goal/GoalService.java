package org.arise.goal;

import org.arise.goal.dto.CreateGoalRequest;
import org.arise.goal.dto.GoalResponse;
import org.arise.goal.dto.UpdateGoalRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GoalService {
    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public GoalResponse create(CreateGoalRequest r) {
        return GoalMapper.toResponse(goalRepository.save(GoalMapper.toEntity(r)));
    }

    public GoalResponse get(Long id) {
        return GoalMapper.toResponse(findOrThrow(id));
    }

    public List<GoalResponse> list() {
        return goalRepository.findAll().stream().map(GoalMapper::toResponse).toList();
    }

    public GoalResponse update(Long id, UpdateGoalRequest r) {
        Goal g = findOrThrow(id);
        GoalMapper.applyUpdate(g, r);
        return GoalMapper.toResponse(goalRepository.save(g));
    }

    public void delete(Long id) {
        goalRepository.delete(findOrThrow(id));
    }

    private Goal findOrThrow(Long id) {
        return goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found: " + id));
    }
}
