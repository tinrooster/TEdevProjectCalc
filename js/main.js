/**
 * Main Application Entry Point
 * KGO Project Calculator - Refactored Version
 */

import { ProjectCalculator } from './modules/calculator.js';
import { VendorManager } from './modules/vendor.js';
import { ProjectManager } from './modules/project.js';
import { ReconciliationManager } from './modules/reconciliation.js';
import { GraphicsManager } from './modules/graphics.js';
import { UIUtils } from './utils/ui.js';

class KGOProjectCalculator {
    constructor() {
        console.log('🔧 Creating KGOProjectCalculator instance...');
        
        try {
            // Create all managers first
            this.calculator = new ProjectCalculator();
            console.log('✅ ProjectCalculator created');
            
            this.vendorManager = new VendorManager();
            console.log('✅ VendorManager created');
            
            this.projectManager = new ProjectManager();
            console.log('✅ ProjectManager created');
            
            this.reconciliationManager = new ReconciliationManager();
            console.log('✅ ReconciliationManager created');
            
            this.graphicsManager = new GraphicsManager();
            console.log('✅ GraphicsManager created');
            
            this.uiUtils = new UIUtils();
            console.log('✅ UIUtils created');
            
            // Make modules globally accessible for cross-module communication
            window.calculator = this.calculator;
            window.vendorManager = this.vendorManager;
            window.projectManager = this.projectManager;
            window.reconciliationManager = this.reconciliationManager;
            window.graphicsManager = this.graphicsManager;
            window.UIUtils = this.uiUtils;
            window.kgoCalculator = this;

            // Add test function to check button functionality
            window.testButtons = () => {
                console.log('🧪 Testing button functionality...');
                const saveBtn = document.getElementById('saveBtn');
                const loadBtn = document.getElementById('loadBtn');
                const exportBtn = document.getElementById('exportBtn');

                console.log('🔍 Button elements:', {
                    saveBtn: saveBtn?.outerHTML,
                    loadBtn: loadBtn?.outerHTML,
                    exportBtn: exportBtn?.outerHTML
                });

                console.log('🔍 Button click handlers:', {
                    saveBtn: saveBtn?.onclick,
                    loadBtn: loadBtn?.onclick,
                    exportBtn: exportBtn?.onclick
                });

                // Try clicking buttons programmatically
                if (saveBtn) saveBtn.click();
                if (loadBtn) loadBtn.click();
                if (exportBtn) exportBtn.click();
            };
            
            // Add test function to check vendor manager state
            window.testVendorManager = () => {
                console.log('🧪 Testing vendor manager from global function...');
                console.log('🧪 window.vendorManager:', window.vendorManager);
                console.log('🧪 window.vendorManager.vendors:', window.vendorManager?.vendors);
                console.log('🧪 window.vendorManager._initialized:', window.vendorManager?._initialized);
                console.log('🧪 window.kgoCalculator.vendorManager:', window.kgoCalculator?.vendorManager);
                console.log('🧪 window.kgoCalculator.vendorManager.vendors:', window.kgoCalculator?.vendorManager?.vendors);
            };
            
            // Add test function for inactive vendor scenario
            window.testInactiveVendorScenario = () => {
                console.log('🧪 Testing inactive vendor scenario from global function...');
                if (window.vendorManager) {
                    const result = window.vendorManager.testInactiveVendorScenario();
                    console.log('🧪 Test result:', result);
                    return result;
                } else {
                    console.warn('⚠️ Vendor manager not available');
                    return null;
                }
            };
            
                           // Add function to clear all localStorage data
               window.clearAllData = () => {
                   console.log('🗑️ Clearing all localStorage data...');
                   if (window.calculator && window.calculator.clearAllLocalStorage) {
                       window.calculator.clearAllLocalStorage();
                   } else {
                       // Fallback if calculator is not available
                       const keysToRemove = [
                           'kgoProjectCalculator',
                           'kgoCableLineItems',
                           'autoSavedProject',
                           'currentProject',
                           'autoSaveEnabled',
                           'cableLengthMode',
                           'laborMode',
                           'theme',
                           'currency',
                           'defaultSettings',
                           'projectHistory',
                           'reconciliationHistory',
                           'staffDescriptionOptions'
                       ];
                       
                       keysToRemove.forEach(key => {
                           localStorage.removeItem(key);
                       });
                       
                       // Also remove any saved project files
                       const allKeys = Object.keys(localStorage);
                       allKeys.forEach(key => {
                           if (key.startsWith('savedProject_')) {
                               localStorage.removeItem(key);
                           }
                       });
                       
                       console.log('🗑️ Cleared all localStorage data');
                       console.log('🔄 Reloading page in 2 seconds...');
                       setTimeout(() => {
                           window.location.reload();
                       }, 2000);
                   }
               };
               
                               // Add confirmation function for clearing data
                window.confirmClearAllData = () => {
                    const confirmed = confirm('⚠️ WARNING: This will permanently delete ALL saved data!\n\nThis includes:\n• All projects and settings\n• Project history\n• Auto-saved data\n• Default settings\n• Staff descriptions\n• Vendor data\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to continue?');
                    
                    if (confirmed) {
                        const finalConfirm = confirm('🚨 FINAL WARNING!\n\nYou are about to permanently delete ALL data from this application.\n\nThis will:\n• Clear all localStorage\n• Reset the application to factory defaults\n• Remove all your work and settings\n\nClick OK to proceed with deletion, or Cancel to abort.');
                        
                        if (finalConfirm) {
                            console.log('🗑️ User confirmed data deletion');
                            window.clearAllData();
                        } else {
                            console.log('❌ User cancelled data deletion at final confirmation');
                        }
                    } else {
                        console.log('❌ User cancelled data deletion');
                    }
                };


            
            // Add function to show current localStorage state
            window.showLocalStorageState = () => {
                console.log('📊 Current localStorage state:');
                const allKeys = Object.keys(localStorage);
                allKeys.forEach(key => {
                    if (key.includes('kgo') || key.includes('Project') || key.includes('auto')) {
                        try {
                            const value = localStorage.getItem(key);
                            console.log(`${key}:`, value);
                        } catch (error) {
                            console.log(`${key}: [Error reading value]`);
                        }
                    }
                });
            };
            
            console.log('✅ Global modules set');
            
            // Now initialize everything
            this.initializeApp();
        } catch (error) {
            console.error('❌ Error creating KGOProjectCalculator:', error);
        }
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        console.log('🚀 Initializing KGO Project Calculator...');

        try {
            // Set up event listeners first
            console.log('🔧 Setting up event listeners...');
            this.setupEventListeners();
            console.log('✅ Event listeners set up');

            // Initialize UI components
            console.log('🔧 Initializing UI components...');
            this.uiUtils.initializeUI();
            console.log('✅ UI components initialized');

            // Initialize vendor UI
            console.log('🔧 Initializing vendor UI...');
            this.vendorManager.initializeVendorUI();
            console.log('✅ Vendor UI initialized');
            
            // Initialize reconciliation manager
            console.log('🔧 Initializing reconciliation manager...');
            this.reconciliationManager.initializeEventListeners();
            console.log('✅ Reconciliation manager initialized');
            
            // Clear any hardcoded values from localStorage
            console.log('🔧 Clearing hardcoded values from localStorage...');
            this.clearHardcodedValues();
            console.log('✅ Hardcoded values cleared');
            
            // Force update vendor indicators after initialization
            setTimeout(() => {
                console.log('🔧 Forcing vendor indicators update after initialization...');
                this.vendorManager.updateVendorUI();
            }, 100);
            
            // Set up periodic protection against vendor names being cleared
            setInterval(() => {
                if (this.vendorManager && this.vendorManager._protectVendorNames) {
                    this.vendorManager._protectVendorNames();
                }
            }, 2000); // Check every 2 seconds
            
            // Test section headers
            console.log('🔧 Testing section headers...');
            const sectionHeaders = document.querySelectorAll('.section-header');
            console.log('🔍 Found section headers:', sectionHeaders.length);
            sectionHeaders.forEach((header, index) => {
                const sectionId = header.getAttribute('data-section');
                console.log(`🔍 Section ${index + 1}: ${sectionId}`);
                console.log(`🔍 Section ${index + 1} element:`, header);
            });

            // Load saved data if available
            console.log('🔧 Loading saved data...');
            this.projectManager.loadSavedData();
            console.log('✅ Saved data loaded');

            // Run initial calculation
            console.log('🔧 Running initial calculation...');
            this.calculator.calculate();
            console.log('✅ Initial calculation complete');

            console.log('✅ KGO Project Calculator initialized successfully');
        } catch (error) {
            console.error('❌ Error during app initialization:', error);
        }
    }

