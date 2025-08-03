/**
 * Vendor Management Module
 * Handles vendor pricing, vendor switching, and vendor state management
 */

console.log('🔧 Vendor module loading...');
console.log('🔧 Vendor module file loaded successfully');

// Global tracking to see if multiple instances are created
let vendorManagerInstanceCount = 0;

export class VendorManager {
    constructor() {
        vendorManagerInstanceCount++;
        console.log(`🔧 VendorManager constructor called (instance #${vendorManagerInstanceCount})`);
        console.log(`🔧 This instance:`, this);
        try {
            this.vendors = {
                1: { name: '', items: [], active: true },
                2: { name: '', items: [], active: false },
                3: { name: '', items: [], active: false }
            };
            this.currentVendor = 1;
            this.vendorQuotes = [];
            console.log('✅ VendorManager constructor completed');
            console.log('🔍 Vendors initialized:', this.vendors);
            console.log('🔍 Vendor keys after init:', Object.keys(this.vendors));
            
            // Add a property to track if this instance has been initialized
            this._initialized = true;
            console.log('🔍 VendorManager _initialized flag:', this._initialized);
            
            // Store a reference to this instance globally for debugging
            if (!window._vendorManagerInstances) {
                window._vendorManagerInstances = [];
            }
            window._vendorManagerInstances.push(this);
            console.log('🔍 Total VendorManager instances:', window._vendorManagerInstances.length);
            
            // Add a watcher to track when vendors object changes
            this._watchVendors();
        } catch (error) {
            console.error('❌ Error in VendorManager constructor:', error);
            console.error('❌ Error stack:', error.stack);
        }
    }
    
    _watchVendors() {
        let originalVendors = this.vendors;
        Object.defineProperty(this, 'vendors', {
            get() {
                return originalVendors;
            },
            set(newValue) {
                console.log('🔍 VENDORS OBJECT CHANGED!');
                console.log('🔍 Old value:', originalVendors);
                console.log('🔍 New value:', newValue);
                console.log('🔍 Stack trace:', new Error().stack);
                originalVendors = newValue;
            }
        });
    }

    /**
     * Clear existing event listeners by cloning and replacing elements
     */
    _clearExistingEventListeners() {
        console.log('🔧 Clearing existing event listeners...');
        
        // Clear vendor active toggles (but NOT the vendor tab buttons)
        for (let i = 1; i <= 3; i++) {
            const vendorDetails = document.getElementById(`vendor${i}Details`);
            if (vendorDetails) {
                const toggle = vendorDetails.querySelector('.vendor-active-toggle');
                if (toggle) {
                    const newToggle = toggle.cloneNode(true);
                    toggle.parentNode.replaceChild(newToggle, toggle);
                }
            }
        }
        
        // Clear vendor name inputs - IMPROVED to better preserve values
        document.querySelectorAll('[id^="vendor"][id$="Name"]').forEach(input => {
            const vendorNum = parseInt(input.id.match(/\d+/)[0]);
            const currentValue = input.value;
            console.log(`🔧 Clearing event listeners for vendor ${vendorNum} name input, current value: "${currentValue}"`);
            
            const newInput = input.cloneNode(true);
            newInput.value = currentValue; // Preserve the value
            input.parentNode.replaceChild(newInput, input);
            
            console.log(`🔧 Vendor ${vendorNum} name input replaced, new value: "${newInput.value}"`);
        });
        
        console.log('✅ Existing event listeners cleared');
    }

    /**
     * Set active vendor
     */
    setVendor(vendorNum) {
        if (vendorNum >= 1 && vendorNum <= 3) {
            this.currentVendor = vendorNum;
            this.updateVendorUI();
        }
    }

    /**
     * Toggle vendor active status
     */
    toggleVendorActive(vendorNum) {
        console.log('🔄 Toggling vendor active status:', vendorNum);
        console.log('🔍 Vendor number type:', typeof vendorNum);
        console.log('🔍 Vendor number value:', vendorNum);
        console.log('🔍 Available vendors:', Object.keys(this.vendors));
        console.log('🔍 Vendors object:', this.vendors);
        
        // If vendors object is empty, reinitialize it
        if (!this.vendors || Object.keys(this.vendors).length === 0) {
            console.log('🔧 Vendors object is empty, reinitializing...');
            this.vendors = {
                1: { name: '', items: [], active: true },
                2: { name: '', items: [], active: false },
                3: { name: '', items: [], active: false }
            };
            console.log('✅ Vendors reinitialized:', this.vendors);
        }
        
        if (this.vendors[vendorNum]) {
            this.vendors[vendorNum].active = !this.vendors[vendorNum].active;
            console.log('✅ Vendor', vendorNum, 'active status:', this.vendors[vendorNum].active);
            this.updateVendorUI();
            
            // Trigger calculation update when vendor active status changes
            console.log('🔧 Triggering project calculator update after vendor active status change...');
            if (window.projectCalculator) {
                window.projectCalculator.calculate();
            }
            
            // Trigger auto-save immediately
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
            
            // Also trigger calculator save to ensure vendor data is persisted
            if (window.calculator) {
                window.calculator.saveValues();
            }
        } else {
            console.warn('⚠️ Vendor not found:', vendorNum);
            console.warn('⚠️ Available vendor keys:', Object.keys(this.vendors));
            console.warn('⚠️ Trying to access vendor with key:', vendorNum);
        }
    }

