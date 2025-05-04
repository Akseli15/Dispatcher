package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.TaskStatus;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/*
    Данные о задаче (маршрутном листе)
*/

@Entity
@Getter
@Setter
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "task_number", nullable = false, unique = true)
    private String taskNumber;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "dispatcher_id", nullable = false)
    private Dispatcher dispatcher;
}
