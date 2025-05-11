
document.addEventListener("DOMContentLoaded", async () => {
    const mainContent = document.querySelector(".main-content");
    const sidebarItems = document.querySelectorAll(".sidebar-item, .sidebar-subitem");
    const section = new URLSearchParams(window.location.search).get('section');

    const endpoints = {
        tasks: "/api/tasks",
        drivers: "/api/drivers",
        vehicles: "/api/vehicles",
        clients: "/api/clients",
        dispatchers: "/api/dispatchers",
        driverReports: "api/",
        routeReports: "api/",
        vehicleReports: "api/",
        vehicleLog: "api/vehicle-logs",
        routeLog: "api/task-logs"
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
                html += '<div> <button class="btn-primary" onClick="handleAddDriver()" style="margin-bottom: 10px;">Добавить водителя</button></div>'
                break;
            case "dispatchers":
                html += '<div> <button class="btn-primary"  onClick="handleAddDispatcher()" style="margin-bottom: 10px;">Добавить диспетчера</button></div>'
                break;
            case "vehicles":
                html += '<div> <button class="btn-primary"  onClick="handleAddVehicle()" style="margin-bottom: 10px;">Добавить транспортное средство</button></div>'
                break;
            case "clients":
                html += '<div> <button class="btn-primary"  onClick="handleAddClient()" style="margin-bottom: 10px;">Добавить клиента</button></div>'
                break;
            case "tasks":
                html += '<div> <button class="btn-primary"  onClick="handleAddTask()" style="margin-bottom: 10px;">Создать маршрутный лист</button></div>' +
                    '<div id="filters" class="filter-section">\n                                <label for="status">Статус:</label>\n                                <select id="status">\n                                    <option value="">Все</option>\n                                    <option value="EDITING">На редактировании</option>\n                                    <option value="READY">Готов к исполнению</option>\n                                    <option value="IN_PROGRESS">Выполняется</option>\n                                    <option value="COMPLETED">Завершён</option>\n                                    <option value="CLOSED">Закрыт</option>\n                                    <option value="CANCELED">Отменён</option>\n                                    <option value="ISSUE">Проблема на рейсе</option>\n                                </select>\n                            \n                                <label for="driverId">Водитель:</label>\n                                <select id="driverId">\n                                    <option value="">Все</option>\n                                </select>\n                            \n                                <label for="dispatcherId">Диспетчер:</label>\n                                <select id="dispatcherId">\n                                    <option value="">Все</option>\n                                </select>\n                            \n                                <label for="createdFrom">Дата создания с:</label>\n                                <input type="date" id="createdFrom" />\n                            \n                                <label for="createdTo">Дата создания по:</label>\n                                <input type="date" id="createdTo" />\n                            \n                                <label for="completedFrom">Дата завершения с:</label>\n                                <input type="date" id="completedFrom" />\n                            \n                                <label for="completedTo">Дата завершения по:</label>\n                                <input type="date" id="completedTo" />\n                            \n                                <button id="applyTaskFilters">Применить</button>\n                            </div>'
                break;
            case "vehicleLog":
                html += '<div id="filters" class="filter-section">\n                                <label for="status">Статус:</label>\n                                <select id="status">\n                                    <option value="">Все</option>\n                                    <option value="MAINTENANCE_REQUIRED">Требуется ТО</option>\n                                    <option value="UNDER_MAINTENANCE">Проходит ТО</option>\n                                    <option value="AVAILABLE">Свободно</option>\n                                    <option value="ON_ROUTE">В рейсе</option>\n                                </select>\n                                \n                                <label for="driverId">Водитель:</label>\n                                <select id="driverId">\n                                    <option value="">Все</option>\n                                </select>\n                            \n                                <label for="vehicleId">Транспортное средство:</label>\n                                <select id="vehicleId">\n                                    <option value="">Все</option>\n                                </select>\n                            \n                                <label for="changedAt">Дата изменения:</label>\n                                <input type="date" id="changedAt" />\n                            \n                                <button id="applyVehicleLogFilters">Применить</button>\n                            </div>'
                break;
            case "routeLog":
                html += '<div id="filters" class="filter-section">\n                                <label for="taskId">Номер документа:</label>\n                                <select id="taskId">\n                                    <option value="">Все</option>\n                                </select>\n                            \n                                <label for="status">Статус:</label>\n                                <select id="status">\n                                    <option value="">Все</option>\n                                    <option value="EDITING">На редактировании</option>\n                                    <option value="READY">Готов к исполнению</option>\n                                    <option value="IN_PROGRESS">Выполняется</option>\n                                    <option value="COMPLETED">Завершён</option>\n                                    <option value="CLOSED">Закрыт</option>\n                                    <option value="CANCELED">Отменён</option>\n                                    <option value="ISSUE">Проблема на рейсе</option>\n                                </select>\n                            \n                                <label for="changedAt">Дата изменения:</label>\n                                <input type="date" id="changedAt" />\n                            \n                                <button id="applyVehicleLogFilters">Применить</button>\n                            </div>'
                break;
        }
        columns.forEach(col => html += `<th>${col}</th>`);
        html += `</tr></thead><tbody>`;

        if (!data || data.length === 0) {
            html += `<tr><td colspan="${columns.length}" class="text-center">Данных пока нет</td></tr>`;
        } else {
            data.forEach(item => {
                html += `<tr>`;
                switch (section) {
                    case "drivers":
                        html += `
                            <td>${item.id}</td>
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
                            <td>${item.id}</td>
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
                            <td>${item.createdAt}</td>
                            <td>${item.completedAt || "Не завершено"}</td>
                            <td>${item.driver.name}</td>
                            <td>${item.dispatcher.fullName}</td>
                            <td>
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
                            <td>${item.id}</td>
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
                            <td>${item.id}</td>
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
                            <td>${item.id}</td>
                            <td>${item.vehicle}</td>
                            <td>${item.driver}</td>
                            <td>${vehicleStatusDescriptions[item.status] || item.status}</td>
                            <td>${item.statusChangedAt}</td>
                        `;
                        break;
                    case "routeLog":
                        html += `
                            <td hidden>${item.id}</td>
                            <td>${item.task.id}</td>
                            <td>"●" + ${taskStatusDescriptions[item.status] || item.status}</td>
                            <td>${item.statusChangedAt}</td>
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
    };

    const loadData = async (section) => {
        try {
            const response = await fetch(endpoints[section]);
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке данных: ${response.statusText}`);
            }
            const data = await response.json();
            renderTable(section, data);
        } catch (error) {
            mainContent.innerHTML = `<div class="alert alert-danger">Не удалось загрузить данные: ${error.message}</div>`;
        }
    };

    const loadSection = (section) => {
        fetch(endpoints[section])
            .then(res => res.json())
            .then(data => renderTable(section, data))
            .catch(err => {
                console.error("Ошибка при загрузке:", err);
                mainContent.innerHTML = `<div class="alert alert-danger mt-4">Ошибка загрузки данных для ${section}</div>`;
            });
    };

    sidebarItems.forEach(item => {
        if (item.classList.contains("collapsible")) return;

        item.addEventListener("click", () => {
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            const section = item.getAttribute("data-section");
            loadSection(section);
        });
    });

    if (section) {
        try {
            await loadData(section);
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    } else {
        loadSection("tasks");
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

document.querySelectorAll('.sidebar-subitem').forEach(subitem => {
    subitem.addEventListener("click", () => {
        sidebarItems.forEach(i => i.classList.remove("active"));
        subitem.classList.add("active");
        const section = subitem.getAttribute("data-section");
        loadSection(section);
    });
});