    /**
     * Add vendor quote
     */
    addVendorQuote(vendorName = '', itemDescription = '', partNumber = '', quoteNumber = '', amount = 0, status = 'pending') {
        this.vendorQuotes.push({
            id: Date.now(),
            vendorName: vendorName,
            itemDescription: itemDescription,
            partNumber: partNumber,
            quoteNumber: quoteNumber,
            amount: parseFloat(amount),
            status: status
        });
        this.updateVendorQuotesUI();
        
        // Trigger calculation update when vendor quote is added
        if (window.projectCalculator) {
            window.projectCalculator.calculate();
        }
        
        // Trigger auto-save
        if (window.projectManager) {
            window.projectManager.autoSave();
        }
    }

    /**
     * Remove vendor quote
     */
    removeVendorQuote(quoteId) {
        this.vendorQuotes = this.vendorQuotes.filter(quote => quote.id !== quoteId);
        this.updateVendorQuotesUI();
        
        // Trigger calculation update when vendor quote is removed
        if (window.projectCalculator) {
            window.projectCalculator.calculate();
        }
        
        // Trigger auto-save
        if (window.projectManager) {
            window.projectManager.autoSave();
        }
    }

    /**
     * Add vendor item
     */
    addVendorItem(vendorNum, description, quantity, cost) {
        console.log(`🔧 Adding vendor item for vendor ${vendorNum}:`, { description, quantity, cost });
        console.log(`🔍 Current vendors object:`, this.vendors);
        console.log(`🔍 Vendor keys:`, Object.keys(this.vendors));
        console.log(`🔍 Vendor ${vendorNum} exists:`, !!this.vendors[vendorNum]);
        console.log(`🔍 This instance ID:`, window._vendorManagerInstances?.indexOf(this));
        
        // If vendors object is empty, reinitialize it
        if (!this.vendors || Object.keys(this.vendors).length === 0) {
            console.log('🔧 Vendors object is empty, reinitializing...');
            this.vendors = {
                1: { name: '', items: [], active: true },
                2: { name: '', items: [], active: false },
                3: { name: '', items: [], active: false }
            };
            console.log('✅ Vendors reinitialized:', this.vendors);
        }
        
        if (this.vendors[vendorNum]) {
            const newItem = {
                id: Date.now(),
                description: description || '',
                qty: parseFloat(quantity) || 1,
                cost: parseFloat(cost) || 0
            };
            
            this.vendors[vendorNum].items.push(newItem);
            console.log(`✅ Added item to vendor ${vendorNum}:`, newItem);
            console.log(`🔍 Vendor ${vendorNum} now has ${this.vendors[vendorNum].items.length} items`);
            
            this.updateVendorItemsUI(vendorNum);
            
            // Trigger calculation update when vendor item is added
            if (window.projectCalculator) {
                console.log('🔧 Triggering project calculator update after adding vendor item...');
                window.projectCalculator.calculate();
            } else {
                console.warn('⚠️ window.projectCalculator not available after adding vendor item');
            }
            
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        } else {
            console.warn(`⚠️ Vendor ${vendorNum} not found when trying to add item`);
            console.warn(`🔍 All vendor manager instances:`, window._vendorManagerInstances);
            console.warn(`🔍 window.vendorManager vendors:`, window.vendorManager?.vendors);
        }
    }

    /**
     * Remove vendor item
     */
    removeVendorItem(vendorNum, itemId) {
        if (this.vendors[vendorNum]) {
            this.vendors[vendorNum].items = this.vendors[vendorNum].items.filter(item => item.id !== itemId);
            this.updateVendorItemsUI(vendorNum);
            
            // Trigger calculation update when vendor item is removed
            if (window.projectCalculator) {
                window.projectCalculator.calculate();
            }
            
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        }
    }

    /**
     * Update vendor name
     */
    updateVendorName(vendorNum, name) {
        console.log(`🔧 updateVendorName called for vendor ${vendorNum} with name: "${name}"`);
        console.log(`🔍 Vendor ${vendorNum} exists:`, !!this.vendors[vendorNum]);
        console.log(`🔍 Current vendor ${vendorNum} state:`, this.vendors[vendorNum]);
        
        if (this.vendors[vendorNum]) {
            const oldName = this.vendors[vendorNum].name;
            this.vendors[vendorNum].name = name;
            console.log(`🔧 Vendor ${vendorNum} name changed from "${oldName}" to "${name}"`);
            console.log(`🔍 Updated vendor ${vendorNum} state:`, this.vendors[vendorNum]);
            
            this.updateVendorButton(vendorNum, name);
            this.updateVendorUI();
            
            // Trigger auto-save immediately
            if (window.projectManager) {
                console.log(`🔧 Triggering projectManager.autoSave() for vendor ${vendorNum} name change`);
                window.projectManager.autoSave();
            }
            
            // Also trigger calculator save to ensure vendor data is persisted
            if (window.calculator) {
                console.log(`🔧 Triggering calculator.saveValues() for vendor ${vendorNum} name change`);
                window.calculator.saveValues();
            }
            
            // Force save to localStorage immediately
            this.forceSaveVendorData();
            
            console.log(`✅ Vendor ${vendorNum} name update complete: ${name}`);
        } else {
            console.error(`❌ Vendor ${vendorNum} not found in vendors object`);
            console.error(`🔍 Available vendor keys:`, Object.keys(this.vendors));
            console.error(`🔍 Vendors object:`, this.vendors);
        }
    }

