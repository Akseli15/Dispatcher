async function sendCreateRequest(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
}

async function handleAddDriver() {
    const formContent = `
        <form id="addDriverForm">
            <div class="mb-3">
                <label for="driverName" class="form-label">ФИО</label>
                <input type="text" class="form-control" id="driverName" required>
            </div>
            <div class="mb-3">
                <label for="driverPhone" class="form-label">Номер телефона</label>
                <input type="tel" class="form-control" id="driverPhone" required>
            </div>
            <div class="mb-3">
                <label for="driverSchedule" class="form-label">График работы</label>
                <select class="form-select" id="driverSchedule" required>
                    <option value="2/2">2/2</option>
                    <option value="5/2">5/2</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="driverStatus" class="form-label">Статус</label>
                <select class="form-select" id="driverStatus" required>
                    <option value="OFF_DUTY">Не работает</option>
                    <option value="AVAILABLE">Свободен</option>
                    <option value="ON_ROUTE">В рейсе</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="driverToken" class="form-label">Токен</label>
                <div class="input-group">
                    <input type="text" class="form-control" id="driverToken" required>
                    <button type="button" class="btn btn-outline-secondary" id="generateTokenBtn">Сгенерировать</button>
                </div>
            </div>
        </form>
    `;

    showModal('Добавление водителя', formContent, async () => {
        const newDriver = {
            name: document.getElementById('driverName').value,
            phoneNumber: document.getElementById('driverPhone').value,
            schedule: document.getElementById('driverSchedule').value,
            status: document.getElementById('driverStatus').value,
            token: document.getElementById('driverToken').value
        };
        return await sendCreateRequest('/api/drivers', newDriver);
    });

    document.getElementById('generateTokenBtn').addEventListener('click', () => {
        const tokenInput = document.getElementById('driverToken');
        tokenInput.value = generateRandomToken(20);
    });
}

