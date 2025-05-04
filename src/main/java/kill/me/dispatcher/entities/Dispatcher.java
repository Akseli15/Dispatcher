package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/*
    Данные о диспетчере
 */

@Entity
@Getter
@Setter
@Table(name = "dispatcher")
public class Dispatcher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="username", unique = true, nullable = false)
    private String username;

    @Column(name="password", nullable = false)
    private String password;

    @Column(name="full_name", nullable = false)
    private String fullName;
}
