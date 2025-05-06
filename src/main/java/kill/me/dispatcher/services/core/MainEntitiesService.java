package kill.me.dispatcher.services.core;

import jakarta.persistence.EntityNotFoundException;
import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.entities.Subtask;
import kill.me.dispatcher.entities.Task;
import kill.me.dispatcher.entities.Vehicle;
import kill.me.dispatcher.repos.*;

import java.util.List;

public class MainEntitiesService {

    private DispatcherRepository dispatcherRepository;
    private DriverRepository driverRepository;
    private TaskRepository taskRepository;
    private VehicleRepository vehicleRepository;
    private SubtaskRepository subtaskRepository;

    /**
     *  ------------------------ DRIVER CRUDы ------------------------
     */

    public Driver createDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver updateDriver(Driver updatedDriver) {
        Driver existing = driverRepository.findById(updatedDriver.getId())
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

    /**
     *  ------------------------ VEHICLE CRUDы ------------------------
     */

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Vehicle updated) {
        Vehicle existing = vehicleRepository.findById(updated.getId())
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

    /**
     *  ------------------------ TASK CRUDы ------------------------
     */

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Task updated) {
        Task existing = taskRepository.findById(updated.getId())
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

    /**
     *   ------------------------ SUBTASK CRUDы ------------------------
     */

    public Subtask createSubtask(Subtask subtask) {
        return subtaskRepository.save(subtask);
    }

    public Subtask updateSubtask(Subtask updated) {
        Subtask existing = subtaskRepository.findById(updated.getId())
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
}