    /**
     * Force save vendor data to localStorage
     */
    forceSaveVendorData() {
        try {
            const vendorState = this.getState();
            const currentData = localStorage.getItem('kgoProjectCalculator');
            let formData = {};
            
            if (currentData) {
                formData = JSON.parse(currentData);
            }
            
            formData.lineItems = formData.lineItems || {};
            formData.lineItems.vendorQuotes = vendorState;
            
            localStorage.setItem('kgoProjectCalculator', JSON.stringify(formData));
            console.log('💾 Vendor data force saved to localStorage');
        } catch (error) {
            console.error('❌ Error force saving vendor data:', error);
        }
    }

    /**
     * PROTECTED method to prevent vendor names from being cleared
     */
    _protectVendorNames() {
        // Set up a MutationObserver to watch for vendor name inputs being cleared
        const vendorNameInputs = document.querySelectorAll('[id^="vendor"][id$="Name"]');
        vendorNameInputs.forEach(input => {
            const vendorNum = parseInt(input.id.match(/\d+/)[0]);
            const vendor = this.vendors[vendorNum];
            
            // If the input is being cleared but we have a saved name, restore it
            if (input.value === '' && vendor && vendor.name && vendor.name.trim() !== '') {
                console.log(`🛡️ PROTECTION: Vendor ${vendorNum} name input was cleared, restoring to: "${vendor.name}"`);
                input.value = vendor.name;
            }
        });
    }

    /**
     * Update vendor item
     */
    updateVendorItem(vendorNum, itemId, field, value) {
        console.log(`🔧 Updating vendor item: vendor=${vendorNum}, itemId=${itemId}, field=${field}, value=${value}`);
        console.log(`🔍 Current vendors object:`, this.vendors);
        console.log(`🔍 Vendor ${vendorNum} exists:`, !!this.vendors[vendorNum]);
        
        if (this.vendors[vendorNum]) {
            const item = this.vendors[vendorNum].items.find(item => item.id === itemId);
            if (item) {
                console.log(`🔍 Found item to update:`, item);
                const oldValue = item[field];
                item[field] = value;
                console.log(`🔍 Item updated: ${field} changed from ${oldValue} to ${value}`);
                console.log(`🔍 Updated item:`, item);
                
                // Trigger calculation update when vendor item changes
                if (window.projectCalculator) {
                    console.log('🔧 Triggering project calculator update...');
                    window.projectCalculator.calculate();
                } else {
                    console.warn('⚠️ window.projectCalculator not available');
                }
                
                // Trigger auto-save
                if (window.projectManager) {
                    window.projectManager.autoSave();
                }
            } else {
                console.warn(`⚠️ Item with ID ${itemId} not found in vendor ${vendorNum}`);
                console.log(`🔍 Available items in vendor ${vendorNum}:`, this.vendors[vendorNum].items);
            }
        } else {
            console.warn(`⚠️ Vendor ${vendorNum} not found`);
            console.log(`🔍 Available vendor keys:`, Object.keys(this.vendors));
        }
    }

    /**
     * Calculate vendor quotes total
     */
    calculateVendorQuotesTotal() {
        return this.vendorQuotes.reduce((total, quote) => total + quote.amount, 0);
    }

    /**
     * Calculate active vendor total
     */
    calculateActiveVendorTotal() {
        let total = 0;
        console.log('🔧 Calculating active vendor total...');
        console.log('🔍 Vendors object:', this.vendors);
        console.log('🔍 Vendor keys:', Object.keys(this.vendors));
        
        Object.entries(this.vendors).forEach(([vendorKey, vendor]) => {
            const vendorNum = parseInt(vendorKey);
            console.log(`🔍 Vendor ${vendorNum}:`, vendor);
            console.log(`🔍 Vendor ${vendorNum} active status:`, vendor.active);
            console.log(`🔍 Vendor ${vendorNum} items count:`, vendor.items.length);
            
            if (vendor.active) {
                console.log(`🔍 Vendor ${vendorNum} is active, processing ${vendor.items.length} items`);
                vendor.items.forEach((item, itemIndex) => {
                    const itemTotal = item.qty * item.cost;
                    total += itemTotal;
                    console.log(`🔍 Item ${itemIndex + 1}: qty=${item.qty}, cost=${item.cost}, total=${itemTotal}, running total=${total}`);
                });
            } else {
                console.log(`🔍 Vendor ${vendorNum} is inactive, skipping`);
            }
        });
        
        console.log('🔧 Final active vendor total:', total);
        return total;
    }

