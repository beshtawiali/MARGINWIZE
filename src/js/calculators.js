import { formatCurrency, formatPercent, getCurrencySymbol } from './common.js';

function runInitCalculators() {
  initProfitMarginCalc();
  initMarkupCalc();
  initSalesTaxCalc();
  initBreakEvenCalc();
  initDiscountCalc();
  initRoiCalc();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInitCalculators);
} else {
  runInitCalculators();
}

// Re-run current page calculation when currency symbol changes
window.addEventListener('currencyChange', () => {
  runInitCalculators();
});

// Helper to parse input values cleanly
function getNum(id, defaultVal = 0) {
  const el = document.getElementById(id);
  if (!el) return defaultVal;
  const val = parseFloat(el.value);
  return isNaN(val) ? defaultVal : val;
}

function setTxt(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Helper to save and restore calculator input values (Remembers your numbers)
function setupInputPersistence(inputs, calculateFn) {
  inputs.forEach(inp => {
    if (!inp) return;
    const key = 'marginwize_val_' + inp.id;
    const stored = localStorage.getItem(key);
    if (stored !== null && stored !== undefined) {
      inp.value = stored;
    }
    const handler = () => {
      localStorage.setItem(key, inp.value);
      if (calculateFn) calculateFn();
    };
    inp.addEventListener('input', handler);
    inp.addEventListener('change', handler);
  });
}

/* ==========================================================================
   1. PROFIT MARGIN CALCULATOR
   ========================================================================== */
function initProfitMarginCalc() {
  const costInput = document.getElementById('pm-cost');
  const revInput = document.getElementById('pm-revenue');
  const opexInput = document.getElementById('pm-opex');

  if (!costInput || !revInput) return;

  const calculate = () => {
    const cost = getNum('pm-cost', 0);
    const revenue = getNum('pm-revenue', 0);
    const opex = getNum('pm-opex', 0);

    const grossProfit = revenue - cost;
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const markupPct = cost > 0 ? (grossProfit / cost) * 100 : 0;
    const netProfit = grossProfit - opex;
    const netMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    setTxt('res-pm-gross-profit', formatCurrency(grossProfit));
    setTxt('res-pm-gross-margin', formatPercent(grossMarginPct));
    setTxt('res-pm-markup', formatPercent(markupPct));
    setTxt('res-pm-net-profit', formatCurrency(netProfit));
    setTxt('res-pm-net-margin', formatPercent(netMarginPct));

    // Warning Banner: Display when COGS > Revenue (Operating at a Loss)
    const pmWarningBanner = document.getElementById('pm-warning-banner');
    const pmWarningText = document.getElementById('pm-warning-text');
    if (pmWarningBanner && pmWarningText) {
      if (cost > revenue && revenue > 0) {
        pmWarningText.textContent = `Your Cost of Goods (${formatCurrency(cost)}) exceeds your Revenue (${formatCurrency(revenue)}). This means you're operating at a loss — double-check your numbers if this wasn't intentional.`;
        pmWarningBanner.classList.remove('hidden');
      } else if (cost > 0 && revenue === 0) {
        pmWarningText.textContent = `Your Cost of Goods is ${formatCurrency(cost)} with $0 Revenue. Operating at a 100% loss.`;
        pmWarningBanner.classList.remove('hidden');
      } else {
        pmWarningBanner.classList.add('hidden');
      }
    }

    // Update Financial Breakdown Chart
    updateProfitMarginChart(revenue, cost, grossProfit, netProfit, opex);
  };

  setupInputPersistence([costInput, revInput, opexInput], calculate);

  // Preset buttons
  const presets = document.querySelectorAll('.pm-preset-btn');
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-cost');
      const r = btn.getAttribute('data-rev');
      if (c && costInput) {
        costInput.value = c;
        localStorage.setItem('marginwize_val_pm-cost', c);
      }
      if (r && revInput) {
        revInput.value = r;
        localStorage.setItem('marginwize_val_pm-revenue', r);
      }
      calculate();
    });
  });

  calculate();
}

/* ==========================================================================
   2. MARKUP CALCULATOR
   ========================================================================== */
