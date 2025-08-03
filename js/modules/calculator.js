/**
 * Core Calculator Module
 * Handles all project calculations and result updates
 */

export class ProjectCalculator {
    constructor() {
        console.log('🔧 Initializing ProjectCalculator...');
        this.state = {
            cableLengthMode: 'average',
            laborMode: 'single',
            vendorPricing: {
                1: { name: '', items: [], active: true },
                2: { name: '', items: [], active: false },
                3: { name: '', items: [], active: false }
            },
            currentVendor: 1
        };

        // Initialize UI state after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeUI());
        } else {
            this.initializeUI();
        }
    }

    /**
     * Initialize UI state
     */
    initializeUI() {
        console.log('🔧 Initializing calculator UI...');
        
        // Load saved values from localStorage FIRST
        this.loadSavedValues();
        
        // Initialize labor mode UI
        const singleLabor = document.getElementById('singleLabor');
        const dualLabor = document.getElementById('dualLabor');
        const laborPreset = document.getElementById('laborPreset');
        
        if (singleLabor && dualLabor) {
            singleLabor.style.display = 'grid';
            dualLabor.style.display = 'none';
            
            // Only set default values if they haven't been loaded from localStorage
            // This prevents hard-coded values from overriding user input
            if (!document.getElementById('numTechnicians').value) {
                document.getElementById('numTechnicians').value = '1';
            }
            if (!document.getElementById('hourlyRate').value) {
                document.getElementById('hourlyRate').value = '25';
            }
            if (!document.getElementById('workHoursPerDay').value) {
                document.getElementById('workHoursPerDay').value = '0';
            }
            if (!document.getElementById('staffHours').value) {
                document.getElementById('staffHours').value = '0';
            }

            // Note: Input event listeners are now handled in main.js setupLaborEvents()
            console.log('🔧 Calculator UI initialized - input listeners handled by main.js');
        }
        
        // Load all line items from localStorage
        this.loadCableLineItems();
        
        // Load other line items from localStorage if they exist
        const savedState = localStorage.getItem('kgoProjectCalculator');
        if (savedState) {
            try {
                const formData = JSON.parse(savedState);
                if (formData.lineItems) {
                    this.loadAllLineItemsState(formData.lineItems);
                }
            } catch (error) {
                console.error('❌ Error loading line items from localStorage:', error);
            }
        }
        
        // Setup event listeners for existing cable line items
        document.querySelectorAll('#cableLengths .line-item').forEach(item => {
            this.setupCableLineItemEvents(item);
        });
        
        // Ensure UI state is properly restored after a short delay
        setTimeout(() => {
            this.updateUIForState();
        }, 100);

        // Add labor preset handler
        if (laborPreset) {
            laborPreset.addEventListener('change', (e) => {
                const preset = e.target.value;
                console.log('🔧 Labor preset changed:', preset);
                
                switch (preset) {
                    case 'rateA':
                        this.setLaborMode('single');
                        // Only set if user hasn't already set a value
                        if (!document.getElementById('hourlyRate').value || document.getElementById('hourlyRate').value === '0') {
                            document.getElementById('hourlyRate').value = '25';
                        }
                        break;
                    case 'rateB':
                        this.setLaborMode('single');
                        // Only set if user hasn't already set a value
                        if (!document.getElementById('hourlyRate').value || document.getElementById('hourlyRate').value === '0') {
                            document.getElementById('hourlyRate').value = '125';
                        }
                        break;
                    case 'zeroed':
                        this.setLaborMode('single');
                        // Only set if user hasn't already set a value
                        if (!document.getElementById('numTechnicians').value || document.getElementById('numTechnicians').value === '0') {
                            document.getElementById('numTechnicians').value = '0';
                        }
                        if (!document.getElementById('hourlyRate').value || document.getElementById('hourlyRate').value === '0') {
                            document.getElementById('hourlyRate').value = '0';
                        }
                        if (!document.getElementById('workHoursPerDay').value || document.getElementById('workHoursPerDay').value === '0') {
                            document.getElementById('workHoursPerDay').value = '0';
                        }
                        break;
                }
                this.calculate();
            });
        }
        
        this.results = {
            totalCables: 0,
            totalTerminations: 0,
            terminationHours: 0,
            projectDays: 0,
            laborCost: 0,
            suppliesCost: 0,
            materialsCost: 0,
            equipmentCost: 0,
            shippingCost: 0,
            adminCost: 0,
            vendorQuotesTotal: 0,
            pendingQuotesTotal: 0,
            approvedQuotesTotal: 0,
            activeVendorTotal: 0,
            staffHoursTotal: 0,
            staffAssignmentDetails: [],
            spoolsRequired: 0,
            totalCost: 0
        };
        
        this.breakdown = {
            termination: 0,
            running: 0,
            testing: 0,
            labeling: 0,
            cleanup: 0,
            cutover: 0,
            decommissioning: 0,
            rack: 0,
            total: 0
        };
    }

    /**
     * Main calculation method
     */
    calculate() {
        console.log('🔧 Starting calculation...');
        try {
            // Reset results to prevent accumulation
            this.results = {
                totalCables: 0,
                totalTerminations: 0,
                terminationHours: 0,
                projectDays: 0,
                laborCost: 0,
                suppliesCost: 0,
                materialsCost: 0,
                equipmentCost: 0,
                shippingCost: 0,
                adminCost: 0,
                vendorQuotesTotal: 0,
                pendingQuotesTotal: 0,
                approvedQuotesTotal: 0,
                activeVendorTotal: 0,
                staffHoursTotal: 0,
                staffAssignmentDetails: [],
                spoolsRequired: 0,
                totalCost: 0
            };

            // Reset breakdown to prevent accumulation
            this.breakdown = {
                termination: 0,
                running: 0,
                testing: 0,
                labeling: 0,
                cleanup: 0,
                cutover: 0,
                decommissioning: 0,
                rack: 0,
                total: 0
            };
            
            // Calculate cable data first
            console.log('🔧 Calculating cable data...');
            this.calculateCableData();
            
            // Calculate time breakdown (needed for labor costs)
            console.log('🔧 Calculating time breakdown...');
            this.calculateTimeBreakdown();
            
            // Now calculate labor costs with the updated time breakdown
            console.log('🔧 Calculating labor costs...');
            this.calculateLaborCosts();
            
            // Calculate remaining costs
            console.log('🔧 Calculating vendor costs...');
            this.calculateVendorCosts();
            console.log('🔧 Calculating equipment costs...');
            this.calculateEquipmentCosts();
            
            // Calculate final totals
            console.log('🔧 Calculating totals...');
            this.calculateTotals();
            
            // Update UI
            console.log('🔧 Updating UI...');
            this.updateResults();
            
            // Save values to localStorage
            this.saveValues();
            
            console.log('✅ Calculation complete');
        } catch (error) {
            console.error('❌ Error in calculation:', error);
            console.error('Stack trace:', error.stack);
        }
    }

    /**
     * Calculate cable-related data
     */
    calculateCableData() {
        console.log('🔧 Calculating cable data...');
        console.log('🔍 Current cable length mode:', this.state.cableLengthMode);
        
        let cables = 0;
        let length = 0;
        let totalCableQuantity = 0;

        if (this.state.cableLengthMode === 'average') {
            cables = parseInt(document.getElementById('numCables')?.value) || 0;
            const avgCableLength = parseInt(document.getElementById('avgCableLength')?.value) || 0;
            length = cables * avgCableLength;
            totalCableQuantity = cables;
            console.log('🔍 Average mode values:', { cables, avgCableLength, totalLength: length, totalCableQuantity });
        } else {
            // Calculated mode
            console.log('🔍 Calculating in calculated mode...');
            const lineItems = document.querySelectorAll('#cableLengths .line-item');
            console.log('🔍 Found line items:', lineItems.length);
            
            lineItems.forEach((item, index) => {
                const cableLengthInput = item.querySelector('.cable-length');
                const qtyInput = item.querySelector('.cable-qty');
                
                // Only process if we have valid numeric values
                if (cableLengthInput && qtyInput) {
                    const cableLengthRaw = cableLengthInput.value.trim();
                    const qtyRaw = qtyInput.value.trim();
                    
                    const cableLength = parseFloat(cableLengthRaw) || 0;
                    const qty = parseFloat(qtyRaw) || 0;
                    
                    console.log(`🔍 Line item ${index + 1} raw values:`, {
                        cableLengthRaw,
                        qtyRaw,
                        cableLengthParsed: cableLength,
                        qtyParsed: qty
                    });
                    
                    // Only add to totals if we have valid values
                    if (cableLength > 0 && qty > 0) {
                        length += (cableLength * qty);
                        totalCableQuantity += qty;
                        console.log(`🔍 Line item ${index + 1} calculated:`, { cableLength, qty, runningTotal: length, runningQty: totalCableQuantity });
                    } else {
                        console.log(`🔍 Line item ${index + 1} skipped - invalid values`);
                    }
                } else {
                    console.log(`🔍 Line item ${index + 1} skipped - missing inputs`);
                }
            });
        }

        const termsPerCable = parseInt(document.getElementById('terminationsPerCable')?.value) || 2;
        const totalTerms = totalCableQuantity * termsPerCable;
        const timePerTerm = parseFloat(document.getElementById('timePerTermination')?.value) || 0;
        const termHours = (totalTerms * timePerTerm) / 60;

        this.results.totalCables = totalCableQuantity;
        this.results.totalTerminations = totalTerms;
        this.results.terminationHours = termHours;

        console.log('🔍 Final cable calculation results:', {
            totalCableQuantity,
            totalTerms,
            termHours,
            totalLength: length
        });

        // Calculate spools required
        const spoolLength = parseInt(document.getElementById('spoolLength')?.value) || 1000;
        const wasteFactor = parseFloat(document.getElementById('wasteFactor')?.value) || 0;
        const totalLengthWithWaste = length * (1 + wasteFactor / 100);
        this.results.spoolsRequired = Math.ceil(totalLengthWithWaste / spoolLength);
        
        // Update cable summary if in calculated mode
        this.updateCableSummary(totalCableQuantity, length);
    }

    /**
     * Calculate labor costs
     */
    calculateLaborCosts() {
        console.log('🔧 Calculating labor costs...');
        let laborCost = 0;
        let laborHours = 0;

        if (this.state.laborMode === 'single') {
            const numTechs = parseInt(document.getElementById('numTechnicians')?.value) || 0;
            const techRate = parseFloat(document.getElementById('hourlyRate')?.value) || 0;
            const hoursPerDay = Math.round(parseFloat(document.getElementById('workHoursPerDay')?.value) || 0);
            
            console.log('🔍 Single rate mode values:', { numTechs, techRate, hoursPerDay });

            // Calculate total labor hours (per tech * number of techs * project days)
            laborHours = numTechs * hoursPerDay * this.results.projectDays;

            if (numTechs > 0 && hoursPerDay > 0) {
                if (hoursPerDay > 8) {
                    // Overtime calculation
                    const regularHours = Math.min(hoursPerDay, 8);
                    const overtimeHours = Math.min(hoursPerDay - 8, 4);
                    const doubleTimeHours = Math.max(hoursPerDay - 12, 0);

                    const regularPay = regularHours * techRate;
                    const overtimePay = overtimeHours * techRate * 1.5;
                    const doubleTimePay = doubleTimeHours * techRate * 2;

                    laborCost = Math.ceil((regularPay + overtimePay + doubleTimePay) * numTechs);
                } else {
                    laborCost = Math.ceil(hoursPerDay * numTechs * techRate);
                }
            }
        } else {
            // Dual rate mode
            const techACount = parseInt(document.getElementById('techACount')?.value) || 0;
            const techARate = parseFloat(document.getElementById('techARate')?.value) || 0;
            const techAHours = Math.round(parseFloat(document.getElementById('techAHours')?.value) || 0);

            const techBCount = parseInt(document.getElementById('techBCount')?.value) || 0;
            const techBRate = parseFloat(document.getElementById('techBRate')?.value) || 0;
            const techBHours = Math.round(parseFloat(document.getElementById('techBHours')?.value) || 0);
            
            console.log('🔍 Dual rate mode values:', {
                techA: { count: techACount, rate: techARate, hours: techAHours },
                techB: { count: techBCount, rate: techBRate, hours: techBHours }
            });

            laborHours = (techACount * techAHours) + (techBCount * techBHours);

            let techACost = 0;
            let techBCost = 0;

            // Calculate Tech A cost with overtime
            if (techACount > 0 && techAHours > 0) {
                techACost = this.calculateOvertimeCost(techAHours, techARate, techACount);
            }

            // Calculate Tech B cost with overtime
            if (techBCount > 0 && techBHours > 0) {
                techBCost = this.calculateOvertimeCost(techBHours, techBRate, techBCount);
            }

            laborCost = techACost + techBCost;
        }

        // Add staff hours (non-billable)
        const staffHours = parseFloat(document.getElementById('staffHours')?.value) || 0;
        
        // Calculate staff hours from line items
        let staffLineItemHours = 0;
        const staffLineItems = document.querySelectorAll('#staffLineItemsContainer .line-item');
        console.log('🔍 Found staff line items:', staffLineItems.length);
        
        staffLineItems.forEach((item, index) => {
            const hoursInput = item.querySelector('.staff-hours');
            const hours = parseFloat(hoursInput?.value) || 0;
            console.log(`🔍 Staff line item ${index + 1}: ${hours} hours`);
            staffLineItemHours += hours;
        });
        
        console.log('🔍 Staff hours from input field:', staffHours);
        console.log('🔍 Staff hours from line items:', staffLineItemHours);
        
        // Total staff hours = input field + line items
        this.results.staffHoursTotal = staffHours + staffLineItemHours;
        console.log('🔍 Total staff hours:', this.results.staffHoursTotal);

        // Generate staff assignment details for caption
        this.results.staffAssignmentDetails = this.generateStaffAssignmentDetails(staffHours, staffLineItems);

        this.results.laborCost = laborCost;
    }

    /**
     * Generate staff assignment details for caption
     */
    generateStaffAssignmentDetails(staffHours, staffLineItems) {
        const details = [];
        
        // Add assigned staff from line items
        staffLineItems.forEach((item, index) => {
            const descSelect = item.querySelector('.staff-desc');
            const hoursInput = item.querySelector('.staff-hours');
            const noteInput = item.querySelector('.staff-note');
            
            if (descSelect && hoursInput) {
                const staffName = descSelect.value;
                const hours = parseFloat(hoursInput.value) || 0;
                const note = noteInput?.value?.trim() || '';
                
                if (staffName && hours > 0) {
                    let detail = `${staffName}: ${hours.toFixed(1)}h`;
                    if (note) {
                        detail += ` (${note})`;
                    }
                    details.push(detail);
                }
            }
        });
        
        // Add unassigned but allocated hours from Labor for Staff field
        if (staffHours > 0) {
            details.push(`Unassigned: ${staffHours.toFixed(1)}h (allocated)`);
        }
        
        return details;
    }

    /**
     * Calculate overtime costs
     */
    calculateOvertimeCost(hours, rate, count) {
        if (hours > 8) {
            const regularHours = Math.min(hours, 8);
            const overtimeHours = Math.min(hours - 8, 4);
            const doubleTimeHours = Math.max(hours - 12, 0);

            const regularPay = regularHours * rate;
            const overtimePay = overtimeHours * rate * 1.5;
            const doubleTimePay = doubleTimeHours * rate * 2;

            return Math.ceil((regularPay + overtimePay + doubleTimePay) * count);
        } else {
            return Math.ceil(hours * count * rate);
        }
    }

    /**
     * Calculate vendor costs
     */
    calculateVendorCosts() {
        console.log('🔧 Calculating vendor costs...');
        console.log('🔍 window.vendorManager available:', !!window.vendorManager);
        console.log('🔍 window.vendorManager type:', typeof window.vendorManager);
        console.log('🔍 window.vendorManager vendors:', window.vendorManager?.vendors);
        
        let pendingQuotesTotal = 0;
        let approvedQuotesTotal = 0;
        let activeVendorTotal = 0;
        let vendorQuotesTotal = 0;

        // Use VendorManager data if available
        if (window.vendorManager) {
            console.log('🔍 Using VendorManager data...');
            const vendorData = window.vendorManager.getVendorData();
            console.log('🔍 Vendor data received:', vendorData);
            
            // Calculate pending and approved quotes from vendor quotes
            vendorData.vendorQuotes.forEach(quote => {
                if (quote.status === 'pending' || !quote.status) {
                    pendingQuotesTotal += quote.amount;
                } else if (quote.status === 'approved') {
                    approvedQuotesTotal += quote.amount;
                }
            });
            
            activeVendorTotal = vendorData.activeVendorTotal;
            // Quotes total should ONLY include quotes, not orders
            vendorQuotesTotal = pendingQuotesTotal + approvedQuotesTotal;
            
            console.log('🔍 Pending quotes total:', pendingQuotesTotal);
            console.log('🔍 Approved quotes total:', approvedQuotesTotal);
            console.log('🔍 Active vendor total (orders):', activeVendorTotal);
            console.log('🔍 Quotes total (quotes only):', vendorQuotesTotal);
        } else {
            console.log('🔍 VendorManager not available, using DOM fallback...');
            // Fallback to DOM reading if VendorManager not available
            // Calculate vendor quotes (pending and approved)
            document.querySelectorAll('#vendorQuotes .line-item').forEach(item => {
                const amount = parseFloat(item.querySelector('.vendor-quote-amount')?.value) || 0;
                const status = item.querySelector('.vendor-quote-status')?.value || 'pending';
                
                if (status === 'pending') {
                    pendingQuotesTotal += amount;
                } else if (status === 'approved') {
                    approvedQuotesTotal += amount;
                }
            });

            // Calculate active vendor orders
            for (let i = 1; i <= 3; i++) {
                const vendorDetails = document.getElementById(`vendor${i}Details`);
                if (vendorDetails) {
                    const toggle = vendorDetails.querySelector('.vendor-active-toggle');
                    const isActive = toggle && toggle.classList.contains('active');
                    
                    if (isActive) {
                        document.querySelectorAll(`#vendor${i}Details .vendor-items .line-item`).forEach(item => {
                            const qty = parseFloat(item.querySelector('.vendor-item-qty')?.value) || 1;
                            const cost = parseFloat(item.querySelector('.vendor-item-cost')?.value) || 0;
                            activeVendorTotal += qty * cost;
                        });
                    }
                }
            }
            
            // Quotes total should ONLY include quotes, not orders
            vendorQuotesTotal = pendingQuotesTotal + approvedQuotesTotal;
            console.log('🔍 DOM fallback - pending quotes total:', pendingQuotesTotal);
            console.log('🔍 DOM fallback - approved quotes total:', approvedQuotesTotal);
            console.log('🔍 DOM fallback - active vendor total (orders):', activeVendorTotal);
            console.log('🔍 DOM fallback - quotes total (quotes only):', vendorQuotesTotal);
        }

        this.results.pendingQuotesTotal = pendingQuotesTotal;
        this.results.approvedQuotesTotal = approvedQuotesTotal;
        this.results.activeVendorTotal = activeVendorTotal;
        this.results.vendorQuotesTotal = vendorQuotesTotal;
        
        console.log('🔧 Final vendor costs set:', {
            pendingQuotesTotal: this.results.pendingQuotesTotal,
            approvedQuotesTotal: this.results.approvedQuotesTotal,
            activeVendorTotal: this.results.activeVendorTotal,
            vendorQuotesTotal: this.results.vendorQuotesTotal
        });
    }

    /**
     * Calculate equipment and supplies costs
     */
    calculateEquipmentCosts() {
        let suppliesCost = 0;
        let materialsCost = 0;
        let equipmentCost = 0;
        let shippingCost = 0;
        let adminCost = 0;

        // Calculate supplies and expendables (existing other materials)
        document.querySelectorAll('#otherMaterials .line-item').forEach(item => {
            const qty = parseFloat(item.querySelector('.other-material-qty')?.value) || 0;
            const amount = parseFloat(item.querySelector('.other-material-amount')?.value) || 0;
            suppliesCost += qty * amount;
        });

        // Calculate materials and hardware
        document.querySelectorAll('#materialsItems .line-item').forEach(item => {
            const qty = parseFloat(item.querySelector('.material-qty')?.value) || 0;
            const cost = parseFloat(item.querySelector('.material-cost')?.value) || 0;
            materialsCost += qty * cost;
        });

        // Calculate equipment and tools
        document.querySelectorAll('#equipmentItems .line-item').forEach(item => {
            const qty = parseFloat(item.querySelector('.equipment-qty')?.value) || 0;
            const cost = parseFloat(item.querySelector('.equipment-cost')?.value) || 0;
            equipmentCost += qty * cost;
        });

        // Calculate shipping and logistics
        document.querySelectorAll('#shippingItems .line-item').forEach(item => {
            const qty = parseFloat(item.querySelector('.shipping-qty')?.value) || 0;
            const cost = parseFloat(item.querySelector('.shipping-cost')?.value) || 0;
            shippingCost += qty * cost;
        });

        // Calculate documentation and admin
        document.querySelectorAll('#adminItems .line-item').forEach(item => {
            const qty = parseFloat(item.querySelector('.admin-qty')?.value) || 0;
            const cost = parseFloat(item.querySelector('.admin-cost')?.value) || 0;
            adminCost += qty * cost;
        });

        this.results.suppliesCost = suppliesCost;
        this.results.materialsCost = materialsCost;
        this.results.equipmentCost = equipmentCost;
        this.results.shippingCost = shippingCost;
        this.results.adminCost = adminCost;
    }

    /**
     * Calculate time breakdown
     */
    calculateTimeBreakdown() {
        console.log('🔧 Calculating time breakdown...');
        
        // Reset breakdown values to prevent accumulation
        this.breakdown = {
            termination: 0,
            running: 0,
            testing: 0,
            labeling: 0,
            cleanup: 0,
            cutover: 0,
            decommissioning: 0,
            rack: 0,
            total: 0
        };
        
        const totalCableQuantity = this.results.totalCables;
        
        const runTime = parseFloat(document.getElementById('cableRunTime')?.value) || 0;
        const testTime = parseFloat(document.getElementById('testingTime')?.value) || 0;
        const rackTime = parseFloat(document.getElementById('rackSetupTime')?.value) || 0;
        const labelingTime = parseFloat(document.getElementById('labelingTime')?.value) || 0;
        const cleanupTime = parseFloat(document.getElementById('cleanupTime')?.value) || 0;
        const cutoverTime = parseFloat(document.getElementById('cutoverTime')?.value) || 0;
        const decommissioningTime = parseFloat(document.getElementById('decommissioningTime')?.value) || 0;

        console.log('🔍 Time values:', {
            runTime,
            testTime,
            rackTime,
            labelingTime,
            cleanupTime,
            cutoverTime,
            decommissioningTime,
            totalCableQuantity
        });

        // Calculate fresh values
        this.breakdown.termination = this.results.terminationHours;
        this.breakdown.running = (totalCableQuantity * runTime) / 60;
        this.breakdown.testing = (totalCableQuantity * testTime) / 60;
        this.breakdown.labeling = (totalCableQuantity * labelingTime) / 60;
        this.breakdown.cleanup = cleanupTime;
        this.breakdown.cutover = cutoverTime;
        this.breakdown.decommissioning = decommissioningTime;
        this.breakdown.rack = rackTime;

        // Calculate total from scratch
        this.breakdown.total = Object.values(this.breakdown).reduce((sum, value) => sum + value, 0);
        
        console.log('🔍 Breakdown values:', this.breakdown);
        console.log('🔍 Total breakdown hours:', this.breakdown.total);
        
        // Calculate project days
        const hoursPerDay = 8;
        this.results.projectDays = this.breakdown.total / hoursPerDay;
        
        console.log('🔍 Project days calculated:', this.results.projectDays);
    }

    /**
     * Calculate total project cost
     */
    calculateTotals() {
        this.results.totalCost = 
            this.results.laborCost + 
            this.results.suppliesCost + 
            this.results.materialsCost + 
            this.results.equipmentCost + 
            this.results.shippingCost + 
            this.results.adminCost + 
            this.results.vendorQuotesTotal + // Quotes only (pending + approved)
            this.results.activeVendorTotal; // Orders (active vendor totals)
    }

    /**
     * Update UI with calculated results
     */
    updateResults() {
        // Update result cards
        this.updateElement('totalCables', this.results.totalCables.toString());
        this.updateElement('totalTerminations', this.results.totalTerminations.toString());
        this.updateElement('terminationHours', this.formatHours(this.results.terminationHours));
        this.updateElement('projectDays', this.formatDays(this.results.projectDays));
        this.updateElement('laborCost', this.formatCurrency(this.results.laborCost));
        this.updateElement('suppliesCost', this.formatCurrency(this.results.suppliesCost));
        this.updateElement('materialsCost', this.formatCurrency(this.results.materialsCost));
        this.updateElement('equipmentCost', this.formatCurrency(this.results.equipmentCost));
        this.updateElement('shippingCost', this.formatCurrency(this.results.shippingCost));
        this.updateElement('adminCost', this.formatCurrency(this.results.adminCost));
        this.updateElement('vendorQuotesTotal', this.formatCurrency(this.results.vendorQuotesTotal));
        this.updateElement('pendingQuotesTotal', this.formatCurrency(this.results.pendingQuotesTotal));
        this.updateElement('approvedQuotesTotal', this.formatCurrency(this.results.approvedQuotesTotal));
        this.updateElement('activeVendorTotal', this.formatCurrency(this.results.activeVendorTotal));
        this.updateElement('staffHoursTotal', this.results.staffHoursTotal.toFixed(1));
        
        // Update staff hours caption with assignment details
        this.updateStaffHoursCaption();
        this.updateElement('spoolsRequired', this.results.spoolsRequired.toString());
        this.updateElement('totalCost', this.formatCurrency(this.results.totalCost));

        // Update detailed breakdowns for termination time and project duration
        this.updateTerminationDetails();
        this.updateProjectDurationDetails();
        this.updateLaborDetails();
        this.updateSpoolDetails();
        this.updateVendorQuoteDetails();

        // Update breakdown
        this.updateElement('breakdownTermination', this.formatHours(this.breakdown.termination));
        this.updateElement('breakdownRunning', this.formatHours(this.breakdown.running));
        this.updateElement('breakdownTesting', this.formatHours(this.breakdown.testing));
        this.updateElement('breakdownLabeling', this.formatHours(this.breakdown.labeling));
        this.updateElement('breakdownCleanup', this.formatHours(this.breakdown.cleanup));
        this.updateElement('breakdownCutover', this.formatHours(this.breakdown.cutover));
        this.updateElement('breakdownDecommissioning', this.formatHours(this.breakdown.decommissioning));
        this.updateElement('breakdownRack', this.formatHours(this.breakdown.rack));
        this.updateElement('breakdownTotal', this.formatHours(this.breakdown.total));

        // Update reconciliation status
        console.log('🔧 Updating labor reconciliation...');
        const calculatedHours = Math.round(this.breakdown.total);
        let allocatedHours = 0;

        if (this.state.laborMode === 'single') {
            const numTechs = parseInt(document.getElementById('numTechnicians')?.value) || 0;
            const hoursPerDay = Math.round(parseFloat(document.getElementById('workHoursPerDay')?.value) || 0);
            allocatedHours = numTechs * hoursPerDay;
        } else {
            const techACount = parseInt(document.getElementById('techACount')?.value) || 0;
            const techAHours = Math.round(parseFloat(document.getElementById('techAHours')?.value) || 0);
            const techBCount = parseInt(document.getElementById('techBCount')?.value) || 0;
            const techBHours = Math.round(parseFloat(document.getElementById('techBHours')?.value) || 0);
            allocatedHours = (techACount * techAHours) + (techBCount * techBHours);
        }

        const difference = calculatedHours - allocatedHours;
        console.log('🔍 Labor reconciliation:', { calculatedHours, allocatedHours, difference });

        this.updateElement('calculatedHours', this.formatHours(calculatedHours));
        this.updateElement('allocatedHours', this.formatHours(allocatedHours));
        this.updateElement('hoursDifference', this.formatHours(Math.abs(difference)));

        // Show/hide reconciliation status
        const reconciliationStatus = document.getElementById('reconciliationStatus');
        if (reconciliationStatus) {
            const shouldShow = calculatedHours > 0 || allocatedHours > 0;
            console.log('🔍 Reconciliation status visibility:', shouldShow);
            reconciliationStatus.style.display = shouldShow ? 'block' : 'none';
        }

        // Refresh charts if graphics manager is available
        if (window.graphicsManager) {
            window.graphicsManager.refreshCharts();
        }
    }

    /**
     * Update staff hours caption with assignment details
     */
    updateStaffHoursCaption() {
        const captionElement = document.getElementById('staffHoursCaption');
        if (!captionElement) return;
        
        const details = this.results.staffAssignmentDetails || [];
        
        if (details.length === 0) {
            captionElement.textContent = 'No staff assignments';
            return;
        }
        
        // Format the details for display
        const formattedDetails = details.map(detail => {
            // Truncate long details to fit in caption
            if (detail.length > 40) {
                return detail.substring(0, 37) + '...';
            }
            return detail;
        });
        
        // Join with line breaks for better readability
        captionElement.innerHTML = formattedDetails.join('<br>');
    }

    /**
     * Update termination time details with calculation breakdown
     */
    updateTerminationDetails() {
        const totalTerms = this.results.totalTerminations;
        const timePerTerm = parseFloat(document.getElementById('timePerTermination')?.value) || 1.5;
        
        if (totalTerms > 0) {
            const detailDisplay = `${totalTerms} connections × ${timePerTerm.toFixed(1)} min each`;
            this.updateElement('terminationDetails', detailDisplay);
        } else {
            this.updateElement('terminationDetails', '0.0 minutes');
        }
    }

    /**
     * Update project duration details with total hours breakdown
     */
    updateProjectDurationDetails() {
        const totalHours = this.breakdown.total;
        
        if (totalHours > 0) {
            this.updateElement('totalHours', `${totalHours.toFixed(1)} total hours`);
        } else {
            this.updateElement('totalHours', '0 total hours');
        }
    }

    /**
     * Update labor cost details with calculation breakdown
     */
    updateLaborDetails() {
        let laborDetails = '';

        if (this.state.laborMode === 'single') {
            const numTechs = parseInt(document.getElementById('numTechnicians')?.value) || 0;
            const techRate = parseFloat(document.getElementById('hourlyRate')?.value) || 0;
            const hoursPerDay = Math.round(parseFloat(document.getElementById('workHoursPerDay')?.value) || 0);
            
            if (numTechs > 0 && hoursPerDay > 0 && techRate > 0) {
                laborDetails = `${numTechs} techs × ${hoursPerDay.toFixed(1)} hrs × $${techRate}/hr`;
            } else {
                laborDetails = 'No labor allocated';
            }
        } else {
            // Dual rate mode
            const techACount = parseInt(document.getElementById('techACount')?.value) || 0;
            const techARate = parseFloat(document.getElementById('techARate')?.value) || 0;
            const techAHours = Math.round(parseFloat(document.getElementById('techAHours')?.value) || 0);

            const techBCount = parseInt(document.getElementById('techBCount')?.value) || 0;
            const techBRate = parseFloat(document.getElementById('techBRate')?.value) || 0;
            const techBHours = Math.round(parseFloat(document.getElementById('techBHours')?.value) || 0);
            
            const laborParts = [];
            
            if (techACount > 0 && techAHours > 0 && techARate > 0) {
                laborParts.push(`${techACount} techs × ${techAHours.toFixed(1)} hrs × $${techARate}/hr`);
            }
            
            if (techBCount > 0 && techBHours > 0 && techBRate > 0) {
                laborParts.push(`${techBCount} techs × ${techBHours.toFixed(1)} hrs × $${techBRate}/hr`);
            }
            
            laborDetails = laborParts.length > 0 ? laborParts.join(' + ') : 'No labor allocated';
        }

        this.updateElement('laborDetails', laborDetails);
    }

    /**
     * Update spool details with cable length and waste factor breakdown
     */
    updateSpoolDetails() {
        let totalCableNeeded = 0;
        let wasteFactor = parseFloat(document.getElementById('wasteFactor')?.value) || 0;

        if (this.state.cableLengthMode === 'average') {
            const cables = parseInt(document.getElementById('numCables')?.value) || 0;
            const length = parseInt(document.getElementById('avgCableLength')?.value) || 0;
            totalCableNeeded = cables * length;
        } else {
            // Calculated mode - sum up all cable lengths
            const lineItems = document.querySelectorAll('#cableLengths .line-item');
            lineItems.forEach((item) => {
                const cableLengthInput = item.querySelector('.cable-length');
                const qtyInput = item.querySelector('.cable-qty');
                
                if (cableLengthInput && qtyInput) {
                    const cableLength = parseFloat(cableLengthInput.value.trim()) || 0;
                    const qty = parseFloat(qtyInput.value.trim()) || 0;
                    totalCableNeeded += (cableLength * qty);
                }
            });
        }

        const spoolDetails = `${totalCableNeeded}ft needed + ${wasteFactor}% waste`;
        this.updateElement('spoolDetails', spoolDetails);
    }

    /**
     * Update vendor quote details with count and total
     */
    updateVendorQuoteDetails() {
        let quoteCount = 0;
        let pendingCount = 0;
        let approvedCount = 0;
        let orderCount = 0;
        
        // Get quote counts and totals from VendorManager if available
        if (window.vendorManager) {
            const vendorData = window.vendorManager.getVendorData();
            quoteCount = vendorData.vendorQuotes.length;
            
            // Count pending and approved quotes
            vendorData.vendorQuotes.forEach(quote => {
                if (quote.status === 'pending' || !quote.status) {
                    pendingCount++;
                } else if (quote.status === 'approved') {
                    approvedCount++;
                }
            });
            
            // Count active vendor orders
            Object.values(vendorData.vendors).forEach(vendor => {
                if (vendor.active && vendor.items.length > 0) {
                    orderCount += vendor.items.length;
                }
            });
        }
        
        // Update the quotes detail text (only quotes, no orders)
        if (quoteCount > 0) {
            this.updateElement('vendorQuotesDetail', `${quoteCount} quote${quoteCount === 1 ? '' : 's'}`);
        } else {
            this.updateElement('vendorQuotesDetail', '0 quotes');
        }
        
        // Update the orders detail text (separate from quotes)
        if (orderCount > 0) {
            this.updateElement('vendorOrdersDetail', `${orderCount} order${orderCount === 1 ? '' : 's'}`);
        } else {
            this.updateElement('vendorOrdersDetail', '0 orders');
        }
        
        // Update the breakdown caption with individual totals
        const breakdownElement = document.getElementById('vendorQuotesBreakdown');
        if (breakdownElement) {
            const pendingSpan = breakdownElement.querySelector('#pendingQuotesTotal');
            const approvedSpan = breakdownElement.querySelector('#approvedQuotesTotal');
            
            if (pendingSpan) {
                pendingSpan.textContent = this.formatCurrency(this.results.pendingQuotesTotal);
            }
            if (approvedSpan) {
                approvedSpan.textContent = this.formatCurrency(this.results.approvedQuotesTotal);
            }
        }

        // Update vendor orders breakdown
        this.updateVendorOrdersBreakdown();
    }

    /**
     * Update vendor orders breakdown display
     */
    updateVendorOrdersBreakdown() {
        if (!window.vendorManager) {
            console.warn('⚠️ Vendor manager not available for orders breakdown');
            return;
        }

        const breakdownData = window.vendorManager.getVendorOrderBreakdown();
        const breakdownElement = document.getElementById('vendorOrdersBreakdown');
        
        if (breakdownElement && breakdownData.breakdown.length > 0) {
            const container = breakdownElement.querySelector('div');
            if (container) {
                container.innerHTML = '';
                
                breakdownData.breakdown.forEach(vendor => {
                    const vendorDiv = document.createElement('div');
                    vendorDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1px 0;';
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = `${vendor.name}:`;
                    nameSpan.style.cssText = 'font-weight: 500; color: #495057;';
                    
                    const detailsSpan = document.createElement('span');
                    detailsSpan.textContent = `${this.formatCurrency(vendor.total)} (${vendor.orderCount} order${vendor.orderCount === 1 ? '' : 's'})`;
                    detailsSpan.style.cssText = 'color: #6c757d; font-size: 0.85em;';
                    
                    vendorDiv.appendChild(nameSpan);
                    vendorDiv.appendChild(detailsSpan);
                    container.appendChild(vendorDiv);
                });
            }
        } else if (breakdownElement) {
            // Clear the breakdown if no active vendors with orders
            const container = breakdownElement.querySelector('div');
            if (container) {
                container.innerHTML = '';
            }
        }
    }

    /**
     * Helper method to update DOM elements
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Format hours for display
     */
    formatHours(hours) {
        if (hours < 1) {
            return `${(hours * 60).toFixed(1)} minutes`;
        } else {
            return `${hours.toFixed(2)} hours`;
        }
    }

    /**
     * Format days for display
     */
    formatDays(days) {
        if (days < 1) {
            return `${(days * 8).toFixed(1)} hours`;
        } else {
            return `${days.toFixed(1)} days`;
        }
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount) {
        return `$${amount.toLocaleString()}`;
    }

    /**
     * Set cable length mode
     */
    setCableLengthMode(mode) {
        console.log('🔧 Setting cable length mode:', mode);
        this.state.cableLengthMode = mode;
        
        // Update UI
        const averageMode = document.getElementById('averageLengthMode');
        const calculatedMode = document.getElementById('calculatedLengthMode');
        const toggleBtns = document.querySelectorAll('.toggle-btn[data-mode]');

        if (averageMode && calculatedMode) {
            averageMode.style.display = mode === 'average' ? 'block' : 'none';
            calculatedMode.style.display = mode === 'calculated' ? 'block' : 'none';
        }

        // Update toggle buttons
        toggleBtns.forEach(btn => {
            const btnMode = btn.getAttribute('data-mode');
            if (btnMode === 'average' || btnMode === 'calculated') {
                btn.classList.toggle('active', btnMode === mode);
            }
        });

        // Trigger calculation and save
        this.calculate();
        this.saveValues();
    }

    /**
     * Set labor mode
     */
    setLaborMode(mode) {
        console.log('🔧 Setting labor mode:', mode);
        this.state.laborMode = mode;

        // Update UI
        const singleLabor = document.getElementById('singleLabor');
        const dualLabor = document.getElementById('dualLabor');
        const toggleBtns = document.querySelectorAll('.toggle-btn[data-mode]');

        if (singleLabor && dualLabor) {
            singleLabor.style.display = mode === 'single' ? 'grid' : 'none';
            dualLabor.style.display = mode === 'dual' ? 'grid' : 'none';
        }

        // Update toggle buttons
        toggleBtns.forEach(btn => {
            const btnMode = btn.getAttribute('data-mode');
            btn.classList.toggle('active', btnMode === mode);
        });

        // Only set default values if the fields are empty or have default values
        // This prevents overriding user input when switching modes
        if (mode === 'single') {
            // Only set defaults if values are empty or zero
            if (!document.getElementById('numTechnicians').value || document.getElementById('numTechnicians').value === '0') {
                document.getElementById('numTechnicians').value = '1';
            }
            if (!document.getElementById('hourlyRate').value || document.getElementById('hourlyRate').value === '0') {
                document.getElementById('hourlyRate').value = '25';
            }
            if (!document.getElementById('workHoursPerDay').value || document.getElementById('workHoursPerDay').value === '0') {
                document.getElementById('workHoursPerDay').value = '0';
            }
        } else {
            // Only set defaults if values are empty or zero
            if (!document.getElementById('techACount').value || document.getElementById('techACount').value === '0') {
                document.getElementById('techACount').value = '1';
            }
            if (!document.getElementById('techARate').value || document.getElementById('techARate').value === '0') {
                document.getElementById('techARate').value = '25';
            }
            if (!document.getElementById('techAHours').value || document.getElementById('techAHours').value === '0') {
                document.getElementById('techAHours').value = '0';
            }
            if (!document.getElementById('techBCount').value || document.getElementById('techBCount').value === '0') {
                document.getElementById('techBCount').value = '1';
            }
            if (!document.getElementById('techBRate').value || document.getElementById('techBRate').value === '0') {
                document.getElementById('techBRate').value = '125';
            }
            if (!document.getElementById('techBHours').value || document.getElementById('techBHours').value === '0') {
                document.getElementById('techBHours').value = '0';
            }
        }

        // Event listeners are handled centrally in main.js
        console.log('🔧 Labor mode set to:', mode);

        this.calculate();
        this.saveValues();
    }

    /**
     * Update vendor pricing
     */
    updateVendorPricing(vendorNum, data) {
        this.state.vendorPricing[vendorNum] = { ...this.state.vendorPricing[vendorNum], ...data };
        this.calculate();
    }

    /**
     * Get current results
     */
    getResults() {
        return { ...this.results };
    }

    /**
     * Get current breakdown
     */
    getBreakdown() {
        return { ...this.breakdown };
    }

    /**
     * Get state for persistence
     */
    getState() {
        return {
            state: { ...this.state },
            results: { ...this.results },
            lineItems: this.getAllLineItemsState(),
            inputValues: this.getInputValues(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Load state from persistence
     */
    loadState(state) {
        try {
            console.log('🔧 Loading calculator state:', state);
            
            if (state.state) {
                this.state = { ...state.state };
            }
            
            if (state.results) {
                this.results = { ...state.results };
            }
            
            if (state.lineItems) {
                this.loadAllLineItemsState(state.lineItems);
            } else if (state.cableLineItems) {
                // Backward compatibility
                this.loadCableLineItemsState(state.cableLineItems);
            }
            
            if (state.inputValues) {
                this.loadInputValues(state.inputValues);
            }
            
            // Update UI to reflect loaded state
            this.updateUIForState();
            
            console.log('✅ Calculator state loaded successfully');
        } catch (error) {
            console.error('Error loading calculator state:', error);
        }
    }

    /**
     * Get cable line items state
     */
    getCableLineItemsState() {
        const cableLineItems = [];
        const cableContainer = document.getElementById('cableLengths');
        
        if (cableContainer) {
            const items = cableContainer.querySelectorAll('.line-item:not(.add-cable-item)');
            items.forEach(item => {
                const cableType = item.querySelector('.cable-type')?.value || '';
                const qty = item.querySelector('.cable-qty')?.value || '';
                const length = item.querySelector('.cable-length')?.value || '';
                
                if (cableType || qty || length) {
                    cableLineItems.push({
                        cableType: cableType,
                        qty: qty,
                        length: length
                    });
                }
            });
        }
        
        return cableLineItems;
    }

    /**
     * Load cable line items state
     */
    loadCableLineItemsState(cableLineItems) {
        const cableContainer = document.getElementById('cableLengths');
        if (!cableContainer) return;
        
        // Clear existing items
        const existingItems = cableContainer.querySelectorAll('.line-item:not(.add-cable-item)');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        cableLineItems.forEach(itemData => {
            this.addCableLineItem(itemData.cableType, itemData.qty, itemData.length);
        });
    }

    /**
     * Get all line items state for all categories
     */
    getAllLineItemsState() {
        const vendorState = window.vendorManager ? window.vendorManager.getState() : null;
        
        // Debug vendor state being collected
        if (vendorState && vendorState.vendors) {
            console.log('🔍 Vendor state being collected:', vendorState);
            if (vendorState.vendors[3]) {
                console.log('🔍 VENDOR 3 SPECIFIC - State being collected:', vendorState.vendors[3]);
            }
        }
        
        return {
            cableLineItems: this.getCableLineItemsState(),
            staffLineItems: this.getStaffLineItemsState(),
            suppliesLineItems: this.getSuppliesLineItemsState(),
            materialsLineItems: this.getMaterialsLineItemsState(),
            equipmentLineItems: this.getEquipmentLineItemsState(),
            shippingLineItems: this.getShippingLineItemsState(),
            adminLineItems: this.getAdminLineItemsState(),
            vendorQuotes: vendorState
        };
    }

    /**
     * Load all line items state for all categories
     */
    loadAllLineItemsState(lineItemsState) {
        if (lineItemsState.cableLineItems) {
            this.loadCableLineItemsState(lineItemsState.cableLineItems);
        }
        if (lineItemsState.staffLineItems) {
            this.loadStaffLineItemsState(lineItemsState.staffLineItems);
        }
        if (lineItemsState.suppliesLineItems) {
            this.loadSuppliesLineItemsState(lineItemsState.suppliesLineItems);
        }
        if (lineItemsState.materialsLineItems) {
            this.loadMaterialsLineItemsState(lineItemsState.materialsLineItems);
        }
        if (lineItemsState.equipmentLineItems) {
            this.loadEquipmentLineItemsState(lineItemsState.equipmentLineItems);
        }
        if (lineItemsState.shippingLineItems) {
            this.loadShippingLineItemsState(lineItemsState.shippingLineItems);
        }
        if (lineItemsState.adminLineItems) {
            this.loadAdminLineItemsState(lineItemsState.adminLineItems);
        }
        if (lineItemsState.vendorQuotes && window.vendorManager) {
            console.log('🔍 Loading vendor state:', lineItemsState.vendorQuotes);
            if (lineItemsState.vendorQuotes.vendors && lineItemsState.vendorQuotes.vendors[3]) {
                console.log('🔍 VENDOR 3 SPECIFIC - Loading state:', lineItemsState.vendorQuotes.vendors[3]);
            }
            window.vendorManager.loadState(lineItemsState.vendorQuotes);
        }
    }

    /**
     * Get staff line items state
     */
    getStaffLineItemsState() {
        const staffLineItems = [];
        const staffContainer = document.getElementById('staffLineItemsContainer');
        
        if (staffContainer) {
            const items = staffContainer.querySelectorAll('.line-item');
            items.forEach(item => {
                const description = item.querySelector('.staff-desc')?.value || '';
                const hours = item.querySelector('.staff-hours')?.value || '';
                const rate = item.querySelector('.staff-rate')?.value || '';
                const notes = item.querySelector('.staff-note')?.value || '';
                
                if (description || hours || notes) {
                    staffLineItems.push({
                        description: description,
                        hours: hours,
                        notes: notes
                    });
                }
            });
        }
        
        return staffLineItems;
    }

    /**
     * Load staff line items state
     */
    loadStaffLineItemsState(staffLineItems) {
        const staffContainer = document.getElementById('staffLineItemsContainer');
        if (!staffContainer) return;
        
        // Clear existing items
        const existingItems = staffContainer.querySelectorAll('.line-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        staffLineItems.forEach(itemData => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            lineItem.innerHTML = `
                <select class="staff-desc" style="flex: 2; padding: 4px 8px; border: 1px solid #ced4da; border-radius: 4px; background: white;">
                    <option value="">Select Staff...</option>
                </select>
                <input type="text" placeholder="Note" class="staff-note" style="flex: 3;">
                <input type="number" placeholder="Hours" class="staff-hours" step="0.1" min="0" style="width: 60px;">
                <button class="remove-btn">✕</button>
            `;
            staffContainer.appendChild(lineItem);
            
            // Set values
            const descSelect = lineItem.querySelector('.staff-desc');
            const notesInput = lineItem.querySelector('.staff-note');
            const hoursInput = lineItem.querySelector('.staff-hours');
            
            if (descSelect) descSelect.value = itemData.description;
            if (notesInput) notesInput.value = itemData.notes;
            if (hoursInput) hoursInput.value = itemData.hours;
            
            // Setup events
            this.setupLineItemEvents(lineItem);
        });
        
        // Update staff description dropdowns after loading
        if (window.UIUtils && window.UIUtils.updateAllStaffDescriptionDropdowns) {
            window.UIUtils.updateAllStaffDescriptionDropdowns();
        }
    }

    /**
     * Get supplies line items state
     */
    getSuppliesLineItemsState() {
        const suppliesLineItems = [];
        const suppliesContainer = document.getElementById('otherMaterials');
        
        if (suppliesContainer) {
            const items = suppliesContainer.querySelectorAll('.line-item');
            items.forEach(item => {
                const description = item.querySelector('.other-material-desc')?.value || '';
                const qty = item.querySelector('.other-material-qty')?.value || '';
                const amount = item.querySelector('.other-material-amount')?.value || '';
                
                if (description || qty || amount) {
                    suppliesLineItems.push({
                        description: description,
                        qty: qty,
                        amount: amount
                    });
                }
            });
        }
        
        return suppliesLineItems;
    }

    /**
     * Load supplies line items state
     */
    loadSuppliesLineItemsState(suppliesLineItems) {
        const suppliesContainer = document.getElementById('otherMaterials');
        if (!suppliesContainer) return;
        
        // Clear existing items
        const existingItems = suppliesContainer.querySelectorAll('.line-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        suppliesLineItems.forEach(itemData => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            lineItem.innerHTML = `
                <input type="text" placeholder="Description" class="other-material-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="other-material-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="other-material-amount" step="1" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
            suppliesContainer.appendChild(lineItem);
            
            // Set values
            const descInput = lineItem.querySelector('.other-material-desc');
            const qtyInput = lineItem.querySelector('.other-material-qty');
            const amountInput = lineItem.querySelector('.other-material-amount');
            
            if (descInput) descInput.value = itemData.description;
            if (qtyInput) qtyInput.value = itemData.qty;
            if (amountInput) amountInput.value = itemData.amount;
            
            // Setup events
            this.setupLineItemEvents(lineItem);
        });
    }

    /**
     * Get materials line items state
     */
    getMaterialsLineItemsState() {
        const materialsLineItems = [];
        const materialsContainer = document.getElementById('materialsItems');
        
        if (materialsContainer) {
            const items = materialsContainer.querySelectorAll('.line-item');
            items.forEach(item => {
                const description = item.querySelector('.material-desc')?.value || '';
                const qty = item.querySelector('.material-qty')?.value || '';
                const cost = item.querySelector('.material-cost')?.value || '';
                
                if (description || qty || cost) {
                    materialsLineItems.push({
                        description: description,
                        qty: qty,
                        cost: cost
                    });
                }
            });
        }
        
        return materialsLineItems;
    }

    /**
     * Load materials line items state
     */
    loadMaterialsLineItemsState(materialsLineItems) {
        const materialsContainer = document.getElementById('materialsItems');
        if (!materialsContainer) return;
        
        // Clear existing items
        const existingItems = materialsContainer.querySelectorAll('.line-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        materialsLineItems.forEach(itemData => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            lineItem.innerHTML = `
                <input type="text" placeholder="Description" class="material-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="material-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="material-cost" step="1" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
            materialsContainer.appendChild(lineItem);
            
            // Set values
            const descInput = lineItem.querySelector('.material-desc');
            const qtyInput = lineItem.querySelector('.material-qty');
            const costInput = lineItem.querySelector('.material-cost');
            
            if (descInput) descInput.value = itemData.description;
            if (qtyInput) qtyInput.value = itemData.qty;
            if (costInput) costInput.value = itemData.cost;
            
            // Setup events
            this.setupLineItemEvents(lineItem);
        });
    }

    /**
     * Get equipment line items state
     */
    getEquipmentLineItemsState() {
        const equipmentLineItems = [];
        const equipmentContainer = document.getElementById('equipmentItems');
        
        if (equipmentContainer) {
            const items = equipmentContainer.querySelectorAll('.line-item');
            items.forEach(item => {
                const description = item.querySelector('.equipment-desc')?.value || '';
                const qty = item.querySelector('.equipment-qty')?.value || '';
                const cost = item.querySelector('.equipment-cost')?.value || '';
                
                if (description || qty || cost) {
                    equipmentLineItems.push({
                        description: description,
                        qty: qty,
                        cost: cost
                    });
                }
            });
        }
        
        return equipmentLineItems;
    }

    /**
     * Load equipment line items state
     */
    loadEquipmentLineItemsState(equipmentLineItems) {
        const equipmentContainer = document.getElementById('equipmentItems');
        if (!equipmentContainer) return;
        
        // Clear existing items
        const existingItems = equipmentContainer.querySelectorAll('.line-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        equipmentLineItems.forEach(itemData => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            lineItem.innerHTML = `
                <input type="text" placeholder="Description" class="equipment-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="equipment-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="equipment-cost" step="1" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
            equipmentContainer.appendChild(lineItem);
            
            // Set values
            const descInput = lineItem.querySelector('.equipment-desc');
            const qtyInput = lineItem.querySelector('.equipment-qty');
            const costInput = lineItem.querySelector('.equipment-cost');
            
            if (descInput) descInput.value = itemData.description;
            if (qtyInput) qtyInput.value = itemData.qty;
            if (costInput) costInput.value = itemData.cost;
            
            // Setup events
            this.setupLineItemEvents(lineItem);
        });
    }

    /**
     * Get shipping line items state
     */
    getShippingLineItemsState() {
        const shippingLineItems = [];
        const shippingContainer = document.getElementById('shippingItems');
        
        if (shippingContainer) {
            const items = shippingContainer.querySelectorAll('.line-item');
            items.forEach(item => {
                const description = item.querySelector('.shipping-desc')?.value || '';
                const qty = item.querySelector('.shipping-qty')?.value || '';
                const cost = item.querySelector('.shipping-cost')?.value || '';
                
                if (description || qty || cost) {
                    shippingLineItems.push({
                        description: description,
                        qty: qty,
                        cost: cost
                    });
                }
            });
        }
        
        return shippingLineItems;
    }

    /**
     * Load shipping line items state
     */
    loadShippingLineItemsState(shippingLineItems) {
        const shippingContainer = document.getElementById('shippingItems');
        if (!shippingContainer) return;
        
        // Clear existing items
        const existingItems = shippingContainer.querySelectorAll('.line-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        shippingLineItems.forEach(itemData => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            lineItem.innerHTML = `
                <input type="text" placeholder="Description" class="shipping-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="shipping-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="shipping-cost" step="1" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
            shippingContainer.appendChild(lineItem);
            
            // Set values
            const descInput = lineItem.querySelector('.shipping-desc');
            const qtyInput = lineItem.querySelector('.shipping-qty');
            const costInput = lineItem.querySelector('.shipping-cost');
            
            if (descInput) descInput.value = itemData.description;
            if (qtyInput) qtyInput.value = itemData.qty;
            if (costInput) costInput.value = itemData.cost;
            
            // Setup events
            this.setupLineItemEvents(lineItem);
        });
    }

    /**
     * Get admin line items state
     */
    getAdminLineItemsState() {
        const adminLineItems = [];
        const adminContainer = document.getElementById('adminItems');
        
        if (adminContainer) {
            const items = adminContainer.querySelectorAll('.line-item');
            items.forEach(item => {
                const description = item.querySelector('.admin-desc')?.value || '';
                const qty = item.querySelector('.admin-qty')?.value || '';
                const cost = item.querySelector('.admin-cost')?.value || '';
                
                if (description || qty || cost) {
                    adminLineItems.push({
                        description: description,
                        qty: qty,
                        cost: cost
                    });
                }
            });
        }
        
        return adminLineItems;
    }

    /**
     * Load admin line items state
     */
    loadAdminLineItemsState(adminLineItems) {
        const adminContainer = document.getElementById('adminItems');
        if (!adminContainer) return;
        
        // Clear existing items
        const existingItems = adminContainer.querySelectorAll('.line-item');
        existingItems.forEach(item => item.remove());
        
        // Add items from state
        adminLineItems.forEach(itemData => {
            const lineItem = document.createElement('div');
            lineItem.className = 'line-item';
            lineItem.innerHTML = `
                <input type="text" placeholder="Description" class="admin-desc" style="flex: 3;">
                <input type="number" placeholder="Qty" class="admin-qty" min="1" value="1" style="width: 60px;">
                <div style="position: relative; display: inline-block; width: 100px;">
                    <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); color: #666; pointer-events: none; z-index: 1;">$</span>
                    <input type="number" placeholder="Cost" class="admin-cost" step="1" style="width: 100px; padding-left: 15px;">
                </div>
                <button class="remove-btn">✕</button>
            `;
            adminContainer.appendChild(lineItem);
            
            // Set values
            const descInput = lineItem.querySelector('.admin-desc');
            const qtyInput = lineItem.querySelector('.admin-qty');
            const costInput = lineItem.querySelector('.admin-cost');
            
            if (descInput) descInput.value = itemData.description;
            if (qtyInput) qtyInput.value = itemData.qty;
            if (costInput) costInput.value = itemData.cost;
            
            // Setup events
            this.setupLineItemEvents(lineItem);
        });
    }

    /**
     * Setup line item events for newly created items
     */
    setupLineItemEvents(lineItem) {
        // Add input event listeners
        const inputs = lineItem.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculate();
            });
        });
        
        // Add remove button event listener
        const removeBtn = lineItem.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                lineItem.remove();
                this.calculate();
            });
        }
    }

    /**
     * Get all input values
     */
    getInputValues() {
        const inputs = {};
        
        // Cable configuration inputs
        const cableInputs = [
            'numCables', 'avgCableLength', 'terminationsPerCable', 'timePerTermination',
            'wasteFactor', 'spoolLength'
        ];
        
        cableInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                inputs[inputId] = element.value;
            }
        });
        
        // Labor inputs
        const laborInputs = [
            'numTechnicians', 'hourlyRate', 'workHoursPerDay', 'staffHours',
            'techACount', 'techARate', 'techAHours', 'techBCount', 'techBRate', 'techBHours'
        ];
        
        laborInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                inputs[inputId] = element.value;
            }
        });
        
        // Time inputs
        const timeInputs = [
            'cableRunTime', 'testingTime', 'rackSetupTime', 'labelingTime',
            'cleanupTime', 'cutoverTime', 'decommissioningTime'
        ];
        
        timeInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                inputs[inputId] = element.value;
            }
        });
        
        return inputs;
    }

    /**
     * Load input values
     */
    loadInputValues(inputValues) {
        Object.entries(inputValues).forEach(([inputId, value]) => {
            const element = document.getElementById(inputId);
            if (element) {
                element.value = value;
                // Trigger change event to update calculations
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    /**
     * Reset calculator to default state
     */
    reset() {
        console.log('🔄 Resetting calculator...');
        
        try {
            // Clear all input fields
            this.resetInputFields();
            
            // Clear cable line items from localStorage
            localStorage.removeItem('kgoCableLineItems');
            console.log('🗑️ Cleared cable line items from localStorage');
            
            // Clear all line items from localStorage
            const savedState = localStorage.getItem('kgoProjectCalculator');
            if (savedState) {
                try {
                    const formData = JSON.parse(savedState);
                    delete formData.lineItems;
                    localStorage.setItem('kgoProjectCalculator', JSON.stringify(formData));
                    console.log('🗑️ Cleared line items from localStorage');
                } catch (error) {
                    console.error('❌ Error clearing line items from localStorage:', error);
                }
            }
            
            // Reload cable line items to ensure they're empty
            this.loadCableLineItems();
            
            // Clear vendor data
            if (window.vendorManager) {
                window.vendorManager.resetVendorStates();
            }
            
            // Run calculation with reset values
            this.calculate();
            
            console.log('✅ Calculator reset complete');
        } catch (error) {
            console.error('❌ Error during calculator reset:', error);
        }
    }

    /**
     * Reset input fields to default values
     */
    resetInputFields() {
        const defaults = {
            // Cable configuration defaults
            numCables: '0',
            avgCableLength: '0',
            terminationsPerCable: '2',
            timePerTermination: '1.5',
            wasteFactor: '7.5',
            spoolLength: '1000',
            
            // Labor defaults
            numTechnicians: '1',
            hourlyRate: '25',
            workHoursPerDay: '0',
            staffHours: '0',
            techACount: '1',
            techARate: '25',
            techAHours: '0',
            techBCount: '1',
            techBRate: '125',
            techBHours: '0',
            
            // Time defaults
            cableRunTime: '0',
            testingTime: '0',
            rackSetupTime: '0',
            labelingTime: '0',
            cleanupTime: '0',
            cutoverTime: '0',
            decommissioningTime: '0'
        };
        
        Object.entries(defaults).forEach(([inputId, defaultValue]) => {
            const element = document.getElementById(inputId);
            if (element) {
                element.value = defaultValue;
            }
        });
    }

    /**
     * Save form values to localStorage
     */
    saveValues() {
        const formData = {};
        
        // Save all input values
        document.querySelectorAll('input[type="number"], input[type="text"], select').forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });
        
        // Save state
        formData.state = this.state;
        
        // Save all line items
        formData.lineItems = this.getAllLineItemsState();
        
        // Debug vendor data being saved
        if (formData.lineItems && formData.lineItems.vendorQuotes) {
            console.log('🔍 Vendor data being saved:', formData.lineItems.vendorQuotes);
            if (formData.lineItems.vendorQuotes.vendors && formData.lineItems.vendorQuotes.vendors[3]) {
                console.log('🔍 VENDOR 3 SPECIFIC - Data being saved:', formData.lineItems.vendorQuotes.vendors[3]);
            }
        }
        
        localStorage.setItem('kgoProjectCalculator', JSON.stringify(formData));
        console.log('💾 Values saved to localStorage');
    }

    /**
     * Load saved values from localStorage
     */
    loadSavedValues() {
        try {
            const saved = localStorage.getItem('kgoProjectCalculator');
            if (saved) {
                const formData = JSON.parse(saved);
                console.log('📂 Loading saved values from localStorage');
                
                // Restore input values
                Object.keys(formData).forEach(key => {
                    if (key !== 'state' && key !== 'lineItems') {
                        const element = document.getElementById(key);
                        if (element) {
                            element.value = formData[key];
                        }
                    }
                });
                
                // Restore state
                if (formData.state) {
                    this.state = { ...this.state, ...formData.state };
                    console.log('🔍 Restored state:', this.state);
                }
                
                // Load all line items if they exist
                if (formData.lineItems) {
                    console.log('📂 Loading line items from localStorage');
                    this.loadAllLineItemsState(formData.lineItems);
                }
                
                // Update UI to reflect restored state
                this.updateUIForState();
                
                // Force update vendor UI after loading data
                if (window.vendorManager) {
                    console.log('🔧 Force updating vendor UI after loading saved data...');
                    window.vendorManager.updateVendorUI();
                    // Also update vendor buttons with saved names
                    Object.keys(window.vendorManager.vendors).forEach(vendorNum => {
                        const vendor = window.vendorManager.vendors[vendorNum];
                        if (vendor.name) {
                            window.vendorManager.updateVendorButton(vendorNum, vendor.name);
                            console.log(`🔧 Updated vendor ${vendorNum} button with name: "${vendor.name}"`);
                        }
                    });
                    
                    // Set up protection against vendor names being cleared
                    if (window.vendorManager._protectVendorNames) {
                        window.vendorManager._protectVendorNames();
                    }
                }
                
                console.log('✅ Values loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Error loading saved values:', error);
        }
    }

    /**
     * Update UI to reflect current state
     */
    updateUIForState() {
        // Update labor mode UI
        const singleLabor = document.getElementById('singleLabor');
        const dualLabor = document.getElementById('dualLabor');
        
        if (singleLabor && dualLabor) {
            singleLabor.style.display = this.state.laborMode === 'single' ? 'grid' : 'none';
            dualLabor.style.display = this.state.laborMode === 'dual' ? 'grid' : 'none';
        }
        
        // Update labor mode toggle buttons
        document.querySelectorAll('.toggle-btn[data-mode]').forEach(btn => {
            const btnMode = btn.getAttribute('data-mode');
            btn.classList.toggle('active', btnMode === this.state.laborMode);
        });
        
        // Update cable length mode toggle buttons
        document.querySelectorAll('.toggle-btn[data-mode="average"], .toggle-btn[data-mode="calculated"]').forEach(btn => {
            const btnMode = btn.getAttribute('data-mode');
            btn.classList.toggle('active', btnMode === this.state.cableLengthMode);
        });
        
        // Update cable length mode sections
        const averageMode = document.getElementById('averageLengthMode');
        const calculatedMode = document.getElementById('calculatedLengthMode');
        
        if (averageMode && calculatedMode) {
            averageMode.style.display = this.state.cableLengthMode === 'average' ? 'block' : 'none';
            calculatedMode.style.display = this.state.cableLengthMode === 'calculated' ? 'block' : 'none';
        }
        
        // Update cable summary visibility
        this.updateCableSummary(this.results.totalCables || 0, 0);
    }

    /**
     * Clear saved values
     */
    clearSavedValues() {
        localStorage.removeItem('kgoProjectCalculator');
        localStorage.removeItem('kgoCableLineItems');
        console.log('🗑️ Cleared saved calculator values');
    }

    /**
     * Clear all localStorage data
     */
    clearAllLocalStorage() {
        console.log('🗑️ Clearing all localStorage data...');
        
        try {
            // Clear all localStorage items
            localStorage.clear();
            
            // Also clear specific items that might not be caught by clear()
            localStorage.removeItem('kgoCableLineItems');
            localStorage.removeItem('kgoProjectCalculator');
            localStorage.removeItem('autoSavedProject');
            localStorage.removeItem('currentProject');
            localStorage.removeItem('defaultSettings');
            localStorage.removeItem('cableLengthMode');
            localStorage.removeItem('laborMode');
            localStorage.removeItem('theme');
            localStorage.removeItem('currency');
            localStorage.removeItem('autoSaveEnabled');
            
            console.log('✅ All localStorage data cleared');
            
            // Reload the page to ensure clean state
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error clearing localStorage:', error);
        }
    }

    /**
     * Update cable summary display
     */
    updateCableSummary(totalCables, totalLength) {
        console.log('🔧 updateCableSummary called with:', { totalCables, totalLength });
        
        const cableSummary = document.getElementById('cableSummary');
        const cableTotal = document.getElementById('cableTotal');
        const cableLengthTotal = document.getElementById('cableLengthTotal');
        
        console.log('🔍 Cable summary elements found:', {
            cableSummary: !!cableSummary,
            cableTotal: !!cableTotal,
            cableLengthTotal: !!cableLengthTotal
        });
        
        if (cableSummary && cableTotal && cableLengthTotal) {
            // Show summary if we have cables and we're in calculated mode
            const shouldShow = this.state.cableLengthMode === 'calculated' && totalCables > 0;
            cableSummary.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                cableTotal.textContent = totalCables.toString();
                cableLengthTotal.textContent = `${totalLength} ft`;
                console.log('🔧 Updated cable summary display:', { 
                    totalCables, 
                    totalLength, 
                    cableTotalText: cableTotal.textContent,
                    cableLengthText: cableLengthTotal.textContent
                });
            }
        }
    }

    /**
     * Update cable type dropdown colors
     */
    updateCableTypeColors() {
        document.querySelectorAll('.cable-type').forEach(select => {
            const selectedValue = select.value;
            select.setAttribute('data-value', selectedValue);
        });
    }

    /**
     * Save cable line items to localStorage
     */
    saveCableLineItems() {
        const lineItems = [];
        document.querySelectorAll('#cableLengths .line-item').forEach((item, index) => {
            const cableType = item.querySelector('.cable-type')?.value || '';
            const qty = item.querySelector('.cable-qty')?.value || '';
            const length = item.querySelector('.cable-length')?.value || '';
            
            if (cableType || qty || length) {
                lineItems.push({ cableType, qty, length });
            }
        });
        
        localStorage.setItem('kgoCableLineItems', JSON.stringify(lineItems));
        console.log('💾 Cable line items saved:', lineItems);
    }

    /**
     * Load cable line items from localStorage
     */
    loadCableLineItems() {
        try {
            const saved = localStorage.getItem('kgoCableLineItems');
            if (saved) {
                const lineItems = JSON.parse(saved);
                console.log('📂 Loading cable line items:', lineItems);
                
                // Check for hardcoded values and clear them if found
                const hardcodedValues = ['75', '192', '55', '50', '40', '65'];
                const hasHardcodedValues = lineItems.some(item => 
                    hardcodedValues.includes(item.qty) || hardcodedValues.includes(item.length)
                );
                
                if (hasHardcodedValues) {
                    console.log('🚫 Found hardcoded values in kgoCableLineItems, clearing localStorage');
                    localStorage.removeItem('kgoCableLineItems');
                    console.log('🗑️ Cleared kgoCableLineItems containing hardcoded values');
                    // Fall through to empty state handling
                } else {
                    const cableLengthsContainer = document.getElementById('cableLengths');
                    if (cableLengthsContainer && lineItems.length > 0) {
                        // Clear existing items except the first one
                        const existingItems = cableLengthsContainer.querySelectorAll('.line-item');
                        existingItems.forEach((item, index) => {
                            if (index > 0) item.remove();
                        });
                        
                        // Load saved items
                        lineItems.forEach((item, index) => {
                            if (index === 0) {
                                // Update first existing item
                                const firstItem = cableLengthsContainer.querySelector('.line-item');
                                if (firstItem) {
                                    firstItem.querySelector('.cable-type').value = item.cableType;
                                    firstItem.querySelector('.cable-qty').value = item.qty;
                                    firstItem.querySelector('.cable-length').value = item.length;
                                }
                            } else {
                                // Add new items
                                this.addCableLineItem(item.cableType, item.qty, item.length);
                            }
                        });
                        
                        // Update colors
                        this.updateCableTypeColors();
                        return; // Exit early if we successfully loaded valid data
                    }
                }
            }
            
            // No saved data exists or hardcoded values were found - ensure cable line items are empty
            console.log('📂 No saved cable line items found or hardcoded values detected - ensuring empty state');
            const cableLengthsContainer = document.getElementById('cableLengths');
            if (cableLengthsContainer) {
                // Clear any existing items except the first one
                const existingItems = cableLengthsContainer.querySelectorAll('.line-item');
                existingItems.forEach((item, index) => {
                    if (index > 0) item.remove();
                });
                
                // Ensure the first item is empty
                const firstItem = cableLengthsContainer.querySelector('.line-item');
                if (firstItem) {
                    const cableTypeSelect = firstItem.querySelector('.cable-type');
                    const qtyInput = firstItem.querySelector('.cable-qty');
                    const lengthInput = firstItem.querySelector('.cable-length');
                    
                    if (cableTypeSelect) cableTypeSelect.value = '';
                    if (qtyInput) qtyInput.value = '';
                    if (lengthInput) lengthInput.value = '';
                }
            }
        } catch (error) {
            console.error('❌ Error loading cable line items:', error);
        }
    }

    /**
     * Add a new cable line item
     */
    addCableLineItem(cableType = '', qty = '', length = '') {
        const cableLengthsContainer = document.getElementById('cableLengths');
        if (!cableLengthsContainer) return;
        
        const newItem = document.createElement('div');
        newItem.className = 'line-item cable-line-item';
        newItem.innerHTML = `
            <select class="cable-type" data-value="${cableType}">
                <option value="1855">1855</option>
                <option value="1505">1505</option>
                <option value="1694">1694</option>
                <option value="cat6">Cat6</option>
                <option value="other">Other</option>
            </select>
            <input type="number" placeholder="Qty" class="cable-qty" min="1" style="width: 60px;" value="${qty}">
            <input type="number" placeholder="Length" class="cable-length" min="1" style="width: 80px;" value="${length}">
            <button class="remove-btn">✕</button>
        `;
        
        cableLengthsContainer.appendChild(newItem);
        
        // Set the selected value and update colors
        const select = newItem.querySelector('.cable-type');
        if (cableType) {
            select.value = cableType;
            select.setAttribute('data-value', cableType);
        }
        
        // Add event listeners
        this.setupCableLineItemEvents(newItem);
        
        console.log('🔧 Added new cable line item');
    }

    /**
     * Setup event listeners for a cable line item
     */
    setupCableLineItemEvents(item) {
        const select = item.querySelector('.cable-type');
        const qtyInput = item.querySelector('.cable-qty');
        const lengthInput = item.querySelector('.cable-length');
        const removeBtn = item.querySelector('.remove-btn');
        
        // Cable type change
        select.addEventListener('change', (e) => {
            e.target.setAttribute('data-value', e.target.value);
            this.saveCableLineItems();
            this.calculate();
        });
        
        // Quantity and length changes
        [qtyInput, lengthInput].forEach(input => {
            input.addEventListener('input', () => {
                this.saveCableLineItems();
                this.calculate();
            });
        });
        
        // Remove button
        removeBtn.addEventListener('click', () => {
            item.remove();
            this.saveCableLineItems();
            this.calculate();
        });
    }

    /**
     * Clear cable line items from localStorage and UI
     */
    clearCableLineItems() {
        console.log('🗑️ Clearing cable line items...');
        
        try {
            // Remove from localStorage
            localStorage.removeItem('kgoCableLineItems');
            
            // Clear UI
            const cableLengthsContainer = document.getElementById('cableLengths');
            if (cableLengthsContainer) {
                // Clear any existing items except the first one
                const existingItems = cableLengthsContainer.querySelectorAll('.line-item');
                existingItems.forEach((item, index) => {
                    if (index > 0) item.remove();
                });
                
                // Ensure the first item is empty
                const firstItem = cableLengthsContainer.querySelector('.line-item');
                if (firstItem) {
                    const cableTypeSelect = firstItem.querySelector('.cable-type');
                    const qtyInput = firstItem.querySelector('.cable-qty');
                    const lengthInput = firstItem.querySelector('.cable-length');
                    
                    if (cableTypeSelect) cableTypeSelect.value = '';
                    if (qtyInput) qtyInput.value = '';
                    if (lengthInput) lengthInput.value = '';
                }
            }
            
            console.log('✅ Cable line items cleared');
        } catch (error) {
            console.error('❌ Error clearing cable line items:', error);
        }
    }
} 