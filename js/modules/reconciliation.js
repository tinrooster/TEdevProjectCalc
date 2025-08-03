/**
 * Reconciliation Module
 * Handles connector/termination reconciliation and reporting
 */

export class ReconciliationManager {
    constructor() {
        this.eventListenersInitialized = false;
        console.log('🔧 ReconciliationManager constructor called');
    }

    initializeEventListeners() {
        console.log('🔧 Initializing reconciliation event listeners...');
        
        // Set up event listeners for reconciliation buttons
        const runReportBtn = document.getElementById('runReconciliationBtn');
        const historyBtn = document.getElementById('showHistoryBtn');
        const exportAllBtn = document.getElementById('exportAllBtn');
        const exportCurrentBtn = document.getElementById('exportCurrentBtn');

        console.log('🔍 Found buttons:', {
            runReportBtn: !!runReportBtn,
            historyBtn: !!historyBtn,
            exportAllBtn: !!exportAllBtn,
            exportCurrentBtn: !!exportCurrentBtn
        });

        if (runReportBtn) {
            runReportBtn.addEventListener('click', () => {
                console.log('🎯 Run Report button clicked');
                this.runReconciliation();
            });
            console.log('✅ Run Report button listener added');
        } else {
            console.warn('⚠️ Run Report button not found');
        }

        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                console.log('🎯 History button clicked');
                this.showReconciliationHistory();
            });
            console.log('✅ History button listener added');
        } else {
            console.warn('⚠️ History button not found');
        }

        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                console.log('🎯 Export All button clicked');
                this.exportReconciliationCSV();
            });
            console.log('✅ Export All button listener added');
        } else {
            console.warn('⚠️ Export All button not found');
        }

        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', () => {
                console.log('🎯 Export Current button clicked');
                this.exportCurrentReconciliationCSV();
            });
            console.log('✅ Export Current button listener added');
        } else {
            console.warn('⚠️ Export Current button not found');
        }

        this.eventListenersInitialized = true;
        console.log('✅ All reconciliation event listeners initialized');
    }

    runReconciliation() {
        console.log('🔧 Running enhanced reconciliation...');
        try {
            const reconciliationTimestamp = new Date();
            const formatDate = reconciliationTimestamp.toLocaleDateString();
            const formatTime = reconciliationTimestamp.toLocaleTimeString();
            const isoTimestamp = reconciliationTimestamp.toISOString();

            let reconciliationReport = [];

            // Get project data
            const projectName = document.getElementById('projectName')?.value || 'Unnamed Project';
            console.log('🔍 Project name:', projectName);
            
            // Get active vendors
            const activeVendors = this.getActiveVendors();
            const activeVendorCount = activeVendors.length;
            const activeVendorNamesList = activeVendors.join(', ');
            console.log('🔍 Active vendors:', activeVendors);
            console.log('🔍 Active vendor count:', activeVendorCount);

            // Calculate required connectors/terminations
            const terminationsPerCable = parseFloat(document.getElementById('terminationsPerCable')?.value || 2);
            const totalCables = parseFloat(document.getElementById('totalCables')?.textContent || 0);
            const requiredConnectors = totalCables * terminationsPerCable;
            const connectorWasteFactor = 10; // Default 10% waste factor
            const requiredWithWaste = Math.ceil(requiredConnectors * (1 + connectorWasteFactor / 100));

            console.log('🔍 Cable data:', { terminationsPerCable, totalCables, requiredConnectors });

            // Get ordered quantities from vendor data
            const orderedData = this.getOrderedQuantities();
            console.log('🔍 Ordered data:', orderedData);
            
            // Get required cable quantities by type
            const requiredCableTypes = this.getRequiredCableQuantities();
            console.log('🔍 Required cable types:', requiredCableTypes);

            // Generate reconciliation report
            reconciliationReport.push('=== CONNECTOR/TERMINATION RECONCILIATION ===');
            reconciliationReport.push(`Reconciliation Date: ${formatDate}`);
            reconciliationReport.push(`Reconciliation Time: ${formatTime}`);
            reconciliationReport.push(`Project: ${projectName}`);
            reconciliationReport.push(`Active Vendors (${activeVendorCount}): ${activeVendorNamesList}`);
            reconciliationReport.push('');
            reconciliationReport.push(`Total terminations required: ${requiredConnectors}`);
            reconciliationReport.push('');

            // BNC Connectors/Terminations
            const bncRequired = requiredConnectors;
            const bncOrdered = orderedData.bnc || 0;
            const bncDifference = bncOrdered - bncRequired;

            reconciliationReport.push(`BNC Connectors/Terminations:`);
            reconciliationReport.push(`  Required: ${bncRequired}`);
            reconciliationReport.push(`  Ordered: ${bncOrdered}`);

            if (bncDifference > 0) {
                reconciliationReport.push(`  ℹ️  Over-ordered: ${bncDifference} extra`);
            } else if (bncDifference < 0) {
                reconciliationReport.push(`  ⚠️  NEED TO ORDER: ${Math.abs(bncDifference)} more`);
            } else {
                reconciliationReport.push(`  ✅ Perfect match`);
            }
            reconciliationReport.push('');

            // Cable quantity reconciliation
            const cableOrdered = orderedData.cable || 0;
            const cableCalculated = parseFloat(document.getElementById('avgCableLength')?.value || 0) * totalCables;

            reconciliationReport.push('=== CABLE QUANTITY RECONCILIATION ===');
            reconciliationReport.push(`Cable ordered: ${cableOrdered}ft`);
            reconciliationReport.push(`Calculated need: ${cableCalculated}ft`);
            reconciliationReport.push('');

            // Cable type breakdown
            if (Object.keys(orderedData.cableTypes).length > 0) {
                reconciliationReport.push('=== CABLE TYPE BREAKDOWN ===');
                
                // Show required vs ordered by cable type
                Object.keys(orderedData.cableTypes).forEach(cableType => {
                    const orderedQty = orderedData.cableTypes[cableType];
                    const requiredQty = requiredCableTypes[cableType] || 0;
                    const difference = orderedQty - requiredQty;
                    
                    reconciliationReport.push(`${cableType} Cable:`);
                    reconciliationReport.push(`  Required: ${requiredQty}`);
                    reconciliationReport.push(`  Ordered: ${orderedQty}`);
                    
                    if (difference > 0) {
                        reconciliationReport.push(`  ℹ️  Over-ordered: ${difference} extra`);
                    } else if (difference < 0) {
                        reconciliationReport.push(`  ⚠️  NEED TO ORDER: ${Math.abs(difference)} more`);
                    } else {
                        reconciliationReport.push(`  ✅ Perfect match`);
                    }
                    reconciliationReport.push('');
                });
                
                // Show any required cable types that weren't ordered
                Object.keys(requiredCableTypes).forEach(cableType => {
                    if (!orderedData.cableTypes[cableType]) {
                        reconciliationReport.push(`${cableType} Cable:`);
                        reconciliationReport.push(`  Required: ${requiredCableTypes[cableType]}`);
                        reconciliationReport.push(`  Ordered: 0`);
                        reconciliationReport.push(`  ⚠️  NEED TO ORDER: ${requiredCableTypes[cableType]} total`);
                        reconciliationReport.push('');
                    }
                });
            }

            console.log('🔍 Generated report:', reconciliationReport.join('\n'));

            // Update status
            this.updateReconciliationStatus('Completed');
            this.updateQuickStatus(this.generateQuickStatus(requiredConnectors, orderedData, cableCalculated, cableOrdered));
            this.updateReconciliationFlag(requiredConnectors, orderedData, cableCalculated, cableOrdered);

            // Display report
            const reportElement = document.getElementById('reconciliationReport');
            if (reportElement) {
                reportElement.textContent = reconciliationReport.join('\n');
                console.log('✅ Report displayed in UI');
            } else {
                console.warn('⚠️ Report element not found');
            }

            // Save to history
            this.saveReconciliationToHistory({
                timestamp: isoTimestamp,
                date: formatDate,
                time: formatTime,
                project: projectName,
                report: reconciliationReport.join('\n'),
                data: {
                    required: requiredConnectors,
                    ordered: orderedData,
                    cableCalculated: cableCalculated,
                    cableOrdered: cableOrdered,
                    requiredCableTypes: requiredCableTypes
                }
            });

        } catch (error) {
            console.error('❌ Error running reconciliation:', error);
            this.updateReconciliationStatus('Error');
            this.updateQuickStatus('Error running reconciliation');
            
            // Reset flag on error
            const flagElement = document.getElementById('reconciliationFlag');
            if (flagElement) {
                flagElement.textContent = 'Error';
                flagElement.style.background = '#e74c3c';
                flagElement.style.color = 'white';
            }
        }
    }

    getActiveVendors() {
        const vendors = [];
        
        // Use vendor manager if available, otherwise fall back to DOM checking
        if (window.vendorManager && window.vendorManager.vendors) {
            Object.entries(window.vendorManager.vendors).forEach(([vendorNum, vendor]) => {
                if (vendor.active && vendor.name) {
                    vendors.push(vendor.name);
                } else if (vendor.active) {
                    vendors.push(`Vendor ${vendorNum}`);
                }
            });
        } else {
            // Fallback to DOM checking
            for (let i = 1; i <= 3; i++) {
                const vendorToggle = document.querySelector(`[data-vendor="${i}"]`);
                if (vendorToggle && vendorToggle.classList.contains('active')) {
                    const vendorName = document.getElementById(`vendor${i}Name`)?.value || `Vendor ${i}`;
                    vendors.push(vendorName);
                }
            }
        }
        
        return vendors;
    }

    getOrderedQuantities() {
        const data = { 
            bnc: 0, 
            cable: 0,
            cableTypes: {} // Track cable types separately
        };
        
        // Sum up quantities from all active vendors
        for (let i = 1; i <= 3; i++) {
            // Check if vendor is active using vendor manager
            let isActive = false;
            if (window.vendorManager && window.vendorManager.vendors && window.vendorManager.vendors[i]) {
                isActive = window.vendorManager.vendors[i].active;
            } else {
                // Fallback to DOM checking
                const vendorToggle = document.querySelector(`[data-vendor="${i}"]`);
                isActive = vendorToggle && vendorToggle.classList.contains('active');
            }
            
            if (isActive) {
                const vendorItems = document.querySelectorAll(`#vendor${i}Details .vendor-item-desc`);
                vendorItems.forEach(item => {
                    const desc = item.value.toLowerCase();
                    const qty = parseFloat(item.closest('.line-item').querySelector('.vendor-item-qty')?.value || 0);
                    
                    if (desc.includes('bnc') || desc.includes('connector') || desc.includes('termination')) {
                        data.bnc += qty;
                    } else if (desc.includes('cable') || desc.includes('1855') || desc.includes('1505') || desc.includes('1694') || desc.includes('cat6') || desc.includes('cat5')) {
                        data.cable += qty;
                        
                        // Track cable types with improved detection
                        if (desc.includes('1855') || desc.includes('1855a') || desc.includes('1855a/b')) {
                            data.cableTypes['1855'] = (data.cableTypes['1855'] || 0) + qty;
                        } else if (desc.includes('1505') || desc.includes('1505a') || desc.includes('1505a/b')) {
                            data.cableTypes['1505'] = (data.cableTypes['1505'] || 0) + qty;
                        } else if (desc.includes('1694') || desc.includes('1694a') || desc.includes('1694a/b')) {
                            data.cableTypes['1694'] = (data.cableTypes['1694'] || 0) + qty;
                        } else if (desc.includes('cat6') || desc.includes('category 6') || desc.includes('cat 6')) {
                            data.cableTypes['Cat6'] = (data.cableTypes['Cat6'] || 0) + qty;
                        } else if (desc.includes('cat5') || desc.includes('category 5') || desc.includes('cat 5')) {
                            data.cableTypes['Cat5'] = (data.cableTypes['Cat5'] || 0) + qty;
                        } else if (desc.includes('cable') || desc.includes('coax') || desc.includes('coaxial')) {
                            // Generic cable type
                            data.cableTypes['Other'] = (data.cableTypes['Other'] || 0) + qty;
                        }
                    }
                });
            }
        }
        
        return data;
    }

    getRequiredCableQuantities() {
        const cableTypes = {};
        
        // Check if we're in calculated mode (line items) or average mode
        const cableLengthMode = document.querySelector('input[name="cableLengthMode"]:checked')?.value || 'average';
        
        if (cableLengthMode === 'calculated') {
            // Get cable quantities from line items
            const lineItems = document.querySelectorAll('#cableLengths .line-item');
            lineItems.forEach(item => {
                const cableTypeInput = item.querySelector('.cable-type');
                const qtyInput = item.querySelector('.cable-qty');
                
                if (cableTypeInput && qtyInput) {
                    const cableType = cableTypeInput.value.trim();
                    const qty = parseFloat(qtyInput.value) || 0;
                    
                    if (cableType && qty > 0) {
                        // Normalize cable type names to match vendor data
                        let normalizedType = cableType;
                        if (cableType === 'cat6') normalizedType = 'Cat6';
                        else if (cableType === '1855') normalizedType = '1855';
                        else if (cableType === '1505') normalizedType = '1505';
                        else if (cableType === '1694') normalizedType = '1694';
                        else if (cableType === 'other') normalizedType = 'Other';
                        
                        cableTypes[normalizedType] = (cableTypes[normalizedType] || 0) + qty;
                    }
                }
            });
        } else {
            // Average mode - we don't have specific cable types, so we'll use a generic calculation
            const totalCables = parseFloat(document.getElementById('totalCables')?.textContent || 0);
            if (totalCables > 0) {
                cableTypes['Total Cables'] = totalCables;
            }
        }
        
        return cableTypes;
    }

    generateQuickStatus(required, orderedData, cableCalculated, cableOrdered) {
        const bncStatus = orderedData.bnc >= required ? '✅' : '⚠️';
        const cableStatus = cableOrdered >= cableCalculated ? '✅' : '⚠️';
        
        if (orderedData.bnc < required || cableOrdered < cableCalculated) {
            return `${bncStatus}${cableStatus} Cable quantity mismatches detected`;
        } else {
            return '✅ All quantities reconciled';
        }
    }

    updateReconciliationStatus(status) {
        const statusElement = document.getElementById('reconciliationStatus');
        if (statusElement) {
            statusElement.textContent = status;
            if (status === 'Completed') {
                statusElement.style.background = '#27ae60';
            } else if (status === 'Error') {
                statusElement.style.background = '#e74c3c';
            } else {
                statusElement.style.background = '#95a5a6';
            }
        }
    }

         updateQuickStatus(status) {
         const quickStatusElement = document.getElementById('reconciliationQuickStatus');
         if (quickStatusElement) {
             quickStatusElement.textContent = status;
             quickStatusElement.style.color = '#495057'; // Ensure dark text color
         }
     }

     updateReconciliationFlag(required, orderedData, cableCalculated, cableOrdered) {
         const flagElement = document.getElementById('reconciliationFlag');
         if (!flagElement) return;

         // Check if there are any issues
         const hasIssues = orderedData.bnc < required || cableOrdered < cableCalculated;
         
         if (hasIssues) {
             flagElement.textContent = 'SHORTAGES';
             flagElement.style.background = '#e74c3c'; // Red background
             flagElement.style.color = 'white';
         } else {
             flagElement.textContent = 'OK';
             flagElement.style.background = '#27ae60'; // Green background
             flagElement.style.color = 'white';
         }
     }

    showReconciliationHistory() {
        const historyView = document.getElementById('reconciliationHistoryView');
        const reportView = document.getElementById('reconciliationReport');
        
        if (historyView && reportView) {
            historyView.style.display = 'block';
            reportView.style.display = 'none';
            
            this.loadReconciliationHistory();
        }
    }

    loadReconciliationHistory() {
        try {
            const historyList = document.getElementById('reconciliationHistoryList');
            if (!historyList) return;

            const reconciliationHistory = JSON.parse(localStorage.getItem('reconciliationHistory') || '[]');
            
            if (reconciliationHistory && reconciliationHistory.length > 0) {
                const recentReconciliations = reconciliationHistory.slice(-10);
                const historyText = recentReconciliations.map(recon => 
                    `${recon.date} ${recon.time} - ${recon.project}\n${recon.report}\n${'='.repeat(50)}`
                ).join('\n\n');
                historyList.textContent = historyText;
            } else {
                historyList.textContent = 'No reconciliation history available';
            }
        } catch (error) {
            console.error('Error loading reconciliation history:', error);
            const historyList = document.getElementById('reconciliationHistoryList');
            if (historyList) {
                historyList.textContent = 'Error loading reconciliation history: ' + error.message;
            }
        }
    }

    saveReconciliationToHistory(reconciliationData) {
        try {
            const reconciliationHistory = JSON.parse(localStorage.getItem('reconciliationHistory') || '[]');
            reconciliationHistory.push(reconciliationData);
            
            // Keep only last 50 reconciliations to avoid storage bloat
            if (reconciliationHistory.length > 50) {
                reconciliationHistory.splice(0, reconciliationHistory.length - 50);
            }
            
            localStorage.setItem('reconciliationHistory', JSON.stringify(reconciliationHistory));
        } catch (error) {
            console.error('Error saving reconciliation to history:', error);
        }
    }

    exportReconciliationCSV() {
        try {
            const reconciliationHistory = JSON.parse(localStorage.getItem('reconciliationHistory') || '[]');
            
            if (reconciliationHistory.length === 0) {
                alert('No reconciliation history to export');
                return;
            }

            const projectName = document.getElementById('projectName')?.value || 'Unnamed Project';
            const fileName = this.generateFileName(projectName, 'ReconciliationHistory', 'csv');

            let csvData = ['Reconciliation History Export\n'];
            csvData.push('Date,Time,Project,Status\n');
            
            reconciliationHistory.forEach(recon => {
                csvData.push(`${recon.date},${recon.time},${recon.project},Completed\n`);
            });

            this.downloadCSV(csvData.join(''), fileName);
        } catch (error) {
            console.error('Error exporting reconciliation CSV:', error);
            alert('Error exporting reconciliation data');
        }
    }

    exportCurrentReconciliationCSV() {
        try {
            const reportElement = document.getElementById('reconciliationReport');
            if (!reportElement || reportElement.textContent === 'Run reconciliation to generate report') {
                alert('No current reconciliation to export. Please run a reconciliation first.');
                return;
            }

            const projectName = document.getElementById('projectName')?.value || 'Unnamed Project';
            const fileName = this.generateFileName(projectName, 'ReconciliationReport', 'csv');

            const csvData = ['Current Reconciliation Report\n'];
            csvData.push(reportElement.textContent);

            this.downloadCSV(csvData.join(''), fileName);
        } catch (error) {
            console.error('Error exporting current reconciliation CSV:', error);
            alert('Error exporting current reconciliation data');
        }
    }

    generateFileName(projectName, actionType, extension) {
        const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
        const dateStamp = new Date().toISOString().split('T')[0];
        const timeStamp = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
        
        // Get the next incremental value for this project and action type
        const key = `${sanitizedProjectName}_${actionType}_${dateStamp}`;
        const currentCount = parseInt(localStorage.getItem(key) || '0') + 1;
        localStorage.setItem(key, currentCount.toString());
        
        return `${sanitizedProjectName}_${actionType}_${dateStamp}_${timeStamp}_v${currentCount.toString().padStart(3, '0')}.${extension}`;
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
} 