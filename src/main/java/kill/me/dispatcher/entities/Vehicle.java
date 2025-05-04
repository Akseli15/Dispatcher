package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.VehicleStatus;
import lombok.Getter;
import lombok.Setter;

/*
    Данные о транспортных средствах
*/

@Entity
@Getter
@Setter
@Table(name = "vehicle")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VehicleStatus status;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @Column(name = "max_load", nullable = false)
    private Double maxLoad;

    @Column(name = "model", nullable = false)
    private String model;
}
