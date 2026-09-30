package org.arise.goal;

import org.arise.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class GoalRepositoryIT extends IntegrationTest {
    @Autowired
    GoalRepository goalRepository;

    @Test
    void savesAndLoadsGoal() {
        Goal goal = new Goal(
                "Ship v0.1",
                "Finish initial goal endpoints",
                Area.CAREER,
                (short) 1,
                "Write integration tests"
        );

        Goal saved = goalRepository.save(goal);
        assertThat(goalRepository.findById(saved.getId())).isPresent();
    }
}
