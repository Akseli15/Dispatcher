package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Vehicle getById(Long id);
}
