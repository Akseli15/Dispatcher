package kill.me.dispatcher.entities.statuses;

public enum TaskStatus {
    EDITING("EDITING", "На редактировании"),
    READY("READY", "Готов к исполнению"),
    IN_PROGRESS("IN_PROGRESS", "Выполняется"),
    COMPLETED("COMPLETED", "Завершён"),
    CLOSED("CLOSED", "Закрыт"),
    CANCELED("CANCELED", "Отменён"),
    ISSUE("ISSUE", "Проблема на рейсе");

    private final String code;
    private final String description;

    TaskStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    @Override
    public String toString() {
        return code;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
