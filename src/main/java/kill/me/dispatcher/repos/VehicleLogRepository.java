package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.logs.VehicleLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleLogRepository extends JpaRepository<VehicleLog, Long> {
}