function initMarkupCalc() {
  const costInput = document.getElementById('mk-cost');
  const markupInput = document.getElementById('mk-markup');

  if (!costInput || !markupInput) return;

  const calculate = () => {
    const cost = getNum('mk-cost', 0);
    const markupPct = getNum('mk-markup', 0);

    const profit = cost * (markupPct / 100);
    const sellingPrice = cost + profit;
    const marginPct = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    setTxt('res-mk-price', formatCurrency(sellingPrice));
    setTxt('res-mk-profit', formatCurrency(profit));
    setTxt('res-mk-margin', formatPercent(marginPct));
    setTxt('res-mk-markup-val', formatPercent(markupPct));
    setTxt('res-mk-cost-summary', formatCurrency(cost));
    setTxt('res-mk-rate-summary', formatPercent(markupPct));

    // Warning Banner: Display when Markup < 0 (Selling Price < Cost)
    const mkWarningBanner = document.getElementById('mk-warning-banner');
    const mkWarningText = document.getElementById('mk-warning-text');
    if (mkWarningBanner && mkWarningText) {
      if (markupPct < 0) {
        mkWarningText.textContent = `Negative markup results in a Selling Price (${formatCurrency(sellingPrice)}) lower than your Cost (${formatCurrency(cost)}). Operating at a loss.`;
        mkWarningBanner.classList.remove('hidden');
      } else {
        mkWarningBanner.classList.add('hidden');
      }
    }

    // Diff tip
    const diffEl = document.getElementById('mk-diff-note');
    if (diffEl) {
      diffEl.textContent = `A ${markupPct.toFixed(1)}% markup on ${formatCurrency(cost)} cost equals a ${marginPct.toFixed(1)}% profit margin.`;
    }
  };

  setupInputPersistence([costInput, markupInput], calculate);

  calculate();
}

/* ==========================================================================
   3. VAT / SALES TAX CALCULATOR
   ========================================================================== */
function initSalesTaxCalc() {
  const amountInput = document.getElementById('st-amount');
  const rateInput = document.getElementById('st-rate');
  const modeSelect = document.getElementById('st-mode');

  if (!amountInput || !rateInput) return;

  const calculate = () => {
    const amount = getNum('st-amount', 0);
    const taxRate = getNum('st-rate', 0);
    const mode = modeSelect ? modeSelect.value : 'add';

    let netPrice = 0;
    let taxAmount = 0;
    let grossPrice = 0;

    if (mode === 'add') {
      // Amount is Net
      netPrice = amount;
      taxAmount = amount * (taxRate / 100);
      grossPrice = netPrice + taxAmount;
    } else {
      // Amount is Gross (extract tax)
      grossPrice = amount;
      netPrice = amount / (1 + taxRate / 100);
      taxAmount = grossPrice - netPrice;
    }

    setTxt('res-st-net', formatCurrency(netPrice));
    setTxt('res-st-tax', formatCurrency(taxAmount));
    setTxt('res-st-gross', formatCurrency(grossPrice));
    setTxt('res-st-rate-summary', formatPercent(taxRate));
    const effectiveShare = grossPrice > 0 ? (taxAmount / grossPrice) * 100 : 0;
    setTxt('res-st-share-summary', formatPercent(effectiveShare));

    // Update Price vs Tax Donut Chart
    updateSalesTaxChart(netPrice, taxAmount, grossPrice);
  };

  setupInputPersistence([amountInput, rateInput, modeSelect], calculate);

  // Preset rate buttons
  const presets = document.querySelectorAll('.st-preset-btn');
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const r = btn.getAttribute('data-rate');
      if (r && rateInput) {
        rateInput.value = r;
        localStorage.setItem('marginwize_val_st-rate', r);
        calculate();
      }
    });
  });

  calculate();
}

/* ==========================================================================
   4. BREAK-EVEN CALCULATOR
   ========================================================================== */
function initBreakEvenCalc() {
  const fixedInput = document.getElementById('be-fixed');
  const varInput = document.getElementById('be-variable');
  const priceInput = document.getElementById('be-price');

  if (!fixedInput || !varInput || !priceInput) return;

  const calculate = () => {
    const fixedCosts = getNum('be-fixed', 0);
    const varCostUnit = getNum('be-variable', 0);
    const priceUnit = getNum('be-price', 0);

    const contribMarginUnit = priceUnit - varCostUnit;
    const contribRatio = priceUnit > 0 ? (contribMarginUnit / priceUnit) * 100 : 0;

    let breakEvenUnits = 0;
    let breakEvenRevenue = 0;

    if (contribMarginUnit > 0) {
      breakEvenUnits = fixedCosts / contribMarginUnit;
      breakEvenRevenue = breakEvenUnits * priceUnit;
    }

    setTxt('res-be-units', breakEvenUnits > 0 ? Math.ceil(breakEvenUnits).toLocaleString() + ' units' : 'N/A');
    setTxt('res-be-revenue', formatCurrency(breakEvenRevenue));
    setTxt('res-be-contrib', formatCurrency(contribMarginUnit));
    setTxt('res-be-ratio', formatPercent(contribRatio));
    setTxt('res-be-fixed-summary', formatCurrency(fixedCosts));

    // Warning Banner: Display when Variable Cost >= Selling Price
    const beWarningBanner = document.getElementById('be-warning-banner');
    const beWarningText = document.getElementById('be-warning-text');
    if (beWarningBanner && beWarningText) {
      if (varCostUnit >= priceUnit && priceUnit > 0) {
        beWarningText.textContent = `Your Variable Cost (${formatCurrency(varCostUnit)}) meets or exceeds Selling Price (${formatCurrency(priceUnit)}). Every unit sold operates at a loss — break-even is impossible at this price.`;
        beWarningBanner.classList.remove('hidden');
      } else {
        beWarningBanner.classList.add('hidden');
      }
    }

    // Update Break-even visual chart SVG or meters
    updateBreakEvenVisual(fixedCosts, varCostUnit, priceUnit, breakEvenUnits);
  };

  setupInputPersistence([fixedInput, varInput, priceInput], calculate);

  calculate();
}