    /**
     * Get vendor order breakdown for display
     */
    getVendorOrderBreakdown() {
        const breakdown = [];
        let totalOrders = 0;
        
        Object.entries(this.vendors).forEach(([vendorKey, vendor]) => {
            const vendorNum = parseInt(vendorKey);
            if (vendor.active && vendor.items.length > 0) {
                const vendorTotal = vendor.items.reduce((sum, item) => sum + (item.qty * item.cost), 0);
                const orderCount = vendor.items.length;
                totalOrders += orderCount;
                
                breakdown.push({
                    vendorNum: vendorNum,
                    name: vendor.name || `Vendor ${vendorNum}`,
                    total: vendorTotal,
                    orderCount: orderCount
                });
            }
        });
        
        return {
            breakdown: breakdown,
            totalOrders: totalOrders
        };
    }

    /**
     * Get vendor data for calculations
     */
    getVendorData() {
        console.log('🔧 Getting vendor data...');
        console.log('🔍 Current vendor:', this.currentVendor);
        console.log('🔍 Vendors object:', this.vendors);
        console.log('🔍 Vendor quotes:', this.vendorQuotes);
        console.log('🔍 This instance ID:', window._vendorManagerInstances?.indexOf(this));
        
        const vendorQuotesTotal = this.calculateVendorQuotesTotal();
        const activeVendorTotal = this.calculateActiveVendorTotal();
        
        const data = {
            currentVendor: this.currentVendor,
            vendors: { ...this.vendors },
            vendorQuotes: [...this.vendorQuotes],
            vendorQuotesTotal: vendorQuotesTotal,
            activeVendorTotal: activeVendorTotal
        };
        
        console.log('🔧 Returning vendor data:', data);
        console.log('🔧 Active vendor total calculated:', activeVendorTotal);
        return data;
    }

    /**
     * Update vendor UI
     */
    updateVendorUI() {
        console.log('🔧 Updating vendor UI...');
        console.log('🔍 Current vendor:', this.currentVendor);
        console.log('🔍 Vendors object:', this.vendors);
        
        // Update vendor toggle buttons
        document.querySelectorAll('.toggle-btn[data-vendor]').forEach(btn => {
            const vendorNum = parseInt(btn.getAttribute('data-vendor'));
            btn.classList.toggle('active', vendorNum === this.currentVendor);
        });

        // Update vendor details visibility
        document.querySelectorAll('.vendor-details').forEach(detail => {
            detail.style.display = 'none';
        });

        const currentVendorDetails = document.getElementById(`vendor${this.currentVendor}Details`);
        if (currentVendorDetails) {
            currentVendorDetails.style.display = 'block';
        }

        // Update vendor active status indicators - ensure all indicators are properly updated
        Object.keys(this.vendors).forEach(vendorNum => {
            const vendor = this.vendors[vendorNum];
            const vendorDetails = document.getElementById(`vendor${vendorNum}Details`);
            
            if (vendorDetails) {
                const toggleDiv = vendorDetails.querySelector('.vendor-active-toggle');
                if (toggleDiv) {
                    console.log(`🔧 Updating vendor ${vendorNum} toggle - active: ${vendor.active}`);
                    
                    // Update the classes and text
                    if (vendor.active) {
                        toggleDiv.className = 'vendor-active-toggle active';
                        const span = toggleDiv.querySelector('span');
                        if (span) span.textContent = 'ACTIVE';
                        console.log(`✅ Vendor ${vendorNum} set to ACTIVE`);
                    } else {
                        toggleDiv.className = 'vendor-active-toggle inactive';
                        const span = toggleDiv.querySelector('span');
                        if (span) span.textContent = 'INACTIVE';
                        console.log(`✅ Vendor ${vendorNum} set to INACTIVE`);
                    }
                    
                    // Ensure the indicator is visible and properly styled
                    toggleDiv.style.display = 'inline-block';
                    toggleDiv.style.visibility = 'visible';
                    toggleDiv.style.opacity = '1';
                } else {
                    console.warn(`⚠️ Toggle div not found for vendor ${vendorNum}`);
                }
            } else {
                console.warn(`⚠️ Vendor details not found for vendor ${vendorNum}`);
            }
        });
    }

    /**
     * Update vendor items UI
     */
    updateVendorItemsUI(vendorNum) {
        const vendor = this.vendors[vendorNum];
        if (!vendor) {
            console.warn(`⚠️ Vendor ${vendorNum} not found`);
            return;
        }

        const container = document.querySelector(`#vendor${vendorNum}Details .vendor-items`);
        if (!container) {
            console.warn(`⚠️ Container for vendor ${vendorNum} not found`);
            return;
        }

        console.log(`🔧 Updating vendor ${vendorNum} items UI`);
        console.log(`🔍 Vendor items count: ${vendor.items.length}`);

        // Clear existing items
        container.innerHTML = '';

        // Add vendor items
        vendor.items.forEach(item => {
            const itemElement = this.createVendorItemElement(vendorNum, item);
            container.appendChild(itemElement);
        });

        // Always add the "add item" button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-success add-vendor-item-btn';
        addBtn.textContent = '➕ Add';
        addBtn.addEventListener('click', () => {
            console.log(`🎯 Add vendor item button clicked for vendor ${vendorNum}`);
            console.log(`🔍 This context:`, this);
            console.log(`🔍 This vendors:`, this.vendors);
            console.log(`🔍 Vendor ${vendorNum} exists:`, !!this.vendors[vendorNum]);
            
            // Use this.addVendorItem directly since we're in the correct context
            this.addVendorItem(vendorNum, '', 1, 0);
        });
        container.appendChild(addBtn);
        
        console.log(`✅ Vendor ${vendorNum} items UI updated, button added`);
    }

