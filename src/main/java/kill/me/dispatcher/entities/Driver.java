package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.DriverStatus;
import lombok.Getter;
import lombok.Setter;

/*
    Данные о водителе
 */

@Entity
@Getter
@Setter
@Table(name ="driver")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "chat_id")
    private String chatId;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "schedule", nullable = false)
    private String schedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DriverStatus status;

    @Column(name = "token", nullable = false)
    private String token;
}
