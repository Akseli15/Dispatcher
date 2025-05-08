package kill.me.dispatcher.entities;

import jakarta.persistence.*;
import kill.me.dispatcher.entities.statuses.DriverStatus;

/*
    Данные о водителе
 */

@Entity
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

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getChatId() {
        return chatId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getSchedule() {
        return schedule;
    }

    public DriverStatus getStatus() {
        return status;
    }

    public String getToken() {
        return token;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public void setStatus(DriverStatus status) {
        this.status = status;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
