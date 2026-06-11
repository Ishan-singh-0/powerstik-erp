export const parseAICommand = (text) => {
  const lowerText = text.toLowerCase();
  
  // 1. Add Client (e.g., "Add client Omega Corp")
  const clientMatch = text.match(/add (?:a |new )?client (?:named |called )?(.+)/i);
  if (clientMatch && !lowerText.includes('sales order') && !lowerText.includes('invoice')) {
    return { action: 'addClient', data: { name: clientMatch[1].trim() }, message: `Successfully added client: ${clientMatch[1].trim()}.` };
  }

  // 2. Create Invoice (e.g., "create a new invoice for INV-2025-001 OF 50000", "create invoice for Apple for 50000")
  const createInvMatch = text.match(/create (?:a )?(?:new )?invoice (?:for )?(.+?) (?:of|for) (?:rs |₹ )?(\d+)/i);
  if (createInvMatch && !lowerText.includes('sales order')) {
    let clientOrId = createInvMatch[1].trim();
    const amount = parseInt(createInvMatch[2], 10);
    let customId = null;
    let clientName = clientOrId;
    
    // Check if they provided an ID instead of client name (e.g., INV-2025-001)
    if (clientOrId.match(/^INV-\d{4}-\d{3}$/i)) {
      customId = clientOrId.toUpperCase();
      clientName = "Unknown Client"; // Placeholder if they didn't provide a name
    }

    return { 
      action: 'createInvoice', 
      data: { client: clientName, amount, customId }, 
      message: `Generated invoice ${customId ? customId : 'for ' + clientName} for ₹${amount.toLocaleString('en-IN')}.`
    };
  }

  // 3. Record Payment (e.g., "Record payment of 50000 for INV-2023-001")
  const paymentMatch = text.match(/(?:payment|received|paid).*?(?:of |rs |₹|rupees )?(\d+)[ ,kL]*.+?(?:for |invoice )+(INV-\d{4}-\d{3})/i);
  if (paymentMatch) {
    const amount = parseInt(paymentMatch[1], 10);
    const invoiceId = paymentMatch[2].toUpperCase();
    return {
      action: 'recordPayment',
      data: { amount, invoiceId },
      message: `Recorded payment of ₹${amount.toLocaleString('en-IN')} towards invoice ${invoiceId}.`
    };
  }

  // 4. Create Sales Order (e.g., "Create a new sales order for Beta Tech for 100000")
  const orderMatch = text.match(/sales order for (.+?) for (?:rs |₹ )?(\d+)/i);
  if (orderMatch) {
    return {
      action: 'createSalesOrder',
      data: { client: orderMatch[1].trim(), amount: parseInt(orderMatch[2], 10) },
      message: `Created sales order for ${orderMatch[1].trim()} totaling ₹${parseInt(orderMatch[2], 10).toLocaleString('en-IN')}.`
    };
  }

  // 5. Update Production Status (e.g., "Mark WO-2041 as completed", "Pause WO-2044", "Start WO-1000")
  const prodMatch = text.match(/(mark|set|start|pause|resume|complete) (?:job |work order )?(WO-\d{4})(?: as )?(running|completed|paused|queued)?/i);
  if (prodMatch) {
    const verb = prodMatch[1].toLowerCase();
    const jobId = prodMatch[2].toUpperCase();
    let status = 'Running';
    
    if (verb === 'pause') status = 'Paused';
    if (verb === 'complete' || verb === 'completed' || prodMatch[3]?.toLowerCase() === 'completed') status = 'Completed';
    if (verb === 'start' || verb === 'resume' || prodMatch[3]?.toLowerCase() === 'running') status = 'Running';

    return {
      action: 'updateProduction',
      data: { jobId, status },
      message: `Updated Production Job ${jobId} to ${status}.`
    };
  }

  // 6. Create New Inventory Item (e.g., "Create new item Golden Foil with 100 rolls")
  const invCreateMatch = text.match(/(?:create|add) (?:new )?(?:inventory )?item (.+?) (?:with|having|starting at) (\d+)(?: )?([a-zA-Z]+)?/i);
  if (invCreateMatch && lowerText.includes('item')) {
    const itemName = invCreateMatch[1].trim();
    const stock = parseInt(invCreateMatch[2], 10);
    const unit = invCreateMatch[3] ? invCreateMatch[3].trim() : 'Pcs';
    return {
      action: 'createInventoryItem',
      data: { itemName, stock, unit },
      message: `Created new inventory item: ${itemName} with initial stock of ${stock} ${unit}.`
    };
  }

  // 7. Add/Update Inventory (e.g., "Add 500 to Corrugated Box", "Received 100 Kgs of Premium Glossy Paper")
  const invAddMatch = text.match(/(?:add|received|restocked) (\d+)(?: pcss| kgs| rolls)? (?:to|of|for) (.+)/i);
  if (invAddMatch) {
    return {
      action: 'addInventoryQty',
      data: { qty: parseInt(invAddMatch[1], 10), itemName: invAddMatch[2].trim() },
      message: `Added ${invAddMatch[1]} units to ${invAddMatch[2].trim()} inventory.`
    };
  }

  // 8. Deduct Inventory (e.g., "Used 50 units of Binding Glue", "Remove 10 from Corrugated Box")
  const invDeductMatch = text.match(/(?:use|used|remove|deduct) (\d+)(?: pcss| kgs| rolls)? (?:from|of) (.+)/i);
  if (invDeductMatch) {
    return {
      action: 'deductInventoryQty',
      data: { qty: parseInt(invDeductMatch[1], 10), itemName: invDeductMatch[2].trim() },
      message: `Deducted ${invDeductMatch[1]} units from ${invDeductMatch[2].trim()} inventory.`
    };
  }

  // 9. Assign Artwork Job (e.g., "Assign AW-5004 to Alex", "Give design AW-5001 to Sarah")
  const artAssignMatch = text.match(/(?:assign|give) (?:design |artwork |job )?(AW-\d{4}) to (.+)/i);
  if (artAssignMatch) {
    return {
      action: 'assignArtwork',
      data: { jobId: artAssignMatch[1].toUpperCase(), designer: artAssignMatch[2].trim() },
      message: `Assigned Artwork Job ${artAssignMatch[1].toUpperCase()} to ${artAssignMatch[2].trim()}.`
    };
  }

  // 10. Approve Artwork (e.g., "Approve AW-5002")
  const artApproveMatch = text.match(/approve (?:design |artwork |job )?(AW-\d{4})/i);
  if (artApproveMatch) {
    return {
      action: 'approveArtwork',
      data: { jobId: artApproveMatch[1].toUpperCase() },
      message: `Approved Artwork Job ${artApproveMatch[1].toUpperCase()}.`
    };
  }

  // 11. Broadcast Alert (e.g., "Send alert: System maintenance at 5PM")
  const alertMatch = text.match(/(?:send|create) alert:? (.+)/i);
  if (alertMatch) {
    return {
      action: 'addAlert',
      data: { message: alertMatch[1].trim(), type: 'warning' },
      message: `Broadcasted alert to all users: "${alertMatch[1].trim()}"`
    };
  }

  return {
    action: 'unknown',
    message: "I didn't quite catch that. Try commands like 'Create a new invoice for Beta Tech of 50000', 'Mark WO-2041 as completed', or 'Used 50 units of Binding Glue'."
  };
};
