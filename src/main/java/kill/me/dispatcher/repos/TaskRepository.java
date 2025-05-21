package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Dispatcher;
import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.entities.Task;
import kill.me.dispatcher.entities.Vehicle;
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
            "AND t.status = 'CLOSED' " +
            "AND t.completedAt BETWEEN :startDate AND :endDate")
    long countCompletedTasksByDriversBetweenDates(@Param("driver") Driver driver,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    // Запрос для получения количества выполненных рейсов за период
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.vehicle = :vehicle " +
            "AND t.status = 'CLOSED' " +
            "AND t.completedAt BETWEEN :startDate AND :endDate")
    long countCompletedTasksByVehiclesBetweenDates(@Param("vehicle") Vehicle vehicle,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);


    // Запрос для расчета средней продолжительности рейса по каждому водителю
    @Query(value = "SELECT t.driver_id, AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) * 1000) " +
            "FROM task t " +
            "WHERE t.status = 'CLOSED' " +
            "GROUP BY t.driver_id",
            nativeQuery = true)
    List<Object[]> findAvgTaskDurationByDriver();

    // Запрос для расчета средней продолжительности рейса по каждому ТС
    @Query(value = "SELECT t.vehicle_id, AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) * 1000) " +
            "FROM task t " +
            "WHERE t.status = 'CLOSED' " +
            "GROUP BY t.vehicle_id",
            nativeQuery = true)
    List<Object[]> findAvgTaskDurationByVehicle();

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

    @Query(value = """
    SELECT s.status AS status, 
           COUNT(t.id) AS count
    FROM (
        VALUES 
            ('EDITING'),
            ('READY'),
            ('IN_PROGRESS'),
            ('COMPLETED'),
            ('CLOSED'),
            ('CANCELED'),
            ('ISSUE')
    ) AS s(status)
    LEFT JOIN task t ON t.status = s.status
    GROUP BY s.status
    ORDER BY s.status
    """, nativeQuery = true)
    List<Object[]> countTasksGroupedByAllStatuses();

    List<Task> findAllByDriver_ChatIdAndStatusNotIn(String chatId, List<String> excludedStatuses);

    Task getTaskById(Long id);
}
