document.getElementById('clear').addEventListener('click', () => {
    document.getElementById('data').value = '';
    document.getElementById('title').value = '';
    document.getElementById('x-variable').value = '';
    document.getElementById('x-units').value = '';
    document.getElementById('y-variable').value = '';
    document.getElementById('y-units').value = '';

    const chart = Chart.getChart('chart');
    if (chart) {
        chart.destroy();
    }
});

document.getElementById('plot').addEventListener('click', () => {
    try {
    const data = document.getElementById('data').value.trim().split('\n').map(line => {
        const [x, y] = line.split(',').map(Number);
        return { x, y };
    });

    const title = document.getElementById('title').value;
    const xVariable = document.getElementById('x-variable').value;
    const xUnits = document.getElementById('x-units').value;
    const yVariable = document.getElementById('y-variable').value;
    const yUnits = document.getElementById('y-units').value;

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
                text: title,
                fontColor: '#212529'
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: `${xVariable} (${xUnits})`,
                        fontColor: '#212529'
                    },
                    ticks: {
                        fontColor: '#212529'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: `${yVariable} (${yUnits})`,
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
}

    });
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
