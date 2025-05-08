package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.SubtaskStatus;

import java.time.LocalDateTime;

/*
    Данные о подзадаче (точке маршрута)
*/

@Entity
@Table(name = "subtask")
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

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

    public Long getId() {
        return id;
    }

    public Task getTask() {
        return task;
    }

    public Client getClient() {
        return client;
    }

    public SubtaskStatus getStatus() {
        return status;
    }

    public LocalDateTime getUnloadingTime() {
        return unloadingTime;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public void setStatus(SubtaskStatus status) {
        this.status = status;
    }

    public void setUnloadingTime(LocalDateTime unloadingTime) {
        this.unloadingTime = unloadingTime;
    }
}