function updateBreakEvenVisual(fixed, varCost, price, beUnits) {
  const chartEl = document.getElementById('be-chart-container');
  if (!chartEl) return;

  const sym = getCurrencySymbol();
  if (beUnits <= 0 || isNaN(beUnits)) {
    chartEl.innerHTML = `<div class="p-6 text-center text-slate-500 font-medium">Selling price must be higher than variable cost per unit to achieve break-even.</div>`;
    return;
  }

  // Draw simple SVG line chart
  const maxUnits = Math.ceil(beUnits * 2);
  const maxRev = maxUnits * price;

  const svgWidth = 500;
  const svgHeight = 220;
  const padding = 35;

  const getX = (u) => padding + (u / maxUnits) * (svgWidth - 2 * padding);
  const getY = (v) => svgHeight - padding - (v / maxRev) * (svgHeight - 2 * padding);

  // Line Points
  const fixedY = getY(fixed);
  const totalCostStart = getY(fixed);
  const totalCostEnd = getY(fixed + varCost * maxUnits);
  const revenueStart = getY(0);
  const revenueEnd = getY(price * maxUnits);

  const beX = getX(beUnits);
  const beY = getY(beUnits * price);

  chartEl.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto overflow-visible">
      <!-- Grid lines -->
      <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <!-- Fixed Cost Line -->
      <line x1="${padding}" y1="${fixedY}" x2="${svgWidth - padding}" y2="${fixedY}" stroke="#94a3b8" stroke-dasharray="4" stroke-width="1.5"/>
      
      <!-- Total Cost Line (Fixed + Var) -->
      <line x1="${padding}" y1="${totalCostStart}" x2="${svgWidth - padding}" y2="${totalCostEnd}" stroke="#ef4444" stroke-width="2.5"/>
      
      <!-- Revenue Line -->
      <line x1="${padding}" y1="${revenueStart}" x2="${svgWidth - padding}" y2="${revenueEnd}" stroke="#10b981" stroke-width="2.5"/>

      <!-- Break even point dot -->
      <circle cx="${beX}" cy="${beY}" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
      
      <!-- Annotations -->
      <text x="${beX + 10}" y="${beY - 10}" fill="#1e293b" font-size="11" font-weight="bold">Break-Even: ${Math.ceil(beUnits).toLocaleString()} Units</text>
      <text x="${padding + 5}" y="${fixedY - 6}" fill="#64748b" font-size="10">Fixed Costs (${sym}${fixed.toLocaleString()})</text>
      
      <text x="${svgWidth - padding}" y="${svgHeight - padding + 20}" text-anchor="end" fill="#64748b" font-size="10">Units Sold (${maxUnits})</text>
      <text x="${padding}" y="${padding - 10}" fill="#64748b" font-size="10">Revenue / Cost (${sym})</text>
    </svg>
    <div class="flex items-center justify-center space-x-6 mt-3 text-xs font-semibold text-slate-600">
      <div class="flex items-center space-x-1.5"><span class="w-3 h-3 bg-red-500 rounded-full inline-block"></span><span>Total Costs</span></div>
      <div class="flex items-center space-x-1.5"><span class="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span><span>Total Revenue</span></div>
      <div class="flex items-center space-x-1.5"><span class="w-3 h-3 bg-blue-600 rounded-full inline-block"></span><span>Break-Even Point</span></div>
    </div>
  `;
}

/* ==========================================================================
   5. DISCOUNT CALCULATOR
   ========================================================================== */
function initDiscountCalc() {
  const origInput = document.getElementById('dc-orig');
  const disc1Input = document.getElementById('dc-disc1');
  const disc2Input = document.getElementById('dc-disc2');
  const taxInput = document.getElementById('dc-tax');

  if (!origInput || !disc1Input) return;

  const calculate = () => {
    const origPrice = getNum('dc-orig', 0);
    const disc1Pct = getNum('dc-disc1', 0);
    const disc2Pct = getNum('dc-disc2', 0);
    const taxRate = getNum('dc-tax', 0);

    const priceAfterDisc1 = origPrice * (1 - disc1Pct / 100);
    const priceAfterDisc2 = priceAfterDisc1 * (1 - disc2Pct / 100);

    const totalSavings = origPrice - priceAfterDisc2;
    const effectiveDiscPct = origPrice > 0 ? (totalSavings / origPrice) * 100 : 0;

    const taxAmount = priceAfterDisc2 * (taxRate / 100);
    const finalTotal = priceAfterDisc2 + taxAmount;

    setTxt('res-dc-final-price', formatCurrency(finalTotal));
    setTxt('res-dc-savings', formatCurrency(totalSavings));
    setTxt('res-dc-effective-pct', formatPercent(effectiveDiscPct));
    setTxt('res-dc-tax', formatCurrency(taxAmount));
    setTxt('res-dc-orig-summary', formatCurrency(origPrice));

    // Warning Banner: Display when Discount >= 100%
    const dcWarningBanner = document.getElementById('dc-warning-banner');
    const dcWarningText = document.getElementById('dc-warning-text');
    if (dcWarningBanner && dcWarningText) {
      if (effectiveDiscPct >= 100) {
        dcWarningText.textContent = `Total combined discount reaches 100% or more. The final price is $0.00 (free).`;
        dcWarningBanner.classList.remove('hidden');
      } else {
        dcWarningBanner.classList.add('hidden');
      }
    }

    // Update Price Comparison Bar Chart
    updateDiscountChart(origPrice, totalSavings, finalTotal);
  };

  setupInputPersistence([origInput, disc1Input, disc2Input, taxInput], calculate);

  // Discount presets
  const presets = document.querySelectorAll('.dc-preset-btn');
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-pct');
      if (p && disc1Input) {
        disc1Input.value = p;
        localStorage.setItem('marginwize_val_dc-disc1', p);
        calculate();
      }
    });
  });

  calculate();
}

/* ==========================================================================
   6. ROI CALCULATOR
   ========================================================================== */
function initRoiCalc() {
  const initialInput = document.getElementById('roi-initial');
  const returnInput = document.getElementById('roi-return');
  const yearsInput = document.getElementById('roi-years');

  if (!initialInput || !returnInput) return;

  // Toggle button setup for Chart vs Table
  const tabChart = document.getElementById('roi-tab-chart');
  const tabTable = document.getElementById('roi-tab-table');
  const chartView = document.getElementById('roi-chart-view');
  const tableView = document.getElementById('roi-table-view');

  if (tabChart && tabTable && chartView && tableView) {
    tabChart.onclick = () => {
      tabChart.className = 'px-3 py-1 rounded-md transition-all bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-2xs';
      tabTable.className = 'px-3 py-1 rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      chartView.classList.remove('hidden');
      chartView.classList.add('block');
      tableView.classList.remove('block');
      tableView.classList.add('hidden');
    };

    tabTable.onclick = () => {
      tabTable.className = 'px-3 py-1 rounded-md transition-all bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-2xs';
      tabChart.className = 'px-3 py-1 rounded-md transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
      tableView.classList.remove('hidden');
      tableView.classList.add('block');
      chartView.classList.remove('block');
      chartView.classList.add('hidden');
    };
  }

  const calculate = () => {
    const initial = getNum('roi-initial', 0);
    const finalVal = getNum('roi-return', 0);
    const years = getNum('roi-years', 1);

    const netProfit = finalVal - initial;
    const totalRoiPct = initial > 0 ? (netProfit / initial) * 100 : 0;
    
    let cagrPct = 0;
    if (initial > 0 && finalVal > 0 && years > 0) {
      cagrPct = (Math.pow(finalVal / initial, 1 / years) - 1) * 100;
    }

    const multiple = initial > 0 ? (finalVal / initial) : 0;

    setTxt('res-roi-profit', formatCurrency(netProfit));
    setTxt('res-roi-pct', formatPercent(totalRoiPct));
    setTxt('res-roi-cagr', years > 0 ? formatPercent(cagrPct) : 'N/A');
    setTxt('res-roi-multiple', `${multiple.toFixed(2)}x`);
    setTxt('res-roi-initial-summary', formatCurrency(initial));

    // Warning Banner: Display when Initial Investment > Final Value (Net Loss)
    const roiWarningBanner = document.getElementById('roi-warning-banner');
    const roiWarningText = document.getElementById('roi-warning-text');
    if (roiWarningBanner && roiWarningText) {
      if (initial > finalVal && initial > 0) {
        roiWarningText.textContent = `Your Initial Investment (${formatCurrency(initial)}) exceeds your Final Value (${formatCurrency(finalVal)}). This investment resulted in a loss of ${formatCurrency(initial - finalVal)}.`;
        roiWarningBanner.classList.remove('hidden');
      } else {
        roiWarningBanner.classList.add('hidden');
      }
    }

    // ROI visual tone
    const roiValEl = document.getElementById('res-roi-pct');
    if (roiValEl) {
      if (totalRoiPct > 0) {
        roiValEl.className = 'text-2xl font-bold text-emerald-600 dark:text-emerald-400';
      } else if (totalRoiPct < 0) {
        roiValEl.className = 'text-2xl font-bold text-red-600 dark:text-red-400';
      } else {
        roiValEl.className = 'text-2xl font-bold text-slate-800 dark:text-slate-200';
      }
    }

    // Render SVG Growth Chart & Table
    renderRoiVisual(initial, finalVal, years);
  };

  setupInputPersistence([initialInput, returnInput, yearsInput], calculate);

  calculate();
}

function renderRoiVisual(initial, finalVal, years) {
  const svgContainer = document.getElementById('roi-svg-chart-container');
  const tableBody = document.getElementById('roi-table-body');
  const hoverInfo = document.getElementById('roi-chart-hover-info');

  if (!svgContainer || !tableBody) return;

  const sym = getCurrencySymbol();
  const nYears = Math.max(1, Math.min(50, Math.round(years || 1)));

  let cagrRate = 0;
  if (initial > 0 && finalVal > 0 && nYears > 0) {
    cagrRate = Math.pow(finalVal / initial, 1 / nYears) - 1;
  } else if (initial > 0 && finalVal === 0) {
    cagrRate = -1 / nYears;
  }

  // Generate Year Data Points
  const points = [];
  for (let t = 0; t <= nYears; t++) {
    let val;
    if (t === 0) {
      val = initial;
    } else if (t === nYears) {
      val = finalVal;
    } else {
      val = initial * Math.pow(1 + cagrRate, t);
    }
    const gain = val - initial;
    const roiPct = initial > 0 ? (gain / initial) * 100 : 0;
    points.push({ year: t, value: val, initial: initial, gain: gain, roiPct: roiPct });
  }

  // Populate Table View
  tableBody.innerHTML = points.map(p => `
    <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td class="p-2 font-semibold text-slate-800 dark:text-slate-200">Year ${p.year}</td>
      <td class="p-2">${formatCurrency(p.initial)}</td>
      <td class="p-2 font-medium ${p.gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">
        ${p.gain >= 0 ? '+' : ''}${formatCurrency(p.gain)}
      </td>
      <td class="p-2 font-bold text-slate-900 dark:text-white">${formatCurrency(p.value)}</td>
      <td class="p-2 text-right font-semibold ${p.roiPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">
        ${formatPercent(p.roiPct)}
      </td>
    </tr>
  `).join('');

  // Default hover info text
  const updateHoverText = (p, label = '') => {
    if (!hoverInfo) return;
    const isGain = p.gain >= 0;
    hoverInfo.innerHTML = `
      <span class="text-slate-500 font-normal mr-1.5">${label ? label : `Year ${p.year}:`}</span>
      <span class="font-bold text-slate-900 dark:text-white mr-2">${formatCurrency(p.value)}</span>
      <span class="${isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} font-semibold">
        ${isGain ? '+' : ''}${formatPercent(p.roiPct)}
      </span>
    `;
  };

  const finalPoint = points[points.length - 1];
  const totalRoiPct = initial > 0 ? ((finalVal - initial) / initial) * 100 : 0;
  updateHoverText(finalPoint, `Year ${nYears} (Final):`);

  // Render SVG Chart
  const width = 460;
  const height = 160;
  const padL = 45;
  const padR = 20;
  const padT = 15;
  const padB = 25;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxVal = Math.max(initial, ...points.map(p => p.value));
  const minVal = Math.min(0, initial, ...points.map(p => p.value));
  
  // Headroom
  const valSpan = (maxVal - minVal) || 1;
  const yMax = maxVal + valSpan * 0.1;
  const yMin = minVal < 0 ? minVal - valSpan * 0.1 : 0;

  const getX = (t) => padL + (t / nYears) * plotW;
  const getY = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  // Grid Lines & Y Axis Labels (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => yMin + ratio * (yMax - yMin));
  let gridSvg = '';
  yTicks.forEach(tickVal => {
    const y = getY(tickVal);
    gridSvg += `
      <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="currentColor" class="text-slate-200 dark:text-slate-700/80" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${padL - 6}" y="${y + 3}" text-anchor="end" fill="currentColor" class="text-[9px] font-medium text-slate-400 dark:text-slate-500">${sym}${Math.round(tickVal).toLocaleString()}</text>
    `;
  });

  // X Axis Ticks (Years)
  let xTicksSvg = '';
  const step = nYears > 10 ? Math.ceil(nYears / 5) : 1;
  for (let t = 0; t <= nYears; t += step) {
    const x = getX(t);
    xTicksSvg += `
      <text x="${x}" y="${height - 6}" text-anchor="middle" fill="currentColor" class="text-[10px] font-medium text-slate-400 dark:text-slate-500">Yr ${t}</text>
    `;
  }
  if (nYears % step !== 0) {
    const x = getX(nYears);
    xTicksSvg += `
      <text x="${x}" y="${height - 6}" text-anchor="middle" fill="currentColor" class="text-[10px] font-medium text-slate-400 dark:text-slate-500">Yr ${nYears}</text>
    `;
  }

  // Paths
  const initY = getY(initial);
  const zeroY = getY(0);
  const initialAreaPath = `M ${getX(0)},${zeroY} L ${getX(0)},${initY} L ${getX(nYears)},${initY} L ${getX(nYears)},${zeroY} Z`;

  let totalAreaD = `M ${getX(0)},${zeroY}`;
  points.forEach(p => {
    totalAreaD += ` L ${getX(p.year)},${getY(p.value)}`;
  });
  totalAreaD += ` L ${getX(nYears)},${zeroY} Z`;

  let totalLineD = '';
  points.forEach((p, idx) => {
    totalLineD += idx === 0 ? `M ${getX(p.year)},${getY(p.value)}` : ` L ${getX(p.year)},${getY(p.value)}`;
  });

  // Dots
  let dotsSvg = '';
  points.forEach((p) => {
    const cx = getX(p.year);
    const cy = getY(p.value);
    dotsSvg += `
      <circle cx="${cx}" cy="${cy}" r="3" class="fill-emerald-500 dark:fill-emerald-400 stroke-white dark:stroke-slate-800" stroke-width="1.5" />
    `;
  });

  const isProfitable = finalVal >= initial;
  const gradientId = isProfitable ? 'roiGradGreen' : 'roiGradRed';
  const valLineColor = isProfitable ? '#10b981' : '#ef4444';

  svgContainer.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible select-none">
      <defs>
        <linearGradient id="roiGradGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
        </linearGradient>
        <linearGradient id="roiGradRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0.02"/>
        </linearGradient>
        <linearGradient id="roiGradBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${gridSvg}

      <!-- Initial Investment Baseline Area -->
      <path d="${initialAreaPath}" fill="url(#roiGradBlue)" />
      <line x1="${getX(0)}" y1="${initY}" x2="${getX(nYears)}" y2="${initY}" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3" />

      <!-- Total Value Area & Line -->
      <path d="${totalAreaD}" fill="url(#${gradientId})" />
      <path d="${totalLineD}" fill="none" stroke="${valLineColor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

      <!-- Points -->
      ${dotsSvg}

      <!-- Axis Labels -->
      ${xTicksSvg}

      <!-- Interactive Hover Line (hidden initially) -->
      <g id="roi-hover-group" style="display: none;">
        <line id="roi-hover-line" x1="0" y1="${padT}" x2="0" y2="${height - padB}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" />
        <circle id="roi-hover-val-dot" cx="0" cy="0" r="5" fill="${valLineColor}" stroke="#ffffff" stroke-width="2" />
        <circle id="roi-hover-init-dot" cx="0" cy="0" r="4" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5" />
      </g>
    </svg>
  `;

  // Attach interactive hover listener to svgContainer
  const hoverGroup = document.getElementById('roi-hover-group');
  const hoverLine = document.getElementById('roi-hover-line');
  const hoverValDot = document.getElementById('roi-hover-val-dot');
  const hoverInitDot = document.getElementById('roi-hover-init-dot');

  const handlePointer = (e) => {
    const rect = svgContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseX = clientX - rect.left;
    const ratio = Math.min(Math.max((mouseX - (padL / width) * rect.width) / ((plotW / width) * rect.width), 0), 1);
    
    const targetYr = Math.round(ratio * nYears);
    const p = points[targetYr] || points[points.length - 1];

    if (hoverGroup && hoverLine && hoverValDot && hoverInitDot) {
      const cx = getX(p.year);
      const cyVal = getY(p.value);
      const cyInit = getY(p.initial);

      hoverGroup.style.display = 'block';
      hoverLine.setAttribute('x1', cx);
      hoverLine.setAttribute('x2', cx);
      hoverValDot.setAttribute('cx', cx);
      hoverValDot.setAttribute('cy', cyVal);
      hoverInitDot.setAttribute('cx', cx);
      hoverInitDot.setAttribute('cy', cyInit);
    }

    updateHoverText(p);
  };

  const handleLeave = () => {
    if (hoverGroup) hoverGroup.style.display = 'none';
    updateHoverText(finalPoint, `Year ${nYears} (Final):`);
  };

  svgContainer.onmousemove = handlePointer;
  svgContainer.ontouchmove = handlePointer;
  svgContainer.onmouseleave = handleLeave;
  svgContainer.ontouchend = handleLeave;
}

