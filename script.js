document.getElementById('add-row').addEventListener('click', () => {
    const tableBody = document.querySelector('#data-table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
    `;
    tableBody.appendChild(newRow);
});

document.getElementById('plot').addEventListener('click', () => {
    const tableRows = document.querySelectorAll('#data-table tbody tr');
    const data = Array.from(tableRows).map(row => {
        const cells = row.querySelectorAll('td');
        const x = parseFloat(cells[0].innerText);
        const y = parseFloat(cells[1].innerText);
        return { x, y };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));

    const headers = document.querySelectorAll('#data-table th');
    const xLabel = headers[0].innerText;
    const yLabel = headers[1].innerText;

    const xValues = data.map(p => p.x);
    const yValues = data.map(p => p.y);

    const { slope, intercept } = linearRegression(xValues, yValues);

    const fitLine = xValues.map(x => ({ x, y: slope * x + intercept }));

    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data',
                    data: data,
                    backgroundColor: '#007bff',
                },
                {
                    label: 'Linear Fit',
                    data: fitLine,
                    borderColor: '#0056b3',
                    type: 'line',
                    fill: false,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: `${yLabel} vs. ${xLabel}`,
                fontColor: '#212529'
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xLabel,
                        fontColor: '#212529'
                    },
                    ticks: {
                        fontColor: '#212529'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabel,
                        fontColor: '#212529'
                    },
                    ticks: {
                        fontColor: '#212529'
                    }
                }],
            },
            annotation: {
                annotations: [
                    {
                        type: 'label',
                        xValue: 0.05,
                        yValue: 0.95,
                        xScaleID: 'x-axis-1',
                        yScaleID: 'y-axis-1',
                        content: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`,
                        font: {
                            size: 16
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        xAdjust: -150,
                        yAdjust: -150

                    },
                ],
            },
        },
    });
});

document.getElementById('clear').addEventListener('click', () => {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = `
        <tr>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
        </tr>
    `;

    const headers = document.querySelectorAll('#data-table th');
    headers[0].innerText = 'X-Variable (units)';
    headers[1].innerText = 'Y-Variable (units)';

    const chart = Chart.getChart('chart');
    if (chart) {
        chart.destroy();
    }
});

document.getElementById('export').addEventListener('click', () => {
    const chart = Chart.getChart('chart');
    if (chart) {
        const url = chart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = 'linear-fit-graph.png';
        a.click();
    }
});

function linearRegression(x, y) {
    const n = x.length;
    let sx = 0;
    let sy = 0;
    let sxy = 0;
    let sxx = 0;
    let syy = 0;

    for (let i = 0; i < n; i++) {
        sx += x[i];
        sy += y[i];
        sxy += x[i] * y[i];
        sxx += x[i] * x[i];
        syy += y[i] * y[i];
    }

    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;

    return { slope, intercept };
}