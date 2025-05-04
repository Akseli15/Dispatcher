package kill.me.dispatcher.services;

import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.repos.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<Driver> getAll() {
        return driverRepository.findAll();
    }

    public Driver findDriverByChatId(String chatId){ return driverRepository.findDriverByChatId(chatId); }

    public void createDriver(Driver driver){
        driverRepository.save(driver); }
}
