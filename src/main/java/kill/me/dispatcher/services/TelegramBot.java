package kill.me.dispatcher.services;

import kill.me.dispatcher.config.BotConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.DeleteMessage;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class TelegramBot extends TelegramLongPollingBot {

    private final BotConfig botConfig;

    private final DriverService driverService;

    @Autowired
    public TelegramBot(BotConfig botConfig, DriverService driverService) {
        this.botConfig = botConfig;
        this.driverService = driverService;
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

        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            SendMessage message = new SendMessage();

            switch (messageText) {
                case "/start":
                    startMenu(chatId);
                    break;
                case "\uD83D\uDC49\uD83C\uDFFB Как пройти":
                    sendPhoneNumberButton(chatId);
                    break;
                case "❔ Помощь":
                case "/help":
                    supportInfo(chatId);
                    break;
                default:
                    prepareAndSendMessage(chatId, "Данной команды не существует, откройте меню бота и выберите пункт \"Помощь\" или введите /help");
            }

            try {
                execute(message);
            } catch (TelegramApiException e) {
                System.out.println("Ошибка при отправке сообщения: " + e.getMessage());
            }
        }
    }

    private void startMenu(long chatId) {
        SendMessage message = new SendMessage();
        if (driverService.findDriverByChatId(String.valueOf(chatId)) != null){
            message.setChatId(chatId);
            message.setText("<b><u>Добро пожаловать!</u></b>\n\n" +
                    "Для начала работы с нашим телеграм-ботом, пожалуйста, зарегистрируйтесь в системе, нажав кнопку <b><u>\"Регистрация\"</u></b>, если вы новый пользователь.");
            message.enableHtml(true);

            InlineKeyboardMarkup keyboardMarkup = new InlineKeyboardMarkup();

            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
            List<InlineKeyboardButton> buttons = Arrays.asList(createInlineKeyboardButton("\uD83D\uDC64 Регистрация", "registation"));

            rows.add(buttons);

            keyboardMarkup.setKeyboard(rows);
            message.setReplyMarkup(keyboardMarkup);

            executeWithExceptionHandler(message);
        } else {
            message.setChatId(chatId);
            message.setText("<b><u>Добро пожаловать!</u></b>\n\n");
            message.enableHtml(true);

            executeWithExceptionHandler(message);
        }
    }

    private void supportInfo(long chatId) {
        String text = "";
        prepareAndSendMessage(chatId,text);
    }

    private void sendPhoneNumberButton(Long chatId) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText("Нажмите кнопку ниже, чтобы поделиться номером:");

        KeyboardButton sharePhoneButton = new KeyboardButton("📞 Поделиться номером");
        sharePhoneButton.setRequestContact(true);

        KeyboardRow row = new KeyboardRow();
        row.add(sharePhoneButton);

        ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
        keyboardMarkup.setKeyboard(Collections.singletonList(row));
        keyboardMarkup.setResizeKeyboard(true);

        message.setReplyMarkup(keyboardMarkup);

        try {
            execute(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private InlineKeyboardButton createInlineKeyboardButton(String buttonText, String callbackData) {
        InlineKeyboardButton button = new InlineKeyboardButton();
        button.setText(buttonText);
        button.setCallbackData(callbackData);
        return button;
    }

    private void prepareAndSendMessage(long chatId, String textToSend){
        SendMessage message = new SendMessage();
        message.setChatId(String.valueOf(chatId));
        message.setText(textToSend);
        message.enableHtml(true);
        try {
            execute(message);
        } catch (TelegramApiException e) {
            System.out.println(e);
        }
    }

    private void executeWithExceptionHandler(SendMessage message) {
        try {
            execute(message);
        } catch (TelegramApiException e) {
            System.out.println("Error occurred:" + e.getMessage());
        }
    }

    private void executeWithExceptionHandler(EditMessageText message) {
        try {
            execute(message);
        } catch (TelegramApiException e) {
            System.out.println("Error occurred:" + e.getMessage());
        }
    }

    private void executeWithExceptionHandler(DeleteMessage message) {
        try {
            execute(message);
        } catch (TelegramApiException e) {
            System.out.println("Error occurred:" + e.getMessage());
        }
    }
}