    /**
     * Clear hardcoded values from localStorage
     */
    clearHardcodedValues() {
        try {
            const hardcodedValues = ['75', '192', '55', '50', '40', '65'];
            
            // Check and clear kgoCableLineItems
            const cableLineItems = localStorage.getItem('kgoCableLineItems');
            if (cableLineItems) {
                try {
                    const items = JSON.parse(cableLineItems);
                    const hasHardcodedValues = items.some(item => 
                        hardcodedValues.includes(item.qty) || hardcodedValues.includes(item.length)
                    );
                    if (hasHardcodedValues) {
                        console.log('🚫 Found hardcoded values in kgoCableLineItems, clearing...');
                        localStorage.removeItem('kgoCableLineItems');
                    }
                } catch (error) {
                    console.log('⚠️ Error parsing kgoCableLineItems, clearing...');
                    localStorage.removeItem('kgoCableLineItems');
                }
            }
            
            // Check and clear autoSavedProject
            const autoSavedProject = localStorage.getItem('autoSavedProject');
            if (autoSavedProject) {
                try {
                    const projectData = JSON.parse(autoSavedProject);
                    const hasHardcodedValues = this.checkForHardcodedValuesInProject(projectData);
                    if (hasHardcodedValues) {
                        console.log('🚫 Found hardcoded values in autoSavedProject, clearing...');
                        localStorage.removeItem('autoSavedProject');
                    }
                } catch (error) {
                    console.log('⚠️ Error parsing autoSavedProject, clearing...');
                    localStorage.removeItem('autoSavedProject');
                }
            }
            
            console.log('✅ Hardcoded values cleared from localStorage');
        } catch (error) {
            console.error('❌ Error clearing hardcoded values:', error);
        }
    }