    /**
     * Update vendor quotes UI
     */
    updateVendorQuotesUI() {
        const container = document.getElementById('vendorQuotes');
        if (!container) return;

        // Clear existing quotes
        container.innerHTML = '';

        // Add vendor quotes
        this.vendorQuotes.forEach(quote => {
            const quoteElement = this.createVendorQuoteElement(quote);
            container.appendChild(quoteElement);
        });

        // Always add the "add quote" button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-success add-vendor-quote-btn';
        addBtn.textContent = '➕ Add';
        addBtn.addEventListener('click', () => {
            console.log(`🎯 Add vendor quote button clicked`);
            this.addVendorQuote('', '', '', '', 0, 'pending');
        });
        container.appendChild(addBtn);
    }

    /**
     * Create vendor item element
     */
    createVendorItemElement(vendorNum, item) {
        const div = document.createElement('div');
        div.className = 'line-item vendor-item';
        div.innerHTML = `
            <input type="text" placeholder="Description/Part #" class="vendor-item-desc" 
                   value="${item.description}" style="flex: 3;">
            <input type="number" placeholder="Qty" class="vendor-item-qty" min="1" 
                   value="${item.qty}" style="width: 60px;">
            <div style="position: relative; display: inline-block; width: 100px;">
                <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); 
                            color: #666; pointer-events: none; z-index: 1;">$</span>
                                <input type="number" placeholder="Cost" class="vendor-item-cost" step="1"
                       value="${item.cost}" style="width: 100px; padding-left: 15px;">
            </div>
            <button class="remove-vendor-item-btn" data-item-id="${item.id}" 
                    style="background: #e74c3c; color: white; border: none; border-radius: 3px; 
                           padding: 2px 6px; font-size: 12px; cursor: pointer; width: 24px; height: 24px;">✕</button>
        `;

        // Add event listeners
        div.querySelector('.vendor-item-desc').addEventListener('input', (e) => {
            this.updateVendorItem(vendorNum, item.id, 'description', e.target.value);
        });

        div.querySelector('.vendor-item-qty').addEventListener('input', (e) => {
            this.updateVendorItem(vendorNum, item.id, 'qty', parseFloat(e.target.value) || 1);
        });

        div.querySelector('.vendor-item-cost').addEventListener('input', (e) => {
            this.updateVendorItem(vendorNum, item.id, 'cost', parseFloat(e.target.value) || 0);
        });

        div.querySelector('.remove-vendor-item-btn').addEventListener('click', () => {
            this.removeVendorItem(vendorNum, item.id);
        });

        return div;
    }

    /**
     * Create vendor quote element
     */
    createVendorQuoteElement(quote) {
        const div = document.createElement('div');
        div.className = 'line-item vendor-quote';
        div.innerHTML = `
            <input type="text" placeholder="Vendor Name" class="vendor-quote-vendor-name" 
                   value="${quote.vendorName}" style="flex: 1;">
            <input type="text" placeholder="Item Description/Part #" class="vendor-quote-item-desc" 
                   value="${quote.itemDescription || ''}" style="flex: 2;">
            <input type="text" placeholder="Quote #" class="vendor-quote-number" 
                   value="${quote.quoteNumber || ''}" style="flex: 1;">
            <select class="vendor-quote-status" data-status="${quote.status || 'pending'}" style="flex: 1; padding: 4px 8px; padding-left: 20px; border: 1px solid #ced4da; border-radius: 4px; background: white;">
                <option value="pending" ${quote.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="approved" ${quote.status === 'approved' ? 'selected' : ''}>✅ Approved</option>
            </select>
            <div style="position: relative; display: inline-block; width: 100px;">
                <span style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); 
                            color: #666; pointer-events: none; z-index: 1;">$</span>
                                <input type="number" placeholder="Amount" class="vendor-quote-amount" step="1"
                       value="${quote.amount}" style="width: 100px; padding-left: 15px;">
            </div>
            <button class="remove-vendor-quote-btn" data-quote-id="${quote.id}" 
                    style="background: #e74c3c; color: white; border: none; border-radius: 3px; 
                           padding: 2px 6px; font-size: 12px; cursor: pointer; width: 24px; height: 24px;">✕</button>
        `;

        // Add event listeners
        div.querySelector('.vendor-quote-vendor-name').addEventListener('input', (e) => {
            quote.vendorName = e.target.value;
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        });

        div.querySelector('.vendor-quote-item-desc').addEventListener('input', (e) => {
            quote.itemDescription = e.target.value;
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        });

        div.querySelector('.vendor-quote-number').addEventListener('input', (e) => {
            quote.quoteNumber = e.target.value;
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        });

        div.querySelector('.vendor-quote-amount').addEventListener('input', (e) => {
            quote.amount = parseFloat(e.target.value) || 0;
            // Trigger calculation update when vendor quote amount changes
            if (window.projectCalculator) {
                window.projectCalculator.calculate();
            }
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        });

        div.querySelector('.vendor-quote-status').addEventListener('change', (e) => {
            quote.status = e.target.value;
            // Update the data-status attribute for CSS styling
            e.target.setAttribute('data-status', quote.status);
            // Trigger calculation update when vendor quote status changes
            if (window.projectCalculator) {
                window.projectCalculator.calculate();
            }
            // Trigger auto-save
            if (window.projectManager) {
                window.projectManager.autoSave();
            }
        });

        div.querySelector('.remove-vendor-quote-btn').addEventListener('click', () => {
            this.removeVendorQuote(quote.id);
        });

        return div;
    }

