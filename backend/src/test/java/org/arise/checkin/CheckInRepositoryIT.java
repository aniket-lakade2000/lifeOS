package org.arise.checkin;
import org.arise.IntegrationTest;
import org.arise.goal.Area;
import org.arise.goal.Goal;
import org.arise.goal.GoalRepository;
import org.arise.goal.GoalStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class CheckInRepositoryIT extends IntegrationTest{
    @Autowired CheckInRepository checkInRepository;
    @Autowired GoalRepository goalRepository;

    private Goal createGoal() {
        Goal goal = new Goal("Ship lifeOS diary", null, Area.CAREER, (short) 1, "Write integration tests");
        return goalRepository.save(goal);
    }

    @Test
    void savesAndFindsCheckInByGoalAndDate() {
        Goal goal = createGoal();
        CheckIn checkIn = new CheckIn();
        checkIn.setGoal(goal);
        checkIn.setCheckDate(LocalDate.now());
        checkIn.setDone(true);
        checkIn.setNote("Did the smallest next action");
        checkInRepository.save(checkIn);

        assertThat(checkInRepository.findByGoalIdAndCheckDate(goal.getId(), LocalDate.now()))
                .isPresent();
    }

    @Test
    void enforcesOneCheckInPerGoalPerDay() {
        Goal goal = createGoal();
        LocalDate today = LocalDate.now();

        CheckIn first = new CheckIn();
        first.setGoal(goal);
        first.setCheckDate(today);
        first.setDone(true);
        checkInRepository.saveAndFlush(first);

        CheckIn duplicate = new CheckIn();
        duplicate.setGoal(goal);
        duplicate.setCheckDate(today);
        duplicate.setDone(false);

        // This is the last operation in the test on purpose — a real constraint
        // violation aborts the @Transactional rollback-only transaction, so
        // nothing can run after this assertion.
        assertThatThrownBy(() -> checkInRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
