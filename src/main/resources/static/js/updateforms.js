// Общая функция для отображения модального окна
function showModal(title, formContent, onSave) {
    const modalHtml = `
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${formContent}
                        <div id="errorMessage" class="alert alert-danger mt-3 d-none"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" id="saveChangesBtn">
                            <span class="spinner-border spinner-border-sm d-none" id="saveSpinner"></span>
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Удаляем предыдущее модальное окно, если оно есть
    const existingModal = document.getElementById('editModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Добавляем новое модальное окно в DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Инициализируем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();

    // Назначаем обработчик для кнопки сохранения
    document.getElementById('saveChangesBtn').addEventListener('click', async () => {
        const saveBtn = document.getElementById('saveChangesBtn');
        const spinner = document.getElementById('saveSpinner');
        const errorElement = document.getElementById('errorMessage');

        saveBtn.disabled = true;
        spinner.classList.remove('d-none');
        errorElement.classList.add('d-none');

        try {
            await onSave();
            modal.hide();
            showToast('Успешно', 'Изменения сохранены', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            errorElement.textContent = error.message || 'Произошла ошибка при сохранении';
            errorElement.classList.remove('d-none');
        } finally {
            saveBtn.disabled = false;
            spinner.classList.add('d-none');
        }
    });
}

// Функция для показа уведомлений
function showToast(title, message, type = 'success') {
    const toastHtml = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${type} text-white">
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        </div>
    `;

    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = toastHtml;
    document.body.appendChild(toastContainer);

    setTimeout(() => {
        toastContainer.remove();
    }, 5000);
}