/* ==========================================================================
   CHART VISUALIZERS FOR PROFIT MARGIN, SALES TAX, AND DISCOUNT
   ========================================================================== */

/**
 * Format compact currency for Y-axis ticks and top bar values ($1.2k, $4.5M, etc.)
 */
function formatCompactCurrency(amount) {
  const sym = getCurrencySymbol();
  if (isNaN(amount) || amount === null) return `${sym}0`;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  let numStr = '';
  if (abs >= 1000000000) {
    numStr = (abs / 1000000000).toFixed(1) + 'B';
  } else if (abs >= 1000000) {
    numStr = (abs / 1000000).toFixed(1) + 'M';
  } else if (abs >= 10000) {
    numStr = (abs / 1000).toFixed(1) + 'k';
  } else if (abs >= 1000) {
    numStr = (abs / 1000).toFixed(1) + 'k';
  } else if (abs % 1 !== 0) {
    numStr = abs.toFixed(abs < 10 ? 2 : 0);
  } else {
    numStr = abs.toString();
  }
  return `${sign}${sym}${numStr}`;
}

/**
 * Generic responsive SVG vertical bar chart generator with X & Y axes, gridlines, and legend
 */
function renderVerticalBarChart(containerId, categories) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!categories || categories.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">No data to display.</div>`;
    return;
  }

  const rawVals = categories.map(c => c.val || 0);
  let minVal = Math.min(...rawVals);
  let maxVal = Math.max(...rawVals);

  if (minVal === 0 && maxVal === 0) {
    maxVal = 100;
  }

  let lowerVal, upperVal;
  if (minVal >= 0) {
    lowerVal = 0;
    upperVal = maxVal * 1.18;
  } else {
    lowerVal = minVal * 1.18;
    upperVal = maxVal > 0 ? maxVal * 1.18 : 0;
  }

  const totalRange = upperVal - lowerVal || 1;

  const width = 360;
  const height = 185;
  const padL = 52;
  const padR = 12;
  const padT = 24;
  const padB = 32;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const getY = (v) => padT + plotH - ((v - lowerVal) / totalRange) * plotH;
  const y0 = getY(0);

  // Y-axis gridlines & ticks (4 grid lines)
  let ticksSvg = '';
  const numTicks = 3;
  for (let i = 0; i <= numTicks; i++) {
    const tickVal = lowerVal + (totalRange / numTicks) * i;
    const tickY = getY(tickVal);
    const tickFormatted = formatCompactCurrency(tickVal);

    if (tickY >= padT - 4 && tickY <= height - padB + 4) {
      ticksSvg += `
        <line x1="${padL}" y1="${tickY}" x2="${width - padR}" y2="${tickY}" 
          stroke="currentColor" class="stroke-slate-200/90 dark:stroke-slate-700/60" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${padL - 6}" y="${tickY + 3.5}" text-anchor="end" 
          class="fill-slate-400 dark:fill-slate-500 text-[9px] font-semibold tracking-tight">${tickFormatted}</text>
      `;
    }
  }

  // Zero baseline
  let zeroLineSvg = '';
  if (y0 >= padT && y0 <= height - padB) {
    zeroLineSvg = `<line x1="${padL}" y1="${y0}" x2="${width - padR}" y2="${y0}" stroke="currentColor" class="stroke-slate-400 dark:stroke-slate-500" stroke-width="1.25" />`;
  }

  // Bars & X labels
  const n = categories.length;
  const groupW = plotW / n;
  const barW = Math.min(groupW * 0.48, 36);

  let barsSvg = '';
  let xLabelsSvg = '';

  categories.forEach((cat, i) => {
    const val = cat.val || 0;
    const cx = padL + i * groupW + groupW / 2;
    const barX = cx - barW / 2;
    const valY = getY(val);

    let barY, barH;
    if (val >= 0) {
      barY = valY;
      barH = Math.max(y0 - valY, 2);
    } else {
      barY = y0;
      barH = Math.max(valY - y0, 2);
    }

    const valFormatted = formatCompactCurrency(val);
    const valTextY = val >= 0 ? barY - 5 : barY + barH + 11;
    const color = cat.color;

    barsSvg += `
      <g class="group">
        <title>${cat.label}: ${formatCurrency(val)}</title>
        <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="3" ry="3" 
          fill="${color}" class="transition-all duration-300 opacity-90 hover:opacity-100" />
        <text x="${cx}" y="${valTextY}" text-anchor="middle" 
          class="fill-slate-700 dark:fill-slate-200 text-[10px] font-bold tracking-tight">${valFormatted}</text>
      </g>
    `;

    xLabelsSvg += `
      <text x="${cx}" y="${height - 10}" text-anchor="middle" 
        class="fill-slate-600 dark:fill-slate-400 text-[10px] font-semibold">${cat.shortLabel || cat.label}</text>
    `;
  });

  // Legend HTML
  let legendHtml = `<div class="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 mt-2.5 text-[11px] font-medium border-t border-slate-100 dark:border-slate-700/60 pt-2.5">`;
  categories.forEach(cat => {
    const valFormatted = formatCurrency(cat.val || 0);
    legendHtml += `
      <div class="flex items-center space-x-1.5" title="${cat.label}: ${valFormatted}">
        <span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background-color: ${cat.color}"></span>
        <span class="text-slate-500 dark:text-slate-400">${cat.label}: <strong class="${cat.val < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}">${valFormatted}</strong></span>
      </div>
    `;
  });
  legendHtml += `</div>`;

  const fullHtml = `
    <div class="w-full">
      <div class="relative w-full overflow-hidden">
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none">
          ${ticksSvg}
          ${zeroLineSvg}
          ${barsSvg}
          ${xLabelsSvg}
        </svg>
      </div>
      ${legendHtml}
    </div>
  `;

  container.innerHTML = fullHtml;
}

