document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.querySelector(".main-content");
    const sidebarItems = document.querySelectorAll(".sidebar-item, .sidebar-subitem");

    const endpoints = {
        tasks: "/api/tasks",
        drivers: "/api/drivers",
        vehicles: "/api/vehicles",
        clients: "/api/clients",
        dispatchers: "/api/dispatchers",
        driverReports: "api/",
        routeReports: "api/",
        vehicleLog:"api/vehicle-logs",
        routeLog:"api/task-logs"
    };

    const driverStatusDescriptions = {
        "OFF_DUTY": "Не работает",
        "AVAILABLE": "Свободен",
        "ON_ROUTE": "В рейсе"
    };

    const subtaskStatusDescriptions = {
        "PENDING": "В ожидании",
        "IN_PROGRESS": "Выполняется",
        "COMPLETED": "Выполнена",
        "CANCELED": "Отменена"
    };

    const vehicleStatusDescriptions = {
        "MAINTENANCE_REQUIRED": "Требуется ТО",
        "UNDER_MAINTENANCE": "Проходит ТО",
        "AVAILABLE": "Свободно",
        "ON_ROUTE": "В рейсе"
    };

    const taskStatusDescriptions = {
        "EDITING": "На редактировании",
        "READY": "Готов к исполнению",
        "IN_PROGRESS": "Выполняется",
        "COMPLETED": "Завершён",
        "CLOSED": "Закрыт",
        "CANCELED": "Отменён",
        "ISSUE": "Проблема на рейсе"
    };

    const columnNames = {
        tasks: ["Номер", "Статус", "Дата создания", "Дата выполнения", "Водитель", "Действия"],
        drivers: ["Номер", "ФИО", "Telegram ID", "Номер телефона", "График работы", "Статус", "Действия"],
        vehicles: ["Номер", "Регистрационный номер", "Модель", "Максимально перевозимый груз", "Статус", "Действия"],
        dispatchers: ["Номер", "Логин", "ФИО", "Пароль", "Действия"],
        clients: ["Номер","Юр.лицо","Номер телефона", "Электронная почта", "Адрес", "Действия"],
        vehicleLog: ["Номер","Транспортное средство","Водитель","Статус","Дата изменения статуса"],
        routeLog: ["Номер маршрутного листа", "Статус", "Дата изменения статуса"]
    };

    const renderTable = (section, data) => {
        const columns = columnNames[section];
        let html = `<table class="table table-bordered table-hover mt-3"><thead><tr>`;
        columns.forEach(col => html += `<th>${col}</th>`);
        html += `</tr></thead><tbody>`;

        data.forEach(item => {
            html += `<tr>`;
            switch (section) {
                case "drivers":
                    html += `
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.chatId}</td>
                        <td>${item.phoneNumber}</td>
                        <td>${item.schedule}</td>
                        <td>${driverStatusDescriptions[item.status] || item.status}</td>
                        <td>
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/126/126472.png" 
                                alt="Настройки" 
                                style="width: 20px; cursor: pointer;" 
                                onclick="handleDispatcherAction(${item.id})"
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
                                    src="https://cdn-icons-png.flaticon.com/512/126/126472.png" 
                                    alt="Настройки" 
                                    style="width: 20px; cursor: pointer;" 
                                    onclick="handleDispatcherAction(${item.id})"
                                />
                            ` : ""}
                        </td>
                    `;
                    break;
                case "tasks":
                    html += `
                        <td hidden>${item.id}</td>
                        <td>${item.number}</td>
                        <td>${taskStatusDescriptions[item.status] || item.status}</td>
                        <td>${item.createdAt}</td>
                        <td>${item.completedAt || ""}</td>
                        <td>${item.driver}</td>
                        <td>
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/126/126472.png" 
                                alt="Настройки" 
                                style="width: 20px; cursor: pointer;" 
                                onclick="handleDispatcherAction(${item.id})"
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
                                src="https://cdn-icons-png.flaticon.com/512/126/126472.png" 
                                alt="Настройки" 
                                style="width: 20px; cursor: pointer;" 
                                onclick="handleDispatcherAction(${item.id})"
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
                                src="https://cdn-icons-png.flaticon.com/512/126/126472.png" 
                                alt="Настройки" 
                                style="width: 20px; cursor: pointer;" 
                                onclick="handleDispatcherAction(${item.id})"
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
                        <td>${taskStatusDescriptions[item.status] || item.status}</td>
                        <td>${item.statusChangedAt}</td>
                    `;
                    break;
                default:
                    html += `<td colspan="${columns.length}">Нет данных для отображения</td>`;
            }
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        mainContent.innerHTML = html;
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

    loadSection("tasks");
});

window.handleDispatcherAction = function(id) {
};

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

