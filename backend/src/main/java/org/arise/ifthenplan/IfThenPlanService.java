package org.arise.ifthenplan;

import org.arise.common.exception.NotFoundException;
import org.arise.goal.Goal;
import org.arise.goal.GoalRepository;
import org.arise.ifthenplan.dto.CreateIfThenPlanRequest;
import org.arise.ifthenplan.dto.IfThenPlanResponse;
import org.arise.ifthenplan.dto.UpdateIfThenPlanRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IfThenPlanService {
    private final IfThenPlanRepository ifThenPlanRepository;
    private final GoalRepository goalRepository;

    public IfThenPlanService(IfThenPlanRepository ifThenPlanRepository, GoalRepository goalRepository) {
        this.ifThenPlanRepository = ifThenPlanRepository;
        this.goalRepository = goalRepository;
    }

    public IfThenPlanResponse create(Long goalId, CreateIfThenPlanRequest r) {
        Goal goal = findGoalOrThrow(goalId);
        IfThenPlan saved = ifThenPlanRepository.save(IfThenPlanMapper.toEntity(r, goal));
        return IfThenPlanMapper.toResponse(saved);
    }

    public List<IfThenPlanResponse> list(Long goalId) {
        findGoalOrThrow(goalId);
        return ifThenPlanRepository.findByGoalId(goalId).stream()
                .map(IfThenPlanMapper::toResponse).toList();
    }

    public IfThenPlanResponse get(Long goalId, Long planId) {
        return IfThenPlanMapper.toResponse(findPlanOrThrow(goalId, planId));
    }

    public IfThenPlanResponse update(Long goalId, Long planId, UpdateIfThenPlanRequest r) {
        IfThenPlan plan = findPlanOrThrow(goalId, planId);
        IfThenPlanMapper.applyUpdate(plan, r);
        return IfThenPlanMapper.toResponse(ifThenPlanRepository.save(plan));
    }

    public void delete(Long goalId, Long planId) {
        ifThenPlanRepository.delete(findPlanOrThrow(goalId, planId));
    }

    private Goal findGoalOrThrow(Long goalId) {
        return goalRepository.findById(goalId)
                .orElseThrow(() -> new NotFoundException("Goal not found: " + goalId));
    }

    private IfThenPlan findPlanOrThrow(Long goalId, Long planId) {
        IfThenPlan plan = ifThenPlanRepository.findById(planId)
                .orElseThrow(() -> new NotFoundException("If-then plan not found: " + planId));
        if (!plan.getGoal().getId().equals(goalId)) {
            throw new NotFoundException("If-then plan not found: " + planId);
        }
        return plan;
    }
}