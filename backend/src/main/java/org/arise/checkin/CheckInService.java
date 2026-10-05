package org.arise.checkin;

import org.arise.checkin.dto.CreateCheckInRequest;
import org.arise.checkin.dto.CheckInResponse;
import org.arise.checkin.dto.UpdateCheckInRequest;
import org.arise.common.exception.BadRequestException;
import org.arise.common.exception.ConflictException;
import org.arise.common.exception.NotFoundException;
import org.arise.goal.Goal;
import org.arise.goal.GoalRepository;
import org.arise.goal.GoalStatus;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@Service
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final GoalRepository goalRepository;
    private final Clock clock;

    public CheckInService(CheckInRepository checkInRepository, GoalRepository goalRepository, Clock clock) {
        this.checkInRepository = checkInRepository;
        this.goalRepository = goalRepository;
        this.clock = clock;
    }

    public CheckInResponse create(Long goalId, CreateCheckInRequest r) {
        Goal goal = findGoalOrThrow(goalId);
        if (goal.getStatus() != GoalStatus.ACTIVE) {
            throw new ConflictException("Cannot check in to a goal that is not active");
        }

        LocalDate today = LocalDate.now(clock);
        LocalDate checkDate = r.checkDate() != null ? r.checkDate() : today;
        if (checkDate.isAfter(today)) {
            throw new BadRequestException("Check-in date cannot be in the future");
        }
        if (checkInRepository.findByGoalIdAndCheckDate(goalId, checkDate).isPresent()) {
            throw new ConflictException("A check-in already exists for " + checkDate);
        }

        CheckIn saved = checkInRepository.save(CheckInMapper.toEntity(r, goal, checkDate));
        return CheckInMapper.toResponse(saved);
    }

    public List<CheckInResponse> list(Long goalId, LocalDate from, LocalDate to) {
        findGoalOrThrow(goalId);
        List<CheckIn> checkIns;
        if (from == null && to == null) {
            checkIns = checkInRepository.findByGoalId(goalId);
        } else {
            LocalDate effectiveFrom = from != null ? from : LocalDate.of(1970, 1, 1);
            LocalDate effectiveTo = to != null ? to : LocalDate.now(clock);
            checkIns = checkInRepository.findByGoalIdAndCheckDateBetween(goalId, effectiveFrom, effectiveTo);
        }
        return checkIns.stream().map(CheckInMapper::toResponse).toList();
    }

    public CheckInResponse get(Long goalId, Long checkInId) {
        return CheckInMapper.toResponse(findCheckInOrThrow(goalId, checkInId));
    }

    public CheckInResponse update(Long goalId, Long checkInId, UpdateCheckInRequest r) {
        CheckIn checkIn = findCheckInOrThrow(goalId, checkInId);
        if (!checkIn.getCheckDate().equals(LocalDate.now(clock))) {
            throw new ConflictException("Only today's check-in can be edited");
        }
        CheckInMapper.applyUpdate(checkIn, r);
        return CheckInMapper.toResponse(checkInRepository.save(checkIn));
    }

    private Goal findGoalOrThrow(Long goalId) {
        return goalRepository.findById(goalId)
                .orElseThrow(() -> new NotFoundException("Goal not found: " + goalId));
    }

    private CheckIn findCheckInOrThrow(Long goalId, Long checkInId) {
        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() -> new NotFoundException("Check-in not found: " + checkInId));
        if (!checkIn.getGoal().getId().equals(goalId)) {
            throw new NotFoundException("Check-in not found: " + checkInId);
        }
        return checkIn;
    }
}