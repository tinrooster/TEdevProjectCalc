/**
 * Project Management Module
 * Handles project saving, loading, auto-save, and project state management
 */

export class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;
        this.lastSavedData = null;
        
        // Initialize auto-save
        this.initializeAutoSave();
    }

    /**
     * Initialize auto-save functionality
     */
    initializeAutoSave() {
        // Check if auto-save is enabled in localStorage
        const savedAutoSave = localStorage.getItem('autoSaveEnabled');
        this.autoSaveEnabled = savedAutoSave !== 'false'; // Default to true

        // Update UI checkbox
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.checked = this.autoSaveEnabled;
        }

        // Start auto-save interval if enabled
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }
    }

    /**
     * Start auto-save interval
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            if (this.autoSaveEnabled) {
                this.autoSave();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    /**
     * Stop auto-save interval
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Toggle auto-save
     */
    toggleAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        localStorage.setItem('autoSaveEnabled', enabled.toString());

        if (enabled) {
            this.startAutoSave();
            this.autoSave(); // Save immediately
        } else {
            this.stopAutoSave();
        }
    }

    /**
     * Auto-save current project data
     */
    autoSave() {
        try {
            const projectData = this.getCurrentProjectData();
            console.log('🔧 Auto-saving project data:', projectData);
            const dataString = JSON.stringify(projectData);
            
            // Only save if data has changed
            if (dataString !== this.lastSavedData) {
                localStorage.setItem('autoSavedProject', dataString);
                this.lastSavedData = dataString;
                console.log('💾 Auto-saved project data');
            } else {
                console.log('💾 No changes detected, skipping auto-save');
            }
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    /**
     * Get current project data
     */
    getCurrentProjectData() {
        const projectData = {
            header: this.getProjectHeader(),
            calculator: this.getCalculatorData(),
            vendor: this.getVendorData(),
            inputs: this.getInputValues(),
            settings: this.getSettingsData(),
            summaryCards: this.getSummaryCardsData(),
            timestamp: new Date().toISOString()
        };
        
        return projectData;
    }

    /**
     * Get project header data
     */
    getProjectHeader() {
        return {
            projectName: document.getElementById('projectName')?.value || '',
            projectNumber: document.getElementById('projectNumber')?.value || '',
            customerName: document.getElementById('customerName')?.value || '',
            date: document.getElementById('projectDate')?.value || ''
        };
    }

    /**
     * Get calculator data
     */
    getCalculatorData() {
        if (window.calculator) {
            return window.calculator.getState();
        }
        return {};
    }

    /**
     * Get vendor data
     */
    getVendorData() {
        if (window.vendorManager) {
            return window.vendorManager.getState();
        }
        return {};
    }

    /**
     * Get all input values from the form
     */
    getInputValues() {
        const inputs = {};
        
        // Get all input elements
        const inputElements = document.querySelectorAll('input, select, textarea');
        
        inputElements.forEach(input => {
            const id = input.id;
            const name = input.name;
            const key = id || name;
            
            if (key) {
                if (input.type === 'checkbox') {
                    inputs[key] = input.checked;
                } else if (input.type === 'number') {
                    inputs[key] = parseFloat(input.value) || 0;
                } else {
                    inputs[key] = input.value;
                }
            }
        });
        
        return inputs;
    }

    /**
     * Get settings data
     */
    getSettingsData() {
        return {
            cableLengthMode: localStorage.getItem('cableLengthMode') || 'feet',
            laborMode: localStorage.getItem('laborMode') || 'hours',
            autoSaveEnabled: this.autoSaveEnabled,
            theme: localStorage.getItem('theme') || 'light',
            currency: localStorage.getItem('currency') || 'USD'
        };
    }

    /**
     * Get summary cards data
     */
    getSummaryCardsData() {
        const summaryCards = {};
        const cardElements = document.querySelectorAll('.summary-card');
        
        cardElements.forEach(card => {
            const cardId = card.id;
            if (cardId) {
                const valueElement = card.querySelector('.card-value');
                const labelElement = card.querySelector('.card-label');
                
                summaryCards[cardId] = {
                    value: valueElement?.textContent || '',
                    label: labelElement?.textContent || '',
                    visible: card.style.display !== 'none'
                };
            }
        });
        
        return summaryCards;
    }

    /**
     * Save project manually
     */
    saveProject() {
        try {
            const projectData = this.getCurrentProjectData();
            const projectName = projectData.header.projectName || 'Untitled Project';
            const fileName = this.generateFileName(projectName, 'save', 'json');
            
            // Save to localStorage
            localStorage.setItem('savedProject_' + fileName, JSON.stringify(projectData));
            
            // Update current project
            this.currentProject = fileName;
            localStorage.setItem('currentProject', fileName);
            
            // Create and download file
            const dataStr = JSON.stringify(projectData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = fileName;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(link.href);
            
            console.log('💾 Project saved:', fileName);
            this.updateProjectDisplay();
            
            // Log the save event
            this.logProjectEvent('Project Saved', `Project "${projectName}" saved successfully`);
            
            return fileName;
        } catch (error) {
            console.error('Save project error:', error);
            return null;
        }
    }

    /**
     * Load project
     */
    loadProject() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const projectData = JSON.parse(event.target.result);
                            this.loadProjectData(projectData);
                            
                            // Log the load event
                            const projectName = projectData.header?.projectName || 'Unnamed Project';
                            this.logProjectEvent('Project Loaded', `Project "${projectName}" loaded successfully`);
                        } catch (error) {
                            console.error('Error parsing project file:', error);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            
            input.click();
        } catch (error) {
            console.error('Load project error:', error);
        }
    }

    /**
     * Load project data
     */
    loadProjectData(data) {
        try {
            console.log('🔧 Loading project data:', data);
            
            // Clear auto-saved data to prevent hardcoded values from persisting
            localStorage.removeItem('autoSavedProject');
            console.log('🗑️ Cleared auto-saved project data to prevent hardcoded values from persisting');
            
            if (data.header) {
                this.loadProjectHeader(data.header);
            }
            
            if (data.calculator) {
                this.loadCalculatorData(data.calculator);
            }
            
            if (data.vendor) {
                this.loadVendorData(data.vendor);
            }
            
            if (data.inputs) {
                this.loadInputValues(data.inputs);
            }
            
            if (data.settings) {
                this.loadSettingsData(data.settings);
            }
            
            if (data.summaryCards) {
                this.loadSummaryCardsData(data.summaryCards);
            }
            
            // Trigger calculation update
            this.triggerCalculationUpdate();
            
            console.log('✅ Project data loaded successfully');
        } catch (error) {
            console.error('Error loading project data:', error);
        }
    }

    /**
     * Load project header
     */
    loadProjectHeader(header) {
        if (header.projectName) {
            const element = document.getElementById('projectName');
            if (element) element.value = header.projectName;
        }
        
        if (header.projectNumber) {
            const element = document.getElementById('projectNumber');
            if (element) element.value = header.projectNumber;
        }
        
        if (header.customerName) {
            const element = document.getElementById('customerName');
            if (element) element.value = header.customerName;
        }
        
        if (header.date) {
            const element = document.getElementById('projectDate');
            if (element) element.value = header.date;
        }
    }

    /**
     * Load calculator data
     */
    loadCalculatorData(calculator) {
        if (window.calculator && calculator) {
            window.calculator.loadState(calculator);
        }
    }

    /**
     * Load vendor data
     */
    loadVendorData(vendor) {
        if (window.vendorManager && vendor) {
            window.vendorManager.loadState(vendor);
        }
    }

    /**
     * Load input values
     */
    loadInputValues(inputs) {
        Object.entries(inputs).forEach(([key, value]) => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'number') {
                    element.value = value;
                } else {
                    element.value = value;
                }
                
                // Trigger change event
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    /**
     * Load settings data
     */
    loadSettingsData(settings) {
        if (settings.cableLengthMode) {
            this.setCableLengthMode(settings.cableLengthMode);
        }
        
        if (settings.laborMode) {
            this.setLaborMode(settings.laborMode);
        }
        
        if (settings.autoSaveEnabled !== undefined) {
            this.toggleAutoSave(settings.autoSaveEnabled);
        }
        
        if (settings.theme) {
            localStorage.setItem('theme', settings.theme);
            // Apply theme if theme manager exists
            if (window.themeManager) {
                window.themeManager.setTheme(settings.theme);
            }
        }
        
        if (settings.currency) {
            localStorage.setItem('currency', settings.currency);
        }
    }

    /**
     * Load summary cards data
     */
    loadSummaryCardsData(summaryCards) {
        Object.entries(summaryCards).forEach(([cardId, cardData]) => {
            const card = document.getElementById(cardId);
            if (card) {
                const valueElement = card.querySelector('.card-value');
                const labelElement = card.querySelector('.card-label');
                
                if (valueElement && cardData.value) {
                    valueElement.textContent = cardData.value;
                }
                
                if (labelElement && cardData.label) {
                    labelElement.textContent = cardData.label;
                }
                
                if (cardData.visible !== undefined) {
                    card.style.display = cardData.visible ? 'block' : 'none';
                }
            }
        });
    }

    /**
     * Update project display
     */
    updateProjectDisplay() {
        const projectName = document.getElementById('projectName')?.value || 'Untitled Project';
        const projectNumber = document.getElementById('projectNumber')?.value || '';
        
        // Update page title
        document.title = projectName + (projectNumber ? ` (${projectNumber})` : '') + ' - KGO Project Calculator';
        
        // Update any project display elements
        const projectDisplayElements = document.querySelectorAll('.project-display');
        projectDisplayElements.forEach(element => {
            element.textContent = projectName;
        });
    }

    /**
     * Set cable length mode
     */
    setCableLengthMode(mode) {
        localStorage.setItem('cableLengthMode', mode);
        
        // Update UI
        const modeButtons = document.querySelectorAll('.cable-length-mode');
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        
        // Update placeholders and labels
        const cableInputs = document.querySelectorAll('.cable-length-input');
        cableInputs.forEach(input => {
            input.placeholder = `Length (${mode})`;
        });
        
        // Trigger recalculation
        this.triggerCalculationUpdate();
    }

    /**
     * Set labor mode
     */
    setLaborMode(mode) {
        localStorage.setItem('laborMode', mode);
        
        // Update UI
        const modeButtons = document.querySelectorAll('.labor-mode');
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        
        // Update placeholders and labels
        const laborInputs = document.querySelectorAll('.labor-input');
        laborInputs.forEach(input => {
            input.placeholder = `Hours (${mode})`;
        });
        
        // Trigger recalculation
        this.triggerCalculationUpdate();
    }

    /**
     * Reset project
     */
    resetProject() {
        if (confirm('Are you sure you want to reset the project? This will clear all data.')) {
            try {
                // Log the reset event before clearing data
                const projectName = document.getElementById('projectName')?.value || 'Untitled Project';
                this.logProjectEvent('Project Reset', `Project "${projectName}" reset - all data cleared`);
                
                // Clear all input fields
                const inputs = document.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.type === 'checkbox') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });
                
                // Reset calculator
                if (window.calculator) {
                    window.calculator.reset();
                }
                
                // Reset vendor manager
                if (window.vendorManager) {
                    window.vendorManager.resetVendorStates();
                }
                
                // Reset project manager
                this.currentProject = null;
                localStorage.removeItem('currentProject');
                
                // Clear auto-saved data
                localStorage.removeItem('autoSavedProject');
                
                // Reset summary cards
                const summaryCards = document.querySelectorAll('.summary-card .card-value');
                summaryCards.forEach(card => {
                    card.textContent = '$0.00';
                });
                
                // Update project display
                this.updateProjectDisplay();
                
                // Trigger calculation update
                this.triggerCalculationUpdate();
                
                console.log('✅ Project reset successfully');
            } catch (error) {
                console.error('Error resetting project:', error);
            }
        }
    }

    /**
     * Load saved data on app startup
     */
    loadSavedData() {
        try {
            // Log application start
            this.logProjectEvent('Application Started', 'TEdevProjectCalc application loaded and initialized');
            
            // Load auto-saved data if available
            const autoSavedData = localStorage.getItem('autoSavedProject');
            if (autoSavedData) {
                const projectData = JSON.parse(autoSavedData);
                console.log('🔧 Loading auto-saved data:', projectData);
                
                // Check if auto-saved data contains hardcoded cable line items
                const hasHardcodedValues = this.checkForHardcodedValues(projectData);
                if (hasHardcodedValues) {
                    console.log('🚫 Auto-saved data contains hardcoded values, skipping auto-save load');
                    localStorage.removeItem('autoSavedProject');
                    console.log('🗑️ Cleared auto-saved data containing hardcoded values');
                } else {
                    this.loadProjectData(projectData);
                    
                    // Log auto-save load
                    const projectName = projectData.header?.projectName || 'Untitled Project';
                    this.logProjectEvent('Auto-Save Loaded', `Auto-saved data for "${projectName}" restored`);
                    return;
                }
            }
            
            // Load current project if available
            const currentProject = localStorage.getItem('currentProject');
            if (currentProject) {
                const savedData = localStorage.getItem('savedProject_' + currentProject);
                if (savedData) {
                    const projectData = JSON.parse(savedData);
                    console.log('🔧 Loading current project:', currentProject);
                    this.loadProjectData(projectData);
                    
                    // Log project load
                    const projectName = projectData.header?.projectName || 'Untitled Project';
                    this.logProjectEvent('Project Loaded', `Project "${projectName}" loaded successfully`);
                    return;
                }
            }
            
            // Only load individual settings if no project data was loaded
            // This prevents default settings from overriding user input
            console.log('🔧 No saved project data found, loading only essential settings');
            this.loadEssentialSettingsOnly();
            
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    /**
     * Check if project data contains hardcoded values
     */
    checkForHardcodedValues(projectData) {
        try {
            // Check for hardcoded cable line items
            if (projectData.calculator && projectData.calculator.lineItems && projectData.calculator.lineItems.cableLineItems) {
                const cableLineItems = projectData.calculator.lineItems.cableLineItems;
                
                // Check for the specific hardcoded values: 75, 192, 55, 50, 40, 65
                const hardcodedValues = ['75', '192', '55', '50', '40', '65'];
                const foundHardcodedValues = cableLineItems.some(item => 
                    hardcodedValues.includes(item.qty) || hardcodedValues.includes(item.length)
                );
                
                if (foundHardcodedValues) {
                    console.log('🚫 Found hardcoded values in cable line items:', cableLineItems);
                    return true;
                }
            }
            
            // Check for hardcoded values in legacy format
            if (projectData.calculator && projectData.calculator.cableLineItems) {
                const cableLineItems = projectData.calculator.cableLineItems;
                
                // Check for the specific hardcoded values: 75, 192, 55, 50, 40, 65
                const hardcodedValues = ['75', '192', '55', '50', '40', '65'];
                const foundHardcodedValues = cableLineItems.some(item => 
                    hardcodedValues.includes(item.qty) || hardcodedValues.includes(item.length)
                );
                
                if (foundHardcodedValues) {
                    console.log('🚫 Found hardcoded values in legacy cable line items:', cableLineItems);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking for hardcoded values:', error);
            return false;
        }
    }

    /**
     * Load only essential settings that don't override user input
     */
    loadEssentialSettingsOnly() {
        // Load cable length mode
        const cableMode = localStorage.getItem('cableLengthMode');
        if (cableMode) {
            this.setCableLengthMode(cableMode);
        }
        
        // Load labor mode
        const laborMode = localStorage.getItem('laborMode');
        if (laborMode) {
            this.setLaborMode(laborMode);
        }
        
        // Load theme
        const theme = localStorage.getItem('theme');
        if (theme && window.themeManager) {
            window.themeManager.setTheme(theme);
        }
        
        // Load currency
        const currency = localStorage.getItem('currency');
        if (currency) {
            // Apply currency formatting if currency manager exists
            if (window.currencyManager) {
                window.currencyManager.setCurrency(currency);
            }
        }
        
        console.log('✅ Essential settings loaded from localStorage');
    }

    /**
     * Trigger calculation update
     */
    triggerCalculationUpdate() {
        if (window.calculator) {
            window.calculator.calculate();
        }
    }

    /**
     * Refresh project data and update UI
     */
    refreshProjectData() {
        console.log('🔄 Refreshing project data...');
        
        try {
            // Update project display
            this.updateProjectDisplay();
            
            // Trigger calculation update
            this.triggerCalculationUpdate();
            
            // Update any project-related UI elements
            this.loadSavedData();
            
            console.log('✅ Project data refreshed successfully');
        } catch (error) {
            console.error('❌ Error refreshing project data:', error);
        }
    }

    /**
     * Export to Excel
     */
    exportToExcel() {
        try {
            console.log('🔍 Starting Excel export...');
            console.log('🔍 XLSX library available:', typeof XLSX !== 'undefined');
            console.log('🔍 ExcelJS library available:', typeof ExcelJS !== 'undefined');
            
            const projectData = this.getCurrentProjectData();
            const projectName = projectData.header.projectName || 'Untitled Project';
            
            // Create workbook using xlsx library
            const workbook = XLSX.utils.book_new();
            
            // Create summary sheet
            const summaryData = this.createSummaryData(projectData);
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Create breakdown sheet
            const breakdownData = this.createBreakdownData(projectData);
            const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownData);
            XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Breakdown');
            
            // Generate file name
            const fileName = this.generateFileName(projectName, 'export', 'xlsx');
            
            // Download file
            XLSX.writeFile(workbook, fileName);
            
            console.log('📊 Excel export completed:', fileName);
        } catch (error) {
            console.error('Excel export error:', error);
        }
    }

    /**
     * Create summary data for Excel export
     */
    createSummaryData(projectData) {
        const data = [];
        
        // Add project header
        data.push(['Project Summary']);
        data.push(['Project Name:', projectData.header.projectName || '']);
        data.push(['Project Number:', projectData.header.projectNumber || '']);
        data.push(['Customer:', projectData.header.customerName || '']);
        data.push(['Date:', projectData.header.date || '']);
        data.push([]);
        
        // Add summary cards data
        data.push(['Summary Cards']);
        Object.entries(projectData.summaryCards || {}).forEach(([cardId, cardData]) => {
            data.push([cardData.label || cardId, cardData.value || '']);
        });
        
        return data;
    }

    /**
     * Create breakdown data for Excel export
     */
    createBreakdownData(projectData) {
        const data = [];
        
        // Add calculator breakdown
        if (projectData.calculator) {
            data.push(['Calculator Breakdown']);
            data.push(['Category', 'Amount']);
            
            Object.entries(projectData.calculator).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    data.push([key, value]);
                }
            });
            data.push([]);
        }
        
        // Add vendor breakdown
        if (projectData.vendor) {
            data.push(['Vendor Breakdown']);
            data.push(['Vendor', 'Status', 'Items', 'Total']);
            
            Object.entries(projectData.vendor.vendors || {}).forEach(([vendorNum, vendor]) => {
                const itemCount = vendor.items ? vendor.items.length : 0;
                const total = vendor.items ? vendor.items.reduce((sum, item) => sum + (item.qty * item.cost), 0) : 0;
                data.push([vendor.name || `Vendor ${vendorNum}`, vendor.active ? 'Active' : 'Inactive', itemCount, total]);
            });
        }
        
        return data;
    }

    /**
     * Create summary sheet (legacy function for ExcelJS)
     */
    createSummarySheet(projectData, worksheet) {
        // Add project header
        worksheet.addRow(['Project Summary']);
        worksheet.addRow(['Project Name:', projectData.header.projectName || '']);
        worksheet.addRow(['Project Number:', projectData.header.projectNumber || '']);
        worksheet.addRow(['Customer:', projectData.header.customerName || '']);
        worksheet.addRow(['Date:', projectData.header.date || '']);
        worksheet.addRow([]);
        
        // Add summary cards data
        worksheet.addRow(['Summary Cards']);
        Object.entries(projectData.summaryCards || {}).forEach(([cardId, cardData]) => {
            worksheet.addRow([cardData.label || cardId, cardData.value || '']);
        });
    }

    /**
     * Create breakdown sheet
     */
    createBreakdownSheet(projectData, worksheet) {
        // Add calculator breakdown
        if (projectData.calculator) {
            worksheet.addRow(['Calculator Breakdown']);
            worksheet.addRow(['Category', 'Amount']);
            
            Object.entries(projectData.calculator).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    worksheet.addRow([key, value]);
                }
            });
            worksheet.addRow([]);
        }
        
        // Add vendor breakdown
        if (projectData.vendor) {
            worksheet.addRow(['Vendor Breakdown']);
            worksheet.addRow(['Vendor', 'Status', 'Items', 'Total']);
            
            Object.entries(projectData.vendor.vendors || {}).forEach(([vendorNum, vendor]) => {
                const itemCount = vendor.items ? vendor.items.length : 0;
                const total = vendor.items ? vendor.items.reduce((sum, item) => sum + (item.qty * item.cost), 0) : 0;
                worksheet.addRow([vendor.name || `Vendor ${vendorNum}`, vendor.active ? 'Active' : 'Inactive', itemCount, total]);
            });
        }
    }

    /**
     * Generate file name
     */
    generateFileName(projectName, actionType, extension) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
        return `${sanitizedName}_${timestamp}_${actionType}.${extension}`;
    }

    /**
     * Get state for persistence
     */
    getState() {
        return {
            currentProject: this.currentProject,
            autoSaveEnabled: this.autoSaveEnabled,
            lastSavedData: this.lastSavedData
        };
    }

    /**
     * Load state from persistence
     */
    loadState(state) {
        if (state.currentProject) {
            this.currentProject = state.currentProject;
        }
        
        if (state.autoSaveEnabled !== undefined) {
            this.autoSaveEnabled = state.autoSaveEnabled;
        }
        
        if (state.lastSavedData) {
            this.lastSavedData = state.lastSavedData;
        }
    }

    /**
     * Save default settings
     */
    saveDefaultSettings() {
        try {
            const defaultSettings = {
                terminationsPerCable: document.getElementById('terminationsPerCable')?.value || '2',
                timePerTermination: document.getElementById('timePerTermination')?.value || '1.5',
                wasteFactor: document.getElementById('wasteFactor')?.value || '7.5',
                connectorWasteFactor: document.getElementById('connectorWasteFactor')?.value || '3.0',
                spoolLength: document.getElementById('spoolLength')?.value || '1000',
                cableCostPerFoot: document.getElementById('cableCostPerFoot')?.value || '0.34',
                terminationCost: document.getElementById('terminationCost')?.value || '2.40',
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('defaultSettings', JSON.stringify(defaultSettings));
            console.log('💾 Default settings saved:', defaultSettings);
            
            // Show success message
            this.showNotification('Default settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving default settings:', error);
            this.showNotification('Error saving default settings: ' + error.message, 'error');
        }
    }

    /**
     * Load default settings
     */
    loadDefaultSettings() {
        try {
            const savedSettings = localStorage.getItem('defaultSettings');
            if (!savedSettings) {
                this.showNotification('No saved default settings found.', 'warning');
                return;
            }
            
            const defaultSettings = JSON.parse(savedSettings);
            console.log('📂 Loading default settings:', defaultSettings);
            
            // Apply settings to form fields
            if (defaultSettings.terminationsPerCable) {
                const element = document.getElementById('terminationsPerCable');
                if (element) element.value = defaultSettings.terminationsPerCable;
            }
            
            if (defaultSettings.timePerTermination) {
                const element = document.getElementById('timePerTermination');
                if (element) element.value = defaultSettings.timePerTermination;
            }
            
            if (defaultSettings.wasteFactor) {
                const element = document.getElementById('wasteFactor');
                if (element) element.value = defaultSettings.wasteFactor;
            }
            
            if (defaultSettings.connectorWasteFactor) {
                const element = document.getElementById('connectorWasteFactor');
                if (element) element.value = defaultSettings.connectorWasteFactor;
            }
            
            if (defaultSettings.spoolLength) {
                const element = document.getElementById('spoolLength');
                if (element) element.value = defaultSettings.spoolLength;
            }
            
            if (defaultSettings.cableCostPerFoot) {
                const element = document.getElementById('cableCostPerFoot');
                if (element) element.value = defaultSettings.cableCostPerFoot;
            }
            
            if (defaultSettings.terminationCost) {
                const element = document.getElementById('terminationCost');
                if (element) element.value = defaultSettings.terminationCost;
            }
            
            // Trigger calculation update
            this.triggerCalculationUpdate();
            
            this.showNotification('Default settings loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error loading default settings:', error);
            this.showNotification('Error loading default settings: ' + error.message, 'error');
        }
    }

    /**
     * Clear default settings
     */
    clearDefaultSettings() {
        try {
            // Reset to factory defaults
            const factoryDefaults = {
                terminationsPerCable: '2',
                timePerTermination: '1.5',
                wasteFactor: '7.5',
                connectorWasteFactor: '3.0',
                spoolLength: '1000',
                cableCostPerFoot: '0.34',
                terminationCost: '2.40'
            };
            
            // Apply factory defaults to form fields
            Object.entries(factoryDefaults).forEach(([fieldId, defaultValue]) => {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.value = defaultValue;
                    // Trigger change event
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            // Remove saved default settings
            localStorage.removeItem('defaultSettings');
            
            // Trigger calculation update
            this.triggerCalculationUpdate();
            
            console.log('🔄 Default settings cleared and reset to factory defaults');
            this.showNotification('Default settings cleared and reset to factory defaults!', 'success');
            
        } catch (error) {
            console.error('Error clearing default settings:', error);
            this.showNotification('Error clearing default settings: ' + error.message, 'error');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
        
        // Add CSS animations if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Log project event to history
     */
    logProjectEvent(eventType, detailMessage) {
        try {
            const projectName = document.getElementById('projectName')?.value || 'Untitled Project';
            const timestamp = new Date();
            
            const event = {
                timestamp: timestamp.toISOString(),
                projectName: projectName,
                eventType: eventType,
                detailMessage: detailMessage
            };
            
            // Get existing history
            const existingHistory = localStorage.getItem('projectHistory');
            let history = existingHistory ? JSON.parse(existingHistory) : [];
            
            // Add new event to beginning of array (most recent first)
            history.unshift(event);
            
            // Keep only last 100 events to prevent localStorage from getting too large
            if (history.length > 100) {
                history = history.slice(0, 100);
            }
            
            // Save updated history
            localStorage.setItem('projectHistory', JSON.stringify(history));
            
            console.log('📝 Project event logged:', event);
        } catch (error) {
            console.error('Error logging project event:', error);
        }
    }

    /**
     * Show project history modal
     */
    showProjectHistory() {
        try {
            // Get project history
            const existingHistory = localStorage.getItem('projectHistory');
            const history = existingHistory ? JSON.parse(existingHistory) : [];
            
            // Create modal HTML
            const modalHTML = `
                <div id="projectHistoryModal" class="modal-overlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                ">
                    <div class="modal-content" style="
                        background: white;
                        border-radius: 8px;
                        width: 90%;
                        max-width: 600px;
                        max-height: 80vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    ">
                        <div class="modal-header" style="
                            background: #495057;
                            color: white;
                            padding: 15px 20px;
                            border-radius: 8px 8px 0 0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        ">
                            <h3 style="margin: 0; font-size: 1.2rem;">Project History</h3>
                            <button id="closeHistoryModal" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                padding: 5px 10px;
                                cursor: pointer;
                                font-size: 1rem;
                            ">✕</button>
                        </div>
                        
                        <div class="modal-body" style="
                            padding: 20px;
                            flex: 1;
                            overflow-y: auto;
                            max-height: 60vh;
                        ">
                            ${this.generateHistoryHTML(history)}
                        </div>
                        
                        <div class="modal-footer" style="
                            padding: 15px 20px;
                            border-top: 1px solid #dee2e6;
                            display: flex;
                            gap: 10px;
                            justify-content: flex-end;
                        ">
                            <button id="clearHistoryBtn" style="
                                background: #dc3545;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                padding: 8px 16px;
                                cursor: pointer;
                                font-size: 0.9rem;
                            ">Clear History</button>
                            <button id="closeHistoryBtn" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                padding: 8px 16px;
                                cursor: pointer;
                                font-size: 0.9rem;
                            ">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add event listeners
            const modal = document.getElementById('projectHistoryModal');
            const closeModal = () => {
                if (modal && modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
            document.getElementById('closeHistoryModal').addEventListener('click', closeModal);
            document.getElementById('closeHistoryBtn').addEventListener('click', closeModal);
            document.getElementById('clearHistoryBtn').addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all project history? This action cannot be undone.')) {
                    this.clearProjectHistory();
                    closeModal();
                }
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            console.log('📋 Project history modal displayed');
        } catch (error) {
            console.error('Error showing project history:', error);
            alert('Error displaying project history: ' + error.message);
        }
    }

    /**
     * Generate HTML for history entries
     */
    generateHistoryHTML(history) {
        if (history.length === 0) {
            return '<p style="text-align: center; color: #6c757d; font-style: italic;">No project history available.</p>';
        }
        
        return history.map(event => {
            const timestamp = new Date(event.timestamp);
            const formattedDate = timestamp.toLocaleDateString() + ', ' + timestamp.toLocaleTimeString();
            
            return `
                <div class="history-entry" style="
                    border-bottom: 1px solid #f1f3f4;
                    padding: 12px 0;
                    margin-bottom: 8px;
                ">
                    <div style="
                        font-size: 0.8rem;
                        color: #6c757d;
                        margin-bottom: 4px;
                    ">${formattedDate}</div>
                    <div style="
                        font-weight: 500;
                        color: #333;
                        margin-bottom: 2px;
                    ">${event.projectName} - <span style="color: #28a745;">${event.eventType}</span></div>
                    <div style="
                        font-size: 0.9rem;
                        color: #495057;
                    ">${event.detailMessage}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Clear project history
     */
    clearProjectHistory() {
        try {
            localStorage.removeItem('projectHistory');
            console.log('🗑️ Project history cleared');
            this.showNotification('Project history cleared successfully!', 'success');
        } catch (error) {
            console.error('Error clearing project history:', error);
            this.showNotification('Error clearing project history: ' + error.message, 'error');
        }
    }
} 