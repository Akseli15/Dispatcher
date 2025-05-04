package kill.me.dispatcher.entities.logs;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.VehicleStatus;
import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.entities.Vehicle;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/*
    Журнал эксплуатации ТС
 */

@Entity
@Getter
@Setter
@Table(name = "vehicle_log")
public class VehicleLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VehicleStatus status;

    @Column(name = "status_changed_at", nullable = false)
    private LocalDateTime statusChangedAt;
}
