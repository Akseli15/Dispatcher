package kill.me.dispatcher.entities.statuses;


public enum DriverStatus {
    OFF_DUTY("OFF_DUTY", "Не работает"),
    AVAILABLE("AVAILABLE", "Свободен"),
    ON_ROUTE("ON_ROUTE", "В рейсе");

    private final String code;
    private final String description;

    DriverStatus(String code, String description) {
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

