package kill.me.dispatcher.services;

import com.itextpdf.layout.element.Cell;
import jakarta.annotation.PostConstruct;
import kill.me.dispatcher.config.BotConfig;
import kill.me.dispatcher.entities.Driver;
import kill.me.dispatcher.entities.Subtask;
import kill.me.dispatcher.entities.Task;
import kill.me.dispatcher.entities.statuses.SubtaskStatus;
import kill.me.dispatcher.services.core.BotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.GetFile;
import org.telegram.telegrambots.meta.api.methods.commands.SetMyCommands;
import org.telegram.telegrambots.meta.api.methods.send.SendDocument;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.commands.BotCommand;
import org.telegram.telegrambots.meta.api.objects.commands.scope.BotCommandScopeDefault;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import kill.me.dispatcher.entities.Comment;

@Component
public class TelegramBot extends TelegramLongPollingBot {

    private final BotConfig botConfig;
    private final BotService botService;
    private final Map<Long, Long> currentTaskId = new HashMap<>();
    private final Map<Long, Long> currentSubtaskId = new HashMap<>();
    private final Map<Long, Long> lastMessageId = new HashMap<>();
    private final Map<Long, Boolean> awaitingMessage = new HashMap<>(); // Track if waiting for message input

    @Autowired
    public TelegramBot(BotConfig botConfig, BotService botService) {
        this.botConfig = botConfig;
        this.botService = botService;
    }

    @Override
    public String getBotUsername() {
        return botConfig.getBotName();
    }

    @Override
    public String getBotToken() {
        return botConfig.getToken();
    }

