/**
 * UI Utilities Module
 * Handles common UI interactions, component creation, and UI state management
 */

export class UIUtils {
    constructor() {
        this.breakdownCollapsed = false;
        this.sections = new Map();
        this.initialized = false;
        this.lineItemHandlersInitialized = false;
        
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeUI();
            });
        } else {
            // DOM is already loaded, but wait a bit to ensure everything is ready
            setTimeout(() => {
                this.initializeUI();
            }, 100);
        }
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        if (this.initialized) {
            console.log('UIUtils already initialized, skipping...');
            return;
        }
        
        console.log('🔧 Initializing UIUtils...');
        
        try {
            this.setupSectionToggles();
            this.setupBreakdownToggle();
            this.setupLineItemHandlers();
            this.setupCableTypeColors();
            this.setupProjectDisplay();
            this.setupAutoSaveToggle();
            this.setupStaffHoursListeners();
            this.setupStaffDescriptionOptions();
            this.setupRevisionIncrement();
            
            this.initialized = true;
            console.log('✅ UIUtils initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing UIUtils:', error);
        }
    }

    /**
     * Setup section toggle functionality
     */
    setupSectionToggles() {
        console.log('🔧 Setting up section toggles...');
        
        const headers = document.querySelectorAll('.section-header');
        console.log(`Found ${headers.length} section headers`);
        
        headers.forEach((header, index) => {
            const sectionId = header.getAttribute('data-section');
            console.log(`Processing section ${index + 1}: ${sectionId}`);
            
            if (sectionId) {
                const content = document.getElementById(sectionId);
                if (!content) {
                    console.warn(`⚠️ Section content not found for ID: ${sectionId}`);
                    return;
                }
                console.log(`✅ Found section content:`, content);
                
                const isExpanded = header.classList.contains('expanded') || content.classList.contains('expanded');
                
                this.sections.set(sectionId, {
                    header: header,
                    content: content,
                    expanded: isExpanded
                });

                // Set initial state
                if (isExpanded) {
                    content.classList.add('expanded');
                    header.classList.add('expanded');
                    content.style.setProperty('display', 'block', 'important');
                    const icon = header.querySelector('.toggle-icon');
                    if (icon) icon.textContent = '▼';
                    console.log(`📂 Section ${sectionId} initialized as expanded`);
                } else {
                    content.classList.remove('expanded');
                    header.classList.remove('expanded');
                    content.style.setProperty('display', 'none', 'important');
                    const icon = header.querySelector('.toggle-icon');
                    if (icon) icon.textContent = '▶';
                    console.log(`📁 Section ${sectionId} initialized as collapsed`);
                }

                // Create unique event handler for each section
                const clickHandler = (e) => {
                    console.log(`🎯 Section header clicked: ${sectionId}`);
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleSection(sectionId);
                };
                
                // Remove any existing listeners to prevent duplicates
                header.removeEventListener('click', clickHandler);
                
                // Add click listener
                header.addEventListener('click', clickHandler);
                
                // Make sure header is clickable
                header.style.cursor = 'pointer';
                console.log(`🔗 Click listener added to section ${sectionId}`);
                
                console.log(`✅ Section ${sectionId} setup complete`);
            }
        });
        
        console.log(`✅ Section toggles setup complete. Total sections: ${this.sections.size}`);
    }

    /**
     * Toggle section visibility
     */
    toggleSection(sectionId) {
        console.log(`🔄 Toggling section: ${sectionId}`);
        
        const section = this.sections.get(sectionId);
        if (!section) {
            console.warn(`⚠️ Section not found: ${sectionId}`);
            return;
        }
        console.log(`✅ Found section to toggle:`, section);

        const icon = section.header.querySelector('.toggle-icon');
        
        if (section.expanded) {
            // Collapse section
            section.content.classList.remove('expanded');
            section.header.classList.remove('expanded');
            section.content.style.setProperty('display', 'none', 'important');
            if (icon) icon.textContent = '▶';
            section.expanded = false;
            console.log(`📁 Section ${sectionId} collapsed`);
        } else {
            // Expand section
            section.content.classList.add('expanded');
            section.header.classList.add('expanded');
            section.content.style.setProperty('display', 'block', 'important');
            if (icon) icon.textContent = '▼';
            section.expanded = true;
            console.log(`📂 Section ${sectionId} expanded`);
        }
    }

    /**
     * Setup breakdown toggle
     */
    setupBreakdownToggle() {
        const breakdownHeader = document.querySelector('#breakdown h3');
        if (breakdownHeader) {
            breakdownHeader.addEventListener('click', () => {
                this.toggleBreakdown();
            });
        }
    }

    /**
     * Toggle breakdown visibility
     */
    toggleBreakdown() {
        const breakdown = document.getElementById('breakdown');
        if (breakdown) {
            breakdown.classList.toggle('collapsed');
            this.breakdownCollapsed = breakdown.classList.contains('collapsed');
        }
    }

    /**
     * Setup line item handlers
     */
    setupLineItemHandlers() {
        if (this.lineItemHandlersInitialized) {
            console.log('⚠️ Line item handlers already initialized, skipping...');
            return;
        }
        
        console.log('🔧 Setting up line item handlers...');
        
        // Debug: Check if buttons exist
        const addButtons = document.querySelectorAll('.add-item-btn');
        console.log('🔍 Found add buttons:', addButtons.length);
        addButtons.forEach((btn, index) => {
            console.log(`🔍 Add button ${index + 1}:`, btn.textContent, 'data-type:', btn.getAttribute('data-type'));
        });
        
        // Store event handlers for potential removal
        this.addLineItemHandler = (e) => {
            console.log('🔍 Add line item button clicked:', e.target);
            this.addLineItem(e.target);
        };
        
        this.removeLineItemHandler = (e) => {
            if (e.target.matches('.remove-btn, .remove-vendor-item-btn, .remove-vendor-quote-btn, .remove-line-item')) {
                console.log('🔍 Remove line item button clicked:', e.target);
                this.removeLineItem(e.target);
            }
        };
        
        // Add line item buttons - use direct event listeners
        addButtons.forEach(button => {
            // Remove any existing listeners first
            button.removeEventListener('click', this.addLineItemHandler);
            // Add new listener
            button.addEventListener('click', this.addLineItemHandler);
        });

        // Remove line item buttons - use event delegation for dynamically added buttons
        document.addEventListener('click', this.removeLineItemHandler);
        
        // Add event listeners for staff hours inputs
        this.setupStaffHoursListeners();
        
        this.lineItemHandlersInitialized = true;
        console.log('✅ Line item handlers setup complete');
    }

    /**
     * Add line item
     */
    addLineItem(button) {
        console.log('🔧 Adding line item...');
        
        // Find the appropriate container based on the button's context
        let container = null;
        let type = 'generic';
        
        // Get the button's data-type attribute
        const buttonType = button.getAttribute('data-type');
        console.log('🔍 Button type:', buttonType);
        
        // Find container based on button type and context
        if (buttonType === 'cable') {
            container = document.getElementById('cableLengths');
            type = 'cable';
            // If cable container is not found, it might be hidden in calculated mode
            if (!container) {
                console.log('🔍 Cable container not found, checking if calculated mode is hidden...');
                const calculatedMode = document.getElementById('calculatedLengthMode');
                if (calculatedMode && calculatedMode.style.display === 'none') {
                    console.log('🔍 Calculated mode is hidden, switching to calculated mode...');
                    // Switch to calculated mode
                    const averageMode = document.getElementById('averageLengthMode');
                    const calculatedMode = document.getElementById('calculatedLengthMode');
                    const averageBtn = document.querySelector('.toggle-btn[data-mode="average"]');
                    const calculatedBtn = document.querySelector('.toggle-btn[data-mode="calculated"]');
                    
                    if (averageMode && calculatedMode && averageBtn && calculatedBtn) {
                        averageMode.style.display = 'none';
                        calculatedMode.style.display = 'block';
                        averageBtn.classList.remove('active');
                        calculatedBtn.classList.add('active');
                        
                        // Now try to find the container again
                        container = document.getElementById('cableLengths');
                        console.log('🔍 Cable container after mode switch:', !!container);
                    }
                }
            }
        } else if (buttonType === 'other') {
            container = document.getElementById('otherMaterials');
            type = 'other';
        } else if (buttonType === 'staff') {
            container = document.getElementById('staffLineItemsContainer');
            type = 'staff';
        } else if (buttonType === 'material') {
            container = document.getElementById('materialsItems');
            type = 'material';
        } else if (buttonType === 'equipment') {
            container = document.getElementById('equipmentItems');
            type = 'equipment';
        } else if (buttonType === 'shipping') {
            container = document.getElementById('shippingItems');
            type = 'shipping';
        } else if (buttonType === 'admin') {
            container = document.getElementById('adminItems');
            type = 'admin';
        }
        
        // Fallback: try to find container by looking at the button's parent structure
        if (!container) {
            console.log('🔍 Trying fallback container detection...');
            
            // Look for containers in the button's parent hierarchy
            const parentGroup = button.closest('.input-group');
            if (parentGroup) {
                const cableContainer = parentGroup.querySelector('#cableLengths');
                const otherContainer = parentGroup.querySelector('#otherMaterials');
                const staffContainer = parentGroup.querySelector('#staffLineItemsContainer');
                const materialsContainer = parentGroup.querySelector('#materialsItems');
                const equipmentContainer = parentGroup.querySelector('#equipmentItems');
                const shippingContainer = parentGroup.querySelector('#shippingItems');
                const adminContainer = parentGroup.querySelector('#adminItems');
                
                if (cableContainer) {
                    container = cableContainer;
                    type = 'cable';
                } else if (otherContainer) {
                    container = otherContainer;
                    type = 'other';
                } else if (staffContainer) {
                    container = staffContainer;
                    type = 'staff';
                } else if (materialsContainer) {
                    container = materialsContainer;
                    type = 'material';
                } else if (equipmentContainer) {
                    container = equipmentContainer;
                    type = 'equipment';
                } else if (shippingContainer) {
                    container = shippingContainer;
                    type = 'shipping';
                } else if (adminContainer) {
                    container = adminContainer;
                    type = 'admin';
                }
            }
        }
        
        if (!container) {
            console.warn('⚠️ Line items container not found');
            console.log('🔍 Available containers:', {
                cableLengths: !!document.getElementById('cableLengths'),
                otherMaterials: !!document.getElementById('otherMaterials'),
                staffLineItemsContainer: !!document.getElementById('staffLineItemsContainer'),
                materialsItems: !!document.getElementById('materialsItems'),
                equipmentItems: !!document.getElementById('equipmentItems'),
                shippingItems: !!document.getElementById('shippingItems'),
                adminItems: !!document.getElementById('adminItems')
            });
            return;
        }
        
        console.log(`🔧 Creating line item of type: ${type} in container: ${container.id}`);
        
        const lineItem = this.createLineItem(type);
        if (lineItem) {
            // Append to the container (don't try to insert before button)
            container.appendChild(lineItem);
            
            // Focus on the first input
            const firstInput = lineItem.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
            
            console.log('✅ Line item added successfully');
            
            // If this is a staff line item, update the dropdown options
            if (type === 'staff') {
                this.updateAllStaffDescriptionDropdowns();
            }
            
            // Trigger calculation update
            this.triggerCalculationUpdate();
            
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        }
    }

    /**
     * Remove line item
     */
    removeLineItem(button) {
        console.log('🔧 Removing line item...');
        
        const lineItem = button.closest('.line-item');
        if (lineItem) {
            lineItem.remove();
            console.log('✅ Line item removed successfully');
            
            // Trigger calculation update
            this.triggerCalculationUpdate();
            
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        } else {
            console.warn('⚠️ Line item not found');
        }
    }

    /**
     * Setup staff hours listeners
     */
    setupStaffHoursListeners() {
        console.log('🔧 Setting up staff hours listeners...');
        
        // Listen for changes to staff hours inputs
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('staff-hours')) {
                console.log('🔧 Staff hours changed:', e.target.value);
                // Trigger calculation update
                this.triggerCalculationUpdate();
            }
        });
        
        console.log('✅ Staff hours listeners setup complete');
    }

    /**
     * Create line item element
     */
    createLineItem(type) {
        const div = document.createElement('div');
        div.className = 'line-item';

        if (type.includes('cable')) {
            div.innerHTML = `
                <select class="cable-type" data-value="1855">
                    <option value="1855">1855</option>
                    <option value="1505">1505</option>
                    <option value="1694">1694</option>
                    <option value="cat6">Cat6</option>
                    <option value="other">Other</option>
                </select>
                <input type="number" placeholder="Qty" class="cable-qty" min="1" style="width: 60px;">
                <input type="number" placeholder="Length" class="cable-length" min="1" style="width: 80px;">
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('vendor')) {
            div.innerHTML = `
                <input type="text" placeholder="Description/Part #" class="vendor-item-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="vendor-item-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="vendor-item-cost" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('quote')) {
            div.innerHTML = `
                <input type="text" placeholder="Quote Description" class="vendor-quote-desc" style="flex: 3;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Amount" class="vendor-quote-amount" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('other')) {
            div.innerHTML = `
                <input type="text" placeholder="Description" class="other-material-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="other-material-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="other-material-amount" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('material')) {
            div.innerHTML = `
                <input type="text" placeholder="Description" class="material-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="material-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="material-cost" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('equipment')) {
            div.innerHTML = `
                <input type="text" placeholder="Description" class="equipment-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="equipment-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="equipment-cost" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('shipping')) {
            div.innerHTML = `
                <input type="text" placeholder="Description" class="shipping-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="shipping-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="shipping-cost" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('admin')) {
            div.innerHTML = `
                <input type="text" placeholder="Description" class="admin-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="admin-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="admin-cost" step="1" value="0" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
        } else if (type.includes('staff')) {
            div.innerHTML = `
                <select class="staff-desc" style="flex: 2; padding: 4px 8px; border: 1px solid #ced4da; border-radius: 4px; background: white;">
                    <option value="">Select Staff...</option>
                    ${this.getStaffDescriptionOptions().map(option => `<option value="${option}">${option}</option>`).join('')}
                </select>
                <input type="text" placeholder="Note" class="staff-note" style="flex: 3;">
                <input type="number" placeholder="Hours" class="staff-hours" step="0.1" min="0" value="0" style="width: 60px;">
                <button class="remove-btn">✕</button>
            `;
        }

        // Setup cable type colors for new items
        const cableSelect = div.querySelector('.cable-type');
        if (cableSelect) {
            this.updateCableTypeColor(cableSelect);
            cableSelect.addEventListener('change', (e) => this.updateCableTypeColor(e.target));
        }

        return div;
    }

    /**
     * Setup cable type colors
     */
    setupCableTypeColors() {
        document.querySelectorAll('.cable-type').forEach(select => {
            this.updateCableTypeColor(select);
            select.addEventListener('change', (e) => this.updateCableTypeColor(e.target));
        });
    }

    /**
     * Update cable type color
     */
    updateCableTypeColor(selectElement) {
        const value = selectElement.value || '1855';
        const colors = {
            '1855': { border: '#2e7d32', bg: '#e8f5e8', text: '#2e7d32' },
            '1505': { border: '#1976d2', bg: '#e3f2fd', text: '#1976d2' },
            '1694': { border: '#f57c00', bg: '#fff3e0', text: '#f57c00' },
            'cat6': { border: '#7b1fa2', bg: '#f3e5f5', text: '#7b1fa2' },
            'other': { border: '#424242', bg: '#fafafa', text: '#424242' }
        };

        const color = colors[value] || colors['1855'];
        selectElement.style.borderColor = color.border;
        selectElement.style.backgroundColor = color.bg;
        selectElement.style.color = color.text;
    }

    /**
     * Setup project display
     */
    setupProjectDisplay() {
        // Set current date
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('projectDate');
        if (dateInput && !dateInput.value) {
            dateInput.value = today;
        }

        // Update display fields when project fields change
        const projectFields = ['projectName', 'projectDescription', 'projectRevision', 'projectDate', 'projectEndDate'];
        projectFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => this.updateProjectDisplay());
            }
        });
    }

    /**
     * Update project display
     */
    updateProjectDisplay() {
        const displayFields = {
            'projectNameDisplay': document.getElementById('projectName')?.value || '',
            'projectDescriptionDisplay': document.getElementById('projectDescription')?.value || '',
            'projectRevisionDisplay': document.getElementById('projectRevision')?.value || '1.0',
            'projectDateDisplay': document.getElementById('projectDate')?.value || '',
            'projectEndDateDisplay': document.getElementById('projectEndDate')?.value || ''
        };

        Object.keys(displayFields).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = displayFields[fieldId];
            }
        });
    }

    /**
     * Get staff description options from localStorage or return defaults
     */
    getStaffDescriptionOptions() {
        const stored = localStorage.getItem('staffDescriptionOptions');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse staff description options:', e);
            }
        }
        // Default options
        return [
            'David Fortin',
            'Marcus Saxton',
            'Eric Lanyon',
            'David Figura',
            'AC Hay',
            'Nathan Altimari',
            'Rodney Simmons',
            'Jason Omphroy',
            'Victor Luu',
            'Jack Fraser',
            'Rosendo Pena'
        ];
    }

    /**
     * Save staff description options to localStorage
     */
    saveStaffDescriptionOptions(options) {
        try {
            localStorage.setItem('staffDescriptionOptions', JSON.stringify(options));
            console.log('💾 Staff description options saved:', options);
        } catch (e) {
            console.error('Failed to save staff description options:', e);
        }
    }

    /**
     * Setup staff description options management
     */
    setupStaffDescriptionOptions() {
        const optionsContainer = document.getElementById('staffDescriptionOptions');
        const addBtn = document.getElementById('addStaffDescriptionBtn');
        const newInput = document.getElementById('newStaffDescription');
        const saveBtn = document.getElementById('saveStaffDescriptionsBtn');
        const resetBtn = document.getElementById('resetStaffDescriptionsBtn');
        const clearBtn = document.getElementById('clearStaffDescriptionsBtn');

        if (!optionsContainer || !addBtn || !newInput || !saveBtn || !resetBtn || !clearBtn) {
            console.warn('Staff description options elements not found');
            return;
        }

        // Clear any existing data and populate with defaults
        const existingData = localStorage.getItem('staffDescriptionOptions');
        if (!existingData) {
            console.log('🔧 No existing staff options found, populating with defaults...');
            const defaultOptions = [
                'David Fortin',
                'Marcus Saxton',
                'Eric Lanyon',
                'David Figura',
                'AC Hay',
                'Nathan Altimari',
                'Rodney Simmons',
                'Jason Omphroy',
                'Victor Luu',
                'Jack Fraser',
                'Rosendo Pena'
            ];
            this.saveStaffDescriptionOptions(defaultOptions);
        }
        
        // Load and display current options
        this.refreshStaffDescriptionOptions();
        
        // Populate existing dropdowns
        this.updateAllStaffDescriptionDropdowns();

        // Add new option
        addBtn.addEventListener('click', () => {
            const newOption = newInput.value.trim();
            if (newOption) {
                const currentOptions = this.getStaffDescriptionOptions();
                if (!currentOptions.includes(newOption)) {
                    currentOptions.push(newOption);
                    this.saveStaffDescriptionOptions(currentOptions);
                    this.refreshStaffDescriptionOptions();
                    newInput.value = '';
                    this.updateAllStaffDescriptionDropdowns();
                } else {
                    this.showNotification('Option already exists', 'warning');
                }
            }
        });

        // Save options
        saveBtn.addEventListener('click', () => {
            const options = Array.from(optionsContainer.querySelectorAll('.option-item'))
                .map(item => item.querySelector('.option-text').textContent.trim())
                .filter(text => text.length > 0);
            
            this.saveStaffDescriptionOptions(options);
            this.updateAllStaffDescriptionDropdowns();
            this.showNotification('Options saved successfully', 'success');
        });

        // Reset to defaults
        resetBtn.addEventListener('click', () => {
            const defaultOptions = [
                'David Fortin',
                'Marcus Saxton',
                'Eric Lanyon',
                'David Figura',
                'AC Hay',
                'Nathan Altimari',
                'Rodney Simmons',
                'Jason Omphroy',
                'Victor Luu',
                'Jack Fraser',
                'Rosendo Pena'
            ];
            this.saveStaffDescriptionOptions(defaultOptions);
            this.refreshStaffDescriptionOptions();
            this.updateAllStaffDescriptionDropdowns();
            this.showNotification('Options reset to defaults', 'info');
        });

        // Clear all options
        clearBtn.addEventListener('click', () => {
            this.saveStaffDescriptionOptions([]);
            this.refreshStaffDescriptionOptions();
            this.updateAllStaffDescriptionDropdowns();
            this.showNotification('All options cleared', 'info');
        });

        // Auto populate button
        const populateBtn = document.getElementById('populateStaffDescriptionsBtn');
        if (populateBtn) {
            populateBtn.addEventListener('click', () => {
                const defaultOptions = [
                    'David Fortin',
                    'Marcus Saxton',
                    'Eric Lanyon',
                    'David Figura',
                    'AC Hay',
                    'Nathan Altimari',
                    'Rodney Simmons',
                    'Jason Omphroy',
                    'Victor Luu',
                    'Jack Fraser',
                    'Rosendo Pena'
                ];
                this.saveStaffDescriptionOptions(defaultOptions);
                this.refreshStaffDescriptionOptions();
                this.updateAllStaffDescriptionDropdowns();
                this.showNotification('Staff list auto-populated!', 'success');
            });
        }

        // Enter key support for adding options
        newInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });
    }

    /**
     * Setup revision increment functionality
     */
    setupRevisionIncrement() {
        const incrementBtn = document.getElementById('incrementRevisionBtn');
        if (incrementBtn) {
            incrementBtn.addEventListener('click', () => {
                this.incrementRevision();
            });
        }
    }

    /**
     * Increment revision number (minor: 01-09, then bump major)
     */
    incrementRevision() {
        const revInput = document.getElementById('projectRevision');
        const revDisplay = document.getElementById('projectRevisionDisplay');
        
        if (!revInput) {
            console.warn('Revision input not found');
            return;
        }

        const currentRev = revInput.value.trim();
        console.log('🔧 Incrementing revision from:', currentRev);
        
        if (currentRev) {
            // Parse current revision (e.g., "2.05" -> major: 2, minor: 5)
            const parts = currentRev.split('.');
            let major = parseInt(parts[0]) || 1;
            let minor = parts.length > 1 ? parseInt(parts[1]) : 0;
            
            // Handle floating point precision issues by ensuring we're working with integers
            if (isNaN(major)) major = 1;
            if (isNaN(minor)) minor = 0;
            
            console.log(`🔧 Current: Major=${major}, Minor=${minor}`);
            
            // Increment minor version (01-09)
            minor += 1;
            
            // If minor reaches 10, increment major and reset minor to 01
            if (minor >= 10) {
                major += 1;
                minor = 1;
                console.log(`🔧 Minor reached 10, bumping major to ${major}, resetting minor to ${minor}`);
            }
            
            // Format new revision with leading zero for minor version
            const newRev = major + '.' + minor.toString().padStart(2, '0');
            
            console.log(`🔧 New revision: ${newRev}`);
            
            // Update both inputs
            revInput.value = newRev;
            if (revDisplay) {
                revDisplay.value = newRev;
            }
            
            // Trigger project display update
            this.updateProjectDisplay();
            
            // Show notification
            this.showNotification(`Revision incremented to ${newRev}`, 'success');
            
            console.log(`✅ Revision incremented from ${currentRev} to ${newRev}`);
        } else {
            // If no current revision, start with 1.01
            const newRev = '1.01';
            revInput.value = newRev;
            if (revDisplay) {
                revDisplay.value = newRev;
            }
            this.updateProjectDisplay();
            this.showNotification(`Revision set to ${newRev}`, 'info');
        }
    }

    /**
     * Refresh the staff description options display
     */
    refreshStaffDescriptionOptions() {
        const optionsContainer = document.getElementById('staffDescriptionOptions');
        if (!optionsContainer) return;

        const options = this.getStaffDescriptionOptions();
        optionsContainer.innerHTML = '';

        if (options.length === 0) {
            optionsContainer.innerHTML = '<p style="color: #6c757d; font-style: italic;">No options configured</p>';
            return;
        }

        options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            optionDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: white; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 4px;';
            
            optionDiv.innerHTML = `
                <span class="option-text" style="flex: 1;">${option}</span>
                <button class="remove-option-btn" data-index="${index}" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 2px 6px; font-size: 12px; cursor: pointer;">✕</button>
            `;
            
            optionsContainer.appendChild(optionDiv);
        });

        // Add remove event listeners
        optionsContainer.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const currentOptions = this.getStaffDescriptionOptions();
                currentOptions.splice(index, 1);
                this.saveStaffDescriptionOptions(currentOptions);
                this.refreshStaffDescriptionOptions();
                this.updateAllStaffDescriptionDropdowns();
            });
        });
    }

    /**
     * Update all existing staff description dropdowns with current options
     */
    updateAllStaffDescriptionDropdowns() {
        const options = this.getStaffDescriptionOptions();
        const dropdowns = document.querySelectorAll('.staff-desc');
        
        dropdowns.forEach(dropdown => {
            const currentValue = dropdown.value;
            dropdown.innerHTML = `<option value="">Select Staff...</option>${options.map(option => `<option value="${option}">${option}</option>`).join('')}`;
            dropdown.value = currentValue; // Preserve current selection
        });
    }

    /**
     * Setup auto-save toggle
     */
    setupAutoSaveToggle() {
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.addEventListener('change', (e) => {
                this.toggleAutoSave(e.target.checked);
            });
        }
    }

    /**
     * Toggle auto-save
     */
    toggleAutoSave(enabled) {
        if (window.projectManager) {
            window.projectManager.toggleAutoSave(enabled);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">✕</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Add to page
        document.body.appendChild(notification);
    }

    /**
     * Show loading spinner
     */
    showLoading(message = 'Loading...') {
        const loading = document.createElement('div');
        loading.id = 'loading-spinner';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        document.body.appendChild(loading);
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const loading = document.getElementById('loading-spinner');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * Create modal
     */
    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.showFooter ? `
                    <div class="modal-footer">
                        <button class="modal-cancel">Cancel</button>
                        <button class="modal-confirm">Confirm</button>
                    </div>
                ` : ''}
            </div>
        `;

        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => modal.remove());

        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => modal.remove());
        }

        const confirmBtn = modal.querySelector('.modal-confirm');
        if (confirmBtn && options.onConfirm) {
            confirmBtn.addEventListener('click', () => {
                options.onConfirm();
                modal.remove();
            });
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Trigger calculation update
     */
    triggerCalculationUpdate() {
        if (window.calculator) {
            // Save cable line items before calculating
            if (window.calculator.saveCableLineItems) {
                window.calculator.saveCableLineItems();
            }
            window.calculator.calculate();
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    /**
     * Format hours
     */
    formatHours(hours) {
        if (hours < 1) {
            return `${(hours * 60).toFixed(1)} minutes`;
        } else {
            return `${hours.toFixed(2)} hours`;
        }
    }

    /**
     * Format days
     */
    formatDays(days) {
        if (days < 1) {
            return `${(days * 8).toFixed(1)} hours`;
        } else {
            return `${days.toFixed(1)} days`;
        }
    }

    /**
     * Validate input
     */
    validateInput(element, rules = {}) {
        const value = element.value;
        const errors = [];

        if (rules.required && !value) {
            errors.push('This field is required');
        }

        if (rules.min && parseFloat(value) < rules.min) {
            errors.push(`Minimum value is ${rules.min}`);
        }

        if (rules.max && parseFloat(value) > rules.max) {
            errors.push(`Maximum value is ${rules.max}`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || 'Invalid format');
        }

        // Update element styling
        if (errors.length > 0) {
            element.classList.add('error');
            element.title = errors.join(', ');
        } else {
            element.classList.remove('error');
            element.title = '';
        }

        return errors.length === 0;
    }

    /**
     * Get UI state
     */
    getState() {
        return {
            breakdownCollapsed: this.breakdownCollapsed,
            sections: Array.from(this.sections.entries()).map(([id, section]) => ({
                id,
                expanded: section.expanded
            }))
        };
    }

    /**
     * Load UI state
     */
    loadState(state) {
        if (state.breakdownCollapsed !== undefined) {
            this.breakdownCollapsed = state.breakdownCollapsed;
            if (this.breakdownCollapsed) {
                const breakdown = document.getElementById('breakdown');
                if (breakdown) {
                    breakdown.classList.add('collapsed');
                }
            }
        }

        if (state.sections) {
            state.sections.forEach(sectionState => {
                const section = this.sections.get(sectionState.id);
                if (section && sectionState.expanded) {
                    this.toggleSection(sectionState.id);
                }
            });
        }
    }
} 