    /**
     * Check if project data contains hardcoded values
     */
    checkForHardcodedValuesInProject(projectData) {
        try {
            const hardcodedValues = ['75', '192', '55', '50', '40', '65'];
            
            // Check for hardcoded cable line items
            if (projectData.calculator && projectData.calculator.lineItems && projectData.calculator.lineItems.cableLineItems) {
                const cableLineItems = projectData.calculator.lineItems.cableLineItems;
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
            console.error('Error checking for hardcoded values in project:', error);
            return false;
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        console.log('🔧 Setting up all event listeners...');
        try {
            console.log('🔧 Setting up cable events...');
            this.setupCableEvents();
            console.log('✅ Cable events set up');

            console.log('🔧 Setting up labor events...');
            this.setupLaborEvents();
            console.log('✅ Labor events set up');

            console.log('🔧 Setting up project events...');
            this.setupProjectEvents();
            console.log('✅ Project events set up');

            console.log('🔧 Setting up calculation events...');
            this.setupCalculationEvents();
            console.log('✅ Calculation events set up');
            
            console.log('🔧 Setting up UI events...');
            this.setupUIEvents();
            console.log('✅ UI events set up');

            console.log('✅ All event listeners set up successfully');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
            console.error('❌ Error stack:', error.stack);
        }
    }

    /**
     * Set up UI-specific event listeners
     */
    setupUIEvents() {
        console.log('🔧 Setting up UI events...');
        
        // Note: Section toggles are handled by UIUtils.setupSectionToggles()
        // to avoid conflicts with multiple event listeners

        // Line item buttons (add/remove) are handled by UIUtils.setupLineItemHandlers()
        // to avoid conflicts with multiple event listeners

        // Vendor toggle buttons (handled by vendor manager)
        // Removed to avoid conflicts with vendor manager's own event handling

        // Header toggle functionality - click on the double line to toggle all tabs
        this.setupHeaderToggle();

        console.log('✅ UI events set up');
    }

    /**
     * Set up header toggle functionality
     */
    setupHeaderToggle() {
        console.log('🔧 Setting up header toggle functionality...');
        
        // Store the previous state of all sections
        let previousSectionStates = {};
        let allTabsClosed = false;
        
        const projectHeader = document.querySelector('.project-header');
        if (projectHeader) {
            // Add click event listener to the header (the ::after pseudo-element will be clickable)
            projectHeader.addEventListener('click', (e) => {
                // Only trigger if clicking on the bottom area (where the double line is)
                const rect = projectHeader.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const headerHeight = rect.height;
                
                // Check if click is in the bottom 8px area (where the double line is)
                if (clickY >= headerHeight - 8) {
                    console.log('🔧 Header toggle clicked!');
                    
                    if (allTabsClosed) {
                        // Restore previous state
                        console.log('🔧 Restoring previous section states...');
                        Object.keys(previousSectionStates).forEach(sectionId => {
                            const header = document.querySelector(`[data-section="${sectionId}"]`);
                            const content = document.getElementById(sectionId);
                            if (header && content) {
                                if (previousSectionStates[sectionId]) {
                                    // Was expanded, restore expanded
                                    header.classList.add('expanded');
                                    content.style.setProperty('display', 'block', 'important');
                                    const icon = header.querySelector('.toggle-icon');
                                    if (icon) icon.textContent = '▼';
                                } else {
                                    // Was collapsed, restore collapsed
                                    header.classList.remove('expanded');
                                    content.style.setProperty('display', 'none', 'important');
                                    const icon = header.querySelector('.toggle-icon');
                                    if (icon) icon.textContent = '▶';
                                }
                            }
                        });
                        allTabsClosed = false;
                        console.log('✅ Previous section states restored');
                    } else {
                        // Close all tabs and save current state
                        console.log('🔧 Closing all sections...');
                        previousSectionStates = {};
                        
                        document.querySelectorAll('.section-header').forEach(header => {
                            const sectionId = header.getAttribute('data-section');
                            const content = document.getElementById(sectionId);
                            if (sectionId && content) {
                                // Save current state
                                previousSectionStates[sectionId] = header.classList.contains('expanded');
                                
                                // Close the section
                                header.classList.remove('expanded');
                                content.style.setProperty('display', 'none', 'important');
                                const icon = header.querySelector('.toggle-icon');
                                if (icon) icon.textContent = '▶';
                            }
                        });
                        allTabsClosed = true;
                        console.log('✅ All sections closed');
                    }
                    
                    // Show notification
                    this.showToggleNotification(allTabsClosed);
                }
            });
            
            console.log('✅ Header toggle functionality set up');
        } else {
            console.warn('⚠️ Project header not found');
        }
    }

    /**
     * Show notification for toggle action
     */
    showToggleNotification(allTabsClosed) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${allTabsClosed ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = allTabsClosed ? 'All tabs closed' : 'Previous state restored';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 2000);
    }

    /**
     * Set up cable-related event listeners
     */
    setupCableEvents() {
        console.log('🔧 Setting up cable events...');
        
        // Cable configuration inputs
        const cableInputs = [
            'numCables', 'avgCableLength', 'terminationsPerCable', 
            'timePerTermination', 'wasteFactor', 'spoolLength'
        ];
        
        cableInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Cable input changed: ${inputId} = ${e.target.value}`);
                    if (window.calculator) {
                        window.calculator.calculate();
                    }
                    // Trigger auto-save
                    if (window.projectManager) {
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        // Cable length mode toggles
        document.querySelectorAll('.toggle-btn[data-mode="average"], .toggle-btn[data-mode="calculated"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.getAttribute('data-mode');
                console.log('🔧 Cable length mode changed:', mode);
                if (window.calculator) {
                    window.calculator.setCableLengthMode(mode);
                }
                // Trigger auto-save
                if (window.projectManager) {
                    window.projectManager.autoSave();
                }
            });
        });

        // Cable line item events are handled by UIUtils
        console.log('✅ Cable events set up');
    }

    /**
     * Set up labor-related event listeners
     */
    setupLaborEvents() {
        console.log('🔧 Setting up labor events...');
        
        // Labor mode toggles
        document.querySelectorAll('.toggle-btn[data-mode="single"], .toggle-btn[data-mode="dual"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.getAttribute('data-mode');
                console.log('🔧 Labor mode changed:', mode);
                if (window.calculator) {
                    window.calculator.setLaborMode(mode);
                }
                // Trigger auto-save
                if (window.projectManager) {
                    window.projectManager.autoSave();
                }
            });
        });

        // Single labor inputs
        const singleLaborInputs = [
            'numTechnicians', 'hourlyRate', 'workHoursPerDay', 'staffHours'
        ];
        
        singleLaborInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Single labor input changed: ${inputId} = ${e.target.value}`);
                    if (window.calculator) {
                        window.calculator.calculate();
                    }
                    // Trigger auto-save
                    if (window.projectManager) {
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        // Dual labor inputs
        const dualLaborInputs = [
            'techACount', 'techARate', 'techAHours', 
            'techBCount', 'techBRate', 'techBHours'
        ];
        
        dualLaborInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Dual labor input changed: ${inputId} = ${e.target.value}`);
                    if (window.calculator) {
                        window.calculator.calculate();
                    }
                    // Trigger auto-save
                    if (window.projectManager) {
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        console.log('✅ Labor events set up');
    }

    /**
     * Set up calculation-related event listeners
     */
    setupCalculationEvents() {
        console.log('🔧 Setting up calculation events...');
        
        // Time breakdown inputs
        const timeInputs = [
            'cableRunTime', 'testingTime', 'rackSetupTime', 'labelingTime',
            'cleanupTime', 'cutoverTime', 'decommissioningTime'
        ];
        
        timeInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Time input changed: ${inputId} = ${e.target.value}`);
                    if (window.calculator) {
                        window.calculator.calculate();
                    }
                    // Trigger auto-save
                    if (window.projectManager) {
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        // Default settings inputs
        const defaultSettingsInputs = [
            'terminationsPerCable', 'timePerTermination', 'wasteFactor', 
            'connectorWasteFactor', 'spoolLength', 'cableCostPerFoot', 'terminationCost'
        ];
        
        defaultSettingsInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Default setting input changed: ${inputId} = ${e.target.value}`);
                    if (window.calculator) {
                        window.calculator.calculate();
                    }
                    // Trigger auto-save
                    if (window.projectManager) {
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        console.log('✅ Calculation events set up');
    }

    /**
     * Set up project-related event listeners
     */
    setupProjectEvents() {
        console.log('🔧 Setting up project events...');
        
        // Project header inputs
        const projectInputs = [
            'projectName', 'projectNumber', 'customerName', 'projectDate'
        ];
        
        projectInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Project input changed: ${inputId} = ${e.target.value}`);
                    // Update project display
                    if (window.projectManager) {
                        window.projectManager.updateProjectDisplay();
                        // Trigger auto-save
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        // Additional project inputs (Setup section)
        const additionalProjectInputs = [
            'projectDescription', 'projectRevision', 'projectEndDate'
        ];
        
        additionalProjectInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    console.log(`🔧 Additional project input changed: ${inputId} = ${e.target.value}`);
                    // Trigger auto-save
                    if (window.projectManager) {
                        window.projectManager.autoSave();
                    }
                });
            }
        });

        // Save/Load/Export buttons (Header)
        const saveBtn = document.getElementById('saveBtn');
        const loadBtn = document.getElementById('loadBtn');
        const exportBtn = document.getElementById('exportBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (saveBtn) {
            console.log('🔍 Save button found:', saveBtn);
            saveBtn.addEventListener('click', () => {
                console.log('💾 Save button clicked');
                console.log('🔍 window.projectManager:', window.projectManager);
                if (window.projectManager) {
                    console.log('🔍 Calling saveProject()...');
                    window.projectManager.saveProject();
                } else {
                    console.error('❌ Project manager not found!');
                }
            });
        } else {
            console.error('❌ Save button not found!');
        }

        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                console.log('📂 Load button clicked');
                if (window.projectManager) {
                    window.projectManager.loadProject();
                }
            });
        }

        if (exportBtn) {
            console.log('🔍 Export button found:', exportBtn);
            exportBtn.addEventListener('click', () => {
                console.log('📊 Export button clicked');
                console.log('🔍 window.projectManager:', window.projectManager);
                if (window.projectManager) {
                    console.log('🔍 Calling exportToExcel()...');
                    window.projectManager.exportToExcel();
                } else {
                    console.error('❌ Project manager not found!');
                }
            });
        } else {
            console.error('❌ Export button not found!');
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('🔄 Reset button clicked');
                if (window.projectManager) {
                    window.projectManager.resetProject();
                }
            });
        }

        // Setup/Project section buttons
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        const loadProjectBtn = document.getElementById('loadProjectBtn');
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        const projectHistoryBtn = document.getElementById('projectHistoryBtn');
        const resetProjectBtn = document.getElementById('resetProjectBtn');
        const autoSaveToggle = document.getElementById('autoSaveToggle');

        if (saveProjectBtn) {
            console.log('🔍 Save Project button found:', saveProjectBtn);
            saveProjectBtn.addEventListener('click', () => {
                console.log('💾 Save Project button clicked (Setup section)');
                console.log('🔍 window.projectManager:', window.projectManager);
                if (window.projectManager) {
                    console.log('🔍 Calling saveProject()...');
                    window.projectManager.saveProject();
                } else {
                    console.error('❌ Project manager not found!');
                }
            });
        } else {
            console.error('❌ Save Project button not found!');
        }

        if (loadProjectBtn) {
            loadProjectBtn.addEventListener('click', () => {
                console.log('📂 Load Project button clicked (Setup section)');
                if (window.projectManager) {
                    window.projectManager.loadProject();
                }
            });
        }

        if (exportCsvBtn) {
            console.log('🔍 Export CSV button found:', exportCsvBtn);
            exportCsvBtn.addEventListener('click', () => {
                console.log('📊 Export CSV button clicked (Setup section)');
                console.log('🔍 window.projectManager:', window.projectManager);
                if (window.projectManager) {
                    console.log('🔍 Calling exportToExcel()...');
                    window.projectManager.exportToExcel();
                } else {
                    console.error('❌ Project manager not found!');
                }
            });
        } else {
            console.error('❌ Export CSV button not found!');
        }

        if (projectHistoryBtn) {
            projectHistoryBtn.addEventListener('click', () => {
                console.log('📈 Project History button clicked');
                if (window.projectManager) {
                    window.projectManager.showProjectHistory();
                }
            });
        }

        if (resetProjectBtn) {
            resetProjectBtn.addEventListener('click', () => {
                console.log('🔄 Reset Project button clicked (Setup section)');
                if (window.projectManager) {
                    window.projectManager.resetProject();
                }
            });
        }

        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('click', () => {
                console.log('💾 Auto-Save Toggle button clicked');
                if (window.projectManager) {
                    const currentState = window.projectManager.autoSaveEnabled;
                    const newState = !currentState;
                    window.projectManager.toggleAutoSave(newState);
                    
                    // Update button text
                    autoSaveToggle.textContent = newState ? '💾 Auto-Save: ON' : '💾 Auto-Save: OFF';
                }
            });
        }

        // Auto-save checkbox (if it exists)
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.addEventListener('change', (e) => {
                console.log('🔧 Auto-save checkbox toggled:', e.target.checked);
                if (window.projectManager) {
                    window.projectManager.toggleAutoSave(e.target.checked);
                }
            });
        }

        // Default Settings buttons
        const saveDefaultSettingsBtn = document.getElementById('saveDefaultSettingsBtn');
        const resetDefaultSettingsBtn = document.getElementById('resetDefaultSettingsBtn');

        if (saveDefaultSettingsBtn) {
            saveDefaultSettingsBtn.addEventListener('click', () => {
                console.log('💾 Save Default Settings button clicked');
                if (window.projectManager) {
                    window.projectManager.saveDefaultSettings();
                }
            });
        }

        if (resetDefaultSettingsBtn) {
            resetDefaultSettingsBtn.addEventListener('click', () => {
                console.log('🔄 Reset Default Settings button clicked');
                if (window.projectManager) {
                    window.projectManager.clearDefaultSettings();
                }
            });
        }

        console.log('✅ Project events set up');
    }
}

