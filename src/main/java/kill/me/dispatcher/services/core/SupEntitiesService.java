package kill.me.dispatcher.services.core;

import kill.me.dispatcher.entities.Client;
import kill.me.dispatcher.entities.Comment;
import kill.me.dispatcher.entities.logs.VehicleLog;
import kill.me.dispatcher.entities.logs.TaskLog;
import kill.me.dispatcher.repos.ClientRepository;
import kill.me.dispatcher.repos.CommentRepository;
import kill.me.dispatcher.repos.TaskLogRepository;
import kill.me.dispatcher.repos.VehicleLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SupEntitiesService {

    private CommentRepository commentRepository;
    private ClientRepository clientRepository;
    private VehicleLogRepository vehicleLogRepository;
    private TaskLogRepository taskLogRepository;

    public SupEntitiesService(CommentRepository commentRepository, ClientRepository clientRepository, VehicleLogRepository vehicleLogRepository, TaskLogRepository taskLogRepository) {
        this.commentRepository = commentRepository;
        this.clientRepository = clientRepository;
        this.vehicleLogRepository = vehicleLogRepository;
        this.taskLogRepository = taskLogRepository;
    }

    /**
     *  ------------------------ Comment CRUDы ------------------------
     */

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Comment updateComment(Long id, Comment updated) {
        return commentRepository.findById(id)
                .map(existing -> {
                    if (updated.getText() != null) existing.setText(updated.getText());
                    if (updated.getCreatedAt() != null) existing.setCreatedAt(updated.getCreatedAt());
                    if (updated.getAuthorFullName() != null) existing.setAuthorFullName(updated.getAuthorFullName());
                    if (updated.getTask() != null) existing.setTask(updated.getTask());
                    return commentRepository.save(existing);
                }).orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    /**
     *  ------------------------ Client CRUDы ------------------------
     */

    public Client createClient(Client client) {
        return clientRepository.save(client);
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client updateClient(Long id, Client updated) {
        return clientRepository.findById(id)
                .map(existing -> {
                    if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
                    if (updated.getPhoneNumber() != null) existing.setPhoneNumber(updated.getPhoneNumber());
                    if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
                    if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
                    return clientRepository.save(existing);
                }).orElseThrow(() -> new RuntimeException("Client not found"));
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

    /**
     *  ------------------------ VehicleLog CRUDы ------------------------
     */

    public VehicleLog createVehicleLog(VehicleLog log) {
        if (log.getStatusChangedAt() == null) log.setStatusChangedAt(LocalDateTime.now());
        return vehicleLogRepository.save(log);
    }

    public Optional<VehicleLog> getVehicleLogById(Long id) {
        return vehicleLogRepository.findById(id);
    }

    public List<VehicleLog> getAllVehicleLogs() {
        return vehicleLogRepository.findAll();
    }

    public VehicleLog updateVehicleLog(Long id, VehicleLog updated) {
        return vehicleLogRepository.findById(id)
                .map(existing -> {
                    if (updated.getVehicle() != null) existing.setVehicle(updated.getVehicle());
                    if (updated.getDriver() != null) existing.setDriver(updated.getDriver());
                    if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
                    if (updated.getStatusChangedAt() != null) existing.setStatusChangedAt(updated.getStatusChangedAt());
                    return vehicleLogRepository.save(existing);
                }).orElseThrow(() -> new RuntimeException("VehicleLog not found"));
    }

    public void deleteVehicleLog(Long id) {
        vehicleLogRepository.deleteById(id);
    }

    /**
     *  ------------------------ TaskLog CRUDы ------------------------
     */

    public TaskLog createTaskLog(TaskLog log) {
        if (log.getStatusChangedAt() == null) log.setStatusChangedAt(LocalDateTime.now());
        return taskLogRepository.save(log);
    }

    public Optional<TaskLog> getTaskLogById(Long id) {
        return taskLogRepository.findById(id);
    }

    public List<TaskLog> getAllTaskLogs() {
        return taskLogRepository.findAll();
    }

    public TaskLog updateTaskLog(Long id, TaskLog updated) {
        return taskLogRepository.findById(id)
                .map(existing -> {
                    if (updated.getTask() != null) existing.setTask(updated.getTask());
                    if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
                    if (updated.getStatusChangedAt() != null) existing.setStatusChangedAt(updated.getStatusChangedAt());
                    return taskLogRepository.save(existing);
                }).orElseThrow(() -> new RuntimeException("TaskLog not found"));
    }

    public void deleteTaskLog(Long id) {
        taskLogRepository.deleteById(id);
    }
}
