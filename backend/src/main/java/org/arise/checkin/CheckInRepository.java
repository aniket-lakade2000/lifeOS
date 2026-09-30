package org.arise.checkin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Optional<CheckIn> findByGoalIdAndCheckDate(Long goalId, LocalDate checkDate);
    List<CheckIn> findByGoalIdAndCheckDateBetween(Long goalId, LocalDate from, LocalDate to);
    List<CheckIn> findByGoalId(Long goalId);
}
