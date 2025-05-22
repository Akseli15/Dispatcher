// Функция для извлечения taskId из URL
function getTaskIdFromUrl() {
    // Вариант 1: Если ID в пути (например /tasks/123)
    const pathParts = window.location.pathname.split('/');
    const idFromPath = pathParts[pathParts.length - 1];
    if (idFromPath && !isNaN(idFromPath)) {
        return idFromPath;
    }

    // Вариант 2: Если ID в параметрах (например /tasks?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const idFromParams = urlParams.get('id');
    if (idFromParams) {
        return idFromParams;
    }

    return null;
}

// Форматирование даты и времени
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

// Подгрузка комментариев
async function loadComments(taskId) {
    if (!taskId) {
        console.error('Ошибка: ID задачи не найден для загрузки комментариев');
        alert('Ошибка: ID задачи не найден');
        return;
    }

    try {
        console.log('Загрузка комментариев для taskId:', taskId);
        const response = await fetch(`/api/comments/task/${taskId}`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки комментариев: ${response.status} ${response.statusText}`);
        }
        const comments = await response.json();
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) {
            console.error('Элемент #comments-list не найден на странице');
            return;
        }
        commentsList.innerHTML = '';

        if (comments.length === 0) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'card mb-2';
            commentDiv.innerHTML = `
                <div class="card-body">
                    <p class="card-text text-center">Комментариев пока нет</p>
                </div>
            `;
            commentsList.appendChild(commentDiv);
            return;
        }

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'card mb-2';
            let photoHtml = '';
            if (comment.photoUrl) {
                photoHtml = `
                    <a href="#" class="photo-link" data-bs-toggle="modal" data-bs-target="#photoModal" data-photo-url="${comment.photoUrl}">
                        <img src="${comment.photoUrl}" alt="Фото" style="max-width: 200px; margin-top: 10px; cursor: pointer;">
                    </a>`;
            }
            commentDiv.innerHTML = `
                <div class="card-body">
                    <p style = "margin-bottom: 2px" class="card-text">${comment.text}</p>
                    ${photoHtml}
                    <div></div>
                    <small class="text-muted">Добавлено: ${formatDateTime(comment.createdAt)} ${comment.authorFullName}</small>
                </div>
            `;
            commentsList.appendChild(commentDiv);
        });
        console.log('Комментарии успешно загружены:', comments.length);

        // Обработчик для открытия фото в модальном окне
        document.querySelectorAll('.photo-link').forEach(link => {
            link.addEventListener('click', function() {
                const photoUrl = this.getAttribute('data-photo-url');
                const modalPhoto = document.getElementById('modalPhoto');
                modalPhoto.src = photoUrl;
            });
        });
    } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
        alert('Не удалось загрузить комментарии. Проверьте консоль для деталей.');
    }
}

// Обновление комментариев по кнопке
function refreshComments() {
    const taskId = getTaskIdFromUrl();
    if (taskId) {
        loadComments(taskId);
    } else {
        alert('Ошибка: ID задачи не найден');
    }
}

// Загрузка подзадач
async function loadSubtasks(taskId) {
    const subtaskStatusDescriptions = {
        "PENDING": "🟡 В ожидании",
        "IN_PROGRESS": "🔵 Выполняется",
        "COMPLETED": "🟢 Выполнена",
        "CANCELED": "⚫ Отменена"
    };

    const tbody = document.getElementById("subtask-table-body");
    tbody.innerHTML = "";

    try {
        const res = await fetch(`/api/subtasks/task/${taskId}`);
        const subtasks = await res.json();

        if (subtasks.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="7" class="text-center">Данных пока нет</td>`;
            tbody.appendChild(row);
            return;
        }

        subtasks.forEach((subtask, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${subtaskStatusDescriptions[subtask.status] || subtask.status}</td>
                <td>${formatDateTime(subtask.unloadingTime)}</td>
                <td>${subtask.client.address || ''}</td>
                <td>${subtask.client.fullName || ''}</td>
                <td>${subtask.client.phoneNumber || ''}</td>
                <td>
                    <img 
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjI3NSAyNy41SDEyLjcyNUMxMi4xMzc3IDI3LjUgMTEuNjI5NSAyNy4wOTEzIDExLjUwMzggMjYuNTE3NUwxMC45OTUgMjQuMTYyNUMxMC4zMTYzIDIzLjg2NTEgOS42NzI4IDIzLjQ5MzMgOS4wNzYyNyAyMy4wNTM4TDYuNzgwMDIgMjMuNzg1QzYuMjIwMDIgMjMuOTYzNiA1LjYxMTI1IDIzLjcyNzkgNS4zMTc1MiAyMy4yMTg4TDMuMDM3NTIgMTkuMjhDMi43NDcgMTguNzcwNiAyLjg0NzA5IDE4LjEyODEgMy4yNzc3NyAxNy43MzEzTDUuMDYwMDIgMTYuMTA2M0M0Ljk3OTAyIDE1LjM3MDEgNC45NzkwMiAxNC42Mjc0IDUuMDYwMDIgMTMuODkxMkwzLjI3Nzc3IDEyLjI3QzIuODQ2NDYgMTEuODczIDIuNzQ2MzMgMTEuMjI5NyAzLjAzNzUyIDEwLjcyTDYuMzEyNTIgNi43Nzg3NUM2LjYwNjI1IDYuMjY5NjIgNy4yMTUwMiA2LjAzMzkyIDcuNzc1MDIgNi4yMTI1TDkuMDcxMjcgNi45NDM3NUM5LjM3NjM1IDYuNzE3NyA5LjY5Mzk0IDYuNTA5MDMgMTAuMDIyNSA2LjMxODc1QzEwLjMzNzkgNi4xNDA4NyAxMC42NjI2IDUuOTc5ODEgMTAuOTk1IDUuODM2MjVMMTEuNTA1IDMuNDgzNzVDMTEuNjMwMSAyLjkwOTk2IDEyLjEzNzggMi41MDA2MiAxMi43MjUgMi41SDE3LjI3NUMxNy44NjIzIDIuNTAwNjIgMTguMzY5OSAyLjkwOTk2IDE4LjQ5NSAzLjQ4Mzc1TDE5LjAxIDUuODM3NUMxOS4zNjEgNS45OTE5IDE5LjcwMjggNi4xNjYzNSAyMC4wMzM4IDYuMzZDMjAuMzQyNCA2LjUzODUyIDIwLjY0MDggNi43MzQyNCAyMC45Mjc1IDYuOTQ2MjVMMjMuMjI1IDYuMjE1QzIzLjc4NDYgNi4wMzcwOSAyNC4zOTI3IDYuMjczIDI0LjY4NjMgNi43ODEyNUwyNi45NjEzIDEwLjcyMjVDMjcuMjUxOCAxMS4yMzE5IDI3LjE1MTcgMTEuODc0NCAyNi43MiAxMi4yNzEyTDI0LjkzODggMTMuODk2MkMyNS4wMTg4IDE0LjYzMjQgMjUuMDE4OCAxNS4zNzUxIDI0LjkzODggMTYuMTExMkwyNi43MiAxNy43MzYyQzI3LjE1MTcgMTguMTMzMSAyNy4yNTE4IDE4Ljc3NTYgMjYuOTYxMyAxOS4yODVMMjQuNjg2MyAyMy4yMjYyQzI0LjM5MjcgMjMuNzM0OCAyMy43ODQ2IDIzLjk3MDQgMjMuMjI1IDIzLjc5MjVMMjAuOTI3NSAyMy4wNjEyQzIwLjYzNjggMjMuMjc1NCAyMC4zMzQ3IDIzLjQ3MzYgMjAuMDIyNSAyMy42NTVDMTkuNjk0OCAyMy44NDQ5IDE5LjM1NjggMjQuMDE2NCAxOS4wMSAyNC4xNjg4TDE4LjQ5NSAyNi41MTc1QzE4LjM2OTQgMjcuMDkwOCAxNy44NjE5IDI3LjQ5OTUgMTcuMjc1IDI3LjVaTTkuNTI1MDIgMjAuMjg2M0wxMC41NSAyMS4wMzYzQzEwLjc4MTEgMjEuMjA2NCAxMS4wMjE5IDIxLjM2MyAxMS4yNzEzIDIxLjUwNUMxMS41MDU5IDIxLjY0MDkgMTEuNzUyNSAyMS43NjQ0IDEyLjAwNSAyMS44NzVMMTMuMTYxMyAyMi4zODYyTDEzLjczMjUgMjVIMTYuMjdMMTYuODQxMyAyMi4zODVMMTguMDA3NSAyMS44NzM4QzE4LjUxNjYgMjEuNjQ5MiAxOS4wMDA5IDIxLjM3MDEgMTkuNDQ4OCAyMS4wNDEzTDIwLjQ3NSAyMC4yOTEzTDIzLjAyNjMgMjEuMTAzOEwyNC4yOTUgMTguOTA2MkwyMi4zMTYzIDE3LjEwMjVMMjIuNDU2MyAxNS44Mzc1QzIyLjUxNzggMTUuMjg0MiAyMi41MTc4IDE0LjcyNTggMjIuNDU2MyAxNC4xNzI1TDIyLjMxNjMgMTIuOTA3NUwyNC4yOTYzIDExLjFMMjMuMDI2MyA4LjkwMTI1TDIwLjQ3NSA5LjcxMzc1TDE5LjQ0ODggOC45NjM3NUMxOS4wMDA4IDguNjMzODkgMTguNTE2NiA4LjM1MjE5IDE4LjAwNzUgOC4xMjVMMTYuODQxMyA3LjYxMzc1TDE2LjI3IDVIMTMuNzMyNUwxMy4xNTg4IDcuNjE1TDExLjk5NSA4LjEyNUMxMS43NTIzIDguMjMzOCAxMS41MDU3IDguMzU2MDcgMTEuMjcxMyA4LjQ5MTI1QzExLjAyMzQgOC42MzI5MSAxMC43ODM5IDguNzg4NTggMTAuNTUzOCA4Ljk1NzVMOS41Mjc1MiA5LjcwNzVMNi45Nzc1MiA4Ljg5NUw1LjcwNjI3IDExLjFMNy42ODUwMiAxMi45MDEyTDcuNTQ1MDIgMTQuMTY3NUM3LjQ4MzUyIDE0LjcyMDggNy40ODM1MiAxNS4yNzkyIDcuNTQ1MDIgMTUuODMyNUw3LjY4NTAyIDE3LjA5NzVMNS43MDYyNyAxOC45MDEzTDYuOTc1MDIgMjEuMDk4N0w5LjUyNTAyIDIwLjI4NjNaTTE0Ljk5NSAyMEMxMi4yMzM2IDIwIDkuOTk1MDIgMTcuNzYxNCA5Ljk5NTAyIDE1QzkuOTk1MDIgMTIuMjM4NiAxMi4yMzM2IDEwIDE0Ljk5NSAxMEMxNy43NTY0IDEwIDE5Ljk5NSAxMi4yMzg2IDE5Ljk5NSAxNUMxOS45OTE2IDE3Ljc2IDE3Ljc1NSAxOS45OTY2IDE0Ljk5NSAyMFpNMTQuOTk1IDEyLjVDMTMuNjI5MyAxMi41MDE0IDEyLjUxNzQgMTMuNTk4NiAxMi40OTc4IDE0Ljk2NDJDMTIuNDc4MiAxNi4zMjk4IDEzLjU1ODIgMTcuNDU4NCAxNC45MjM0IDE3LjQ5ODlDMTYuMjg4NSAxNy41Mzk0IDE3LjQzMzYgMTYuNDc2OSAxNy40OTUgMTUuMTEyNVYxNS42MTI1VjE1QzE3LjQ5NSAxMy42MTkzIDE2LjM3NTcgMTIuNSAxNC45OTUgMTIuNVoiIGZpbGw9IiM2NzY3NjciLz4KPC9zdmc+"
                        alt="Настройки" 
                        style="width: 33px; cursor: pointer; vertical-align: middle;" 
                        onclick="handleSubtaskEdit(${subtask.id})"
                    />
                    <img
                        src="data:image/svg+xml;utf8,<svg width='31' height='31' viewBox='0 0 31 31' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M7.74999 24.5417C7.74999 25.9625 8.9125 27.125 10.3333 27.125H20.6667C22.0875 27.125 23.25 25.9625 23.25 24.5417V9.04167H7.74999V24.5417ZM10.9275 15.345L12.7487 13.5238L15.5 16.2621L18.2383 13.5238L20.0596 15.345L17.3212 18.0833L20.0596 20.8217L18.2383 22.6429L15.5 19.9046L12.7617 22.6429L10.9404 20.8217L13.6787 18.0833L10.9275 15.345ZM20.0208 5.16667L18.7292 3.875H12.2708L10.9792 5.16667H6.45833V7.75H24.5417V5.16667H20.0208Z' fill='%23D72D3E'/></svg>"
                        alt="Настройки" 
                        style="width: 33px; cursor: pointer; vertical-align: middle;" 
                        onclick="handleSubtaskDelete(${subtask.id})"
                    />
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Ошибка при загрузке подзадач:", err);
        alert('Не удалось загрузить подзадачи. Проверьте консоль для деталей.');
    }
}

// Загрузка данных для выпадающих списков и полей
async function loadDropdownData(taskId) {
    const taskStatusDescriptions = {
        "EDITING": "⚪ На редактировании",
        "READY": "🟢 Готов к исполнению",
        "IN_PROGRESS": "🔵 Выполняется",
        "COMPLETED": "🟡 Завершён",
        "CLOSED": "🟢 Закрыт",
        "CANCELED": "⚫ Отменён",
        "ISSUE": "🔴 Проблема на рейсе"
    };

    try {
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        const taskData = await taskRes.json();

        const driverInput = document.getElementById("driverInput");
        const vehicleInput = document.getElementById("vehicleInput");
        const statusInput = document.getElementById("statusInput");

        driverInput.value = taskData.driver?.name || '';
        vehicleInput.value = taskData.vehicle ? `${taskData.vehicle.registrationNumber} ${taskData.vehicle.model}` : '';
        statusInput.value = taskStatusDescriptions[taskData.status] || taskData.status;
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        alert('Не удалось загрузить данные задачи. Проверьте консоль для деталей.');
    }
}

// Загрузка данных задачи
async function loadTaskData(taskId) {
    try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (!res.ok) {
            throw new Error(`Ошибка загрузки задачи: ${res.status}`);
        }
        const task = await res.json();
        if (!task) return;

        document.getElementById("task-number").textContent = task.taskNumber;

        // Установка значений по умолчанию (если есть селекты)
        const driverSelect = document.getElementById("driverSelect");
        const vehicleSelect = document.getElementById("vehicleSelect");
        const statusSelect = document.getElementById("statusSelect");

        if (driverSelect) driverSelect.value = task.driver?.id || '';
        if (vehicleSelect) vehicleSelect.value = task.vehicle?.id || '';
        if (statusSelect) statusSelect.value = task.status || '';
    } catch (err) {
        console.error("Ошибка при загрузке задачи:", err);
        alert('Не удалось загрузить данные задачи. Проверьте консоль для деталей.');
    }
}

// Обработка удаления подзадачи
async function handleSubtaskDelete(subtaskId) {
    if (!confirm("Вы уверены, что хотите удалить подзадачу?")) return;

    try {
        const response = await fetch(`/api/subtasks/${subtaskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Заново загружаем подзадачи
            const taskId = getTaskIdFromUrl();
            if (taskId) {
                await loadSubtasks(taskId);
            }
        } else {
            alert("Ошибка при удалении подзадачи");
        }
    } catch (error) {
        console.error("Ошибка при удалении:", error);
        alert('Не удалось удалить подзадачу. Проверьте консоль для деталей.');
    }
}

// Обработка кликов по боковому меню
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item, .sidebar-subitem');
    sidebarItems.forEach(item => {
        if (item.classList.contains("collapsible")) return;

        item.addEventListener("click", () => {
            sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const section = item.getAttribute("data-section");
            if (section) {
                window.location.href = `/main?section=${section}`;
            }
        });
    });

    // Обработка раскрытия подменю
    document.querySelectorAll('.collapsible').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = item.getAttribute('data-toggle');
            const submenu = document.querySelector(`[data-target="${target}"]`);
            submenu.classList.toggle('show');
            item.classList.toggle('open');
        });
    });
}

function setupCommentForm() {
    const commentForm = document.getElementById('comment-form');
    if (!commentForm) {
        console.error('Элемент #comment-form не найден на странице');
        return;
    }

    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const taskId = getTaskIdFromUrl();
        const commentText = document.getElementById('comment-text').value;
        const commentPhoto = document.getElementById('comment-photo').files[0];

        if (!commentText.trim()) {
            alert('Комментарий не может быть пустым');
            return;
        }

        if (!taskId) {
            alert('Ошибка: ID задачи не найден');
            return;
        }

        const formData = new FormData();
        formData.append('text', commentText);
        formData.append('taskId', taskId);
        formData.append('authorFullName', document.querySelector('.username-overlay strong')?.textContent || 'Unknown User');
        if (commentPhoto) {
            formData.append('photo', commentPhoto);
        }

        try {
            console.log('Отправка комментария с taskId:', taskId);
            const response = await fetch('/api/comments', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const newComment = await response.json();
                const commentDiv = document.createElement('div');
                commentDiv.className = 'card mb-2';
                let photoHtml = '';
                if (newComment.photoUrl) {
                    photoHtml = `
                        <a href="#" class="photo-link" data-bs-toggle="modal" data-bs-target="#photoModal" data-photo-url="${newComment.photoUrl}">
                            <img src="${newComment.photoUrl}" alt="Фото" style="max-width: 200px; margin-top: 10px; cursor: pointer;">
                        </a>`;
                }
                commentDiv.innerHTML = `
                    <div class="card-body">
                        <p style = "margin-bottom: 2px" class="card-text">${newComment.text}</p>
                        ${photoHtml}
                        <div></div>
                        <small class="text-muted">Добавлено: ${formatDateTime(newComment.createdAt)} ${newComment.authorFullName}</small>
                    </div>
                `;
                document.getElementById('comments-list').prepend(commentDiv);
                document.getElementById('comment-text').value = '';
                document.getElementById('comment-photo').value = '';
                loadComments(taskId); // Перезагрузка комментариев
            } else {
                const errorText = await response.text();
                console.error('Ошибка сервера:', response.status, errorText);
                alert(`Ошибка при добавлении комментария: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке комментария:', error);
            alert('Произошла ошибка при отправке комментария. Проверьте консоль для деталей.');
        }
    });
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    const taskId = getTaskIdFromUrl();

    if (taskId) {
        window.taskId = taskId;
        console.log('Инициализация страницы с taskId:', taskId);

        // Обновляем кнопку добавления подзадачи
        const addButton = document.querySelector('button[onclick*="handleAddSubtask"]');
        if (addButton) {
            addButton.setAttribute('onclick', `handleAddSubtask(${taskId})`);
        }

        // Загружаем данные
        loadTaskData(taskId);
        loadDropdownData(taskId);
        loadSubtasks(taskId);
        loadComments(taskId);

    } else {
        console.error('ID задачи не найден в URL');
        alert('Ошибка: ID задачи не найден в URL');
    }

    setupSidebarNavigation();
    setupCommentForm();
});