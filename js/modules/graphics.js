/**
 * Graphics and Visualization Module
 * Handles chart creation, data visualization, and graphical representations
 */

export class GraphicsManager {
    constructor() {
        this.currentChart = null;
        this.chartContext = null;
        this.eventListenersInitialized = false;
        
        // Wait for DOM to be ready before initializing event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeEventListeners();
            });
        } else {
            // DOM is already ready
            setTimeout(() => {
                this.initializeEventListeners();
            }, 100);
        }
    }

    initializeEventListeners() {
        // Prevent duplicate initialization
        if (this.eventListenersInitialized) {
            console.log('⚠️ Graphics event listeners already initialized, skipping');
            return;
        }
        
        console.log('🔧 Initializing graphics event listeners...');
        
        // Chart control buttons
        const showTimeChartBtn = document.getElementById('showTimeChartBtn');
        if (showTimeChartBtn) {
            showTimeChartBtn.addEventListener('click', () => {
                console.log('📈 Show time chart button clicked');
                this.showTimeBreakdownChart();
            });
            console.log('✅ Show time chart button listener added');
        }

        const showCostChartBtn = document.getElementById('showCostChartBtn');
        if (showCostChartBtn) {
            showCostChartBtn.addEventListener('click', () => {
                console.log('💰 Show cost chart button clicked');
                this.showCostAnalysisChart();
            });
            console.log('✅ Show cost chart button listener added');
        }



        const exportChartBtn = document.getElementById('exportChartBtn');
        if (exportChartBtn) {
            exportChartBtn.addEventListener('click', () => {
                console.log('📄 Export chart button clicked');
                this.exportCurrentChart();
            });
            console.log('✅ Export chart button listener added');
        }

        const hideChartBtn = document.getElementById('hideChartBtn');
        if (hideChartBtn) {
            hideChartBtn.addEventListener('click', () => {
                console.log('❌ Hide chart button clicked');
                this.hideChart();
            });
            console.log('✅ Hide chart button listener added');
        }
        
        this.eventListenersInitialized = true;
        console.log('✅ All graphics event listeners initialized');
    }

    showTimeBreakdownChart() {
        const chartData = this.getTimeBreakdownData();
        this.createPieChart('Project Time Breakdown', chartData, 'time');
    }

    showCostAnalysisChart() {
        const chartData = this.getCostAnalysisData();
        this.createPieChart('Project Cost Analysis', chartData, 'cost');
    }



    getTimeBreakdownData() {
        // Get time data from the calculator
        const timeData = {
            'Termination Work': parseFloat(document.getElementById('breakdownTermination')?.textContent?.replace(' hours', '') || 0),
            'Cable Running': parseFloat(document.getElementById('breakdownRunning')?.textContent?.replace(' hours', '') || 0),
            'Testing': parseFloat(document.getElementById('breakdownTesting')?.textContent?.replace(' hours', '') || 0),
            'Labeling': parseFloat(document.getElementById('breakdownLabeling')?.textContent?.replace(' hours', '') || 0),
            'Cleanup': parseFloat(document.getElementById('breakdownCleanup')?.textContent?.replace(' hours', '') || 0),
            'Cutover': parseFloat(document.getElementById('breakdownCutover')?.textContent?.replace(' hours', '') || 0),
            'Decommissioning': parseFloat(document.getElementById('breakdownDecommissioning')?.textContent?.replace(' hours', '') || 0),
            'Rack Setup': parseFloat(document.getElementById('breakdownRack')?.textContent?.replace(' hours', '') || 0)
        };

        // Filter out zero values and create chart data
        const chartData = Object.entries(timeData)
            .filter(([key, value]) => value > 0)
            .map(([key, value]) => ({
                label: key,
                value: value,
                color: this.getColorForCategory(key)
            }));

        return chartData;
    }

    getCostAnalysisData() {
        // Get comprehensive cost data from all available cost elements
        const costData = {
            'Labor Cost': parseFloat(document.getElementById('laborCost')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Supplies & Expendables': parseFloat(document.getElementById('suppliesCost')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Materials & Hardware': parseFloat(document.getElementById('materialsCost')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Equipment & Tools': parseFloat(document.getElementById('equipmentCost')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Shipping & Logistics': parseFloat(document.getElementById('shippingCost')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Documentation & Admin': parseFloat(document.getElementById('adminCost')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Vendor Quotes': parseFloat(document.getElementById('vendorQuotesTotal')?.textContent?.replace('$', '').replace(',', '') || 0),
            'Active Orders': parseFloat(document.getElementById('activeVendorTotal')?.textContent?.replace('$', '').replace(',', '') || 0)
        };

        // Filter out zero values and create chart data
        const chartData = Object.entries(costData)
            .filter(([key, value]) => value > 0)
            .map(([key, value]) => ({
                label: key,
                value: value,
                color: this.getColorForCategory(key)
            }));

        return chartData;
    }



    getColorForCategory(category) {
        const colors = {
            'Termination Work': '#3498db',
            'Cable Running': '#e74c3c',
            'Testing': '#f39c12',
            'Labeling': '#9b59b6',
            'Cleanup': '#1abc9c',
            'Cutover': '#34495e',
            'Decommissioning': '#8e44ad',
            'Rack Setup': '#27ae60',
            'Labor Cost': '#e74c3c',
            'Supplies & Expendables': '#3498db',
            'Materials & Hardware': '#f39c12',
            'Equipment & Tools': '#9b59b6',
            'Shipping & Logistics': '#1abc9c',
            'Documentation & Admin': '#34495e',
            'Vendor Quotes': '#e67e22',
            'Active Orders': '#27ae60'
        };
        return colors[category] || '#95a5a6';
    }

    createPieChart(title, data, type) {
        this.showChartContainer();
        this.setChartTitle(title);
        
        const canvas = document.getElementById('projectChart');
        const ctx = canvas.getContext('2d');
        
        // Clear previous chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (data.length === 0) {
            this.drawNoDataMessage(ctx, canvas);
            return;
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 50;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        // Draw pie slices
        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
        });

        // Draw legend
        this.drawLegend(ctx, data, canvas.width, canvas.height, type);
        
        // Update stats
        this.updateStats(data, type);
    }

    createBarChart(title, data) {
        this.showChartContainer();
        this.setChartTitle(title);
        
        const canvas = document.getElementById('projectChart');
        const ctx = canvas.getContext('2d');
        
        // Clear previous chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (data.length === 0) {
            this.drawNoDataMessage(ctx, canvas);
            return;
        }

        const maxValue = Math.max(...data.map(item => item.value));
        const barWidth = (canvas.width - 100) / data.length;
        const maxBarHeight = canvas.height - 100;
        const startX = 50;
        const startY = canvas.height - 50;

        // Draw bars
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * maxBarHeight;
            const x = startX + (index * barWidth) + 10;
            const y = startY - barHeight;
            
            // Draw bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth - 20, barHeight);
            
            // Draw value
            ctx.fillStyle = '#495057';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.value.toString(), x + (barWidth - 20) / 2, y - 5);
            
            // Draw label
            ctx.fillText(item.label, x + (barWidth - 20) / 2, startY + 15);
        });
    }

    drawLegend(ctx, data, canvasWidth, canvasHeight, type) {
        const legendX = 20;
        const legendY = 20;
        const itemHeight = 20;
        const colorBoxSize = 15;
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        data.forEach((item, index) => {
            const y = legendY + (index * itemHeight);
            
            // Draw color box
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, y, colorBoxSize, colorBoxSize);
            
            // Draw label
            ctx.fillStyle = '#495057';
            const label = `${item.label}: ${item.value}${type === 'time' ? ' hrs' : type === 'cost' ? ' $' : ''}`;
            ctx.fillText(label, legendX + colorBoxSize + 5, y + 12);
        });
    }

    drawNoDataMessage(ctx, canvas) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available for chart', canvas.width / 2, canvas.height / 2);
    }

    showChartContainer() {
        const container = document.getElementById('chartContainer');
        if (container) {
            container.style.display = 'block';
        }
    }

    hideChart() {
        const container = document.getElementById('chartContainer');
        if (container) {
            container.style.display = 'none';
        }
    }

    setChartTitle(title) {
        const titleElement = document.getElementById('chartTitle');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    updateStats(data, type) {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        if (type === 'time') {
            const totalTimeStat = document.getElementById('totalTimeStat');
            if (totalTimeStat) {
                totalTimeStat.textContent = `${total.toFixed(1)} hrs`;
            }
        } else if (type === 'cost') {
            const totalCostStat = document.getElementById('totalCostStat');
            if (totalCostStat) {
                totalCostStat.textContent = `$${total.toLocaleString()}`;
            }
        }
        
        // Update other stats using the same logic as updateStatsFromCurrentData
        const cablesStat = document.getElementById('cablesStat');
        if (cablesStat) {
            const totalCables = document.getElementById('totalCables')?.textContent || '0';
            cablesStat.textContent = totalCables;
        }
        
        const terminationsStat = document.getElementById('terminationsStat');
        if (terminationsStat) {
            // Use the already calculated total terminations from the calculator
            const totalTerminations = document.getElementById('totalTerminations')?.textContent || '0';
            terminationsStat.textContent = totalTerminations;
        }
    }

    exportCurrentChart() {
        try {
            const canvas = document.getElementById('projectChart');
            if (!canvas) {
                alert('No chart to export');
                return;
            }

            const projectName = document.getElementById('projectName')?.value || 'Unnamed Project';
            const chartTitle = document.getElementById('chartTitle')?.textContent || 'Chart';
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectName}_${chartTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
            
            console.log('📄 Chart exported successfully');
        } catch (error) {
            console.error('Error exporting chart:', error);
            alert('Error exporting chart: ' + error.message);
        }
    }

    refreshCharts() {
        // Refresh all charts when data changes
        if (this.currentChart) {
            // Recreate the current chart
            switch (this.currentChart) {
                case 'time':
                    this.showTimeBreakdownChart();
                    break;
                case 'cost':
                    this.showCostAnalysisChart();
                    break;
                case 'progress':
                    this.showProjectProgressChart();
                    break;
            }
        }
        
        // Always update stats regardless of chart type
        this.updateStatsFromCurrentData();
    }

    updateStatsFromCurrentData() {
        // Update stats based on current data without needing chart data
        const totalTimeStat = document.getElementById('totalTimeStat');
        if (totalTimeStat) {
            const breakdownTotal = document.getElementById('breakdownTotal')?.textContent?.replace(' hours', '') || '0';
            totalTimeStat.textContent = `${parseFloat(breakdownTotal).toFixed(1)} hrs`;
        }
        
        const totalCostStat = document.getElementById('totalCostStat');
        if (totalCostStat) {
            const totalCost = document.getElementById('totalCost')?.textContent?.replace('$', '').replace(',', '') || '0';
            totalCostStat.textContent = `$${parseFloat(totalCost).toLocaleString()}`;
        }
        
        const cablesStat = document.getElementById('cablesStat');
        if (cablesStat) {
            const totalCables = document.getElementById('totalCables')?.textContent || '0';
            cablesStat.textContent = totalCables;
        }
        
        const terminationsStat = document.getElementById('terminationsStat');
        if (terminationsStat) {
            // Use the already calculated total terminations from the calculator
            const totalTerminations = document.getElementById('totalTerminations')?.textContent || '0';
            terminationsStat.textContent = totalTerminations;
        }
    }
} 