    @Override
    public void onUpdateReceived(Update update) {
        long chatId;
        String userName;

        if (update.hasCallbackQuery()) {
            chatId = update.getCallbackQuery().getMessage().getChatId();
            userName = update.getCallbackQuery().getFrom().getFirstName();
            String callbackData = update.getCallbackQuery().getData();
            Long messageId = update.getCallbackQuery().getMessage().getMessageId().longValue();
            lastMessageId.put(chatId, messageId);

            if (callbackData.equals("write_message")) {
                Long taskId = currentTaskId.getOrDefault(chatId, 0L);
                if (taskId == 0L) {
                    EditMessageText editMessage = new EditMessageText();
                    editMessage.setChatId(String.valueOf(chatId));
                    editMessage.setMessageId(messageId.intValue());
                    editMessage.setText("❌ " + userName + ", маршрутный лист не выбран.");
                    editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                    try {
                        execute(editMessage);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                    }
                    return;
                }
                awaitingMessage.put(chatId, true); // Set flag to await message
                SendMessage message = new SendMessage();
                message.setChatId(String.valueOf(chatId));
                message.setText("💬 " + userName + ", напишите ваше сообщение диспетчеру или отправьте фото:");
                try {
                    execute(message);
                } catch (TelegramApiException e) {
                    System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                }
            } else {
                // Handle other callbacks (refresh_tasks, register, authorize, etc.) as in the original code
                // ... (omitted for brevity, keep existing logic)
                if (callbackData.equals("refresh_tasks")) {
                    try {
                        List<Task> tasks = botService.getTasksByDriverChatId(chatId);
                        StringBuilder taskList = new StringBuilder();
                        if (tasks.isEmpty()) {
                            taskList.append("Нет активных маршрутных листов");
                        }
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("📋 " + userName + ", вот ваши маршрутные листы:\n" + taskList);
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        execute(editMessage);
                    } catch (Exception e) {
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("❌ " + userName + ", ошибка при обновлении списка маршрутных листов.");
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        try {
                            execute(editMessage);
                        } catch (TelegramApiException ex) {
                            throw new RuntimeException(ex);
                        }
                        System.err.println("Ошибка при обновлении списка задач: " + e.getMessage());
                    }
                } else if (callbackData.equals("register")) {
                    boolean isUserInDatabase = checkUserInDatabase(chatId);
                    SendMessage message = new SendMessage();
                    message.setChatId(String.valueOf(chatId));
                    if (isUserInDatabase) {
                        message.setText("🚚 " + userName + ", вы уже в системе! \n\n" +
                                "Можете приступать к работе: просматривать маршрутные листы, общаться с диспетчерами или загружать фото накладных.");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createMainMenuKeyboard(chatId));
                    } else {
                        message.setText("📱 " + userName + ", для регистрации поделитесь номером телефона. \n" +
                                "Мы проверим, есть ли вы в нашей базе, чтобы вы могли начать работу!");
                        message.setReplyMarkup(createPhoneRequestKeyboard());
                    }
                    try {
                        execute(message);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                    }
                } else if (callbackData.equals("authorize")) {
                    boolean isUserInDatabaseAuth = checkUserInDatabase(chatId);
                    SendMessage message = new SendMessage();
                    message.setChatId(String.valueOf(chatId));
                    if (isUserInDatabaseAuth) {
                        message.setText("✅ " + userName + ", авторизация успешна! \n\n" +
                                "Теперь вы можете управлять маршрутными листами, связываться с диспетчерами и загружать фото накладных.");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createMainMenuKeyboard(chatId));
                    } else {
                        message.setText("❌ " + userName + ", ваш chatId не найден в системе. \n" +
                                "Пожалуйста, зарегистрируйтесь, чтобы начать работу!");
                        message.setReplyMarkup(createPhoneRequestKeyboard());
                    }
                    try {
                        execute(message);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                    }
                } else if (callbackData.equals("download_routelist")) {
                    try {
                        Long taskId = currentTaskId.getOrDefault(chatId, 0L);
                        if (taskId == 0L) {
                            EditMessageText editMessage = new EditMessageText();
                            editMessage.setChatId(String.valueOf(chatId));
                            editMessage.setMessageId(messageId.intValue());
                            editMessage.setText("❌ " + userName + ", маршрутный лист не выбран.");
                            editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                            execute(editMessage);
                            return;
                        }
                        Task task = botService.getTaskById(taskId);
                        if (task == null) {
                            EditMessageText editMessage = new EditMessageText();
                            editMessage.setChatId(String.valueOf(chatId));
                            editMessage.setMessageId(messageId.intValue());
                            editMessage.setText("❌ " + userName + ", маршрутный лист не найден.");
                            editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                            execute(editMessage);
                            return;
                        }
                        List<Subtask> subtasks = botService.getAllSubtasksById(taskId);
                        System.out.println("Task ID: " + taskId + ", Task Number: " + task.getTaskNumber() + ", Subtasks: " + (subtasks != null ? subtasks.size() : "null"));
                        byte[] pdfBytes = generateRouteListPdf(task, subtasks);
                        SendDocument sendDocument = new SendDocument();
                        sendDocument.setChatId(String.valueOf(chatId));
                        sendDocument.setDocument(new InputFile(new ByteArrayInputStream(pdfBytes), "Маршрутный_лист_№" + task.getTaskNumber() + ".pdf"));
                        sendDocument.setCaption("#МаршрутныйЛист_" + task.getTaskNumber());
                        execute(sendDocument);
                    } catch (Exception e) {
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("❌ " + userName + ", ошибка при генерации маршрутного листа.");
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        System.err.println("Ошибка при генерации PDF: " + e.getMessage());
                    }
                } else if (callbackData.startsWith("task_")) {
                    try {
                        String taskNumber = callbackData.replace("task_", "");
                        List<Task> tasks = botService.getTasksByDriverChatId(chatId);
                        Task selectedTask = tasks.stream()
                                .filter(task -> task.getTaskNumber().equals(taskNumber))
                                .findFirst()
                                .orElse(null);
                        if (selectedTask != null) {
                            currentTaskId.put(chatId, selectedTask.getId());
                            List<Subtask> subtasks = botService.getAllSubtasksById(selectedTask.getId());
                            StringBuilder routePoints = new StringBuilder();
                            if (subtasks.isEmpty()) {
                                routePoints.append("Пункты маршрута не указаны");
                            } else {
                                for (int i = 0; i < subtasks.size(); i++) {
                                    Subtask subtask = subtasks.get(i);
                                    routePoints.append(i + 1).append(". ")
                                            .append("Адрес: ").append(subtask.getClient().getAddress()).append(", ")
                                            .append("Юр. лицо: ").append(subtask.getClient().getFullName()).append(", ")
                                            .append("Номер телефона: ").append(subtask.getClient().getPhoneNumber()).append(".\n")
                                            .append("Статус: ").append(subtask.getStatus().getDescription()).append("\n");
                                }
                            }
                            EditMessageText editMessage = new EditMessageText();
                            editMessage.setChatId(String.valueOf(chatId));
                            editMessage.setMessageId(messageId.intValue());
                            editMessage.setText("📋 #МаршрутныйЛист_" + taskNumber + "\n\n" +
                                    "Пункты маршрута: \n" + routePoints + "\n" +
                                    "Выберите пункт маршрута для изменения статуса:");
                            editMessage.setReplyMarkup(createTaskDetailsKeyboard(selectedTask.getId()));
                            execute(editMessage);
                        } else {
                            EditMessageText editMessage = new EditMessageText();
                            editMessage.setChatId(String.valueOf(chatId));
                            editMessage.setMessageId(messageId.intValue());
                            editMessage.setText("❌ " + userName + ", маршрутный лист №" + taskNumber + " не найден.");
                            editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                            execute(editMessage);
                        }
                    } catch (Exception e) {
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("❌ " + userName + ", ошибка при получении маршрутного листа.");
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        try {
                            execute(editMessage);
                        } catch (TelegramApiException ex) {
                            throw new RuntimeException(ex);
                        }
                        System.err.println("Ошибка при обработке маршрутного листа: " + e.getMessage());
                    }
                } else if (callbackData.startsWith("subtask_")) {
                    try {
                        Long subtaskId = Long.parseLong(callbackData.replace("subtask_", ""));
                        currentSubtaskId.put(chatId, subtaskId);
                        Subtask selectedSubtask = botService.getAllSubtasksById(currentTaskId.getOrDefault(chatId, 0L))
                                .stream()
                                .filter(subtask -> subtask.getId().equals(subtaskId))
                                .findFirst()
                                .orElse(null);
                        if (selectedSubtask != null) {
                            EditMessageText editMessage = new EditMessageText();
                            editMessage.setChatId(String.valueOf(chatId));
                            editMessage.setMessageId(messageId.intValue());
                            editMessage.setText("📍 Выбран пункт: " + selectedSubtask.getClient().getAddress() + "\n\n" +
                                    "Выберите новый статус:");
                            editMessage.setReplyMarkup(createStatusKeyboard(subtaskId, currentTaskId.getOrDefault(chatId, 0L)));
                            execute(editMessage);
                        } else {
                            EditMessageText editMessage = new EditMessageText();
                            editMessage.setChatId(String.valueOf(chatId));
                            editMessage.setMessageId(messageId.intValue());
                            editMessage.setText("❌ " + userName + ", пункт не найден.");
                            editMessage.setReplyMarkup(createTaskDetailsKeyboard(currentTaskId.getOrDefault(chatId, 0L)));
                            execute(editMessage);
                        }
                    } catch (Exception e) {
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("❌ " + userName + ", ошибка при выборе пункта.");
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        try {
                            execute(editMessage);
                        } catch (TelegramApiException ex) {
                            throw new RuntimeException(ex);
                        }
                        System.err.println("Ошибка при обработке подзадачи: " + e.getMessage());
                    }
                } else if (callbackData.startsWith("status_")) {
                    try {
                        String[] parts = callbackData.replace("status_", "").split("_");
                        Long subtaskId = Long.parseLong(parts[0]);
                        SubtaskStatus newStatus = SubtaskStatus.valueOf(parts[1]);
                        Long taskId = currentTaskId.getOrDefault(chatId, 0L);
                        Subtask updatedSubtask = botService.updateStatus(subtaskId, newStatus);
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("✅ " + userName + ", статус пункта обновлен на: " + newStatus.getDescription());
                        editMessage.setReplyMarkup(createTaskDetailsKeyboard(taskId));
                        execute(editMessage);
                    } catch (Exception e) {
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("❌ " + userName + ", ошибка при обновлении статуса.");
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        try {
                            execute(editMessage);
                        } catch (TelegramApiException ex) {
                            throw new RuntimeException(ex);
                        }
                        System.err.println("Ошибка при обновлении статуса: " + e.getMessage());
                    }
                } else if (callbackData.startsWith("back_to_task_")) {
                    try {
                        Long taskId = Long.parseLong(callbackData.replace("back_to_task_", ""));
                        List<Subtask> subtasks = botService.getAllSubtasksById(taskId);
                        StringBuilder routePoints = new StringBuilder();
                        if (subtasks.isEmpty()) {
                            routePoints.append("Пункты маршрута не указаны");
                        } else {
                            for (int i = 0; i < subtasks.size(); i++) {
                                Subtask subtask = subtasks.get(i);
                                routePoints.append(i + 1).append(". ")
                                        .append("Адрес: ").append(subtask.getClient().getAddress()).append(", ")
                                        .append("Юр. лицо: ").append(subtask.getClient().getFullName()).append(", ")
                                        .append("Номер телефона: ").append(subtask.getClient().getPhoneNumber()).append(".\n")
                                        .append("Статус: ").append(subtask.getStatus().getDescription()).append("\n");
                            }
                        }
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("📋 #МаршрутныйЛист_\n\n" +
                                "Пункты маршрута: \n" + routePoints + "\n" +
                                "Выберите пункт маршрута для изменения статуса:");
                        editMessage.setReplyMarkup(createTaskDetailsKeyboard(taskId));
                        execute(editMessage);
                    } catch (Exception e) {
                        EditMessageText editMessage = new EditMessageText();
                        editMessage.setChatId(String.valueOf(chatId));
                        editMessage.setMessageId(messageId.intValue());
                        editMessage.setText("❌ " + userName + ", ошибка при возврате к пунктам маршрута.");
                        editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                        try {
                            execute(editMessage);
                        } catch (TelegramApiException ex) {
                            throw new RuntimeException(ex);
                        }
                        System.err.println("Ошибка при возврате к пунктам маршрута: " + e.getMessage());
                    }
                } else if (callbackData.equals("back_to_main")) {
                    EditMessageText editMessage = new EditMessageText();
                    editMessage.setChatId(String.valueOf(chatId));
                    editMessage.setMessageId(messageId.intValue());
                    editMessage.setText("📋 " + userName + ", вот ваши маршрутные листы:");
                    editMessage.setReplyMarkup(createMainMenuKeyboard(chatId));
                    try {
                        execute(editMessage);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при редактировании сообщения: " + e.getMessage());
                    }
                }
            }
        } else if (update.hasMessage()) {
            chatId = update.getMessage().getChatId();
            userName = update.getMessage().getFrom().getFirstName();
            SendMessage message = new SendMessage();
            message.setChatId(String.valueOf(chatId));

            if (awaitingMessage.getOrDefault(chatId, false)) {
                Long taskId = currentTaskId.getOrDefault(chatId, 0L);
                if (taskId == 0L) {
                    message.setText("❌ " + userName + ", маршрутный лист не выбран.");
                    message.setReplyMarkup(createMainMenuKeyboard(chatId));
                    awaitingMessage.remove(chatId);
                    try {
                        execute(message);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                    }
                    return;
                }

                Task task = botService.getTaskById(taskId);
                if (task == null) {
                    message.setText("❌ " + userName + ", маршрутный лист не найден.");
                    message.setReplyMarkup(createMainMenuKeyboard(chatId));
                    awaitingMessage.remove(chatId);
                    try {
                        execute(message);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                    }
                    return;
                }

                Comment comment = new Comment();
                comment.setAuthorFullName(userName);

                MultipartFile photo = null;
                if (update.getMessage().hasPhoto()) {
                    try {
                        photo = downloadPhoto(update);
                        comment.setText(update.getMessage().getCaption() != null ? update.getMessage().getCaption() : "");
                    } catch (Exception e) {
                        message.setText("❌ " + userName + ", не удалось обработать фото.");
                        message.setReplyMarkup(createMainMenuKeyboard(chatId));
                        awaitingMessage.remove(chatId);
                        try {
                            execute(message);
                        } catch (TelegramApiException ex) {
                            System.err.println("Ошибка при отправке сообщения: " + ex.getMessage());
                        }
                        return;
                    }
                } else if (update.getMessage().hasText()) {
                    comment.setText(update.getMessage().getText());
                } else {
                    message.setText("❌ " + userName + ", пожалуйста, отправьте текст или фото.");
                    try {
                        execute(message);
                    } catch (TelegramApiException e) {
                        System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                    }
                    return;
                }

                try {
                    botService.createComment(comment, photo, taskId);
                    message.setText("✅ " + userName + ", сообщение успешно отправлено! Ожидайте ответа диспетчера.");
                    message.setReplyMarkup(createMainMenuKeyboard(chatId));
                } catch (Exception e) {
                    message.setText("❌ " + userName + ", не удалось отправить сообщение.");
                    message.setReplyMarkup(createMainMenuKeyboard(chatId));
                    System.err.println("Ошибка при создании комментария: " + e.getMessage());
                }
                awaitingMessage.remove(chatId);
                try {
                    execute(message);
                } catch (TelegramApiException e) {
                    System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                }
            } else if (update.getMessage().hasText()) {
                String messageText = update.getMessage().getText();

                switch (messageText) {
                    case "/start":
                        message.setText("🚛 Привет, " + userName + "! Добро пожаловать в бот для водителей! \n\n" +
                                "📋 Получайте маршрутные листы, \n" +
                                "💬 Связывайтесь с диспетчерами, \n" +
                                "📤 Выгружайте данные по маршрутам, \n" +
                                "📸 Загрузите фото накладных. \n\n" +
                                "Готовы к работе? Выберите действие ниже:");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createStartKeyboard());
                        break;
                    case "/routelist":
                        message.setText("📋 " + userName + ", вот ваши маршрутные листы:");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createMainMenuKeyboard(chatId));
                        break;
                    case "Написать сообщение":
                        Long taskId = currentTaskId.getOrDefault(chatId, 0L);
                        if (taskId == 0L) {
                            message.setText("❌ " + userName + ", маршрутный лист не выбран.");
                            message.setReplyMarkup(createMainMenuKeyboard(chatId));
                        } else {
                            awaitingMessage.put(chatId, true);
                            message.setText("💬 " + userName + ", напишите ваше сообщение диспетчеру или отправьте фото:");
                        }
                        break;
                    case "Назад в главное меню":
                        message.setText("📋 " + userName + ", вот ваши маршрутные листы:");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createMainMenuKeyboard(chatId));
                        break;
                    default:
                        message.setText("❓ " + userName + ", неизвестная команда. \n" +
                                "Используйте /start, чтобы вернуться к началу и выбрать действие.");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createStartKeyboard());
                }
                try {
                    execute(message);
                } catch (TelegramApiException e) {
                    System.err.println("Ошибка при отправке сообщения: " + e.getMessage());
                }
            } else if (update.getMessage().hasContact()) {
                String phoneNumber = update.getMessage().getContact().getPhoneNumber().replace("+", "");
                System.out.println(phoneNumber);
                try {
                    Driver driver = botService.getDriverByPhoneNumber(phoneNumber);
                    if (driver != null) {
                        botService.updateChatId(driver, String.valueOf(chatId));
                        message.setText("🎉 " + userName + ", регистрация успешна! \n\n" +
                                "Ваш номер телефона найден в базе. Теперь вы можете работать с маршрутными листами и загружать фото накладных!");
                        message.setReplyMarkup(new ReplyKeyboardRemove(true));
                        message.setReplyMarkup(createMainMenuKeyboard(chatId));
                        execute(message);
                    } else {
                        message.setText("⚠️ " + userName + ", ваш номер телефона не найден в базе данных. \n" +
                                "Обратитесь к администратору для добавления в систему.");
                        message.setReplyMarkup(createStartKeyboard());
                        execute(message);
                    }
                } catch (Exception e) {
                    message.setText("❌ " + userName + ", произошла ошибка при регистрации. \n" +
                            "Попробуйте снова или свяжитесь с администратором.");
                    message.setReplyMarkup(createStartKeyboard());
                    try {
                        execute(message);
                    } catch (TelegramApiException ex) {
                        throw new RuntimeException(ex);
                    }
                    System.err.println("Ошибка при работе с базой данных: " + e.getMessage());
                }
            }
        }
    }

    private MultipartFile downloadPhoto(Update update) throws Exception {
        if (!update.getMessage().hasPhoto()) {
            return null;
        }
        // Get the largest photo size
        var photos = update.getMessage().getPhoto();
        var photo = photos.get(photos.size() - 1); // Largest size
        String fileId = photo.getFileId();

        // Create and configure GetFile request
        GetFile getFile = new GetFile();
        getFile.setFileId(fileId);

        org.telegram.telegrambots.meta.api.objects.File file;
        try {
            file = execute(getFile); // Call execute with GetFile object
        } catch (TelegramApiException e) {
            throw new Exception("Failed to retrieve file metadata from Telegram: " + e.getMessage(), e);
        }

        String fileUrl = String.format("https://api.telegram.org/file/bot%s/%s", getBotToken(), file.getFilePath());

        URL url = new URL(fileUrl);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (InputStream is = url.openStream()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }
        } catch (Exception e) {
            throw new Exception("Failed to download photo from Telegram: " + e.getMessage(), e);
        }
        byte[] fileBytes = baos.toByteArray();

        String originalFileName = UUID.randomUUID().toString() + ".jpg";
        return new MultipartFile() {
            @Override
            public String getName() {
                return "photo";
            }

            @Override
            public String getOriginalFilename() {
                return originalFileName;
            }

            @Override
            public String getContentType() {
                return "image/jpeg";
            }

            @Override
            public boolean isEmpty() {
                return fileBytes.length == 0;
            }

            @Override
            public long getSize() {
                return fileBytes.length;
            }

            @Override
            public byte[] getBytes() {
                return fileBytes;
            }

            @Override
            public InputStream getInputStream() {
                return new ByteArrayInputStream(fileBytes);
            }

            @Override
            public void transferTo(java.io.File dest) throws IOException {
                Files.write(dest.toPath(), fileBytes);
            }
        };
    }

    private InlineKeyboardMarkup createStartKeyboard() {
        InlineKeyboardMarkup keyboardMarkup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();

        List<InlineKeyboardButton> row = new ArrayList<>();
        row.add(InlineKeyboardButton.builder()
                .text("\uD83D\uDCDD Регистрация \uD83D\uDCDD")
                .callbackData("register")
                .build());
        row.add(InlineKeyboardButton.builder()
                .text("\uD83D\uDD11 Авторизация \uD83D\uDD11")
                .callbackData("authorize")
                .build());
        keyboard.add(row);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private ReplyKeyboardMarkup createPhoneRequestKeyboard() {
        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setResizeKeyboard(true);
        keyboardMarkup.setOneTimeKeyboard(true);

        List<KeyboardRow> keyboard = new ArrayList<>();
        KeyboardRow row = new KeyboardRow();
        row.add(KeyboardButton.builder()
                .text("Отправить номер телефона")
                .requestContact(true)
                .build());
        keyboard.add(row);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private InlineKeyboardMarkup createMainMenuKeyboard(long chatId) {
        InlineKeyboardMarkup keyboardMarkup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();

        try {
            List<Task> tasks = botService.getTasksByDriverChatId(chatId);
            if (tasks.isEmpty()) {
                List<InlineKeyboardButton> row = new ArrayList<>();
                row.add(InlineKeyboardButton.builder()
                        .text("Нет активных маршрутных листов")
                        .callbackData("no_tasks")
                        .build());
                keyboard.add(row);
            } else {
                for (Task task : tasks) {
                    List<InlineKeyboardButton> row = new ArrayList<>();
                    row.add(InlineKeyboardButton.builder()
                            .text("Маршрутный лист № " + task.getTaskNumber())
                            .callbackData("task_" + task.getTaskNumber())
                            .build());
                    keyboard.add(row);
                }
            }
        } catch (Exception e) {
            List<InlineKeyboardButton> row = new ArrayList<>();
            row.add(InlineKeyboardButton.builder()
                    .text("Ошибка при загрузке маршрутных листов")
                    .callbackData("error_tasks")
                    .build());
            keyboard.add(row);
            System.err.println("Ошибка при получении задач: " + e.getMessage());
        }

        List<InlineKeyboardButton> refreshRow = new ArrayList<>();
        refreshRow.add(InlineKeyboardButton.builder()
                .text("Обновить список маршрутных листов")
                .callbackData("refresh_tasks")
                .build());
        keyboard.add(refreshRow);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private InlineKeyboardMarkup createTaskDetailsKeyboard(Long taskId) {
        InlineKeyboardMarkup keyboardMarkup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();

        try {
            List<Subtask> subtasks = botService.getAllSubtasksById(taskId);
            if (subtasks.isEmpty()) {
                List<InlineKeyboardButton> row = new ArrayList<>();
                row.add(InlineKeyboardButton.builder()
                        .text("Нет пунктов маршрута")
                        .callbackData("no_subtasks")
                        .build());
                keyboard.add(row);
            } else {
                for (int i = 0; i < subtasks.size(); i++) {
                    Subtask subtask = subtasks.get(i);
                    List<InlineKeyboardButton> row = new ArrayList<>();
                    row.add(InlineKeyboardButton.builder()
                            .text("Пункт " + (i + 1) + ": " + subtask.getClient().getAddress())
                            .callbackData("subtask_" + subtask.getId())
                            .build());
                    keyboard.add(row);
                }
            }
        } catch (Exception e) {
            List<InlineKeyboardButton> row = new ArrayList<>();
            row.add(InlineKeyboardButton.builder()
                    .text("Ошибка при загрузке пунктов")
                    .callbackData("error_subtasks")
                    .build());
            keyboard.add(row);
            System.err.println("Ошибка при получении подзадач: " + e.getMessage());
        }

        List<InlineKeyboardButton> additionalRow = new ArrayList<>();
        additionalRow.add(InlineKeyboardButton.builder()
                .text("Написать сообщение")
                .callbackData("write_message")
                .build());
        additionalRow.add(InlineKeyboardButton.builder()
                .text("Скачать маршрутный лист")
                .callbackData("download_routelist")
                .build());
        additionalRow.add(InlineKeyboardButton.builder()
                .text("Назад в главное меню")
                .callbackData("back_to_main")
                .build());
        keyboard.add(additionalRow);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private InlineKeyboardMarkup createStatusKeyboard(Long subtaskId, Long taskId) {
        InlineKeyboardMarkup keyboardMarkup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();

        for (SubtaskStatus status : SubtaskStatus.values()) {
            List<InlineKeyboardButton> row = new ArrayList<>();
            row.add(InlineKeyboardButton.builder()
                    .text(status.getDescription())
                    .callbackData("status_" + subtaskId + "_" + status.name())
                    .build());
            keyboard.add(row);
        }

        List<InlineKeyboardButton> backRow = new ArrayList<>();
        backRow.add(InlineKeyboardButton.builder()
                .text("Назад к пунктам маршрута")
                .callbackData("back_to_task_" + taskId)
                .build());
        keyboard.add(backRow);

        keyboardMarkup.setKeyboard(keyboard);
        return keyboardMarkup;
    }

    private boolean checkUserInDatabase(long chatId) {
        Driver driver = botService.getDriverByChatId(String.valueOf(chatId));
        return driver != null;
    }

    public void sendTaskNotification(String chatId, String taskNumber) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("📋 Вам назначен новый маршрутный лист № #МаршрутныйЛист_" + taskNumber + "!\n" +
                "Проверьте список задач с помощью команды /routelist");
        try {
            execute(message);
        } catch (TelegramApiException e) {
            throw new RuntimeException("Ошибка при отправке уведомления о новой задаче: " + e.getMessage());
        }
    }

    public void sendTaskCanceledNotification(String chatId, String taskNumber) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("📋 Ваш #МаршрутныйЛист_" + taskNumber + " был отменён!\n" +
                "Проверьте список задач с помощью команды /routelist");
        try {
            execute(message);
        } catch (TelegramApiException e) {
            throw new RuntimeException("Ошибка при отправке уведомления о новой задаче: " + e.getMessage());
        }
    }

    public void sendTaskClosedNotification(String chatId, String taskNumber) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("📋 Ваш #МаршрутныйЛист_" + taskNumber + " был закрыт!\n" +
                "Проверьте список задач с помощью команды /routelist");
        try {
            execute(message);
        } catch (TelegramApiException e) {
            throw new RuntimeException("Ошибка при отправке уведомления о новой задаче: " + e.getMessage());
        }
    }

    public void sendTelegramNotification(String telegramId, String taskNumber, String commentText, String photoUrl) throws TelegramApiException {
        String caption = String.format(
                "Новый комментарий к маршрутному листу №%s:\n%s\n\n#%s",
                taskNumber,
                commentText,
                "МаршрутныйЛист_" + taskNumber
        );

        if (photoUrl != null) {
            String basePath = "E:/Университет/4 курс/8 семестр/Диплом/dispatcher";
            File photoFile = new File(basePath + photoUrl);

            if (photoFile.exists()) {
                SendPhoto sendPhoto = new SendPhoto();
                sendPhoto.setChatId(telegramId);
                sendPhoto.setPhoto(new InputFile(photoFile));
                sendPhoto.setCaption(caption);
                execute(sendPhoto);
                return;
            } else {
                System.err.println("Файл не найден: " + photoFile.getAbsolutePath());
            }
        }

        SendMessage message = new SendMessage();
        message.setChatId(telegramId);
        message.setText(caption);
        execute(message);
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private byte[] generateRouteListPdf(Task task, List<Subtask> subtasks) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        PdfFont font;
        try {
            font = PdfFontFactory.createFont("c:/windows/fonts/arial.ttf", PdfEncodings.IDENTITY_H);
            document.setFont(font);
        } catch (Exception e) {
            System.err.println("Failed to load font: " + e.getMessage() + ". Using default font.");
            font = PdfFontFactory.createFont(PdfEncodings.IDENTITY_H);
            document.setFont(font);
        }

        String taskNumber = task.getTaskNumber() != null ? task.getTaskNumber() : "Не указан";
        document.add(new Paragraph(new Text("МАРШРУТНЫЙ ЛИСТ № " + taskNumber))
                .setBold().setFontSize(13).setUnderline().setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("работника \"ООО Транспортные решения\"")
                .setTextAlignment(TextAlignment.CENTER));
        String taskDate = task.getCreatedAt() != null ? task.getCreatedAt().format(DATE_FORMATTER) : "Не указана";
        document.add(new Paragraph("на \"" + taskDate + "\"")
                .setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

        String driverName = task.getDriver() != null && task.getDriver().getName() != null ? task.getDriver().getName() : "Не указан";
        document.add(new Paragraph("Работник: " + driverName));
        document.add(new Paragraph("Должность: Водитель (Транспортный отдел)").setMarginBottom(15));

        float[] columnWidths = {30, 100, 100, 80, 80, 50, 50};
        Table table = new Table(UnitValue.createPointArray(columnWidths));
        table.addHeaderCell("№");
        table.addHeaderCell("Наименование организации");
        table.addHeaderCell("Адрес");
        table.addHeaderCell("Цель поездки");
        table.addHeaderCell("Транспортное средство");
        table.addHeaderCell("Время");
        table.addHeaderCell("Подпись");

        if (subtasks == null || subtasks.isEmpty()) {
            Cell noSubtasksCell = new Cell(1, 7);
            noSubtasksCell.add(new Paragraph("Нет пунктов маршрута").setTextAlignment(TextAlignment.CENTER));
            table.addCell(noSubtasksCell);
        } else {
            for (int i = 0; i < subtasks.size(); i++) {
                Subtask subtask = subtasks.get(i);
                table.addCell(String.valueOf(i + 1));
                table.addCell(subtask.getClient() != null && subtask.getClient().getFullName() != null ? subtask.getClient().getFullName() : "Не указан");
                table.addCell(subtask.getClient() != null && subtask.getClient().getAddress() != null ? subtask.getClient().getAddress() : "Не указан");
                table.addCell("Доставка груза");
                table.addCell(task.getVehicle() != null && task.getVehicle().getRegistrationNumber() != null ? task.getVehicle().getRegistrationNumber() : "Не указан");
                table.addCell(subtask.getUnloadingTime() != null ? subtask.getUnloadingTime().format(TIME_FORMATTER) : "");
                table.addCell("");
            }
        }
        document.add(table);

        document.add(new Paragraph("Маршрутный лист сформирован \"" + java.time.LocalDate.now().format(DATE_FORMATTER) +
                "\" в " + java.time.LocalTime.now().format(TIME_FORMATTER))
                .setTextAlignment(TextAlignment.RIGHT).setMarginTop(30));

        document.close();
        return baos.toByteArray();
    }

    @PostConstruct
    public void initCommands() {
        List<BotCommand> commandList = new ArrayList<>();
        commandList.add(new BotCommand("/start", "Запуск бота"));
        commandList.add(new BotCommand("/routelist", "Вернёт Вам список назначенных маршрутных листов"));

        try {
            execute(new SetMyCommands(commandList, new BotCommandScopeDefault(), null));
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }
}