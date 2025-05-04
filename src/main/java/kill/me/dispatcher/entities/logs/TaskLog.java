package kill.me.dispatcher.entities.logs;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.TaskStatus;
import kill.me.dispatcher.entities.Task;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/*
    Журнал маршрутных листов
 */

@Entity
@Getter
@Setter
@Table(name = "task_log")
public class TaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status;

    @Column(name = "status_changed_at", nullable = false)
    private LocalDateTime statusChangedAt;
}
