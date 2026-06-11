import { supabase } from '../lib/supabase';

// Static defaults migrated from Code (1).js
export const DEFAULT_MASTERS = {
  orderPrefixes: ['SL', 'M'],
  salesReps: ['Manisha', 'Sikesh', 'Sarvesh', 'Prachi', 'Sneha', 'Manshi', 'Priyanka', 'Nikky'],
  salesTypes: [
    'Regular B2B', 'SEZ Supplies with Payment', 'SEZ Supplies without Payment', 'Deemed Exp',
    'Intra State Supplies attracting GST', 'Export Sales', 'B2C', 'Exempted From GST'
  ],
  categories: [
    'Calenders', 'Carry Bags', 'Catalogues', 'Caution Sticker', 'Corrugated Box', 'Dangler', 'Envelopes', 'Folders',
    'IT Sticker', 'Labels', 'Leaflet', 'Letter Head', 'Posters', 'Stickers', 'Visiting Card', 'Warranty Card', 'Writing Pads'
  ],
  hsnGroups: [
    'CORRUGATED BOX', 'LEAFLET', 'BOOK', 'T SHIRT', 'CAP', 'STICKER', 'WARRANTY CARD', 'KEY RING', 'ENVELOPE', 'LETTER HEAD',
    'NOTEPADS', 'FOLDER', 'VISITING CARD', 'CALENDAR', 'POSTER', 'CATALOGUE', 'DANGLER', 'PAPER BAGS', 'ROLL UP STANDEE'
  ],
  hsnToGst: {
    'CORRUGATED BOX': 5, 'LEAFLET': 5, 'BOOK': 5, 'T SHIRT': 5, 'CAP': 5,
    'STICKER': 18, 'WARRANTY CARD': 18, 'ENVELOPE': 18, 'LETTER HEAD': 18, 'NOTEPADS': 18,
    'FOLDER': 18, 'VISITING CARD': 18, 'CALENDAR': 18, 'POSTER': 18, 'CATALOGUE': 18,
    'DANGLER': 18, 'PAPER BAGS': 18, 'ROLL UP STANDEE': 18
  },
  units: ['Pcs', 'Kgs', 'Meter'],
  rateTypes: ['Unit', 'Per Unit', 'Unit Cost', '1000 Unit', '100 Unit', 'Per 1000', 'Per 100', 'TOTAL'],
  currencies: ['INR', 'USD'],
  jobTypes: ['New', 'Repeat'],
  companyState: 'Haryana',
};

/**
 * Fetches dynamic masters from Supabase and merges with defaults.
 * Replaces the `getUnifiedMasters` logic from Google Apps Script.
 */
export async function getMasters() {
  const masters = { ...DEFAULT_MASTERS, clients: [] };

  if (!supabase) {
    return masters;
  }

  try {
    // 1. Fetch Clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('active', true)
      .order('client_name', { ascending: true });

    if (!clientsError && clients) {
      masters.clients = clients.map(c => ({
        code: c.client_code,
        name: c.client_name,
        state: c.state || '',
        gstin: c.gstin || '',
        creditDays: c.credit_days || 0,
        category: c.category || '',
        panNo: c.pan_no || ''
      }));
    } else {
      masters.clients = [];
    }

    // 2. Fetch Items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('hsn_group,gst_pct')
      .eq('active', true)
      .order('hsn_group', { ascending: true });

    if (!itemsError && items) {
      items.forEach(i => {
        if (i.hsn_group) {
          const grp = i.hsn_group.trim().toUpperCase();
          masters.hsnToGst[grp] = Number(i.gst_pct) || 0;
        }
      });
    }

    return masters;
  } catch (error) {
    console.error("Error fetching masters:", error);
    return masters; // Fallback to static defaults
  }
}