// Initialize the application
console.log('📄 Initializing KGO Project Calculator...');

// Create a single instance when the DOM is ready
function createCalculator() {
    if (!window.kgoCalculator) {
        console.log('📄 Creating KGOProjectCalculator...');
        try {
            const calculator = new KGOProjectCalculator();
            console.log('✅ KGOProjectCalculator created and initialized');
        } catch (error) {
            console.error('❌ Error creating KGOProjectCalculator:', error);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log('📄 DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', createCalculator);
} else {
    console.log('📄 DOM already loaded, initializing immediately...');
    createCalculator();
}

// Export for use in other modules
export default KGOProjectCalculator;

// Refresh function to update all calculations and UI elements
function refreshAll() {
    console.log('🔄 Refreshing all calculations and UI elements...');
    
    try {
        // Force calculator to recalculate everything
        if (window.calculator) {
            console.log('🔄 Forcing calculator recalculation...');
            window.calculator.calculate();
            window.calculator.updateResults();
        }
        
        // Force key calculation inputs to trigger updates
        console.log('🔄 Triggering key calculation inputs...');
        const keyInputs = [
            'terminationsPerCable',
            'timePerTermination', 
            'wasteFactor',
            'connectorWasteFactor',
            'spoolLength',
            'cableCostPerFoot',
            'terminationCost',
            'laborForStaff'
        ];
        
        keyInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                console.log(`🔄 Triggering ${inputId}...`);
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Also trigger any cable line item inputs
        const cableInputs = document.querySelectorAll('.cable-line-item input');
        cableInputs.forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Trigger staff line item inputs
        const staffInputs = document.querySelectorAll('.staff-line-item input');
        staffInputs.forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Trigger supplies line item inputs
        const suppliesInputs = document.querySelectorAll('.supplies-line-item input');
        suppliesInputs.forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        // Force vendor manager to update if it exists
        if (window.vendorManager) {
            console.log('🔄 Updating vendor data...');
            window.vendorManager.calculateVendorQuotesTotal();
            window.vendorManager.calculateActiveVendorTotal();
            window.vendorManager.updateVendorUI();
            if (window.vendorManager.updateVendorQuotesUI) {
                window.vendorManager.updateVendorQuotesUI();
            }
        }
        
        // Update staff description dropdowns if UIUtils exists
        if (window.UIUtils && window.UIUtils.updateAllStaffDescriptionDropdowns) {
            console.log('🔄 Updating staff description dropdowns...');
            window.UIUtils.updateAllStaffDescriptionDropdowns();
        }
        
        // Force a final calculation update
        if (window.calculator) {
            console.log('🔄 Final calculation update...');
            window.calculator.calculate();
            window.calculator.updateResults();
        }
        
        console.log('✅ All elements refreshed successfully');
        
        // Show success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = 'All calculations refreshed!';
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error during refresh:', error);
        
        // Show error notification
        const errorNotification = document.createElement('div');
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorNotification.textContent = 'Refresh failed: ' + error.message;
        document.body.appendChild(errorNotification);
        
        // Remove error notification after 5 seconds
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.remove();
            }
        }, 5000);
    }
}

// Expose refreshAll function to global scope
window.refreshAll = refreshAll;