    /**
     * Initialize vendor UI
     */
    initializeVendorUI() {
        // Prevent multiple initialization
        if (this._uiInitialized) {
            console.log('⚠️ Vendor UI already initialized, skipping...');
            return;
        }
        
        console.log('🔧 Initializing vendor UI...');
        console.log('🔍 VendorManager _initialized flag:', this._initialized);
        console.log('🔍 Vendors object at UI init:', this.vendors);
        console.log('🔍 Vendor keys at UI init:', Object.keys(this.vendors));
        
        try {
            // Set up vendor toggle buttons FIRST (these are the tab buttons)
            console.log('🔧 Setting up vendor tab buttons...');
            document.querySelectorAll('.toggle-btn[data-vendor]').forEach(btn => {
                console.log(`🔧 Setting up event listener for vendor tab button:`, btn);
                btn.addEventListener('click', (e) => {
                    const vendorNum = parseInt(e.target.getAttribute('data-vendor'));
                    console.log(`🎯 Vendor tab button clicked for vendor ${vendorNum}`);
                    this.setVendor(vendorNum);
                });
            });
            
            // Clear any existing event listeners for vendor active toggles and name inputs
            this._clearExistingEventListeners();

            // Set up vendor active toggles directly - handle all vendors including hidden ones
            for (let i = 1; i <= 3; i++) {
                const vendorDetails = document.getElementById(`vendor${i}Details`);
                if (vendorDetails) {
                    const toggle = vendorDetails.querySelector('.vendor-active-toggle');
                    if (toggle) {
                        console.log(`🔧 Setting up event listener for vendor ${i} toggle:`, toggle);
                        console.log(`🔍 Vendor ${i} toggle text:`, toggle.textContent.trim());
                        console.log(`🔍 Vendor ${i} details visible:`, vendorDetails.style.display !== 'none');
                        console.log(`🔍 Vendor ${i} exists in data:`, !!this.vendors[i]);
                        
                                                 // Add event listener directly to the toggle
                         toggle.addEventListener('click', (e) => {
                             console.log(`🎯 Vendor ${i} active toggle clicked directly`);
                             console.log(`🔍 About to call toggleVendorActive(${i})`);
                             console.log(`🔍 Event target:`, e.target);
                             console.log(`🔍 Event currentTarget:`, e.currentTarget);
                             console.log(`🔍 Event type:`, e.type);
                             console.log(`🔍 This context:`, this);
                             e.preventDefault();
                             e.stopPropagation();
                             this.toggleVendorActive(i);
                         });
                        console.log(`✅ Event listener attached to vendor ${i} toggle`);
                    } else {
                        console.warn(`⚠️ Vendor ${i} toggle not found`);
                    }
                } else {
                    console.warn(`⚠️ Vendor ${i} details not found`);
                }
            }

            // Set up vendor name inputs
            document.querySelectorAll('[id^="vendor"][id$="Name"]').forEach(input => {
                const vendorNum = parseInt(input.id.match(/\d+/)[0]);
                input.addEventListener('input', (e) => {
                    this.updateVendorName(vendorNum, e.target.value);
                    this.updateVendorButton(vendorNum, e.target.value);
                });
            });

            // Initialize UI
            console.log('🔧 Initializing vendor UI components...');
            this.updateVendorUI();
            console.log('🔧 Initializing vendor 1 items UI...');
            this.updateVendorItemsUI(1);
            console.log('🔧 Initializing vendor 2 items UI...');
            this.updateVendorItemsUI(2);
            console.log('🔧 Initializing vendor 3 items UI...');
            this.updateVendorItemsUI(3);
            console.log('🔧 Initializing vendor quotes UI...');
            this.updateVendorQuotesUI();
            
            // Initialize vendor details for each vendor
            this.createVendorDetails(1);
            this.createVendorDetails(2);
            this.createVendorDetails(3);

            // Set up protection against vendor names being cleared
            this._protectVendorNames();

            console.log('✅ Vendor UI initialization complete');
            this._uiInitialized = true;
        } catch (error) {
            console.error('❌ Error during vendor UI initialization:', error);
            console.error('❌ Error stack:', error.stack);
        }
    }

    /**
     * Get vendor state for saving
     */
    getState() {
        console.log('🔧 Getting vendor state for persistence...');
        console.log('🔍 Current vendors:', this.vendors);
        console.log('🔍 Current vendor:', this.currentVendor);
        console.log('🔍 Vendor quotes:', this.vendorQuotes);
        
        const state = {
            vendors: { ...this.vendors },
            currentVendor: this.currentVendor,
            vendorQuotes: [...this.vendorQuotes]
        };
        
        console.log('🔧 Returning vendor state:', state);
        return state;
    }