function generateRandomToken(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function handleAddDispatcher() {
    const formContent = `
        <form id="addDispatcherForm">
            <div class="mb-3">
                <label for="dispatcherUsername" class="form-label">Логин</label>
                <input type="text" class="form-control" id="dispatcherUsername" required>
            </div>
            <div class="mb-3">
                <label for="dispatcherPassword" class="form-label">Пароль</label>
                <input type="password" class="form-control" id="dispatcherPassword" required>
            </div>
            <div class="mb-3">
                <label for="dispatcherFullName" class="form-label">ФИО</label>
                <input type="text" class="form-control" id="dispatcherFullName" required>
            </div>
            <div class="mb-3">
                <label for="dispatcherRole" class="form-label">Роль</label>
                <select class="form-select" id="dispatcherRole" required>
                    <option value="DISPATCHER">Диспетчер</option>
                    <option value="ADMIN">Администратор</option>
                </select>
            </div>
        </form>
    `;

    showModal('Добавление диспетчера', formContent, async () => {
        const newDispatcher = {
            username: document.getElementById('dispatcherUsername').value,
            password: document.getElementById('dispatcherPassword').value,
            fullName: document.getElementById('dispatcherFullName').value,
            role: document.getElementById('dispatcherRole').value
        };

        return await sendCreateRequest('/api/dispatchers', newDispatcher);
    });
}
async function handleAddVehicle() {
    const formContent = `
        <form id="addVehicleForm">
            <div class="mb-3">
                <label for="vehicleRegNumber" class="form-label">Регистрационный номер</label>
                <input type="text" class="form-control" id="vehicleRegNumber" required>
            </div>
            <div class="mb-3">
                <label for="vehicleModel" class="form-label">Модель</label>
                <input type="text" class="form-control" id="vehicleModel" required>
            </div>
            <div class="mb-3">
                <label for="vehicleMaxLoad" class="form-label">Максимально перевозимый груз (тонны)</label>
                <input type="number" step="1" class="form-control" id="vehicleMaxLoad" required>
            </div>
            <div class="mb-3">
                <label for="vehicleStatus" class="form-label">Статус</label>
                <select class="form-select" id="vehicleStatus" required>
                    <option value="MAINTENANCE_REQUIRED">Требуется ТО</option>
                    <option value="UNDER_MAINTENANCE">Проходит ТО</option>
                    <option value="AVAILABLE">Свободно</option>
                    <option value="ON_ROUTE">В рейсе</option>
                </select>
            </div>
        </form>
    `;

    showModal('Добавление транспортного средства', formContent, async () => {
        const newVehicle = {
            registrationNumber: document.getElementById('vehicleRegNumber').value,
            model: document.getElementById('vehicleModel').value,
            maxLoad: parseFloat(document.getElementById('vehicleMaxLoad').value),
            status: document.getElementById('vehicleStatus').value
        };

        return await sendCreateRequest('/api/vehicles', newVehicle);
    });
}
async function handleAddClient() {
    const formContent = `
        <form id="addClientForm">
            <div class="mb-3">
                <label for="clientFullName" class="form-label">Юр.лицо</label>
                <input type="text" class="form-control" id="clientFullName" required>
            </div>
            <div class="mb-3">
                <label for="clientPhone" class="form-label">Номер телефона</label>
                <input type="tel" class="form-control" id="clientPhone" required>
            </div>
            <div class="mb-3">
                <label for="clientEmail" class="form-label">Электронная почта</label>
                <input type="email" class="form-control" id="clientEmail" required>
            </div>
            <div class="mb-3">
                <label for="clientAddress" class="form-label">Адрес</label>
                <input type="text" class="form-control" id="clientAddress" required>
            </div>
        </form>
    `;

    showModal('Добавление клиента', formContent, async () => {
        const newClient = {
            fullName: document.getElementById('clientFullName').value,
            phoneNumber: document.getElementById('clientPhone').value,
            email: document.getElementById('clientEmail').value,
            address: document.getElementById('clientAddress').value
        };

        return await sendCreateRequest('/api/clients', newClient);
    });
}
async function handleAddTask() {
    try {
        const [driversRes, vehiclesRes, currentDispatcherRes] = await Promise.all([
            fetch('/api/drivers'),
            fetch('/api/vehicles'),
            fetch('/api/dispatchers/me')
        ]);

        if (!driversRes.ok || !vehiclesRes.ok || !currentDispatcherRes.ok) {
            throw new Error('Не удалось загрузить данные');
        }

        const drivers = await driversRes.json();
        const vehicles = await vehiclesRes.json();
        const currentDispatcher = await currentDispatcherRes.json();

        const driverOptions = drivers.map(driver =>
            `<option value="${driver.id}">${driver.name}</option>`
        ).join('');
        const vehicleOptions = vehicles.map(vehicle =>
            `<option value="${vehicle.id}">${vehicle.registrationNumber} (${vehicle.model})</option>`
        ).join('');

        const formContent =
            `<form id="addTaskForm">
                <div class="mb-3">
                    <label for="taskDriver" class="form-label">Водитель</label>
                    <select class="form-select" id="taskDriver" required>
                        <option value="">Выберите водителя</option>
                        ${driverOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="taskVehicle" class="form-label">Транспортное средство</label>
                    <select class="form-select" id="taskVehicle" required>
                        <option value="">Выберите транспорт</option>
                        ${vehicleOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="taskStatus" class="form-label">Статус</label>
                    <select class="form-select" id="taskStatus" required>
                        <option value="EDITING">На редактировании</option>
                        <option value="READY">Готов к исполнению</option>
                        <option value="IN_PROGRESS">Выполняется</option>
                        <option value="COMPLETED">Завершён</option>
                        <option value="CLOSED">Закрыт</option>
                        <option value="CANCELED">Отменён</option>
                        <option value="ISSUE">Проблема на рейсе</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="taskCompletedAt" class="form-label">Дата выполнения</label>
                    <input type="datetime-local" class="form-control" id="taskCompletedAt">
                </div>
            </form>`;

        showModal('Создание маршрутного листа', formContent, async () => {
            const newTask = {
                driver: { id: document.getElementById('taskDriver').value },
                vehicle: { id: document.getElementById('taskVehicle').value },
                dispatcher: { id: currentDispatcher.id },
                status: document.getElementById('taskStatus').value,
                completedAt: document.getElementById('taskCompletedAt').value || null
            };

            const response = await sendCreateRequest('/api/tasks', newTask);
            window.location.href = `http://localhost:8080/routelist/${response.id}`;
            return response;
        });
    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Ошибка', error.message, 'danger');
    }
}

async function handleAddSubtask(taskId) {
    const subtaskStatusDescriptions = {
        "PENDING": "В ожидании",
        "IN_PROGRESS": "Выполняется",
        "COMPLETED": "Выполнена",
        "CANCELED": "Отменена"
    };

    try {
        const [tasksRes, clientsRes] = await Promise.all([
            fetch('/api/tasks/'+ taskId),
            fetch('/api/clients')
        ]);

        if (!tasksRes.ok || !clientsRes.ok) {
            throw new Error('Не удалось загрузить данные');
        }

        const task = await tasksRes.json();
        taskNumber = task.taskNumber;
        const clients = await clientsRes.json();

        const clientOptions = clients.map(client =>
            `<option value="${client.id}">${client.fullName}</option>`
        ).join('');
        const statusOptions = Object.entries(subtaskStatusDescriptions).map(([key, value]) =>
            `<option value="${key}">${value}</option>`
        ).join('');

        const formContent = `
            <form id="addSubtaskForm">
                <div class="mb-3">
                    <label for="subtaskTask" class="form-label">Маршрутный лист</label>
                    <input type="text" class="form-control" id="subtaskTaskId" value="${taskNumber}" disabled>
                </div>
                <div class="mb-3">
                    <label for="subtaskClient" class="form-label">Клиент</label>
                    <select class="form-select" id="subtaskClient"  name="clientId" required>
                        <option value="">Выберите клиента</option>
                        ${clientOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="subtaskStatus" class="form-label">Статус</label>
                    <select class="form-select" id="subtaskStatus" required>
                        ${statusOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="subtaskUnloadingTime" class="form-label">Время разгрузки</label>
                    <input type="datetime-local" class="form-control" id="subtaskUnloadingTime">
                </div>
            </form>
        `;

        showModal('Добавление подзадачи', formContent, async () => {
            const clientId = document.getElementById('subtaskClient').value;
            const status = document.getElementById('subtaskStatus').value;
            const unloadingTime = document.getElementById('subtaskUnloadingTime').value || null;

            if (!clientId) {
                showToast('Ошибка', 'Пожалуйста, выберите клиента', 'warning');
                return null;
            }

            const newSubtask = {
                task: { id: taskId },
                client: { id: clientId },
                status: status,
                unloadingTime: unloadingTime
            };


            return await sendCreateRequest('/api/subtasks', newSubtask);
        });

    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Ошибка', error.message, 'danger');
    }
}

