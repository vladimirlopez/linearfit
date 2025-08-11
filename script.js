document.addEventListener('DOMContentLoaded', () => {
    const chartCanvas = document.getElementById('chart');
    let chart;

    // Ensure plugins are registered when using UMD builds
    try {
        const w = window;
        if (w && typeof Chart !== 'undefined') {
        // Register plugins robustly for UMD
        const anno = w['chartjs-plugin-annotation'] || w['ChartAnnotation'] || w['chartjsPluginAnnotation'];
        const zoom = w['chartjs-plugin-zoom'] || w['ChartZoom'] || w['chartjsPluginZoom'];
        if (anno) Chart.register(anno);
        if (zoom) Chart.register(zoom);
        }
    } catch (_) {}

        const state = {
            title: 'Title',
            xLabel: 'X-Axis',
            yLabel: 'Y-Axis',
        xScaleType: 'linear',
        yScaleType: 'linear',
        xMin: undefined,
        xMax: undefined,
        yMin: undefined,
        yMax: undefined,
        regressionLabelId: 'regression-label'
    };

    function buildChart() {
        const data = {
            datasets: [
                {
                    label: 'Data',
                    data: [],
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    showLine: false,
                    pointRadius: 5
                },
                {
                    label: 'Linear Fit',
                    data: [],
                    borderColor: '#dc3545',
                    borderWidth: 2,
                    showLine: true,
                    type: 'line',
                    pointRadius: 0
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: false },
                        annotation: {
                    annotations: {}
                },
                                zoom: {
                                    pan: { enabled: true, mode: 'xy' },
                                    zoom: {
                                        wheel: { enabled: true },
                                        pinch: { enabled: true },
                                        drag: { enabled: false },
                                        mode: 'xy'
                                    }
                                }
            },
            scales: {
                x: {
                    type: state.xScaleType,
                    title: { display: true, text: state.xLabel },
                    ticks: { maxTicksLimit: 10 },
                    min: state.xMin,
                    max: state.xMax
                },
                y: {
                    type: state.yScaleType,
                    title: { display: true, text: state.yLabel },
                    ticks: { maxTicksLimit: 8 },
                    min: state.yMin,
                    max: state.yMax
                }
            }
        };

        const ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, { type: 'scatter', data, options });
    }

    function parseTable() {
        const rows = Array.from(document.querySelectorAll('#data-table tbody tr'));
        const points = [];
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (!cells || cells.length < 2) continue;
            const x = parseFloat(cells[0].innerText);
            const y = parseFloat(cells[1].innerText);
            if (!Number.isNaN(x) && !Number.isNaN(y)) points.push({ x, y });
        }
        return points;
    }

        function setStatus(message, kind = 'info') {
            const el = document.getElementById('status');
            if (!el) return;
            el.textContent = message || '';
            el.className = kind ? `status ${kind}` : 'status';
        }

            function setEquationText(text) {
                const el = document.getElementById('equation');
                if (el) el.textContent = text || '';
            }

    function linearRegression(x, y) {
        const n = x.length;
        if (n < 2) return { slope: 0, intercept: 0 };
        let sx = 0, sy = 0, sxy = 0, sxx = 0;
        for (let i = 0; i < n; i++) {
            const xi = x[i];
            const yi = y[i];
            sx += xi; sy += yi; sxy += xi * yi; sxx += xi * xi;
        }
        const denom = n * sxx - sx * sx;
        if (denom === 0) return { slope: 0, intercept: sy / n };
        const slope = (n * sxy - sx * sy) / denom;
        const intercept = (sy - slope * sx) / n;
        return { slope, intercept };
    }

        function updateRegressionAnnotation(slope, intercept, xData, yData) {
            if (!xData || !yData || xData.length < 2) return;
            const minX = Math.min(...xData);
            const maxY = Math.max(...yData);
            const rangeX = Math.max(...xData) - minX || 1;
            const rangeY = maxY - Math.min(...yData) || 1;
            // Position 5% from left, 5% below top of data range
            const x = minX + 0.05 * rangeX;
            const y = maxY - 0.05 * rangeY;
            const text = `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`;
        chart.options.plugins.annotation.annotations[state.regressionLabelId] = {
            type: 'label',
            xValue: x,
            yValue: y,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderColor: 'rgba(0,0,0,0.4)',
            borderWidth: 1,
            borderRadius: 6,
            content: [text],
            font: { size: 14, family: getComputedStyle(document.body).fontFamily },
            padding: 6,
            callout: { display: false },
            draggable: true
        };
    }

    function applyAxesFromControls() {
        const xMin = parseFloat(document.getElementById('x-min').value);
        const xMax = parseFloat(document.getElementById('x-max').value);
        const yMin = parseFloat(document.getElementById('y-min').value);
        const yMax = parseFloat(document.getElementById('y-max').value);
        const xScale = document.getElementById('x-scale').value;
        const yScale = document.getElementById('y-scale').value;

        state.xMin = Number.isNaN(xMin) ? undefined : xMin;
        state.xMax = Number.isNaN(xMax) ? undefined : xMax;
        state.yMin = Number.isNaN(yMin) ? undefined : yMin;
        state.yMax = Number.isNaN(yMax) ? undefined : yMax;
        state.xScaleType = xScale;
        state.yScaleType = yScale;

            // Log scales must be > 0; sanitize inputs
            if (state.xScaleType === 'logarithmic') {
                if (!(state.xMin > 0)) state.xMin = undefined;
                if (!(state.xMax > 0)) state.xMax = undefined;
            }
            if (state.yScaleType === 'logarithmic') {
                if (!(state.yMin > 0)) state.yMin = undefined;
                if (!(state.yMax > 0)) state.yMax = undefined;
            }

        chart.options.scales.x.type = state.xScaleType;
        chart.options.scales.y.type = state.yScaleType;
        chart.options.scales.x.min = state.xMin;
        chart.options.scales.x.max = state.xMax;
        chart.options.scales.y.min = state.yMin;
        chart.options.scales.y.max = state.yMax;
            chart.update();
            setStatus('');
    }

    function autoscaleToData() {
        const pts = chart.data.datasets[0].data;
        if (!pts || pts.length === 0) return;
        const xs = pts.map(p => p.x);
        const ys = pts.map(p => p.y);
        const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
        const [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
        const padX = (xmax - xmin || 1) * 0.05;
        const padY = (ymax - ymin || 1) * 0.1;
        chart.options.scales.x.min = xmin - padX;
        chart.options.scales.x.max = xmax + padX;
        chart.options.scales.y.min = ymin - padY;
        chart.options.scales.y.max = ymax + padY;
        document.getElementById('x-min').value = chart.options.scales.x.min.toString();
        document.getElementById('x-max').value = chart.options.scales.x.max.toString();
        document.getElementById('y-min').value = chart.options.scales.y.min.toString();
        document.getElementById('y-max').value = chart.options.scales.y.max.toString();
        chart.update();
    }

    function updateChart() {
            const rawPts = parseTable();
            // Filter for log scales
            const pts = rawPts.filter(p => {
                if (chart.options.scales.x.type === 'logarithmic' && !(p.x > 0)) return false;
                if (chart.options.scales.y.type === 'logarithmic' && !(p.y > 0)) return false;
                return true;
            });
            const skipped = rawPts.length - pts.length;
            if (skipped > 0) setStatus(`Skipped ${skipped} point(s) not valid on log scale.`, 'warn');
            else setStatus('');

            const xs = pts.map(p => p.x);
            const ys = pts.map(p => p.y);

        // Sort by x for line drawing
        const sorted = [...pts].sort((a,b) => a.x - b.x);

            chart.data.datasets[0].data = sorted;

                if (xs.length >= 2) {
                    const { slope, intercept } = linearRegression(xs, ys);
                // Build fit line across current x-range
                const xStart = Math.min(...xs);
                const xEnd = Math.max(...xs);
                chart.data.datasets[1].data = [
                    { x: xStart, y: slope * xStart + intercept },
                    { x: xEnd, y: slope * xEnd + intercept }
                ];
                updateRegressionAnnotation(slope, intercept, xs, ys);
                    setEquationText(`y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`);
            } else {
                chart.data.datasets[1].data = [];
                chart.options.plugins.annotation.annotations = {};
                    setEquationText('');
            }

        const headers = document.querySelectorAll('#data-table thead th');
        const xHeader = headers[0]?.innerText?.trim() || state.xLabel;
        const yHeader = headers[1]?.innerText?.trim() || state.yLabel;
        chart.options.scales.x.title.text = xHeader;
        chart.options.scales.y.title.text = yHeader;

        chart.update();
    }

    // UI bindings
        document.getElementById('graph-title').addEventListener('input', (e) => {
            state.title = e.target.innerText || 'Title';
        });
        // Axis label edits come from the table header and axis controls now

    // Table row add/remove
    document.getElementById('add-row').addEventListener('click', () => {
        const tbody = document.querySelector('#data-table tbody');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td class="row-actions"><button class="delete-row" aria-label="Delete row">×</button></td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelector('#data-table tbody').addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-row');
        if (btn) {
            const row = btn.closest('tr');
            row?.remove();
        }
    });
        // Debounced live update on edit
        let updateTimer;
        document.querySelector('#data-table tbody').addEventListener('input', () => {
            clearTimeout(updateTimer);
            updateTimer = setTimeout(() => {
                updateChart();
            }, 150);
        });

        // Keyboard navigation for editable cells
        document.querySelector('#data-table').addEventListener('keydown', (e) => {
            const cell = e.target.closest('td, th');
            if (!cell || !cell.isContentEditable) return;
            const tr = cell.parentElement;
            const table = cell.closest('table');
            const tbody = table.querySelector('tbody');
            const isHeader = cell.tagName.toLowerCase() === 'th';

            const getCellIndex = (c) => Array.from(c.parentElement.children).indexOf(c);
            const colIndex = getCellIndex(cell);
            function focusCell(r, c) {
                const row = r?.children?.[c];
                if (row) {
                    row.focus();
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(row);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                if (isHeader) return; // keep header Enter default to break lines if needed
                // Move to same column on next row (create one if at end)
                const rows = Array.from(tbody.querySelectorAll('tr'));
                const rowIndex = rows.indexOf(tr);
                if (rowIndex === rows.length - 1) {
                    // add a row
                    const newTr = document.createElement('tr');
                    newTr.innerHTML = `
                        <td contenteditable="true"></td>
                        <td contenteditable="true"></td>
                        <td class="row-actions"><button class="delete-row" aria-label="Delete row">×</button></td>
                    `;
                    tbody.appendChild(newTr);
                    focusCell(newTr, colIndex);
                } else {
                    focusCell(rows[rowIndex + 1], colIndex);
                }
            } else if (e.key === 'Tab') {
                // Move to next editable cell; wrap to first cell of next row
                const cells = Array.from(table.querySelectorAll('tbody td[contenteditable="true"]'));
                const idx = cells.indexOf(cell);
                if (idx >= 0) {
                    e.preventDefault();
                    const next = cells[idx + (e.shiftKey ? -1 : 1)];
                    if (next) {
                        focusCell(next.parentElement, getCellIndex(next));
                    } else if (!e.shiftKey) {
                        // add a row and go to first cell
                        const newTr = document.createElement('tr');
                        newTr.innerHTML = `
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td class="row-actions"><button class="delete-row" aria-label="Delete row">×</button></td>
                        `;
                        tbody.appendChild(newTr);
                        focusCell(newTr, 0);
                    }
                }
            }
        });

    document.getElementById('plot').addEventListener('click', updateChart);

        // Update axis labels when table headers are edited
        document.querySelector('#data-table thead').addEventListener('input', (e) => {
            const headers = document.querySelectorAll('#data-table thead th');
            const xHeader = headers[0]?.innerText?.trim() || state.xLabel;
            const yHeader = headers[1]?.innerText?.trim() || state.yLabel;
            chart.options.scales.x.title.text = xHeader;
            chart.options.scales.y.title.text = yHeader;
            chart.update();
        });

    document.getElementById('clear').addEventListener('click', () => {
        const tbody = document.querySelector('#data-table tbody');
        tbody.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td contenteditable="true"></td>
                <td contenteditable="true"></td>
                <td class="row-actions"><button class="delete-row" aria-label="Delete row">×</button></td>
            `;
            tbody.appendChild(tr);
        }
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];
        chart.options.plugins.annotation.annotations = {};
        chart.update();
        setStatus('');
    });

    document.getElementById('export').addEventListener('click', () => {
            // Compose title + chart into one image
            const title = (document.getElementById('graph-title')?.innerText || '').trim();
            const padding = 16; // space between title and chart
            const titleHeight = title ? 32 : 0;
            const width = chartCanvas.width;
            const height = chartCanvas.height + titleHeight + (title ? padding : 0);
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = width;
            exportCanvas.height = height;
            const ctx = exportCanvas.getContext('2d');
            // white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            // draw title if present
            if (title) {
                ctx.fillStyle = '#111827';
                ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(title, width / 2, 8);
            }
            // draw chart
            const chartOffsetY = title ? (titleHeight + padding) : 0;
            ctx.drawImage(chartCanvas, 0, chartOffsetY);
            const url = exportCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'linear-fit-graph.png';
        a.click();
    });

    document.getElementById('reset-zoom').addEventListener('click', () => {
        chart.resetZoom();
    });

    document.getElementById('apply-axes').addEventListener('click', () => {
        applyAxesFromControls();
    });
    document.getElementById('autoscale').addEventListener('click', () => {
        autoscaleToData();
    });

        // Initialize
        buildChart();
            document.getElementById('graph-title').innerText = state.title;
});
