package kill.me.dispatcher.entities.statuses;

import lombok.Getter;

@Getter
public enum VehicleStatus {
    MAINTENANCE_REQUIRED("MAINTENANCE_REQUIRED", "Требуется ТО"),
    UNDER_MAINTENANCE("UNDER_MAINTENANCE", "Проходит ТО"),
    AVAILABLE("AVAILABLE", "Свободно"),
    ON_ROUTE("ON_ROUTE", "В рейсе");

    private final String code;
    private final String description;

    VehicleStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    @Override
    public String toString() {
        return code;
    }
}

