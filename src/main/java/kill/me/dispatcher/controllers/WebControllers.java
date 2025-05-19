package kill.me.dispatcher.controllers;

import kill.me.dispatcher.entities.*;
import kill.me.dispatcher.entities.logs.TaskLog;
import kill.me.dispatcher.entities.logs.VehicleLog;
import kill.me.dispatcher.entities.statuses.DriverStatus;
import kill.me.dispatcher.entities.statuses.TaskStatus;
import kill.me.dispatcher.repos.DispatcherRepository;
import kill.me.dispatcher.repos.DriverRepository;
import kill.me.dispatcher.services.core.MainEntitiesService;
import kill.me.dispatcher.services.core.SupEntitiesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class WebControllers {

    @Autowired
    private MainEntitiesService service;
    @Autowired
    private SupEntitiesService supService;
    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private DispatcherRepository dispatcherRepository;

    // ---------- Dispatcher ----------
    @PostMapping("/dispatchers")
    @PreAuthorize("hasRole('ADMIN')")
    public Dispatcher createDispatcher(@RequestBody Dispatcher dispatcher) {
        dispatcher.setRole("DISPATCHER");
        return service.createDispatcher(dispatcher);
    }

    @GetMapping("/dispatchers/me")
    public ResponseEntity<Dispatcher> getCurrentDispatcher(@AuthenticationPrincipal UserDetails userDetails) {
        Dispatcher dispatcher = dispatcherRepository.findDispatcherByUsername(userDetails.getUsername());
        return dispatcher != null ? ResponseEntity.ok(dispatcher) : ResponseEntity.notFound().build();
    }

    @GetMapping("/dispatchers")
    public List<Dispatcher> getAllDispatchers() {
        return service.getAllDispatchers();
    }

    @GetMapping("/dispatchers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Optional<Dispatcher> getDispatcher(@PathVariable Long id) {
        return service.getDispatcherById(id);
    }

    @PutMapping("/dispatchers/{id}")
    public Dispatcher updateDispatcher(@PathVariable Long id, @RequestBody Dispatcher dispatcher) {
        return service.updateDispatcher(id, dispatcher);
    }

    @DeleteMapping("/dispatchers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteDispatcher(@PathVariable Long id) {
        service.deleteDispatcher(id);
    }

    // ---------- Driver ----------
    @PostMapping("/drivers")
    public Driver createDriver(@RequestBody Driver driver) {
        return service.createDriver(driver);
    }

    @GetMapping("/drivers")
    public List<Driver> getAllDrivers() {
        return service.getAllDrivers();
    }

    @GetMapping("/drivers/{id}")
    public Optional<Driver> getDriver(@PathVariable Long id) {
        return service.getDriverById(id);
    }

    @PutMapping("/drivers/{id}")
    public Driver updateDriver(@PathVariable Long id, @RequestBody Driver driver) {
        return service.updateDriver(id, driver);
    }

    @DeleteMapping("/drivers/{id}")
    public void deleteDriver(@PathVariable Long id) {
        service.deleteDriver(id);
    }

    // ---------- Task ----------
    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        task.setTaskNumber(service.generateNextTaskNumber());
        return service.createTask(task);
    }

    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return service.getAllTasks();
    }

    @GetMapping("/tasks/{id}")
    public Optional<Task> getTask(@PathVariable Long id) {
        return service.getTaskById(id);
    }

    @PutMapping("/tasks/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        return service.updateTask(id, task);
    }

    @DeleteMapping("/tasks/{id}")
    public void deleteTask(@PathVariable Long id) {
        service.deleteTask(id);
    }

    // Получение количества выполненных задач по водителю за период
    @GetMapping("/tasks/completed-count")
    public long getCompletedTaskCount(
            @RequestParam Long driverId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Driver driver = driverRepository.getById(driverId);
        return service.getCompletedTaskCountForDriverBetweenDates(driver, start, end);
    }

    // Получение средней продолжительности выполнения задач по водителям
    @GetMapping("/tasks/avg-duration")
    public Map<Long, Double> getAvgTaskDurationByDriver() {
        return service.getAverageTaskDurationByDriver();
    }

    // Фильтрация задач по параметрам
    @GetMapping("/tasks/filter")
    public List<Task> filterTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long dispatcherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime completedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime completedTo) {
        Driver driver = driverRepository.getById(driverId);
        Dispatcher dispatcher = dispatcherRepository.getById(dispatcherId);

        return service.filterTasks(status, driver, dispatcher, createdFrom, createdTo, completedFrom, completedTo);
    }

    // ---------- Vehicle ----------
    @PostMapping("/vehicles")
    public Vehicle createVehicle(@RequestBody Vehicle vehicle) {
        return service.createVehicle(vehicle);
    }

    @GetMapping("/vehicles")
    public List<Vehicle> getAllVehicles() {
        return service.getAllVehicles();
    }

    @GetMapping("/vehicles/{id}")
    public Optional<Vehicle> getVehicle(@PathVariable Long id) {
        return service.getVehicleById(id);
    }

    @PutMapping("/vehicles/{id}")
    public Vehicle updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return service.updateVehicle(id, vehicle);
    }

    @DeleteMapping("/vehicles/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        service.deleteVehicle(id);
    }

    // ---------- Subtask ----------
    @PostMapping("/subtasks")
    public Subtask createSubtask(@RequestBody Subtask subtask) {
        return service.createSubtask(subtask);
    }

    @GetMapping("/subtasks")
    public List<Subtask> getAllSubtasks() {
        return service.getAllSubtasks();
    }

    @GetMapping("/subtasks/task/{taskId}")
    public List<Subtask> getAllSubtasksByTaskId(@PathVariable Long taskId) {
        return service.getAllSubtasksById(taskId);
    }

    @GetMapping("/subtasks/{id}")
    public Optional<Subtask> getSubtask(@PathVariable Long id) {
        return service.getSubtaskById(id);
    }

    @PutMapping("/subtasks/{id}")
    public Subtask updateSubtask(@PathVariable Long id, @RequestBody Subtask subtask) {
        return service.updateSubtask(id, subtask);
    }

    @DeleteMapping("/subtasks/{id}")
    public void deleteSubtask(@PathVariable Long id) {
        service.deleteSubtask(id);
    }

    // ---------- Comment ----------
    @PostMapping("/comments")
    public Comment createComment(@RequestBody Comment comment) {
        return supService.createComment(comment);
    }

    @GetMapping("/comments")
    public List<Comment> getAllComments() {
        return supService.getAllComments();
    }

    @GetMapping("/comments/{id}")
    public Optional<Comment> getComment(@PathVariable Long id) {
        return supService.getCommentById(id);
    }

    @PutMapping("/comments/{id}")
    public Comment updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        return supService.updateComment(id, comment);
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        supService.deleteComment(id);
    }

    // ---------- Client ----------
    @PostMapping("/clients")
    public Client createClient(@RequestBody Client client) {
        return supService.createClient(client);
    }

    @GetMapping("/clients")
    public List<Client> getAllClients() {
        return supService.getAllClients();
    }

    @GetMapping("/clients/{id}")
    public Optional<Client> getClient(@PathVariable Long id) {
        return supService.getClientById(id);
    }

    @PutMapping("/clients/{id}")
    public Client updateClient(@PathVariable Long id, @RequestBody Client client) {
        return supService.updateClient(id, client);
    }

    @DeleteMapping("/clients/{id}")
    public void deleteClient(@PathVariable Long id) {
        supService.deleteClient(id);
    }

    // ---------- VehicleLog ----------
    @PostMapping("/vehicle-logs")
    public VehicleLog createVehicleLog(@RequestBody VehicleLog vehicleLog) {
        return supService.createVehicleLog(vehicleLog);
    }

    @GetMapping("/vehicle-logs")
    public List<VehicleLog> getAllVehicleLogs() {
        return supService.getAllVehicleLogs();
    }

    @GetMapping("/vehicle-logs/{id}")
    public Optional<VehicleLog> getVehicleLog(@PathVariable Long id) {
        return supService.getVehicleLogById(id);
    }

    @PutMapping("/vehicle-logs/{id}")
    public VehicleLog updateVehicleLog(@PathVariable Long id, @RequestBody VehicleLog vehicleLog) {
        return supService.updateVehicleLog(id, vehicleLog);
    }

    @DeleteMapping("/vehicle-logs/{id}")
    public void deleteVehicleLog(@PathVariable Long id) {
        supService.deleteVehicleLog(id);
    }

    // ---------- TaskLog ----------
    @PostMapping("/task-logs")
    public TaskLog createTaskLog(@RequestBody TaskLog taskLog) {
        return supService.createTaskLog(taskLog);
    }

    @GetMapping("/task-logs")
    public List<TaskLog> getAllTaskLogs() {
        return supService.getAllTaskLogs();
    }

    @GetMapping("/task-logs/{id}")
    public Optional<TaskLog> getTaskLog(@PathVariable Long id) {
        return supService.getTaskLogById(id);
    }

    @PutMapping("/task-logs/{id}")
    public TaskLog updateTaskLog(@PathVariable Long id, @RequestBody TaskLog taskLog) {
        return supService.updateTaskLog(id, taskLog);
    }

    @DeleteMapping("/task-logs/{id}")
    public void deleteTaskLog(@PathVariable Long id) {
        supService.deleteTaskLog(id);
    }
}
