package kill.me.dispatcher.services.core;

import jakarta.persistence.EntityNotFoundException;
import kill.me.dispatcher.entities.*;
import kill.me.dispatcher.entities.statuses.DriverStatus;
import kill.me.dispatcher.entities.statuses.TaskStatus;
import kill.me.dispatcher.repos.*;
import kill.me.dispatcher.services.TelegramBot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MainEntitiesService {

    private DispatcherRepository dispatcherRepository;
    private DriverRepository driverRepository;
    private TaskRepository taskRepository;
    private VehicleRepository vehicleRepository;
    private SubtaskRepository subtaskRepository;

    private final TelegramBot telegramBot;

    public MainEntitiesService(DispatcherRepository dispatcherRepository, DriverRepository driverRepository, TaskRepository taskRepository, VehicleRepository vehicleRepository, SubtaskRepository subtaskRepository, TelegramBot telegramBot) {
        this.dispatcherRepository = dispatcherRepository;
        this.driverRepository = driverRepository;
        this.taskRepository = taskRepository;
        this.vehicleRepository = vehicleRepository;
        this.subtaskRepository = subtaskRepository;
        this.telegramBot = telegramBot;
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

    @Transactional
    public Task updateTask(Long id, Task updated) {
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        // Check if existing status is EDITING and new status is READY
        if (existing.getStatus() == TaskStatus.EDITING && updated.getStatus() == TaskStatus.READY) {
            String chatId = existing.getDriver() != null ? existing.getDriver().getChatId() : null;
            if (chatId != null && existing.getTaskNumber() != null) {
                try {
                    telegramBot.sendTaskNotification(chatId, existing.getTaskNumber());
                } catch (Exception e) {
                    System.err.println("Ошибка при отправке уведомления в Telegram для задачи №" +
                            existing.getTaskNumber() + ": " + e.getMessage());
                }
            } else {
                System.err.println("Не удалось отправить уведомление: chatId или taskNumber отсутствует для задачи ID " + id);
            }
        }

        // Update fields as in the original method
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

    // Получение количества выполненных задач за период по водителю
    public long getCompletedTaskCountForDriverBetweenDates(Driver driver, LocalDateTime start, LocalDateTime end) {
        return taskRepository.countCompletedTasksByDriversBetweenDates(driver, start, end);
    }

    // Получение количества выполненных задач за период по водителю
    public long getCompletedTaskCountForVehiclesBetweenDates(Vehicle vehicle, LocalDateTime start, LocalDateTime end) {
        return taskRepository.countCompletedTasksByVehiclesBetweenDates(vehicle, start, end);
    }

    // Получение средней продолжительности выполнения задачи по каждому водителю (в часах)
    public Map<Long, Double> getAverageTaskDurationByDriver() {
        List<Object[]> results = taskRepository.findAvgTaskDurationByDriver();
        Map<Long, Double> avgDurations = new HashMap<>();
        for (Object[] row : results) {
            Long driverId = ((Number) row[0]).longValue(); // Безопасное приведение к Long
            Double avgDurationMs = ((Number) row[1]).doubleValue(); // Миллисекунды
            if (avgDurationMs <= 0 || avgDurationMs > 86_400_000_000.0) { // 100 дней в миллисекундах
                continue;
            }
            Double avgDurationHours = avgDurationMs / (1000.0 * 60 * 60); // Преобразование в часы
            avgDurations.put(driverId, Math.round(avgDurationHours * 100.0) / 100.0); // Округление до 2 знаков
        }
        return avgDurations;
    }

    // Получение средней продолжительности выполнения задачи по каждому водителю (в часах)
    public Map<Long, Double> getAverageTaskDurationByVehicle() {
        List<Object[]> results = taskRepository.findAvgTaskDurationByVehicle();
        Map<Long, Double> avgDurations = new HashMap<>();
        for (Object[] row : results) {
            Long driverId = ((Number) row[0]).longValue(); // Безопасное приведение к Long
            Double avgDurationMs = ((Number) row[1]).doubleValue(); // Миллисекунды
            if (avgDurationMs <= 0 || avgDurationMs > 86_400_000_000.0) { // 100 дней в миллисекундах
                continue;
            }
            Double avgDurationHours = avgDurationMs / (1000.0 * 60 * 60); // Преобразование в часы
            avgDurations.put(driverId, Math.round(avgDurationHours * 100.0) / 100.0); // Округление до 2 знаков
        }
        return avgDurations;
    }

    // Фильтрация задач по параметрам
    public List<Task> filterTasks(TaskStatus status,
                                  Driver driver,
                                  Dispatcher dispatcher,
                                  LocalDateTime createdFrom,
                                  LocalDateTime createdTo,
                                  LocalDateTime completedFrom,
                                  LocalDateTime completedTo) {
        return taskRepository.filterTasks(status, driver, dispatcher, createdFrom, createdTo, completedFrom, completedTo);
    }

    public String generateNextTaskNumber() {
        Integer maxNumber = taskRepository.findMaxTaskNumber();
        int next = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("%04d", next);
    }

    // Получение количества задач по статусам
    public List<Object[]> getTaskCountByStatus() {
        return taskRepository.countTasksGroupedByAllStatuses();
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

    public List<Subtask> getAllSubtasksById(Long taskId) { return subtaskRepository.findAllByTaskId(taskId);}
}
