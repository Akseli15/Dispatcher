package kill.me.dispatcher.services.core;

import kill.me.dispatcher.entities.Comment;
import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.entities.Subtask;
import kill.me.dispatcher.entities.Task;
import kill.me.dispatcher.entities.statuses.SubtaskStatus;
import kill.me.dispatcher.entities.statuses.TaskStatus;
import kill.me.dispatcher.repos.CommentRepository;
import kill.me.dispatcher.repos.DriverRepository;
import kill.me.dispatcher.repos.SubtaskRepository;
import kill.me.dispatcher.repos.TaskRepository;
import kill.me.dispatcher.services.TelegramBot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BotService {

    @Autowired
    DriverRepository driverRepository;
    @Autowired
    TaskRepository taskRepository;
    @Autowired
    SubtaskRepository subtaskRepository;
    @Autowired
    CommentRepository commentRepository;
    TelegramBot telegramBot;

    public Driver getDriverByChatId(String chatId) { return driverRepository.findDriverByChatId(chatId); }

    public Driver getDriverByPhoneNumber(String phoneNumber){ return  driverRepository.findDriverByPhoneNumber(phoneNumber);}

    public Driver updateChatId(Driver driver, String chatId) {
        if (driver == null) {
            throw new IllegalArgumentException("Driver cannot be null");
        }
        driver.setChatId(chatId);
        return driverRepository.save(driver);
    }

    @Transactional
    public Subtask updateStatus(Long subtaskId, SubtaskStatus newStatus) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new IllegalArgumentException("Подзадача с ID " + subtaskId + " не найдена"));
        subtask.setStatus(newStatus);
        if(newStatus.getCode().equals("COMPLETED")){
            subtask.setUnloadingTime(LocalDateTime.now());
        }
        Subtask updatedSubtask = subtaskRepository.save(subtask);

        Long taskId = subtask.getTask().getId();
        List<Subtask> subtasks = subtaskRepository.findAllByTaskId(taskId);
        if (!subtasks.isEmpty() && subtasks.stream().allMatch(s -> s.getStatus() == SubtaskStatus.COMPLETED)) {
            updateTaskStatus(taskId, TaskStatus.COMPLETED);
        }

        return updatedSubtask;
    }

    @Transactional
    public void updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Задача с ID " + taskId + " не найдена"));
        task.setStatus(newStatus);
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    public List<Task> getTasksByDriverChatId(Long chatId) {
        List<String> excludedStatuses = List.of("EDITING", "CANCELED", "CLOSED");
        return taskRepository.findAllByDriver_ChatIdAndStatusNotIn(String.valueOf(chatId), excludedStatuses);
    }

    public List<Subtask> getAllSubtasksById(Long taskId) { return subtaskRepository.findAllByTaskId(taskId);}

    public Task getTaskById(Long id) {
        return taskRepository.getTaskById(id);
    }

    public Comment createComment(Comment comment, MultipartFile photo, Long taskId) {
        // Устанавливаем задачу
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        comment.setTask(task);

        // Устанавливаем время создания
        comment.setCreatedAt(LocalDateTime.now());

        // Обработка фотографии
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
                Path filePath = Paths.get("E:/Университет/4 курс/8 семестр/Диплом/dispatcher/uploads/comments", fileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, photo.getBytes());
                photoUrl = "/uploads/comments/" + fileName;
                comment.setPhotoUrl(photoUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save photo", e);
            }
        }

        Comment savedComment = commentRepository.save(comment);

        if (task.getDriver() != null && task.getDriver().getChatId() != null) {
            try {
                telegramBot.sendTelegramNotification(
                        task.getDriver().getChatId(),
                        task.getTaskNumber(),
                        comment.getText(),
                        photoUrl
                );
            } catch (Exception e) {
            }
        } else {
            System.out.println("Driver or Telegram ID not found for task " + taskId);
        }

        return savedComment;
    }
}
