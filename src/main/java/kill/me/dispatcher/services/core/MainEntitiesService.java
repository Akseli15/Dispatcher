package kill.me.dispatcher.services.core;

import jakarta.persistence.EntityNotFoundException;
import kill.me.dispatcher.entities.*;
import kill.me.dispatcher.repos.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MainEntitiesService {

    private DispatcherRepository dispatcherRepository;
    private DriverRepository driverRepository;
    private TaskRepository taskRepository;
    private VehicleRepository vehicleRepository;
    private SubtaskRepository subtaskRepository;

    public MainEntitiesService(DispatcherRepository dispatcherRepository, DriverRepository driverRepository, TaskRepository taskRepository, VehicleRepository vehicleRepository, SubtaskRepository subtaskRepository) {
        this.dispatcherRepository = dispatcherRepository;
        this.driverRepository = driverRepository;
        this.taskRepository = taskRepository;
        this.vehicleRepository = vehicleRepository;
        this.subtaskRepository = subtaskRepository;
    }

    /**
     *  ------------------------ DISPATCHER CRUDы ------------------------
     */

    public Dispatcher createDispatcher(Dispatcher dispatcher) {
        return dispatcherRepository.save(dispatcher);
    }

    public Dispatcher updateDispatcher(Long id, Dispatcher updated) {
        Dispatcher existing = dispatcherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dispatcher not found"));

        if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
        if (updated.getUsername() != null) existing.setUsername(updated.getUsername());
        if (updated.getPassword() != null) existing.setPassword(updated.getPassword());

        return dispatcherRepository.save(existing);
    }

    public void deleteDispatcher(Long id) {
        dispatcherRepository.deleteById(id);
    }

    public List<Dispatcher> getAllDispatchers() {
        return dispatcherRepository.findAll();
    }

    public Optional<Dispatcher> getDispatcherById(Long id) {
        return dispatcherRepository.findById(id);
    }

    /**
     *  ------------------------ DRIVER CRUDы ------------------------
     */

    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver updateDriver(Long id, Driver updatedDriver) {
        Driver existing = driverRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));

        if (updatedDriver.getName() != null) existing.setName(updatedDriver.getName());
        if (updatedDriver.getPhoneNumber() != null) existing.setPhoneNumber(updatedDriver.getPhoneNumber());
        if (updatedDriver.getSchedule() != null) existing.setSchedule(updatedDriver.getSchedule());
        if (updatedDriver.getChatId() != null) existing.setChatId(updatedDriver.getChatId());
        if (updatedDriver.getStatus() != null) existing.setStatus(updatedDriver.getStatus());

        return driverRepository.save(existing);
    }

    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Optional<Driver> getDriverById(Long id) {
        return driverRepository.findById(id);
    }

    /**
     *  ------------------------ VEHICLE CRUDы ------------------------
     */

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle updated) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

        if (updated.getModel() != null) existing.setModel(updated.getModel());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getRegistrationNumber() != null) existing.setRegistrationNumber(updated.getRegistrationNumber());
        if (updated.getMaxLoad() != null) existing.setMaxLoad(updated.getMaxLoad());

        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    /**
     *  ------------------------ TASK CRUDы ------------------------
     */

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task updated) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getDispatcher() != null) existing.setDispatcher(updated.getDispatcher());
        if (updated.getDriver() != null) existing.setDriver(updated.getDriver());
        if (updated.getVehicle() != null) existing.setVehicle(updated.getVehicle());
        if (updated.getCreatedAt() != null) existing.setCreatedAt(updated.getCreatedAt());
        if (updated.getCompletedAt() != null) existing.setCompletedAt(updated.getCompletedAt());

        return taskRepository.save(existing);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    /**
     *   ------------------------ SUBTASK CRUDы ------------------------
     */

    public Subtask createSubtask(Subtask subtask) {
        return subtaskRepository.save(subtask);
    }

    public Subtask updateSubtask(Long id, Subtask updated) {
        Subtask existing = subtaskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subtask not found"));

        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getUnloadingTime() != null) existing.setUnloadingTime(updated.getUnloadingTime());
        if (updated.getClient() != null) existing.setClient(updated.getClient());
        if (updated.getTask() != null) existing.setTask(updated.getTask());

        return subtaskRepository.save(existing);
    }

    public void deleteSubtask(Long id) {
        subtaskRepository.deleteById(id);
    }

    public List<Subtask> getAllSubtasks() {
        return subtaskRepository.findAll();
    }

    public Optional<Subtask> getSubtaskById(Long id) {
        return subtaskRepository.findById(id);
    }
}
