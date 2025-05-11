package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Dispatcher;
import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.entities.Task;
import kill.me.dispatcher.entities.statuses.DriverStatus;
import kill.me.dispatcher.entities.statuses.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task,Long> {

    // Запрос для получения количества выполненных рейсов за период
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.driver = :driver " +
            "AND t.status = 'COMPLETED' " +
            "AND t.completedAt BETWEEN :startDate AND :endDate")
    long countCompletedTasksBetweenDates(@Param("driver") Driver driver,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);


    // Запрос для расчета средней продолжительности рейса по каждому водителю
    @Query("SELECT t.driver.id, AVG(CAST((t.completedAt - t.createdAt) AS long)) " +
            "FROM Task t " +
            "WHERE t.status = 'COMPLETED' " +
            "GROUP BY t.driver.id")
    List<Object[]> findAvgTaskDurationByDriver();

    // Фильтрация Task по дате создания, дате выполнения, водителю, диспетчеру и статусу
    @Query("SELECT t FROM Task t " +
            "WHERE (:status IS NULL OR t.status = :status) " +
            "AND (:driver IS NULL OR t.driver = :driver) " +
            "AND (:dispatcher IS NULL OR t.dispatcher = :dispatcher) " +
            "AND (:createdFrom IS NULL OR t.createdAt >= :createdFrom) " +
            "AND (:createdTo IS NULL OR t.createdAt <= :createdTo) " +
            "AND (:completedFrom IS NULL OR t.completedAt >= :completedFrom) " +
            "AND (:completedTo IS NULL OR t.completedAt <= :completedTo)")
    List<Task> filterTasks(@Param("status") TaskStatus status,
                           @Param("driver") Driver driver,
                           @Param("dispatcher") Dispatcher dispatcher,
                           @Param("createdFrom") LocalDateTime createdFrom,
                           @Param("createdTo") LocalDateTime createdTo,
                           @Param("completedFrom") LocalDateTime completedFrom,
                           @Param("completedTo") LocalDateTime completedTo);

    @Query("SELECT MAX(CAST(t.taskNumber AS int)) FROM Task t")
    Integer findMaxTaskNumber();

}