/**
 * Profit Margin Calculator: Vertical bar chart for Revenue vs COGS vs Gross Profit vs Net Profit
 */
function updateProfitMarginChart(revenue, cost, grossProfit, netProfit, opex) {
  const categories = [
    { key: 'revenue', label: 'Revenue', shortLabel: 'Revenue', val: revenue, color: '#3b82f6' },
    { key: 'cogs', label: 'COGS', shortLabel: 'COGS', val: cost, color: '#64748b' },
    { key: 'gross', label: 'Gross Profit', shortLabel: 'Gross Profit', val: grossProfit, color: grossProfit >= 0 ? '#10b981' : '#ef4444' },
    { key: 'net', label: 'Net Profit', shortLabel: 'Net Profit', val: netProfit, color: netProfit >= 0 ? '#6366f1' : '#dc2626' }
  ];

  renderVerticalBarChart('pm-chart-container', categories);
}

/**
 * VAT / Sales Tax Calculator: Donut chart showing Net Price vs Tax Amount as a proportion of Total Gross Price
 */
function updateSalesTaxChart(netPrice, taxAmount, grossPrice) {
  const container = document.getElementById('st-chart-container');
  if (!container) return;

  if (grossPrice <= 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 text-center py-3">Enter an amount to see the tax breakdown chart.</div>`;
    return;
  }

  const netPct = Math.min(100, Math.max(0, (netPrice / grossPrice) * 100));
  const taxPct = Math.min(100, Math.max(0, (taxAmount / grossPrice) * 100));

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const netDash = (netPct / 100) * circumference;
  const taxDash = (taxPct / 100) * circumference;

  const html = `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
      <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90 transform">
          <!-- Background ring -->
          <circle cx="50" cy="50" r="${radius}" fill="none" class="stroke-slate-100 dark:stroke-slate-700/60" stroke-width="14" />
          <!-- Net Price Arc (Blue) -->
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#3b82f6" stroke-width="14"
            stroke-dasharray="${netDash} ${circumference}" stroke-dashoffset="0" class="transition-all duration-300" />
          <!-- Tax Arc (Amber) -->
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#f59e0b" stroke-width="14"
            stroke-dasharray="${taxDash} ${circumference}" stroke-dashoffset="-${netDash}" class="transition-all duration-300" />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Total</span>
          <span class="text-xs font-extrabold text-slate-900 dark:text-white">${formatCurrency(grossPrice)}</span>
        </div>
      </div>
      <div class="flex flex-col justify-center space-y-2 w-full text-xs">
        <div class="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span class="font-medium text-slate-700 dark:text-slate-300">Net Price</span>
          </div>
          <div class="text-right">
            <span class="font-bold text-slate-900 dark:text-white block">${formatCurrency(netPrice)}</span>
            <span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400">${formatPercent(netPct)}</span>
          </div>
        </div>
        <div class="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span class="font-medium text-slate-700 dark:text-slate-300">Tax Amount</span>
          </div>
          <div class="text-right">
            <span class="font-bold text-slate-900 dark:text-white block">${formatCurrency(taxAmount)}</span>
            <span class="text-[10px] font-semibold text-amber-600 dark:text-amber-400">${formatPercent(taxPct)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

/**
 * Discount Calculator: Vertical bar chart comparing Original Price vs Total Dollars Saved vs Final Total Price
 */
function updateDiscountChart(origPrice, totalSavings, finalPrice) {
  const categories = [
    { key: 'orig', label: 'Original Price', shortLabel: 'Original', val: origPrice, color: '#64748b' },
    { key: 'saved', label: 'Total Saved', shortLabel: 'Saved', val: totalSavings, color: '#10b981' },
    { key: 'final', label: 'Final Total', shortLabel: 'Final Price', val: finalPrice, color: '#f43f5e' }
  ];

  renderVerticalBarChart('dc-chart-container', categories);
}

