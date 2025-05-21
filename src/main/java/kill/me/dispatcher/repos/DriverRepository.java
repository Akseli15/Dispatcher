package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    Driver findDriverByChatId(String chatId);

    Driver getById(Long id);

    Driver findDriverByPhoneNumber(String phoneNumber);

}