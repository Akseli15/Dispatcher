let taskData = [];
let vehicleLogData = [];
let routeLogData = [];

document.addEventListener("DOMContentLoaded", async () => {
    const mainContent = document.querySelector(".main-content");
    const sidebarItems = document.querySelectorAll(".sidebar-item, .sidebar-subitem");
    const section = new URLSearchParams(window.location.search).get('section');
    const driverOptions = await getDriverOptions();
    const dispatcherOptions = await getDispatcherOptions();
    const vehicleOptions = await getVehicleOptions();
    const taskOptions = await getTaskOptions();

    const endpoints = {
        tasks: "/api/tasks",
        drivers: "/api/drivers",
        vehicles: "/api/vehicles",
        clients: "/api/clients",
        dispatchers: "/api/dispatchers",
        driverReports: "/api/tasks/completed-count",
        routeReports: "/api/tasks",
        vehicleReports: "/api/tasks/completed-count",
        vehicleLog: "/api/vehicle-logs",
        routeLog: "/api/task-logs"
    };

    const driverStatusDescriptions = {
        "OFF_DUTY": "⚪ Не работает",
        "AVAILABLE": "🟢 Свободен",
        "ON_ROUTE": "🔵 В рейсе"
    };

    const vehicleStatusDescriptions = {
        "MAINTENANCE_REQUIRED": "🔴 Требуется ТО",
        "UNDER_MAINTENANCE": "🟠 Проходит ТО",
        "AVAILABLE": "🟢 Свободно",
        "ON_ROUTE": "🔵 В рейсе"
    };

    const taskStatusDescriptions = {
        "EDITING": "⚪ На редактировании",
        "READY": "🟢 Готов к исполнению",
        "IN_PROGRESS": "🔵 Выполняется",
        "COMPLETED": "🟡 Завершён",
        "CLOSED": "🟢 Закрыт",
        "CANCELED": "⚫ Отменён",
        "ISSUE": "🔴 Проблема на рейсе"
    };

    const columnNames = {
        tasks: ["Номер", "Статус", "Дата создания", "Дата выполнения", "Водитель", "Диспетчер", "Действия"],
        drivers: ["Номер", "ФИО", "Telegram ID", "Номер телефона", "График работы", "Токен", "Статус", "Действия"],
        vehicles: ["Номер", "Регистрационный номер", "Модель", "Максимально перевозимый груз (тонны)", "Статус", "Действия"],
        dispatchers: ["Номер", "Логин", "ФИО", "Пароль", "Действия"],
        clients: ["Номер", "Юр.лицо", "Номер телефона", "Электронная почта", "Адрес", "Действия"],
        vehicleLog: ["Номер", "Транспортное средство", "Водитель", "Статус", "Дата изменения статуса"],
        routeLog: ["Номер маршрутного листа", "Статус", "Дата изменения статуса"]
    };

    const renderTable = (section, data) => {
        const columns = columnNames[section];
        let html = `<table class="table table-bordered table-hover mt-3 table-responsive"><thead><tr>`;
        switch (section) {
            case "drivers":
                html += '<div> <button class="btn-primary" onClick="handleAddDriver()" style="margin-bottom: 10px;">Добавить водителя</button></div>';
                break;
            case "dispatchers":
                html += '<div> <button class="btn-primary" onClick="handleAddDispatcher()" style="margin-bottom: 10px;">Добавить диспетчера</button></div>';
                break;
            case "vehicles":
                html += '<div> <button class="btn-primary" onClick="handleAddVehicle()" style="margin-bottom: 10px;">Добавить транспортное средство</button></div>';
                break;
            case "clients":
                html += '<div> <button class="btn-primary" onClick="handleAddClient()" style="margin-bottom: 10px;">Добавить клиента</button></div>';
                break;
            case "tasks":
                html += `
                    <div>
                        <button class="btn-primary" onClick="handleAddTask()" style="margin-bottom: 10px;">Создать маршрутный лист</button>
                    </div>
                    <div id="filters" class="filter-section">
                        <label for="status">Статус:</label>
                        <select id="status">
                            <option value="">Все</option>
                            <option value="EDITING">На редактировании</option>
                            <option value="READY">Готов к исполнению</option>
                            <option value="IN_PROGRESS">Выполняется</option>
                            <option value="COMPLETED">Завершён</option>
                            <option value="CLOSED">Закрыт</option>
                            <option value="CANCELED">Отменён</option>
                            <option value="ISSUE">Проблема на рейсе</option>
                        </select>
                        <label for="driverId">Водитель:</label>
                        <select id="driverId">
                            <option value="">Все</option>
                            ${driverOptions}
                        </select>
                        <label for="dispatcherId">Диспетчер:</label>
                        <select id="dispatcherId">
                            <option value="">Все</option>
                            ${dispatcherOptions}
                        </select>
                        <label for="createdFrom">Дата создания с:</label>
                        <input style="width: 20%" type="date" id="createdFrom" />
                        <label for="completedFrom">Дата выполнения с:</label>
                        <input style="width: 20%" type="date" id="completedFrom" />
                        <button class="btn-primary" id="applyTaskFilters">Применить</button>
                        <button class="btn-primary" id="clearTaskFilters">Сбросить</button>
                    </div>
                `;
                break;
            case "vehicleLog":
                html += `
                    <div style="margin-top: 25px" id="filters" class="filter-section">
                        <label for="status">Статус:</label>
                        <select id="status">
                            <option value="">Все</option>
                            <option value="MAINTENANCE_REQUIRED">Требуется ТО</option>
                            <option value="UNDER_MAINTENANCE">Проходит ТО</option>
                            <option value="AVAILABLE">Свободно</option>
                            <option value="ON_ROUTE">В рейсе</option>
                        </select>
                        <label for="driverId">Водитель:</label>
                        <select id="driverId">
                            <option value="">Все</option>
                            ${driverOptions}
                        </select>
                        <label for="vehicleId">Транспортное средство:</label>
                        <select id="vehicleId">
                            <option value="">Все</option>
                            ${vehicleOptions}
                        </select>
                        <label for="changedAt">Дата изменения:</label>
                        <input type="date" id="changedAt" />
                        <button class="btn-primary" id="applyVehicleLogFilters">Применить</button>
                        <button class="btn-primary" id="clearVehicleLogFilters">Сбросить</button>
                    </div>
                `;
                break;
            case "routeLog":
                html += `
                    <div style="margin-top: 25px" id="filters" class="filter-section">
                        <label for="taskId">Номер документа:</label>
                        <select style="width: 15%" id="taskId">
                            <option value="">Все</option>
                            ${taskOptions}
                        </select>
                        <label for="status">Статус:</label>
                        <select style="width: 20%" id="status">
                            <option value="">Все</option>
                            <option value="EDITING">На редактировании</option>
                            <option value="READY">Готов к исполнению</option>
                            <option value="IN_PROGRESS">Выполняется</option>
                            <option value="COMPLETED">Завершён</option>
                            <option value="CLOSED">Закрыт</option>
                            <option value="CANCELED">Отменён</option>
                            <option value="ISSUE">Проблема на рейсе</option>
                        </select>
                        <label for="changedAt">Дата изменения:</label>
                        <input style="width: 20%" type="date" id="changedAt" />
                        <button class="btn-primary" id="applyTaskLogFilters">Применить</button>
                        <button class="btn-primary" id="clearTaskLogFilters">Сбросить</button>
                    </div>
                `;
                break;
        }
        columns.forEach(col => html += `<th>${col}</th>`);
        html += `</tr></thead><tbody>`;

        if (!data || data.length === 0) {
            html += `<tr><td colspan="${columns.length}" class="text-center">Данных пока нет</td></tr>`;
        } else {
            data.forEach((item, index) => {
                html += `<tr>`;
                switch (section) {
                    case "drivers":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${item.chatId || "Не авторизован(а) в чат-боте"}</td>
                            <td>${item.phoneNumber}</td>
                            <td>${item.schedule}</td>
                            <td>${item.token}</td>
                            <td>${driverStatusDescriptions[item.status] || item.status}</td>
                            <td>
                                <img 
                                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjI3NSAyNy41SDEyLjcyNUMxMi4xMzc3IDI3LjUgMTEuNjI5NSAyNy4wOTEzIDExLjUwMzggMjYuNTE3NUwxMC45OTUgMjQuMTYyNUMxMC4zMTYzIDIzLjg2NTEgOS42NzI4IDIzLjQ5MzMgOS4wNzYyNyAyMy4wNTM4TDYuNzgwMDIgMjMuNzg1QzYuMjIwMDIgMjMuOTYzNiA1LjYxMTI1IDIzLjcyNzkgNS4zMTc1MiAyMy4yMTg4TDMuMDM3NTIgMTkuMjhDMi43NDcgMTguNzcwNiAyLjg0NzA5IDE4LjEyODEgMy4yNzc3NyAxNy43MzEzTDUuMDYwMDIgMTYuMTA2M0M0Ljk3OTAyIDE1LjM3MDEgNC45NzkwMiAxNC42Mjc0IDUuMDYwMDIgMTMuODkxMkwzLjI3Nzc3IDEyLjI3QzIuODQ2NDYgMTEuODczIDIuNzQ2MzMgMTEuMjI5NyAzLjAzNzUyIDEwLjcyTDYuMzEyNTIgNi43Nzg3NUM2LjYwNjI1IDYuMjY5NjIgNy4yMTUwMiA2LjAzMzkyIDcuNzc1MDIgNi4yMTI1TDkuMDcxMjcgNi45NDM3NUM5LjM3NjM1IDYuNzE3NyA5LjY5Mzk0IDYuNTA5MDMgMTAuMDIyNSA2LjMxODc1QzEwLjMzNzkgNi4xNDA4NyAxMC42NjI2IDUuOTc5ODEgMTAuOTk1IDUuODM2MjVMMTEuNTA1IDMuNDgzNzVDMTEuNjMwMSAyLjkwOTk2IDEyLjEzNzggMi41MDA2MiAxMi43MjUgMi41SDE3LjI3NUMxNy44NjIzIDIuNTAwNjIgMTguMzY5OSAyLjkwOTk2IDE4LjQ5NSAzLjQ4Mzc1TDE5LjAxIDUuODM3NUMxOS4zNjEgNS45OTE5IDE5LjcwMjggNi4xNjYzNSAyMC4wMzM4IDYuMzZDMjAuMzQyNCA2LjUzODUyIDIwLjY0MDggNi43MzQyNCAyMC45Mjc1IDYuOTQ2MjVMMjMuMjI1IDYuMjE1QzIzLjc4NDYgNi4wMzcwOSAyNC4zOTI3IDYuMjczIDI0LjY4NjMgNi43ODEyNUwyNi45NjEzIDEwLjcyMjVDMjcuMjUxOCAxMS4yMzE5IDI3LjE1MTcgMTEuODc0NCAyNi43MiAxMi4yNzEyTDI0LjkzODggMTMuODk2MkMyNS4wMTg4IDE0LjYzMjQgMjUuMDE4OCAxNS4zNzUxIDI0LjkzODggMTYuMTExMkwyNi43MiAxNy43MzYyQzI3LjE1MTcgMTguMTMzMSAyNy4yNTE4IDE4Ljc3NTYgMjYuOTYxMyAxOS4yODVMMjQuNjg2MyAyMy4yMjYyQzI0LjM5MjcgMjMuNzM0OCAyMy43ODQ2IDIzLjk3MDQgMjMuMjI1IDIzLjc5MjVMMjAuOTI3NSAyMy4wNjEyQzIwLjYzNjggMjMuMjc1NCAyMC4zMzQ3IDIzLjQ3MzYgMjAuMDIyNSAyMy42NTVDMTkuNjk0OCAyMy44NDQ5IDE5LjM1NjggMjQuMDE2NCAxOS4wMSAyNC4xNjg4TDE4LjQ5NSAyNi41MTc1QzE4LjM2OTQgMjcuMDkwOCAxNy44NjE5IDI3LjQ5OTUgMTcuMjc1IDI3LjVaTTkuNTI1MDIgMjAuMjg2M0wxMC41NSAyMS4wMzYzQzEwLjc4MTEgMjEuMjA2NCAxMS4wMjE5IDIxLjM2MyAxMS4yNzEzIDIxLjUwNUMxMS41MDU5IDIxLjY0MDkgMTEuNzUyNSAyMS43NjQ0IDEyLjAwNSAyMS44NzVMMTMuMTYxMyAyMi4zODYyTDEzLjczMjUgMjVIMTYuMjdMMTYuODQxMyAyMi4zODVMMTguMDA3NSAyMS44NzM4QzE4LjUxNjYgMjEuNjQ5MiAxOS4wMDA5IDIxLjM3MDEgMTkuNDQ4OCAyMS4wNDEzTDIwLjQ3NSAyMC4yOTEzTDIzLjAyNjMgMjEuMTAzOEwyNC4yOTUgMTguOTA2MkwyMi4zMTYzIDE3LjEwMjVMMjIuNDU2MyAxNS44Mzc1QzIyLjUxNzggMTUuMjg0MiAyMi41MTc4IDE0LjcyNTggMjIuNDU2MyAxNC4xNzI1TDIyLjMxNjMgMTIuOTA3NUwyNC4yOTYzIDExLjFMMjMuMDI2MyA4LjkwMTI1TDIwLjQ3NSA5LjcxMzc1TDE5LjQ0ODggOC45NjM3NUMxOS4wMDA4IDguNjMzODkgMTguNTE2NiA4LjM1MjE5IDE4LjAwNzUgOC4xMjVMMTYuODQxMyA3LjYxMzc1TDE2LjI3IDVIMTMuNzMyNUwxMy4xNTg4IDcuNjE1TDExLjk5NSA4LjEyNUMxMS43NTIzIDguMjMzOCAxMS41MDU3IDguMzU2MDcgMTEuMjcxMyA4LjQ5MTI1QzExLjAyMzQgOC42MzI5MSAxMC43ODM5IDguNzg4NTggMTAuNTUzOCA4Ljk1NzVMOS41Mjc1MiA5LjcwNzVMNi45Nzc1MiA4Ljg5NUw1LjcwNjI3IDExLjFMNy42ODUwMiAxMi45MDEyTDcuNTQ1MDIgMTQuMTY3NUM3LjQ4MzUyIDE0LjcyMDggNy40ODM1MiAxNS4yNzkyIDcuNTQ1MDIgMTUuODMyNUw3LjY4NTAyIDE3LjA5NzVMNS43MDYyNyAxOC45MDEzTDYuOTc1MDIgMjEuMDk4N0w5LjUyNTAyIDIwLjI4NjNaTTE0Ljk5NSAyMEMxMi4yMzM2IDIwIDkuOTk1MDIgMTcuNzYxNCA5Ljk5NTAyIDE1QzkuOTk1MDIgMTIuMjM4NiAxMi4yMzM2IDEwIDE0Ljk5NSAxMEMxNy43NTY0IDEwIDE5Ljk5NSAxMi4yMzg2IDE5Ljk5NSAxNUMxOS45OTE2IDE3Ljc2IDE3Ljc1NSAxOS45OTY2IDE0Ljk5NSAyMFpNMTQuOTk1IDEyLjVDMTMuNjI5MyAxMi41MDE0IDEyLjUxNzQgMTMuNTk4NiAxMi40OTc4IDE0Ljk2NDJDMTIuNDc4MiAxNi4zMjk4IDEzLjU1ODIgMTcuNDU4NCAxNC45MjM0IDE3LjQ5ODlDMTYuMjg4NSAxNy41Mzk0IDE3LjQzMzYgMTYuNDc2OSAxNy40OTUgMTUuMTEyNVYxNS42MTI1VjE1QzE3LjQ5NSAxMy42MTkzIDE2LjM3NTcgMTIuNSAxNC45OTUgMTIuNVoiIGZpbGw9IiM2NzY3NjciLz4KPC9zdmc+"
                                    alt="Настройки" 
                                    style="width: 33px; cursor: pointer; vertical-align: middle;" 
                                    onclick="handleDriverEdit(${item.id})"
                                />
                            </td>
                        `;
                        break;
                    case "dispatchers":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${index + 1}</td>
                            <td>${item.username}</td>
                            <td>${item.fullName}</td>
                            <td>${item.password}</td>
                            <td>
                                ${item.role === "DISPATCHER" ? `
                                    <img 
                                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjI3NSAyNy41SDEyLjcyNUMxMi4xMzc3IDI3LjUgMTEuNjI5NSAyNy4wOTEzIDExLjUwMzggMjYuNTE3NUwxMC45OTUgMjQuMTYyNUMxMC4zMTYzIDIzLjg2NTEgOS42NzI4IDIzLjQ5MzMgOS4wNzYyNyAyMy4wNTM4TDYuNzgwMDIgMjMuNzg1QzYuMjIwMDIgMjMuOTYzNiA1LjYxMTI1IDIzLjcyNzkgNS4zMTc1MiAyMy4yMTg4TDMuMDM3NTIgMTkuMjhDMi43NDcgMTguNzcwNiAyLjg0NzA5IDE4LjEyODEgMy4yNzc3NyAxNy43MzEzTDUuMDYwMDIgMTYuMTA2M0M0Ljk3OTAyIDE1LjM3MDEgNC45NzkwMiAxNC42Mjc0IDUuMDYwMDIgMTMuODkxMkwzLjI3Nzc3IDEyLjI3QzIuODQ2NDYgMTEuODczIDIuNzQ2MzMgMTEuMjI5NyAzLjAzNzUyIDEwLjcyTDYuMzEyNTIgNi43Nzg3NUM2LjYwNjI1IDYuMjY5NjIgNy4yMTUwMiA2LjAzMzkyIDcuNzc1MDIgNi4yMTI1TDkuMDcxMjcgNi45NDM3NUM5LjM3NjM1IDYuNzE3NyA5LjY5Mzk0IDYuNTA5MDMgMTAuMDIyNSA2LjMxODc1QzEwLjMzNzkgNi4xNDA4NyAxMC42NjI2IDUuOTc5ODEgMTAuOTk1IDUuODM2MjVMMTEuNTA1IDMuNDgzNzVDMTEuNjMwMSAyLjkwOTk2IDEyLjEzNzggMi41MDA2MiAxMi43MjUgMi41SDE3LjI3NUMxNy44NjIzIDIuNTAwNjIgMTguMzY5OSAyLjkwOTk2IDE4LjQ5NSAzLjQ4Mzc1TDE5LjAxIDUuODM3NUMxOS4zNjEgNS45OTE5IDE5LjcwMjggNi4xNjYzNSAyMC4wMzM4IDYuMzZDMjAuMzQyNCA2LjUzODUyIDIwLjY0MDggNi43MzQyNCAyMC45Mjc1IDYuOTQ2MjVMMjMuMjI1IDYuMjE1QzIzLjc4NDYgNi4wMzcwOSAyNC4zOTI3IDYuMjczIDI0LjY4NjMgNi43ODEyNUwyNi45NjEzIDEwLjcyMjVDMjcuMjUxOCAxMS4yMzE5IDI3LjE1MTcgMTEuODc0NCAyNi43MiAxMi4yNzEyTDI0LjkzODggMTMuODk2MkMyNS4wMTg4IDE0LjYzMjQgMjUuMDE4OCAxNS4zNzUxIDI0LjkzODggMTYuMTExMkwyNi43MiAxNy43MzYyQzI3LjE1MTcgMTguMTMzMSAyNy4yNTE4IDE4Ljc3NTYgMjYuOTYxMyAxOS4yODVMMjQuNjg2MyAyMy4yMjYyQzI0LjM5MjcgMjMuNzM0OCAyMy43ODQ2IDIzLjk3MDQgMjMuMjI1IDIzLjc5MjVMMjAuOTI3NSAyMy4wNjEyQzIwLjYzNjggMjMuMjc1NCAyMC4zMzQ3IDIzLjQ3MzYgMjAuMDIyNSAyMy42NTVDMTkuNjk0OCAyMy44NDQ5IDE5LjM1NjggMjQuMDE2NCAxOS4wMSAyNC4xNjg4TDE4LjQ5NSAyNi41MTc1QzE4LjM2OTQgMjcuMDkwOCAxNy44NjE5IDI3LjQ5OTUgMTcuMjc1IDI3LjVaTTkuNTI1MDIgMjAuMjg2M0wxMC41NSAyMS4wMzYzQzEwLjc4MTEgMjEuMjA2NCAxMS4wMjE5IDIxLjM2MyAxMS4yNzEzIDIxLjUwNUMxMS41MDU5IDIxLjY0MDkgMTEuNzUyNSAyMS43NjQ0IDEyLjAwNSAyMS44NzVMMTMuMTYxMyAyMi4zODYyTDEzLjczMjUgMjVIMTYuMjdMMTYuODQxMyAyMi4zODVMMTguMDA3NSAyMS44NzM4QzE4LjUxNjYgMjEuNjQ5MiAxOS4wMDA5IDIxLjM3MDEgMTkuNDQ4OCAyMS4wNDEzTDIwLjQ3NSAyMC4yOTEzTDIzLjAyNjMgMjEuMTAzOEwyNC4yOTUgMTguOTA2MkwyMi4zMTYzIDE3LjEwMjVMMjIuNDU2MyAxNS44Mzc1QzIyLjUxNzggMTUuMjg0MiAyMi41MTc4IDE0LjcyNTggMjIuNDU2MyAxNC4xNzI1TDIyLjMxNjMgMTIuOTA3NUwyNC4yOTYzIDExLjFMMjMuMDI2MyA4LjkwMTI1TDIwLjQ3NSA5LjcxMzc1TDE5LjQ0ODggOC45NjM3NUMxOS4wMDA4IDguNjMzODkgMTguNTE2NiA4LjM1MjE5IDE4LjAwNzUgOC4xMjVMMTYuODQxMyA3LjYxMzc1TDE2LjI3IDVIMTMuNzMyNUwxMy4xNTg4IDcuNjE1TDExLjk5NSA4LjEyNUMxMS43NTIzIDguMjMzOCAxMS41MDU3IDguMzU2MDcgMTEuMjcxMyA4LjQ5MTI1QzExLjAyMzQgOC42MzI5MSAxMC43ODM5IDguNzg4NTggMTAuNTUzOCA4Ljk1NzVMOS41Mjc1MiA5LjcwNzVMNi45Nzc1MiA4Ljg5NUw1LjcwNjI3IDExLjFMNy42ODUwMiAxMi45MDEyTDcuNTQ1MDIgMTQuMTY3NUM3LjQ4MzUyIDE0LjcyMDggNy40ODM1MiAxNS4yNzkyIDcuNTQ1MDIgMTUuODMyNUw3LjY4NTAyIDE3LjA5NzVMNS43MDYyNyAxOC45MDEzTDYuOTc1MDIgMjEuMDk4N0w5LjUyNTAyIDIwLjI4NjNaTTE0Ljk5NSAyMEMxMi4yMzM2IDIwIDkuOTk1MDIgMTcuNzYxNCA5Ljk5NTAyIDE1QzkuOTk1MDIgMTIuMjM4NiAxMi4yMzM2IDEwIDE0Ljk5NSAxMEMxNy43NTY0IDEwIDE5Ljk5NSAxMi4yMzg2IDE5Ljk5NSAxNUMxOS45OTE2IDE3Ljc2IDE3Ljc1NSAxOS45OTY2IDE0Ljk5NSAyMFpNMTQuOTk1IDEyLjVDMTMuNjI5MyAxMi41MDE0IDEyLjUxNzQgMTMuNTk4NiAxMi40OTc4IDE0Ljk2NDJDMTIuNDc4MiAxNi4zMjk4IDEzLjU1ODIgMTcuNDU4NCAxNC45MjM0IDE3LjQ5ODlDMTYuMjg4NSAxNy41Mzk0IDE3LjQzMzYgMTYuNDc2OSAxNy40OTUgMTUuMTEyNVYxNS42MTI1VjE1QzE3LjQ5NSAxMy42MTkzIDE2LjM3NTcgMTIuNSAxNC45OTUgMTIuNVoiIGZpbGw9IiM2NzY3NjciLz4KPC9zdmc+"
                                    alt="Настройки" 
                                    style="width: 33px; cursor: pointer; vertical-align: middle;" 
                                    onclick="handleDispatcherEdit(${item.id})"
                                    />
                                ` : ""}
                            </td>
                        `;
                        break;
                    case "tasks":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${item.taskNumber}</td>
                            <td>${taskStatusDescriptions[item.status] || item.status}</td>
                            <td>${formatDateTime(item.createdAt)}</td>
                            <td>${formatDateTime(item.completedAt)}</td>
                            <td>${item.driver.name}</td>
                            <td>${item.dispatcher.fullName}</td>
                            <td>
                                ${item.status !== "EDITING" ? `
                                    <img 
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjciIHZpZXdCb3g9IjAgMCAyNSAyNyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMjA4MzEgMjEuMzc1VjI0Ljc1SDE5Ljc5MTZWMjEuMzc1IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOS43OTE2IDExLjI1VjcuODc1TDE1LjYyNSAyLjI1SDUuMjA4MzFWMTEuMjUiIHN0cm9rZT0iIzY3Njc2NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTE0LjU4MzMgMi4yNVY3Ljg3NUgxOS43OTE2IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMS44NzUgMTEuMjVIMy4xMjQ5OEMyLjU0OTY4IDExLjI1IDIuMDgzMzEgMTEuNzUzNyAyLjA4MzMxIDEyLjM3NVYyMC4yNUMyLjA4MzMxIDIwLjg3MTMgMi41NDk2OCAyMS4zNzUgMy4xMjQ5OCAyMS4zNzVIMjEuODc1QzIyLjQ1MDMgMjEuMzc1IDIyLjkxNjcgMjAuODcxMyAyMi45MTY3IDIwLjI1VjEyLjM3NUMyMi45MTY3IDExLjc1MzcgMjIuNDUwMyAxMS4yNSAyMS44NzUgMTEuMjVaIiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAuOTM3NSAxNC4wNjI1VjE4LjU2MjUiIHN0cm9rZT0iIzY3Njc2NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTUuMjA4MzEgMTQuMDYyNVYxOC41NjI1IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNi42NjY3IDE4LjU2MjVWMTQuMDYyNUgxOS4yNzA5IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNi42NjY3IDE2Ljg3NUgxOS4yNzA5IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik01LjIwODMxIDE0LjA2MjVINy4wMzEyM0M3Ljc1MDM0IDE0LjA2MjUgOC4zMzMzMSAxNC42OTIxIDguMzMzMzEgMTUuNDY4OEM4LjMzMzMxIDE2LjI0NTQgNy43NTAzNCAxNi44NzUgNy4wMzEyMyAxNi44NzVINS4yMDgzMSIgc3Ryb2tlPSIjNjc2NzY3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAuOTM3NSAxNC4wNjI1SDExLjk3OTJDMTMuMTI5NyAxNC4wNjI1IDE0LjA2MjUgMTUuMDY5OSAxNC4wNjI1IDE2LjMxMjVDMTQuMDYyNSAxNy41NTUxIDEzLjEyOTcgMTguNTYyNSAxMS45NzkyIDE4LjU2MjVIMTAuOTM3NSIgc3Ryb2tlPSIjNjc2NzY3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNOC4zMzMzMSA2Ljc1SDEwLjQxNjYiIHN0cm9rZT0iIzY3Njc2NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+" 
                                        alt="PDF" 
                                        style="width: 30px; cursor: pointer;" 
                                        onclick="generateRouteList(${item.id})"
                                    />
                                    <img 
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjciIGhlaWdodD0iMjciIHZpZXdCb3g9IjAgMCAyNyAyNyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuNSA4LjQzNzVWMy4zNzVDNC41IDIuNzU2NzggNS4wMDM2OCAyLjI1IDUuNjI1IDIuMjVIMjEuMzc1QzIxLjk5NjMgMi4yNSAyMi41IDIuNzU2NzggMjIuNSAzLjM3NVYyMy42MjVDMjIuNSAyNC4yNDMyIDIxLjk5NjMgMjQuNzUgMjEuMzc1IDI0Ljc1SDUuNjI1QzUuMDAzNjggMjQuNzUgNC41IDI0LjI0MzIgNC41IDIzLjYyNVYxOC41NjI1IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNy40Mzc1IDguNDM3NUgxOS4xMjUiIHN0cm9rZT0iIzY3Njc2NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTE1Ljc1IDEyLjkzNzVIMTkuMTI1IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNS43NSAxNy40Mzc1SDE5LjEyNSIgc3Ryb2tlPSIjNjc2NzY3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIuMzc1IDguNDM3NUgyLjI1VjE4LjU2MjVIMTIuMzc1VjguNDM3NVoiIHN0cm9rZT0iIzY3Njc2NyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTUuNjI1IDExLjgxMjVMOSAxNS4xODc1IiBzdHJva2U9IiM2NzY3NjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik05IDExLjgxMjVMNS42MjUgMTUuMTg3NSIgc3Ryb2tlPSIjNjc2NzY3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=" 
                                        alt="Excel" 
                                        style="width: 33px; cursor: pointer; vertical-align: middle;" 
                                        onclick="generateRouteListExcel(${item.id})"
                                    />
                                ` : ""}
                                <img
                                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjI3NSAyNy41SDEyLjcyNUMxMi4xMzc3IDI3LjUgMTEuNjI5NSAyNy4wOTEzIDExLjUwMzggMjYuNTE3NUwxMC45OTUgMjQuMTYyNUMxMC4zMTYzIDIzLjg2NTEgOS42NzI4IDIzLjQ5MzMgOS4wNzYyNyAyMy4wNTM4TDYuNzgwMDIgMjMuNzg1QzYuMjIwMDIgMjMuOTYzNiA1LjYxMTI1IDIzLjcyNzkgNS4zMTc1MiAyMy4yMTg4TDMuMDM3NTIgMTkuMjhDMi43NDcgMTguNzcwNiAyLjg0NzA5IDE4LjEyODEgMy4yNzc3NyAxNy43MzEzTDUuMDYwMDIgMTYuMTA2M0M0Ljk3OTAyIDE1LjM3MDEgNC45NzkwMiAxNC42Mjc0IDUuMDYwMDIgMTMuODkxMkwzLjI3Nzc3IDEyLjI3QzIuODQ2NDYgMTEuODczIDIuNzQ2MzMgMTEuMjI5NyAzLjAzNzUyIDEwLjcyTDYuMzEyNTIgNi43Nzg3NUM2LjYwNjI1IDYuMjY5NjIgNy4yMTUwMiA2LjAzMzkyIDcuNzc1MDIgNi4yMTI1TDkuMDcxMjcgNi45NDM3NUM5LjM3NjM1IDYuNzE3NyA5LjY5Mzk0IDYuNTA5MDMgMTAuMDIyNSA2LjMxODc1QzEwLjMzNzkgNi4xNDA4NyAxMC42NjI2IDUuOTc5ODEgMTAuOTk1IDUuODM2MjVMMTEuNTA1IDMuNDgzNzVDMTEuNjMwMSAyLjkwOTk2IDEyLjEzNzggMi41MDA2MiAxMi43MjUgMi41SDE3LjI3NUMxNy44NjIzIDIuNTAwNjIgMTguMzY5OSAyLjkwOTk2IDE4LjQ5NSAzLjQ4Mzc1TDE5LjAxIDUuODM3NUMxOS4zNjEgNS45OTE5IDE5LjcwMjggNi4xNjYzNSAyMC4wMzM4IDYuMzZDMjAuMzQyNCA2LjUzODUyIDIwLjY0MDggNi43MzQyNCAyMC45Mjc1IDYuOTQ2MjVMMjMuMjI1IDYuMjE1QzIzLjc4NDYgNi4wMzcwOSAyNC4zOTI3IDYuMjczIDI0LjY4NjMgNi43ODEyNUwyNi45NjEzIDEwLjcyMjVDMjcuMjUxOCAxMS4yMzE5IDI3LjE1MTcgMTEuODc0NCAyNi43MiAxMi4yNzEyTDI0LjkzODggMTMuODk2MkMyNS4wMTg4IDE0LjYzMjQgMjUuMDE4OCAxNS4zNzUxIDI0LjkzODggMTYuMTExMkwyNi43MiAxNy43MzYyQzI3LjE1MTcgMTguMTMzMSAyNy4yNTE4IDE4Ljc3NTYgMjYuOTYxMyAxOS4yODVMMjQuNjg2MyAyMy4yMjYyQzI0LjM5MjcgMjMuNzM0OCAyMy43ODQ2IDIzLjk3MDQgMjMuMjI1IDIzLjc5MjVMMjAuOTI3NSAyMy4wNjEyQzIwLjYzNjggMjMuMjc1NCAyMC4zMzQ3IDIzLjQ3MzYgMjAuMDIyNSAyMy42NTVDMTkuNjk0OCAyMy44NDQ5IDE5LjM1NjggMjQuMDE2NCAxOS4wMSAyNC4xNjg4TDE4LjQ5NSAyNi41MTc1QzE4LjM2OTQgMjcuMDkwOCAxNy44NjE5IDI3LjQ5OTUgMTcuMjc1IDI3LjVaTTkuNTI1MDIgMjAuMjg2M0wxMC41NSAyMS4wMzYzQzEwLjc4MTEgMjEuMjA2NCAxMS4wMjE5IDIxLjM2MyAxMS4yNzEzIDIxLjUwNUMxMS41MDU5IDIxLjY0MDkgMTEuNzUyNSAyMS43NjQ0IDEyLjAwNSAyMS44NzVMMTMuMTYxMyAyMi4zODYyTDEzLjczMjUgMjVIMTYuMjdMMTYuODQxMyAyMi4zODVMMTguMDA3NSAyMS44NzM4QzE4LjUxNjYgMjEuNjQ5MiAxOS4wMDA5IDIxLjM3MDEgMTkuNDQ4OCAyMS4wNDEzTDIwLjQ3NSAyMC4yOTEzTDIzLjAyNjMgMjEuMTAzOEwyNC4yOTUgMTguOTA2MkwyMi4zMTYzIDE3LjEwMjVMMjIuNDU2MyAxNS44Mzc1QzIyLjUxNzggMTUuMjg0MiAyMi41MTc4IDE0LjcyNTggMjIuNDU2MyAxNC4xNzI1TDIyLjMxNjMgMTIuOTA3NUwyNC4yOTYzIDExLjFMMjMuMDI2MyA4LjkwMTI1TDIwLjQ3NSA5LjcxMzc1TDE5LjQ0ODggOC45NjM3NUMxOS4wMDA4IDguNjMzODkgMTguNTE2NiA4LjM1MjE5IDE4LjAwNzUgOC4xMjVMMTYuODQxMyA3LjYxMzc1TDE2LjI3IDVIMTMuNzMyNUwxMy4xNTg4IDcuNjE1TDExLjk5NSA4LjEyNUMxMS43NTIzIDguMjMzOCAxMS41MDU3IDguMzU2MDcgMTEuMjcxMyA4LjQ5MTI1QzExLjAyMzQgOC42MzI5MSAxMC43ODM5IDguNzg4NTggMTAuNTUzOCA4Ljk1NzVMOS41Mjc1MiA5LjcwNzVMNi45Nzc1MiA4Ljg5NUw1LjcwNjI3IDExLjFMNy42ODUwMiAxMi45MDEyTDcuNTQ1MDIgMTQuMTY3NUM3LjQ4MzUyIDE0LjcyMDggNy40ODM1MiAxNS4yNzkyIDcuNTQ1MDIgMTUuODMyNUw3LjY4NTAyIDE3LjA5NzVMNS43MDYyNyAxOC45MDEzTDYuOTc1MDIgMjEuMDk4N0w5LjUyNTAyIDIwLjI4NjNaTTE0Ljk5NSAyMEMxMi4yMzM2IDIwIDkuOTk1MDIgMTcuNzYxNCA5Ljk5NTAyIDE1QzkuOTk1MDIgMTIuMjM4NiAxMi4yMzM2IDEwIDE0Ljk5NSAxMEMxNy43NTY0IDEwIDE5Ljk5NSAxMi4yMzg2IDE5Ljk5NSAxNUMxOS45OTE2IDE3Ljc2IDE3Ljc1NSAxOS45OTY2IDE0Ljk5NSAyMFpNMTQuOTk1IDEyLjVDMTMuNjI5MyAxMi41MDE0IDEyLjUxNzQgMTMuNTk4NiAxMi40OTc4IDE0Ljk2NDJDMTIuNDc4MiAxNi4zMjk4IDEzLjU1ODIgMTcuNDU4NCAxNC45MjM0IDE3LjQ5ODlDMTYuMjg4NSAxNy41Mzk0IDE3LjQzMzYgMTYuNDc2OSAxNy40OTUgMTUuMTEyNVYxNS42MTI1VjE1QzE3LjQ5NSAxMy42MTkzIDE2LjM3NTcgMTIuNSAxNC45OTUgMTIuNVoiIGZpbGw9IiM2NzY3NjciLz4KPC9zdmc+"
                                    alt="Настройки" 
                                    style="width: 33px; cursor: pointer; vertical-align: middle;" 
                                    onclick="window.location.href = 'routelist/' + [[${item.id}]]"
                                />
                            </td>
                        `;
                        break;
                    case "vehicles":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${index + 1}</td>
                            <td>${item.registrationNumber}</td>
                            <td>${item.model}</td>
                            <td>${item.maxLoad}</td>
                            <td>${vehicleStatusDescriptions[item.status] || item.status}</td>
                            <td>
                                <img
                                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjI3NSAyNy41SDEyLjcyNUMxMi4xMzc3IDI3LjUgMTEuNjI5NSAyNy4wOTEzIDExLjUwMzggMjYuNTE3NUwxMC45OTUgMjQuMTYyNUMxMC4zMTYzIDIzLjg2NTEgOS42NzI4IDIzLjQ5MzMgOS4wNzYyNyAyMy4wNTM4TDYuNzgwMDIgMjMuNzg1QzYuMjIwMDIgMjMuOTYzNiA1LjYxMTI1IDIzLjcyNzkgNS4zMTc1MiAyMy4yMTg4TDMuMDM3NTIgMTkuMjhDMi43NDcgMTguNzcwNiAyLjg0NzA5IDE4LjEyODEgMy4yNzc3NyAxNy43MzEzTDUuMDYwMDIgMTYuMTA2M0M0Ljk3OTAyIDE1LjM3MDEgNC45NzkwMiAxNC42Mjc0IDUuMDYwMDIgMTMuODkxMkwzLjI3Nzc3IDEyLjI3QzIuODQ2NDYgMTEuODczIDIuNzQ2MzMgMTEuMjI5NyAzLjAzNzUyIDEwLjcyTDYuMzEyNTIgNi43Nzg3NUM2LjYwNjI1IDYuMjY5NjIgNy4yMTUwMiA2LjAzMzkyIDcuNzc1MDIgNi4yMTI1TDkuMDcxMjcgNi45NDM3NUM5LjM3NjM1IDYuNzE3NyA5LjY5Mzk0IDYuNTA5MDMgMTAuMDIyNSA2LjMxODc1QzEwLjMzNzkgNi4xNDA4NyAxMC42NjI2IDUuOTc5ODEgMTAuOTk1IDUuODM2MjVMMTEuNTA1IDMuNDgzNzVDMTEuNjMwMSAyLjkwOTk2IDEyLjEzNzggMi41MDA2MiAxMi43MjUgMi41SDE3LjI3NUMxNy44NjIzIDIuNTAwNjIgMTguMzY5OSAyLjkwOTk2IDE4LjQ5NSAzLjQ4Mzc1TDE5LjAxIDUuODM3NUMxOS4zNjEgNS45OTE5IDE5LjcwMjggNi4xNjYzNSAyMC4wMzM4IDYuMzZDMjAuMzQyNCA2LjUzODUyIDIwLjY0MDggNi43MzQyNCAyMC45Mjc1IDYuOTQ2MjVMMjMuMjI1IDYuMjE1QzIzLjc4NDYgNi4wMzcwOSAyNC4zOTI3IDYuMjczIDI0LjY4NjMgNi43ODEyNUwyNi45NjEzIDEwLjcyMjVDMjcuMjUxOCAxMS4yMzE5IDI3LjE1MTcgMTEuODc0NCAyNi43MiAxMi4yNzEyTDI0LjkzODggMTMuODk2MkMyNS4wMTg4IDE0LjYzMjQgMjUuMDE4OCAxNS4zNzUxIDI0LjkzODggMTYuMTExMkwyNi43MiAxNy43MzYyQzI3LjE1MTcgMTguMTMzMSAyNy4yNTE4IDE4Ljc3NTYgMjYuOTYxMyAxOS4yODVMMjQuNjg2MyAyMy4yMjYyQzI0LjM5MjcgMjMuNzM0OCAyMy43ODQ2IDIzLjk3MDQgMjMuMjI1IDIzLjc5MjVMMjAuOTI3NSAyMy4wNjEyQzIwLjYzNjggMjMuMjc1NCAyMC4zMzQ3IDIzLjQ3MzYgMjAuMDIyNSAyMy42NTVDMTkuNjk0OCAyMy44NDQ5IDE5LjM1NjggMjQuMDE2NCAxOS4wMSAyNC4xNjg4TDE4LjQ5NSAyNi41MTc1QzE4LjM2OTQgMjcuMDkwOCAxNy44NjE5IDI3LjQ5OTUgMTcuMjc1IDI3LjVaTTkuNTI1MDIgMjAuMjg2M0wxMC41NSAyMS4wMzYzQzEwLjc4MTEgMjEuMjA2NCAxMS4wMjE5IDIxLjM2MyAxMS4yNzEzIDIxLjUwNUMxMS41MDU5IDIxLjY0MDkgMTEuNzUyNSAyMS43NjQ0IDEyLjAwNSAyMS44NzVMMTMuMTYxMyAyMi4zODYyTDEzLjczMjUgMjVIMTYuMjdMMTYuODQxMyAyMi4zODVMMTguMDA3NSAyMS44NzM4QzE4LjUxNjYgMjEuNjQ5MiAxOS4wMDA5IDIxLjM3MDEgMTkuNDQ4OCAyMS4wNDEzTDIwLjQ3NSAyMC4yOTEzTDIzLjAyNjMgMjEuMTAzOEwyNC4yOTUgMTguOTA2MkwyMi4zMTYzIDE3LjEwMjVMMjIuNDU2MyAxNS44Mzc1QzIyLjUxNzggMTUuMjg0MiAyMi41MTc4IDE0LjcyNTggMjIuNDU2MyAxNC4xNzI1TDIyLjMxNjMgMTIuOTA3NUwyNC4yOTYzIDExLjFMMjMuMDI2MyA4LjkwMTI1TDIwLjQ3NSA5LjcxMzc1TDE5LjQ0ODggOC45NjM3NUMxOS4wMDA4IDguNjMzODkgMTguNTE2NiA4LjM1MjE5IDE4LjAwNzUgOC4xMjVMMTYuODQxMyA3LjYxMzc1TDE2LjI3IDVIMTMuNzMyNUwxMy4xNTg4IDcuNjE1TDExLjk5NSA4LjEyNUMxMS43NTIzIDguMjMzOCAxMS41MDU3IDguMzU2MDcgMTEuMjcxMyA4LjQ5MTI1QzExLjAyMzQgOC42MzI5MSAxMC43ODM5IDguNzg4NTggMTAuNTUzOCA4Ljk1NzVMOS41Mjc1MiA5LjcwNzVMNi45Nzc1MiA4Ljg5NUw1LjcwNjI3IDExLjFMNy42ODUwMiAxMi45MDEyTDcuNTQ1MDIgMTQuMTY3NUM3LjQ4MzUyIDE0LjcyMDggNy40ODM1MiAxNS4yNzkyIDcuNTQ1MDIgMTUuODMyNUw3LjY4NTAyIDE3LjA5NzVMNS43MDYyNyAxOC45MDEzTDYuOTc1MDIgMjEuMDk4N0w5LjUyNTAyIDIwLjI4NjNaTTE0Ljk5NSAyMEMxMi4yMzM2IDIwIDkuOTk1MDIgMTcuNzYxNCA5Ljk5NTAyIDE1QzkuOTk1MDIgMTIuMjM4NiAxMi4yMzM2IDEwIDE0Ljk5NSAxMEMxNy43NTY0IDEwIDE5Ljk5NSAxMi4yMzg2IDE5Ljk5NSAxNUMxOS45OTE2IDE3Ljc2IDE3Ljc1NSAxOS45OTY2IDE0Ljk5NSAyMFpNMTQuOTk1IDEyLjVDMTMuNjI5MyAxMi41MDE0IDEyLjUxNzQgMTMuNTk4NiAxMi40OTc4IDE0Ljk2NDJDMTIuNDc4MiAxNi4zMjk4IDEzLjU1ODIgMTcuNDU4NCAxNC45MjM0IDE3LjQ5ODlDMTYuMjg4NSAxNy41Mzk0IDE3LjQzMzYgMTYuNDc2OSAxNy40OTUgMTUuMTEyNVYxNS42MTI1VjE1QzE3LjQ5NSAxMy42MTkzIDE2LjM3NTcgMTIuNSAxNC45OTUgMTIuNVoiIGZpbGw9IiM2NzY3NjciLz4KPC9zdmc+"
                                    alt="Настройки" 
                                    style="width: 33px; cursor: pointer; vertical-align: middle;" 
                                    onclick="handleVehicleEdit(${item.id})"
                                />
                            </td>
                        `;
                        break;
                    case "clients":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${index + 1}</td>
                            <td>${item.fullName}</td>
                            <td>${item.phoneNumber}</td>
                            <td>${item.email}</td>
                            <td>${item.address}</td>
                            <td>
                                <img 
                                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjI3NSAyNy41SDEyLjcyNUMxMi4xMzc3IDI3LjUgMTEuNjI5NSAyNy4wOTEzIDExLjUwMzggMjYuNTE3NUwxMC45OTUgMjQuMTYyNUMxMC4zMTYzIDIzLjg2NTEgOS42NzI4IDIzLjQ5MzMgOS4wNzYyNyAyMy4wNTM4TDYuNzgwMDIgMjMuNzg1QzYuMjIwMDIgMjMuOTYzNiA1LjYxMTI1IDIzLjcyNzkgNS4zMTc1MiAyMy4yMTg4TDMuMDM3NTIgMTkuMjhDMi43NDcgMTguNzcwNiAyLjg0NzA5IDE4LjEyODEgMy4yNzc3NyAxNy43MzEzTDUuMDYwMDIgMTYuMTA2M0M0Ljk3OTAyIDE1LjM3MDEgNC45NzkwMiAxNC42Mjc0IDUuMDYwMDIgMTMuODkxMkwzLjI3Nzc3IDEyLjI3QzIuODQ2NDYgMTEuODczIDIuNzQ2MzMgMTEuMjI5NyAzLjAzNzUyIDEwLjcyTDYuMzEyNTIgNi43Nzg3NUM2LjYwNjI1IDYuMjY5NjIgNy4yMTUwMiA2LjAzMzkyIDcuNzc1MDIgNi4yMTI1TDkuMDcxMjcgNi45NDM3NUM5LjM3NjM1IDYuNzE3NyA5LjY5Mzk0IDYuNTA5MDMgMTAuMDIyNSA2LjMxODc1QzEwLjMzNzkgNi4xNDA4NyAxMC42NjI2IDUuOTc5ODEgMTAuOTk1IDUuODM2MjVMMTEuNTA1IDMuNDgzNzVDMTEuNjMwMSAyLjkwOTk2IDEyLjEzNzggMi41MDA2MiAxMi43MjUgMi41SDE3LjI3NUMxNy44NjIzIDIuNTAwNjIgMTguMzY5OSAyLjkwOTk2IDE4LjQ5NSAzLjQ4Mzc1TDE5LjAxIDUuODM3NUMxOS4zNjEgNS45OTE5IDE5LjcwMjggNi4xNjYzNSAyMC4wMzM4IDYuMzZDMjAuMzQyNCA2LjUzODUyIDIwLjY0MDggNi43MzQyNCAyMC45Mjc1IDYuOTQ2MjVMMjMuMjI1IDYuMjE1QzIzLjc4NDYgNi4wMzcwOSAyNC4zOTI3IDYuMjczIDI0LjY4NjMgNi43ODEyNUwyNi45NjEzIDEwLjcyMjVDMjcuMjUxOCAxMS4yMzE5IDI3LjE1MTcgMTEuODc0NCAyNi43MiAxMi4yNzEyTDI0LjkzODggMTMuODk2MkMyNS4wMTg4IDE0LjYzMjQgMjUuMDE4OCAxNS4zNzUxIDI0LjkzODggMTYuMTExMkwyNi43MiAxNy43MzYyQzI3LjE1MTcgMTguMTMzMSAyNy4yNTE4IDE4Ljc3NTYgMjYuOTYxMyAxOS4yODVMMjQuNjg2MyAyMy4yMjYyQzI0LjM5MjcgMjMuNzM0OCAyMy43ODQ2IDIzLjk3MDQgMjMuMjI1IDIzLjc5MjVMMjAuOTI3NSAyMy4wNjEyQzIwLjYzNjggMjMuMjc1NCAyMC4zMzQ3IDIzLjQ3MzYgMjAuMDIyNSAyMy42NTVDMTkuNjk0OCAyMy44NDQ5IDE5LjM1NjggMjQuMDE2NCAxOS4wMSAyNC4xNjg4TDE4LjQ5NSAyNi41MTc1QzE4LjM2OTQgMjcuMDkwOCAxNy44NjE5IDI3LjQ5OTUgMTcuMjc1IDI3LjVaTTkuNTI1MDIgMjAuMjg2M0wxMC41NSAyMS4wMzYzQzEwLjc4MTEgMjEuMjA2NCAxMS4wMjE5IDIxLjM2MyAxMS4yNzEzIDIxLjUwNUMxMS41MDU5IDIxLjY0MDkgMTEuNzUyNSAyMS43NjQ0IDEyLjAwNSAyMS44NzVMMTMuMTYxMyAyMi4zODYyTDEzLjczMjUgMjVIMTYuMjdMMTYuODQxMyAyMi4zODVMMTguMDA3NSAyMS44NzM4QzE4LjUxNjYgMjEuNjQ5MiAxOS4wMDA5IDIxLjM3MDEgMTkuNDQ4OCAyMS4wNDEzTDIwLjQ3NSAyMC4yOTEzTDIzLjAyNjMgMjEuMTAzOEwyNC4yOTUgMTguOTA2MkwyMi4zMTYzIDE3LjEwMjVMMjIuNDU2MyAxNS44Mzc1QzIyLjUxNzggMTUuMjg0MiAyMi41MTc4IDE0LjcyNTggMjIuNDU2MyAxNC4xNzI1TDIyLjMxNjMgMTIuOTA3NUwyNC4yOTYzIDExLjFMMjMuMDI2MyA4LjkwMTI1TDIwLjQ3NSA5LjcxMzc1TDE5LjQ0ODggOC45NjM3NUMxOS4wMDA4IDguNjMzODkgMTguNTE2NiA4LjM1MjE5IDE4LjAwNzUgOC4xMjVMMTYuODQxMyA3LjYxMzc1TDE2LjI3IDVIMTMuNzMyNUwxMy4xNTg4IDcuNjE1TDExLjk5NSA4LjEyNUMxMS43NTIzIDguMjMzOCAxMS41MDU3IDguMzU2MDcgMTEuMjcxMyA4LjQ5MTI1QzExLjAyMzQgOC42MzI5MSAxMC43ODM5IDguNzg4NTggMTAuNTUzOCA4Ljk1NzVMOS41Mjc1MiA5LjcwNzVMNi45Nzc1MiA4Ljg5NUw1LjcwNjI3IDExLjFMNy42ODUwMiAxMi45MDEyTDcuNTQ1MDIgMTQuMTY3NUM3LjQ4MzUyIDE0LjcyMDggNy40ODM1MiAxNS4yNzkyIDcuNTQ1MDIgMTUuODMyNUw3LjY4NTAyIDE3LjA5NzVMNS43MDYyNyAxOC45MDEzTDYuOTc1MDIgMjEuMDk4N0w5LjUyNTAyIDIwLjI4NjNaTTE0Ljk5NSAyMEMxMi4yMzM2IDIwIDkuOTk1MDIgMTcuNzYxNCA5Ljk5NTAyIDE1QzkuOTk1MDIgMTIuMjM4NiAxMi4yMzM2IDEwIDE0Ljk5NSAxMEMxNy43NTY0IDEwIDE5Ljk5NSAxMi4yMzg2IDE5Ljk5NSAxNUMxOS45OTE2IDE3Ljc2IDE3Ljc1NSAxOS45OTY2IDE0Ljk5NSAyMFpNMTQuOTk1IDEyLjVDMTMuNjI5MyAxMi41MDE0IDEyLjUxNzQgMTMuNTk4NiAxMi40OTc4IDE0Ljk2NDJDMTIuNDc4MiAxNi4zMjk4IDEzLjU1ODIgMTcuNDU4NCAxNC45MjM0IDE3LjQ5ODlDMTYuMjg4NSAxNy41Mzk0IDE3LjQzMzYgMTYuNDc2OSAxNy40OTUgMTUuMTEyNVYxNS42MTI1VjE1QzE3LjQ5NSAxMy42MTkzIDE2LjM3NTcgMTIuNSAxNC45OTUgMTIuNVoiIGZpbGw9IiM2NzY3NjciLz4KPC9zdmc+"
                                    alt="Настройки" 
                                    style="width: 33px; cursor: pointer; vertical-align: middle;" 
                                    onclick="handleClientEdit(${item.id})"
                                />
                            </td>
                        `;
                        break;
                    case "vehicleLog":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${index + 1}</td>
                            <td>${item.vehicle}</td>
                            <td>${item.driver}</td>
                            <td>${vehicleStatusDescriptions[item.status] || item.status}</td>
                            <td>${formatDateTime(item.statusChangedAt)}</td>
                        `;
                        break;
                    case "routeLog":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${item.task.taskNumber}</td>
                            <td>${taskStatusDescriptions[item.status] || item.status}</td>
                            <td>${formatDateTime(item.statusChangedAt)}</td>
                        `;
                        break;
                    default:
                        html += `<td colspan="${columns.length}">Нет данных для отображения</td>`;
                }
                html += `</tr>`;
            });
        }
        html += `</tbody></table></div>`;
        mainContent.innerHTML = html;

        // Attach event listeners for filter buttons
        if (section === "tasks") {
            document.querySelector("#applyTaskFilters").addEventListener("click", applyTaskFilters);
            document.querySelector("#clearTaskFilters").addEventListener("click", clearTaskFilters);
        } else if (section === "vehicleLog") {
            document.querySelector("#applyVehicleLogFilters").addEventListener("click", applyVehicleLogFilters);
            document.querySelector("#clearVehicleLogFilters").addEventListener("click", clearVehicleLogFilters);
        } else if (section === "routeLog") {
            document.querySelector("#applyTaskLogFilters").addEventListener("click", applyTaskLogFilters);
            document.querySelector("#clearTaskLogFilters").addEventListener("click", clearTaskLogFilters);
        }
    };

    const applyTaskFilters = () => {
        const status = document.querySelector("#status").value;
        const driverId = document.querySelector("#driverId").value;
        const dispatcherId = document.querySelector("#dispatcherId").value;
        const createdFrom = document.querySelector("#createdFrom").value;
        const completedFrom = document.querySelector("#completedFrom").value;

        let filteredData = taskData.filter(item => {
            let pass = true;

            if (status && item.status !== status) pass = false;
            if (driverId && item.driver.name !== driverId) pass = false;
            if (dispatcherId && item.dispatcher.fullName !== dispatcherId) pass = false;
            if (createdFrom) {
                const createdDate = new Date(item.createdAt);
                const filterDate = new Date(createdFrom);
                if (createdDate < filterDate) pass = false;
            }
            if (completedFrom && item.completedAt) {
                const completedDate = new Date(item.completedAt);
                const filterDate = new Date(completedFrom);
                if (completedDate < filterDate) pass = false;
            }
            return pass;
        });

        renderTable("tasks", filteredData);
    };

    const clearTaskFilters = () => {
        document.querySelector("#status").value = "";
        document.querySelector("#driverId").value = "";
        document.querySelector("#dispatcherId").value = "";
        document.querySelector("#createdFrom").value = "";
        document.querySelector("#completedFrom").value = "";
        renderTable("tasks", taskData);
    };

    const applyVehicleLogFilters = () => {
        const status = document.querySelector("#status").value;
        const driverId = document.querySelector("#driverId").value;
        const vehicleId = document.querySelector("#vehicleId").value;
        const changedAt = document.querySelector("#changedAt").value;

        let filteredData = vehicleLogData.filter(item => {
            let pass = true;

            if (status && item.status !== status) pass = false;
            if (driverId && item.driver !== driverId) pass = false;
            if (vehicleId && item.vehicle !== vehicleId) pass = false;
            if (changedAt) {
                const changeDate = new Date(item.statusChangedAt);
                const filterDate = new Date(changedAt);
                if (changeDate < filterDate) pass = false;
            }
            return pass;
        });

        renderTable("vehicleLog", filteredData);
    };

    const clearVehicleLogFilters = () => {
        document.querySelector("#status").value = "";
        document.querySelector("#driverId").value = "";
        document.querySelector("#vehicleId").value = "";
        document.querySelector("#changedAt").value = "";
        renderTable("vehicleLog", vehicleLogData);
    };

    const applyTaskLogFilters = () => {
        const taskId = document.querySelector("#taskId").value;
        const status = document.querySelector("#status").value;
        const changedAt = document.querySelector("#changedAt").value;

        let filteredData = routeLogData.filter(item => {
            let pass = true;

            if (taskId && item.task.taskNumber !== taskId) pass = false;
            if (status && item.status !== status) pass = false;
            if (changedAt) {
                const changeDate = new Date(item.statusChangedAt);
                const filterDate = new Date(changedAt);
                if (changeDate < filterDate) pass = false;
            }
            return pass;
        });

        renderTable("routeLog", filteredData);
    };

    const clearTaskLogFilters = () => {
        document.querySelector("#taskId").value = "";
        document.querySelector("#status").value = "";
        document.querySelector("#changedAt").value = "";
        renderTable("routeLog", routeLogData);
    };

    const loadData = async (section) => {
        try {
            if (['driverReports', 'vehicleReports'].includes(section)) {
                await renderChart(section);
            } else if (['routeReports'].includes(section)){
                await renderStatusCountChart();
            }
            else {
                const response = await fetch(endpoints[section]);
                const data = await response.json();
                if (section === "tasks") taskData = data;
                else if (section === "vehicleLog") vehicleLogData = data;
                else if (section === "routeLog") routeLogData = data;
                renderTable(section, data);
            }
        } catch (error) {
            console.error(`Error loading ${section} data:`, error);
            mainContent.innerHTML = `<div class="alert alert-danger">Ошибка загрузки данных для раздела ${section}</div>`;
        }
    };

    sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            if (item.hasAttribute("data-toggle")) {
                return;
            }
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const section = item.getAttribute("data-section");
            if (section) {
                window.history.pushState({}, "", `?section=${section}`);
                loadData(section);
            }
        });
    });


    if (section) {
        loadData(section);
    } else {
        loadData('tasks');
    }
});

document.querySelectorAll('.collapsible').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-toggle');
        const submenu = document.querySelector(`.submenu[data-target="${target}"]`);
        submenu.classList.toggle('show');
        item.classList.toggle('open');
    });
});

async function getDriverOptions() {
    try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('Ошибка при загрузке водителей');
        const drivers = await res.json();
        return drivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    } catch (e) {
        console.error(e);
        return '';
    }
}

async function getDispatcherOptions() {
    try {
        const res = await fetch('/api/dispatchers');
        if (!res.ok) throw new Error('Ошибка при загрузке диспетчеров');
        const dispatchers = await res.json();
        return dispatchers.map(d => `<option value="${d.fullName}">${d.fullName}</option>`).join('');
    } catch (e) {
        console.error(e);
        return '';
    }
}

async function getVehicleOptions() {
    try {
        const res = await fetch('/api/vehicles');
        if (!res.ok) throw new Error('Ошибка при загрузке транспорта');
        const vehicles = await res.json();
        return vehicles
            .map(v => `<option value="${v.registrationNumber}">${v.registrationNumber}</option>`)
            .join('');
    } catch (e) {
        console.error(e);
        return '';
    }
}

async function getTaskOptions() {
    try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('Ошибка при загрузке транспорта');
        const tasks = await res.json();
        return tasks
            .map(t => `<option value="${t.taskNumber}">${t.taskNumber}</option>`)
            .join('');
    } catch (e) {
        console.error(e);
        return '';
    }
}

const formatDateTime = (dateTime) => {
    if (!dateTime) return "Не завершено";
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}.${month}.${year}`;
};