// Общая функция для выполнения PUT-запросов
async function sendUpdateRequest(url, data) {
    const response = await fetch(url, {
        method: 'PUT',
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

// Функция для редактирования водителя
function handleDriverEdit(id) {
    fetch(`/api/drivers/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Не удалось загрузить данные водителя');
            return res.json();
        })
        .then(driver => {
            const formContent = `
                <form id="editDriverForm">
                    <div class="mb-3">
                        <label for="driverName" class="form-label">ФИО</label>
                        <input type="text" class="form-control" id="driverName" value="${driver.name || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="driverChatId" class="form-label">Telegram ID</label>
                        <input disabled type="text" class="form-control" id="driverChatId" value="${driver.chatId || 'Не авторизован(а) в чат-боте'}" required>
                    </div>
                    <div class="mb-3">
                        <label for="driverPhone" class="form-label">Номер телефона</label>
                        <input type="tel" class="form-control" id="driverPhone" value="${driver.phoneNumber || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="driverSchedule" class="form-label">График работы</label>
                        <select class="form-select" id="driverSchedule" required>
                            <option value="2/2" ${driver.schedule === '2/2' ? 'selected' : ''}>2/2</option>
                            <option value="5/2" ${driver.schedule === '5/2' ? 'selected' : ''}>5/2</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="driverStatus" class="form-label">Статус</label>
                        <select class="form-select" id="driverStatus" required>
                            <option value="OFF_DUTY" ${driver.status === 'OFF_DUTY' ? 'selected' : ''}>⚪ Не работает</option>
                            <option value="AVAILABLE" ${driver.status === 'AVAILABLE' ? 'selected' : ''}>🟢 Свободен</option>
                            <option value="ON_ROUTE" ${driver.status === 'ON_ROUTE' ? 'selected' : ''}>🔵 В рейсе</option>
                        </select>
                    </div>
                </form>
            `;

            showModal('Редактирование водителя', formContent, async () => {
                const updatedDriver = {
                    name: document.getElementById('driverName').value,
                    chatId: document.getElementById('driverChatId').value,
                    phoneNumber: document.getElementById('driverPhone').value,
                    schedule: document.getElementById('driverSchedule').value,
                    status: document.getElementById('driverStatus').value
                };

                return await sendUpdateRequest(`/api/drivers/${id}`, updatedDriver);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка', error.message, 'danger');
        });
}

// Функция для редактирования диспетчера
function handleDispatcherEdit(id) {
    fetch(`/api/dispatchers/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Не удалось загрузить данные диспетчера');
            return res.json();
        })
        .then(dispatcher => {
            const formContent = `
                <form id="editDispatcherForm">
                    <div class="mb-3">
                        <label for="dispatcherUsername" class="form-label">Логин</label>
                        <input disabled type="text" class="form-control" id="dispatcherUsername" value="${dispatcher.username || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="dispatcherFullName" class="form-label">ФИО</label>
                        <input type="text" class="form-control" id="dispatcherFullName" value="${dispatcher.fullName || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="dispatcherPassword" class="form-label">Пароль</label>
                        <input type="password" class="form-control" id="dispatcherPassword" placeholder="Оставьте пустым, чтобы не менять">
                    </div>
                </form>
            `;

            showModal('Редактирование диспетчера', formContent, async () => {
                const updatedDispatcher = {
                    username: document.getElementById('dispatcherUsername').value,
                    fullName: document.getElementById('dispatcherFullName').value
                };

                const password = document.getElementById('dispatcherPassword').value;
                if (password) {
                    updatedDispatcher.password = password;
                }

                return await sendUpdateRequest(`/api/dispatchers/${id}`, updatedDispatcher);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка', error.message, 'danger');
        });
}

// Функция для редактирования маршрутного листа
function handleTaskEdit(id) {
    fetch(`/api/tasks/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Не удалось загрузить данные маршрутного листа');
            return res.json();
        })
        .then(task => {
            // Загружаем водителей и транспорт одновременно
            Promise.all([
                fetch('/api/drivers').then(res => {
                    if (!res.ok) throw new Error('Не удалось загрузить список водителей');
                    return res.json();
                }),
                fetch('/api/vehicles').then(res => {
                    if (!res.ok) throw new Error('Не удалось загрузить список транспорта');
                    return res.json();
                })
            ])
                .then(([drivers, vehicles]) => {
                    const driverOptions = drivers.map(driver =>
                        `<option value="${driver.id}" ${driver.id === task.driver.id ? 'selected' : ''}>${driver.name}</option>`
                    ).join('');

                    const vehicleOptions = vehicles.map(vehicle =>
                        `<option value="${vehicle.id}" ${vehicle.id === task.vehicle.id ? 'selected' : ''}>${vehicle.registrationNumber} ${vehicle.model}</option>`
                    ).join('');

                    const formContent = `
                    <form id="editTaskForm">
                        <div class="mb-3">
                            <label for="taskNumber" class="form-label">Номер</label>
                            <input disabled type="text" class="form-control" id="taskNumber" value="${task.taskNumber || ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="taskStatus" class="form-label">Статус</label>
                            <select class="form-select" id="taskStatus" required>
                                <option value="EDITING" ${task.status === 'EDITING' ? 'selected' : ''}>⚪ На редактировании</option>
                                <option value="READY" ${task.status === 'READY' ? 'selected' : ''}>🟢 Готов к исполнению</option>
                                <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>🔵 Выполняется</option>
                                <option value="COMPLETED" ${task.status === 'COMPLETED' ? 'selected' : ''}>🟡 Завершён</option>
                                <option value="CLOSED" ${task.status === 'CLOSED' ? 'selected' : ''}>🟢 Закрыт</option>
                                <option value="CANCELED" ${task.status === 'CANCELED' ? 'selected' : ''}>⚫ Отменён</option>
                                <option value="ISSUE" ${task.status === 'ISSUE' ? 'selected' : ''}>🔴 Проблема на рейсе</option>
                            </select>
                        </div>
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
                                <option value="">Выберите транспортное средство</option>
                                ${vehicleOptions}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="taskCompletedAt" class="form-label">Дата выполнения</label>
                            <input type="datetime-local" class="form-control" id="taskCompletedAt" value="${task.completedAt || ''}">
                        </div>
                    </form>
                `;

                    showModal('Редактирование маршрутного листа', formContent, async () => {
                        const updatedTask = {
                            number: document.getElementById('taskNumber').value,
                            status: document.getElementById('taskStatus').value,
                            driverId: document.getElementById('taskDriver').value,
                            vehicleId: document.getElementById('taskVehicle').value,
                            completedAt: document.getElementById('taskCompletedAt').value
                        };

                        return await sendUpdateRequest(`/api/tasks/${id}`, updatedTask);
                    });
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных:', error);
                    showToast('Ошибка', error.message, 'danger');
                });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка', error.message, 'danger');
        });
}

// Функция для редактирования транспортного средства
function handleVehicleEdit(id) {
    fetch(`/api/vehicles/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Не удалось загрузить данные транспортного средства');
            return res.json();
        })
        .then(vehicle => {
            const formContent = `
                <form id="editVehicleForm">
                    <div class="mb-3">
                        <label for="vehicleRegNumber" class="form-label">Регистрационный номер</label>
                        <input type="text" class="form-control" id="vehicleRegNumber" value="${vehicle.registrationNumber || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="vehicleModel" class="form-label">Модель</label>
                        <input type="text" class="form-control" id="vehicleModel" value="${vehicle.model || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="vehicleMaxLoad" class="form-label">Максимально перевозимый груз (тонны)</label>
                        <input disabled type="number" class="form-control" id="vehicleMaxLoad" value="${vehicle.maxLoad || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="vehicleStatus" class="form-label">Статус</label>
                        <select class="form-select" id="vehicleStatus" required>
                            <option value="MAINTENANCE_REQUIRED" ${vehicle.status === 'MAINTENANCE_REQUIRED' ? 'selected' : ''}>🔴 Требуется ТО</option>
                            <option value="UNDER_MAINTENANCE" ${vehicle.status === 'UNDER_MAINTENANCE' ? 'selected' : ''}>🟠 Проходит ТО</option>
                            <option value="AVAILABLE" ${vehicle.status === 'AVAILABLE' ? 'selected' : ''}>🟢 Свободно</option>
                            <option value="ON_ROUTE" ${vehicle.status === 'ON_ROUTE' ? 'selected' : ''}>🔵 В рейсе</option>
                        </select>
                    </div>
                </form>
            `;

            showModal('Редактирование транспортного средства', formContent, async () => {
                const updatedVehicle = {
                    registrationNumber: document.getElementById('vehicleRegNumber').value,
                    model: document.getElementById('vehicleModel').value,
                    maxLoad: parseFloat(document.getElementById('vehicleMaxLoad').value),
                    status: document.getElementById('vehicleStatus').value
                };

                return await sendUpdateRequest(`/api/vehicles/${id}`, updatedVehicle);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка', error.message, 'danger');
        });
}

// Функция для редактирования клиента
function handleClientEdit(id) {
    fetch(`/api/clients/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Не удалось загрузить данные клиента');
            return res.json();
        })
        .then(client => {
            const formContent = `
                <form id="editClientForm">
                    <div class="mb-3">
                        <label for="clientFullName" class="form-label">Юр.лицо</label>
                        <input type="text" class="form-control" id="clientFullName" value="${client.fullName || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="clientPhone" class="form-label">Номер телефона</label>
                        <input type="tel" class="form-control" id="clientPhone" value="${client.phoneNumber || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="clientEmail" class="form-label">Электронная почта</label>
                        <input type="email" class="form-control" id="clientEmail" value="${client.email || ''}">
                    </div>
                    <div class="mb-3">
                        <label for="clientAddress" class="form-label">Адрес</label>
                        <input type="text" class="form-control" id="clientAddress" value="${client.address || ''}">
                    </div>
                </form>
            `;

            showModal('Редактирование клиента', formContent, async () => {
                const updatedClient = {
                    fullName: document.getElementById('clientFullName').value,
                    phoneNumber: document.getElementById('clientPhone').value,
                    email: document.getElementById('clientEmail').value,
                    address: document.getElementById('clientAddress').value
                };

                return await sendUpdateRequest(`/api/clients/${id}`, updatedClient);
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка', error.message, 'danger');
        });
}

// Функция для редактирования подзадачи
async function handleSubtaskEdit(id) {

    const subtaskStatusDescriptions = {
        "PENDING": "🟡 В ожидании",
        "IN_PROGRESS": "🔵 Выполняется",
        "COMPLETED": "🟢 Выполнена",
        "CANCELED": "⚫ Отменена"
    };

    try {
        const [subtaskRes, clientsRes] = await Promise.all([
            fetch(`/api/subtasks/${id}`),
            fetch(`/api/clients`)
        ]);

        if (!subtaskRes.ok || !clientsRes.ok) {
            throw new Error('Ошибка загрузки данных');
        }

        const subtask = await subtaskRes.json();
        const clients = await clientsRes.json();

        const clientOptions = clients.map(c =>
            `<option value="${c.id}" ${subtask.client.id === c.id ? 'selected' : ''}>${c.fullName}</option>`
        ).join('');

        const statusOptions = Object.entries(subtaskStatusDescriptions).map(([key, value]) =>
            `<option value="${key}" ${subtask.status === key ? 'selected' : ''}>${value}</option>`
        ).join('');

        const formContent = `
            <form id="editSubtaskForm">
                <div class="mb-3">
                    <label for="subtaskClient" class="form-label">Клиент</label>
                    <select class="form-select" id="subtaskClient" required>
                        ${clientOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="subtaskStatus" class="form-label">Статус</label>
                    <select class="form-select" id="subtaskStatus" required>
                        ${statusOptions}
                    </select>
                </div>
            </form>
        `;

        showModal('Редактирование подзадачи', formContent, async () => {
            const updatedSubtask = {
                clientId: document.getElementById('subtaskClient').value,
                status: document.getElementById('subtaskStatus').value
            };

            return await sendUpdateRequest(`/api/subtasks/${id}`, updatedSubtask);
        });

    } catch (error) {
        console.error('Ошибка:', error);
        showToast('Ошибка', error.message, 'danger');
    }
}