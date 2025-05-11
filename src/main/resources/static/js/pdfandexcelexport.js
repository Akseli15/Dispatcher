async function generateRouteList(taskId) {
    try {
        // 1. Получение данных из API
        const response = await fetch(`/api/subtasks/task/${taskId}`);
        if (!response.ok) throw new Error('Ошибка при получении данных');
        const subtasks = await response.json();

        // 2. Формирование данных для шаблона
        const task = subtasks[0]?.task || {};
        const data = {
            documentNumber: task.taskNumber || 'Не указан',
            organizationName: 'ООО "Транспортные решения"',
            documentDate: new Date(task.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            }),
            employeeFullName: task.driver?.name || 'Не указан',
            employeePosition: 'Водитель',
            department: 'Транспортный отдел',
            routes: subtasks.map((subtask, index) => ({
                organization: subtask.client?.fullName || 'Не указан',
                address: subtask.client?.address || 'Не указан',
                purpose: 'Доставка груза',
                transportType: task.vehicle?.registrationNumber || 'Не указан',
                confirmationDoc: `Накладная #${subtask.id}`,
                time: subtask.unloadingTime
                    ? new Date(subtask.unloadingTime).toLocaleTimeString('ru-RU', {
                        hour: '2-digit', minute: '2-digit'
                    })
                    : ''
            })),
            issueDate: new Date().toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            }),
            issueTime: new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit', minute: '2-digit'
            })
        };

        // 3. Шаблон routelist.html, встроенный как строка
        const templateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: "Times New Roman", serif; font-size: 12pt; }
    .header { text-align: center; margin-bottom: 20px; }
    .title { font-weight: bold; text-decoration: underline; }
    .info-block { margin: 15px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid black; padding: 5px; text-align: center; }
    .signature { margin-top: 30px; text-align: right; }
    .underline { text-decoration: underline; display: inline-block; min-width: 200px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">МАРШРУТНЫЙ ЛИСТ № {{documentNumber}}</div>
    <div>работника "{{organizationName}}"</div>
    <div>на "{{documentDate}}"</div>
  </div>

  <div class="info-block">
    <div>Работник: <span class="underline">{{employeeFullName}}</span></div>
    <div>Должность: <span class="underline">{{employeePosition}} ({{department}})</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>№ п/п</th>
        <th>Наименование организации</th>
        <th>Адрес</th>
        <th>Цель поездки</th>
        <th>Транспортное средство</th>
        <th>Подтверждающий документ</th>
        <th>Время (ч, мин.)</th>
        <th>Подпись принимающей стороны</th>
      </tr>
    </thead>
    <tbody>
      {{#each routes}}
      <tr>
        <td>{{@index}}</td>
        <td>{{organization}}</td>
        <td>{{address}}</td>
        <td>{{purpose}}</td>
        <td>{{transportType}}</td>
        <td>{{confirmationDoc}}</td>
        <td>{{time}}</td>
        <td></td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="signature">
    Маршрутный лист сформирован "{{issueDate}}" в {{issueTime}}
  </div>
</body>
</html>
`;

        // 4. Компиляция шаблона с использованием Handlebars
        const template = Handlebars.compile(templateHtml);
        const content = template(data);

        // 5. Создание PDF с использованием pdfmake
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [30, 30, 30, 30], // небольшие поля
            content: [
                { text: `МАРШРУТНЫЙ ЛИСТ № ${data.documentNumber}`, style: 'header', alignment: 'center' },
                { text: `работника "${data.organizationName}"`, alignment: 'center' },
                { text: `на "${data.documentDate}"`, alignment: 'center', margin: [0, 0, 0, 20] },
                { text: `Работник: ${data.employeeFullName}`, margin: [0, 0, 0, 5] },
                { text: `Должность: ${data.employeePosition} (${data.department})`, margin: [0, 0, 0, 15] },
                {
                    table: {
                        headerRows: 1,
                        widths: [20, '*', '*', '*', '*', 50, 70], // адаптированные ширины
                        body: [
                            [
                                '№',
                                'Наименование организации',
                                'Адрес',
                                'Цель поездки',
                                'Транспортное средство',
                                'Время',
                                'Подпись'
                            ],
                            ...data.routes.map((route, index) => [
                                index + 1,
                                route.organization,
                                route.address,
                                route.purpose,
                                route.transportType,
                                route.time,
                                ''
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                {
                    text: `Маршрутный лист сформирован "${data.issueDate}" в ${data.issueTime}`,
                    alignment: 'right',
                    margin: [0, 30, 0, 0]
                }
            ],
            styles: {
                header: { fontSize: 13, bold: true, decoration: 'underline', margin: [0, 0, 0, 10] }
            },
            defaultStyle: { font: 'Roboto', fontSize: 10 } // немного увеличен шрифт
        };

        // 6. Генерация и скачивание PDF
        pdfMake.createPdf(docDefinition).download(`Маршрутный_лист_${data.documentNumber}.pdf`);

        console.log('PDF успешно сгенерирован');
        return true;

    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        throw error;
    }
}

async function generateRouteListExcel(taskId) {
    try {
        const response = await fetch(`/api/subtasks/task/${taskId}`);
        if (!response.ok) throw new Error('Ошибка при получении данных');
        const subtasks = await response.json();

        const task = subtasks[0]?.task || {};
        const data = {
            documentNumber: task.taskNumber || 'Не указан',
            organizationName: 'ООО "Транспортные решения"',
            documentDate: new Date(task.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            }),
            employeeFullName: task.driver?.name || 'Не указан',
            employeePosition: 'Водитель',
            department: 'Транспортный отдел',
            routes: subtasks.map((subtask, index) => ({
                index: index + 1,
                organization: subtask.client?.fullName || 'Не указан',
                address: subtask.client?.address || 'Не указан',
                purpose: 'Доставка груза',
                transportType: task.vehicle?.model || 'Не указан',
                time: subtask.unloadingTime
                    ? new Date(subtask.unloadingTime).toLocaleTimeString('ru-RU', {
                        hour: '2-digit', minute: '2-digit'
                    })
                    : ''
            })),
            issueDate: new Date().toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            }),
            issueTime: new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit', minute: '2-digit'
            })
        };

        const worksheetData = [
            [`МАРШРУТНЫЙ ЛИСТ № ${data.documentNumber}`],
            [`работника "${data.organizationName}"`],
            [`на "${data.documentDate}"`],
            [],
            [`Работник: ${data.employeeFullName}`],
            [`Должность: ${data.employeePosition} (${data.department})`],
            [],
            [
                '№ п/п',
                'Наименование организации',
                'Адрес',
                'Цель поездки',
                'Вид транспорта',
                'Время (ч, мин.)',
                'Подпись принимающей стороны'
            ],
            ...data.routes.map(route => [
                route.index,
                route.organization,
                route.address,
                route.purpose,
                route.transportType,
                route.time,
                ''
            ]),
            [],
            [`Маршрутный лист выдан "${data.issueDate}" в ${data.issueTime}`]
        ];

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        ws['!cols'] = [
            { wch: 10 },
            { wch: 35 },
            { wch: 40 },
            { wch: 25 },
            { wch: 25 },
            { wch: 15 },
            { wch: 25 }
        ];

        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
            { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } },
            { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
            { s: { r: worksheetData.length - 1, c: 0 }, e: { r: worksheetData.length - 1, c: 6 } }
        ];

        // Установка рамок и стилей
        const borderStyle = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        };

        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;

                ws[cellAddress].s = {
                    font: { name: 'Arial', sz: 11 },
                    border: borderStyle,
                    alignment: { vertical: 'center', horizontal: 'center', wrapText: true }
                };
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Маршрутный лист');

        XLSX.writeFile(wb, `Маршрутный_лист_${data.documentNumber}.xlsx`);

        console.log('Excel успешно сгенерирован');
        return true;

    } catch (error) {
        console.error('Ошибка генерации Excel:', error);
        throw error;
    }
}