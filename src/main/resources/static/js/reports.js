async function fetchChartData(section) {
    try {
        const end = new Date().toISOString();
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        let entityApi = '';
        let countApi = '';
        let avgApi = '';
        let idKey = '';
        let nameKey = '';
        let countQueryParam = '';

        switch (section) {
            case 'driverReports':
                entityApi = '/api/drivers';
                countApi = (id) => `/api/drivers/completed-count?driverId=${id}&start=${start}&end=${end}`;
                avgApi = '/api/drivers/avg-duration';
                idKey = 'driverId';
                nameKey = 'name';
                break;
            case 'vehicleReports':
                entityApi = '/api/vehicles';
                countApi = (id) => `/api/vehicles/completed-count?vehicleId=${id}&start=${start}&end=${end}`;
                avgApi = '/api/vehicles/avg-duration';
                idKey = 'vehicleId';
                nameKey = 'registrationNumber';
                break;
            default:
                throw new Error(`Неизвестный раздел: ${section}`);
        }

        const entitiesResponse = await fetch(entityApi);
        if (!entitiesResponse.ok) throw new Error(`Ошибка при загрузке данных: ${entityApi}`);
        const entities = await entitiesResponse.json();

        const completedTasks = [];
        for (const entity of entities) {
            const response = await fetch(countApi(entity.id));
            if (!response.ok) throw new Error(`Ошибка при загрузке задач для ${idKey} ${entity.id}`);
            const count = Math.floor(await response.json());
            completedTasks.push({ id: entity.id, count, name: entity[nameKey] });
        }

        const avgDurationResponse = await fetch(avgApi);
        if (!avgDurationResponse.ok) throw new Error(`Ошибка при загрузке средней длительности: ${avgApi}`);
        const avgDurationsRaw = await avgDurationResponse.json();

        const avgDurations = {};
        for (const id in avgDurationsRaw) {
            if (Object.prototype.hasOwnProperty.call(avgDurationsRaw, id)) {
                avgDurations[id] = Number(avgDurationsRaw[id].toFixed(2));
            }
        }

        return { completedTasks, avgDurations, idKey };
    } catch (error) {
        console.error('Ошибка при загрузке графика:', error);
        return { completedTasks: [], avgDurations: {}, idKey: '' };
    }
}

async function renderChart(section) {
    const mainContent = document.querySelector(".main-content");
    const { completedTasks, avgDurations, idKey } = await fetchChartData(section);

    const labels = completedTasks.map(task => `${task.name || task.id}`);
    const taskCounts = completedTasks.map(task => task.count);
    const avgDurationsData = completedTasks.map(task => avgDurations[task.id] || 0);

    const formatDuration = (hours) => {
        const hoursInt = Math.floor(hours);
        const minutes = Math.round((hours - hoursInt) * 60);
        return `${hoursInt} ч ${minutes.toString().padStart(2, '0')} мин`;
    };

    const entityLabel = section === 'vehicleReports' ? 'Транспортное средство' : 'Водитель';
    const chartTitle = section === 'vehicleReports'
        ? 'Производительность ТС: Выполненные задачи и средняя длительность'
        : 'Производительность водителей: Выполненные задачи и средняя длительность';

    let tableHtml = `
        <table class="table table-bordered table-hover mt-3" style="width: 100%; max-width: 1200px; margin: 20px auto;">
            <thead>
                <tr>
                    <th>${entityLabel}</th>
                    <th>Выполненные задачи</th>
                    <th>Средняя продолжительность рейса</th>
                </tr>
            </thead>
            <tbody>
    `;

    completedTasks.forEach(task => {
        const duration = avgDurations[task.id] || 0;
        tableHtml += `
            <tr>
                <td>${task.name || task.id}</td>
                <td>${task.count}</td>
                <td>${formatDuration(duration)}</td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;

    mainContent.innerHTML = `
        <div style="margin-top: 20px;">
            <div id="chartContainer" style="width: 100%; max-width: 1200px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin: 0 auto;">
                <canvas id="driverChart"></canvas>
            </div>
            ${tableHtml}
        </div>
    `;

    const ctx = document.getElementById('driverChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Выполненные задачи',
                    data: taskCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: 'Средняя продолжительность рейса',
                    data: avgDurationsData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Количество задач' },
                    ticks: { stepSize: 1, precision: 0 }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: { display: true, text: 'Средняя длительность (ч:мин)' },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        stepSize: 0.5,
                        callback: (value) => {
                            const hours = Math.floor(value);
                            const minutes = Math.round((value - hours) * 60);
                            return `${hours} ч ${minutes.toString().padStart(2, '0')} мин`;
                        }
                    }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: chartTitle }
            }
        }
    });
}

async function fetchStatusCountData() {
    try {
        const response = await fetch('/api/tasks/status-count');
        if (!response.ok) throw new Error('Ошибка при загрузке данных по статусам задач');
        const data = await response.json();
        // data = [ ["EDITING", 5], ["READY", 10], ... ]
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

const taskStatusDescriptions = {
    "EDITING": "⚪ На редактировании",
    "READY": "🟢 Готов к исполнению",
    "IN_PROGRESS": "🔵 Выполняется",
    "COMPLETED": "🟡 Завершён",
    "CLOSED": "🟢 Закрыт",
    "CANCELED": "⚫ Отменён",
    "ISSUE": "🔴 Проблема на рейсе"
};

async function renderStatusCountChart() {
    const data = await fetchStatusCountData();
    if (!data.length) {
        document.querySelector(".main-content").innerHTML = '<p>Нет данных для отображения по статусам задач.</p>';
        return;
    }

    // Метки на русском с иконками (если есть описание, иначе ключ)
    const labels = data.map(item => taskStatusDescriptions[item[0]] || item[0]);
    const counts = data.map(item => item[1]);

    const mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = `
        <div style="margin-top: 20px; max-width: 1200px; margin-left: auto; margin-right: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <canvas id="statusCountChart" style="max-height: 400px;"></canvas>
            <table class="table table-bordered table-hover mt-4" style="width: 100%; font-size: 16px;">
                <thead>
                    <tr>
                        <th>Статус задачи</th>
                        <th>Количество</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>${taskStatusDescriptions[item[0]] || item[0]}</td>
                            <td>${item[1]}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    const ctx = document.getElementById('statusCountChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Количество задач по статусам',
                data: counts,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Количество задач' },
                    ticks: { stepSize: 1, precision: 0 }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Распределение задач по статусам' }
            }
        }
    });
}