    /**
     * Load vendor state
     */
    loadState(state) {
        console.log('🔧 Loading vendor state:', state);
        console.log('🔍 Current state before load:', {
            vendors: this.vendors,
            currentVendor: this.currentVendor,
            vendorQuotes: this.vendorQuotes
        });
        
        if (state.vendors) {
            // Preserve current active states if not explicitly provided
            const currentActiveStates = {};
            if (this.vendors) {
                Object.keys(this.vendors).forEach(vendorNum => {
                    currentActiveStates[vendorNum] = this.vendors[vendorNum].active;
                });
            }
            
            this.vendors = { ...state.vendors };
            
            // Restore active states if they weren't explicitly set in the new state
            Object.keys(this.vendors).forEach(vendorNum => {
                if (state.vendors[vendorNum] && typeof state.vendors[vendorNum].active === 'undefined') {
                    this.vendors[vendorNum].active = currentActiveStates[vendorNum] || false;
                }
            });
            
            console.log('🔧 Vendors after loadState:', this.vendors);
        }
        
        if (state.currentVendor) {
            this.currentVendor = state.currentVendor;
        }
        
        if (state.vendorQuotes) {
            this.vendorQuotes = [...state.vendorQuotes];
            // Ensure all quotes have a status field (for backward compatibility)
            this.vendorQuotes.forEach(quote => {
                if (!quote.status) {
                    quote.status = 'pending';
                }
            });
        }
        
        this.updateVendorUI();
        this.updateVendorItemsUI(1);
        this.updateVendorItemsUI(2);
        this.updateVendorItemsUI(3);
        this.updateVendorQuotesUI();
        
        // Update vendor name input fields with loaded values
        Object.keys(this.vendors).forEach(vendorNum => {
            const vendor = this.vendors[vendorNum];
            const vendorNameInput = document.getElementById(`vendor${vendorNum}Name`);
            if (vendorNameInput && vendor.name) {
                vendorNameInput.value = vendor.name;
                console.log(`🔧 Updated vendor ${vendorNum} name input to: ${vendor.name}`);
                
                // Extra logging for vendor 3
                if (vendorNum == 3) {
                    console.log(`🔍 VENDOR 3 SPECIFIC - Name input updated to: "${vendor.name}"`);
                    console.log(`🔍 VENDOR 3 SPECIFIC - Input element value: "${vendorNameInput.value}"`);
                    console.log(`🔍 VENDOR 3 SPECIFIC - Vendor object name: "${vendor.name}"`);
                }
            } else if (vendorNum == 3) {
                console.warn(`⚠️ VENDOR 3 SPECIFIC - Name input not found or vendor name is empty`);
                console.warn(`⚠️ VENDOR 3 SPECIFIC - Input element:`, vendorNameInput);
                console.warn(`⚠️ VENDOR 3 SPECIFIC - Vendor object:`, vendor);
            }
        });
        
        console.log('🔧 Vendor state after load:', {
            vendors: this.vendors,
            currentVendor: this.currentVendor,
            vendorQuotes: this.vendorQuotes
        });
        
        // Set up protection against vendor names being cleared after loading state
        this._protectVendorNames();
    }

    /**
     * Test vendor toggle functionality
     */
    testVendorToggle(vendorNum = 1) {
        console.log('🧪 Testing vendor toggle for vendor:', vendorNum);
        this.toggleVendorActive(vendorNum);
    }

    /**
     * Test vendor toggle click simulation
     */
    testVendorToggleClick(vendorNum = 1) {
        console.log('🧪 Testing vendor toggle click simulation for vendor:', vendorNum);
        const vendorDetails = document.getElementById(`vendor${vendorNum}Details`);
        if (vendorDetails) {
            const toggle = vendorDetails.querySelector('.vendor-active-toggle');
            if (toggle) {
                console.log('🧪 Found toggle button, simulating click...');
                console.log('🧪 Toggle element:', toggle);
                console.log('🧪 Toggle event listeners:', toggle.onclick);
                
                // Create and dispatch a click event
                const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                toggle.dispatchEvent(clickEvent);
                
                console.log('🧪 Click event dispatched');
            } else {
                console.warn('⚠️ Toggle button not found');
            }
        } else {
            console.warn('⚠️ Vendor details not found');
        }
    }

    /**
     * Reset vendor states to default
     */
    resetVendorStates() {
        console.log('🔧 Resetting vendor states to default...');
        this.vendors = {
            1: { name: '', items: [], active: true },
            2: { name: '', items: [], active: false },
            3: { name: '', items: [], active: false }
        };
        this.currentVendor = 1;
        this.vendorQuotes = [];
        this._uiInitialized = false; // Reset UI initialization flag
        this.updateVendorUI();
        this.updateVendorItemsUI(1);
        this.updateVendorItemsUI(2);
        this.updateVendorItemsUI(3);
        this.updateVendorQuotesUI();
        console.log('✅ Vendor states reset to default');
    }

