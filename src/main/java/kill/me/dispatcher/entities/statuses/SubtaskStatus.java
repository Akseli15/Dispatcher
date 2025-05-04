package kill.me.dispatcher.entities.statuses;

import lombok.Getter;

@Getter
public enum SubtaskStatus {
    PENDING("PENDING", "В ожидании"),
    IN_PROGRESS("IN_PROGRESS", "Выполняется"),
    COMPLETED("COMPLETED", "Выполнена"),
    CANCELED("CANCELED", "Отменена");

    private final String code;
    private final String description;

    SubtaskStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    @Override
    public String toString() {
        return code;
    }
}
