package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.SubtaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/*
    Данные о подзадаче (точке маршрута)
*/

@Entity
@Getter
@Setter
@Table(name = "subtask")
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubtaskStatus status;

    @Column(name = "unloading_time")
    private LocalDateTime unloadingTime;
}