    /**
     * Debug vendor state
     */
    debugVendorState() {
        console.log('🧪 Debugging vendor state...');
        console.log('🧪 Vendors object:', this.vendors);
        console.log('🧪 Vendor keys:', Object.keys(this.vendors));
        console.log('🧪 Current vendor:', this.currentVendor);
        
        for (let i = 1; i <= 3; i++) {
            console.log(`🧪 Vendor ${i}:`, this.vendors[i]);
            const vendorDetails = document.getElementById(`vendor${i}Details`);
            if (vendorDetails) {
                const toggle = vendorDetails.querySelector('.vendor-active-toggle');
                console.log(`🧪 Vendor ${i} toggle found:`, !!toggle);
                if (toggle) {
                    console.log(`🧪 Vendor ${i} toggle text:`, toggle.textContent.trim());
                    console.log(`🧪 Vendor ${i} toggle classes:`, toggle.className);
                    console.log(`🧪 Vendor ${i} toggle computed style:`, {
                        backgroundColor: getComputedStyle(toggle).backgroundColor,
                        color: getComputedStyle(toggle).color,
                        display: getComputedStyle(toggle).display,
                        visibility: getComputedStyle(toggle).visibility,
                        opacity: getComputedStyle(toggle).opacity
                    });
                }
            } else {
                console.log(`🧪 Vendor ${i} details not found in DOM`);
            }
        }
    }
    
    /**
     * Force update vendor indicators with enhanced visibility
     */
    forceUpdateVendorIndicators() {
        console.log('🔧 Force updating vendor indicators with enhanced visibility...');
        
        Object.keys(this.vendors).forEach(vendorNum => {
            const vendor = this.vendors[vendorNum];
            const vendorDetails = document.getElementById(`vendor${vendorNum}Details`);
            
            if (vendorDetails) {
                const toggleDiv = vendorDetails.querySelector('.vendor-active-toggle');
                if (toggleDiv) {
                    console.log(`🔧 Force updating vendor ${vendorNum} indicator...`);
                    
                    // Update the classes and text
                    if (vendor.active) {
                        toggleDiv.className = 'vendor-active-toggle active';
                        const span = toggleDiv.querySelector('span');
                        if (span) span.textContent = 'ACTIVE';
                    } else {
                        toggleDiv.className = 'vendor-active-toggle inactive';
                        const span = toggleDiv.querySelector('span');
                        if (span) span.textContent = 'INACTIVE';
                    }
                    
                    // Force visibility and styling
                    toggleDiv.style.display = 'inline-block';
                    toggleDiv.style.visibility = 'visible';
                    toggleDiv.style.opacity = '1';
                    toggleDiv.style.position = 'relative';
                    toggleDiv.style.zIndex = '10';
                    
                    // Add a temporary highlight to make it more visible
                    toggleDiv.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.5)';
                    setTimeout(() => {
                        toggleDiv.style.boxShadow = '';
                    }, 2000);
                    
                    console.log(`✅ Vendor ${vendorNum} indicator force updated`);
                }
            }
        });
    }
    
    /**
     * Test specific scenario: vendor with items but inactive
     */
    testInactiveVendorScenario() {
        console.log('🧪 Testing inactive vendor scenario...');
        
        // Set up test scenario: Vendor 1 has items but is inactive
        this.vendors[1] = {
            name: 'Test Vendor 1',
            items: [
                { id: 1, description: 'Test Item 1', qty: 5, cost: 100 },
                { id: 2, description: 'Test Item 2', qty: 3, cost: 50 }
            ],
            active: false
        };
        
        // Vendor 2 is active but has no items
        this.vendors[2] = {
            name: 'Test Vendor 2',
            items: [],
            active: true
        };
        
        // Vendor 3 is inactive and has no items
        this.vendors[3] = {
            name: 'Test Vendor 3',
            items: [],
            active: false
        };
        
        console.log('🧪 Test scenario set up:');
        console.log('🧪 Vendor 1: inactive, 2 items (total value: 650)');
        console.log('🧪 Vendor 2: active, 0 items');
        console.log('🧪 Vendor 3: inactive, 0 items');
        
        const activeTotal = this.calculateActiveVendorTotal();
        console.log('🧪 Expected active vendor total: 0 (only Vendor 2 is active but has no items)');
        console.log('🧪 Actual active vendor total:', activeTotal);
        
        if (activeTotal === 0) {
            console.log('✅ Test PASSED: Inactive vendor items are correctly excluded');
        } else {
            console.log('❌ Test FAILED: Inactive vendor items are being included');
        }
        
        return activeTotal;
    }

    createVendorDetails(vendorNum) {
        const vendorDetails = document.getElementById(`vendor${vendorNum}Details`);
        const vendorNameInput = vendorDetails.querySelector(`#vendor${vendorNum}Name`);

        vendorNameInput.addEventListener('input', (e) => {
            const vendorName = e.target.value;
            this.updateVendorButton(vendorNum, vendorName);
        });
    }

    updateVendorButton(vendorNum, vendorName) {
        const vendorButton = document.querySelector(`.toggle-btn[data-vendor="${vendorNum}"]`);
        if (vendorButton) {
            vendorButton.textContent = vendorName || `Vendor ${vendorNum}`;
        }
    }
}

// Test if vendor manager is accessible
console.log('🔧 Testing vendor manager accessibility...');
console.log('🔧 VendorManager class available:', typeof VendorManager);
console.log('🔧 VendorManager constructor available:', typeof VendorManager.prototype.constructor);