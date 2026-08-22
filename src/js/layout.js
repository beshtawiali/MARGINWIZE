// Shared Site Layout Engine (Header, Footer, Head Tags, GA4, Favicons)

export const SHARED_HEAD_TAGS = `
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png">
  <link rel="apple-touch-icon" href="/favicon-512.png">

  <!-- Instant Theme Script to prevent FOIT -->
  <script>
    (function() {
      try {
        var saved = localStorage.getItem('marginwize_theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'dark' || (!saved && prefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  </script>

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-N8DD8SV8Z3"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-N8DD8SV8Z3');
  </script>
`;

export const SHARED_HEADER_HTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Brand Logo -->
      <a href="/index.html" class="flex items-center space-x-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M15 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Margin<span class="text-blue-600 dark:text-blue-400">Wize</span></span>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-700 dark:text-slate-200">
        <a href="/index.html" data-nav="home" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
        
        <!-- Dropdown for Calculators -->
        <div class="relative group">
          <button id="calc-dropdown-btn" class="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2">
            <span>Calculators</span>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div class="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 hidden group-hover:block transition-all z-50">
            <a href="/profit-margin-calculator.html" data-nav="profit-margin" class="block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">Profit Margin Calculator</a>
            <a href="/markup-calculator.html" data-nav="markup" class="block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">Markup Calculator</a>
            <a href="/sales-tax-calculator.html" data-nav="sales-tax" class="block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">VAT / Sales Tax Calculator</a>
            <a href="/break-even-calculator.html" data-nav="break-even" class="block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">Break-even Calculator</a>
            <a href="/discount-calculator.html" data-nav="discount" class="block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">Discount Calculator</a>
            <a href="/roi-calculator.html" data-nav="roi" class="block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400">ROI Calculator</a>
          </div>
        </div>

        <a href="/blog.html" data-nav="blog" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Articles</a>
        <a href="/about.html" data-nav="about" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a>
        <a href="/contact.html" data-nav="contact" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
      </nav>

      <!-- Currency Selector, Theme Toggle & Mobile Menu -->
      <div class="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg px-1.5 sm:px-2.5 py-1 border border-slate-200 dark:border-slate-600">
          <span class="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-300">Currency:</span>
          <select id="currency-select" aria-label="Select currency" class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer">
            <option value="$" class="dark:bg-slate-800 dark:text-slate-100">$ USD</option>
            <option value="€" class="dark:bg-slate-800 dark:text-slate-100">€ EUR</option>
            <option value="£" class="dark:bg-slate-800 dark:text-slate-100">£ GBP</option>
            <option value="kr" class="dark:bg-slate-800 dark:text-slate-100">kr SEK</option>
            <option value="₹" class="dark:bg-slate-800 dark:text-slate-100">₹ INR</option>
            <option value="¥" class="dark:bg-slate-800 dark:text-slate-100">¥ JPY</option>
          </select>
        </div>

        <button id="theme-toggle-btn" aria-label="Toggle dark mode" class="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:outline-none transition-colors shrink-0">
          <svg id="theme-toggle-dark-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
          <svg id="theme-toggle-light-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"></path></svg>
        </button>

        <button id="mobile-menu-btn" class="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none shrink-0" aria-label="Toggle menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Dropdown Menu -->
  <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 pt-2 pb-4 space-y-2">
    <a href="/index.html" data-mobile-nav="home" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Home</a>
    <div class="pl-3 space-y-1 py-1 border-l-2 border-blue-600 ml-2">
      <p class="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 px-2">Calculators</p>
      <a href="/profit-margin-calculator.html" data-mobile-nav="profit-margin" class="block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Profit Margin</a>
      <a href="/markup-calculator.html" data-mobile-nav="markup" class="block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Markup</a>
      <a href="/sales-tax-calculator.html" data-mobile-nav="sales-tax" class="block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">VAT / Sales Tax</a>
      <a href="/break-even-calculator.html" data-mobile-nav="break-even" class="block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Break-even</a>
      <a href="/discount-calculator.html" data-mobile-nav="discount" class="block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Discount</a>
      <a href="/roi-calculator.html" data-mobile-nav="roi" class="block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">ROI</a>
    </div>
    <a href="/blog.html" data-mobile-nav="blog" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Articles</a>
    <a href="/about.html" data-mobile-nav="about" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">About Us</a>
    <a href="/contact.html" data-mobile-nav="contact" class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Contact</a>
  </div>
`;

export const SHARED_FOOTER_HTML = `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      <div class="md:col-span-1">
        <a href="/index.html" class="flex items-center space-x-2 mb-3">
          <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">MW</div>
          <span class="text-lg font-bold text-slate-900 dark:text-white">Margin<span class="text-blue-600 dark:text-blue-400">Wize</span></span>
        </a>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Free, lightweight financial and business calculator tools designed for fast, accurate decision making.
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-500">© 2026 MarginWize. All rights reserved.</p>
      </div>

      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Calculators</h4>
        <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <li><a href="/profit-margin-calculator.html" class="hover:text-blue-600 dark:hover:text-blue-400">Profit Margin Calculator</a></li>
          <li><a href="/markup-calculator.html" class="hover:text-blue-600 dark:hover:text-blue-400">Markup Calculator</a></li>
          <li><a href="/sales-tax-calculator.html" class="hover:text-blue-600 dark:hover:text-blue-400">VAT / Sales Tax Calculator</a></li>
          <li><a href="/break-even-calculator.html" class="hover:text-blue-600 dark:hover:text-blue-400">Break-even Calculator</a></li>
          <li><a href="/discount-calculator.html" class="hover:text-blue-600 dark:hover:text-blue-400">Discount Calculator</a></li>
          <li><a href="/roi-calculator.html" class="hover:text-blue-600 dark:hover:text-blue-400">ROI Calculator</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Resources</h4>
        <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <li><a href="/blog" class="hover:text-blue-600 dark:hover:text-blue-400">Articles & Guides</a></li>
          <li><a href="/roi-vs-annualized-roi-cagr" class="hover:text-blue-600 dark:hover:text-blue-400">ROI vs Annualized ROI Guide</a></li>
          <li><a href="/complete-markup-formula-guide" class="hover:text-blue-600 dark:hover:text-blue-400">Markup Formula Guide</a></li>
          <li><a href="/how-to-calculate-stacked-discounts" class="hover:text-blue-600 dark:hover:text-blue-400">Stacked Discounts Guide</a></li>
          <li><a href="/what-is-vat-simple-guide" class="hover:text-blue-600 dark:hover:text-blue-400">What Is VAT? Guide</a></li>
          <li><a href="/margin-vs-markup-pricing-mistake" class="hover:text-blue-600 dark:hover:text-blue-400">Margin vs Markup Guide</a></li>
          <li><a href="/how-to-calculate-break-even-point" class="hover:text-blue-600 dark:hover:text-blue-400">Break-Even Analysis Guide</a></li>
          <li><a href="/ebay-profit-margin-calculator" class="hover:text-blue-600 dark:hover:text-blue-400">eBay Profit Margin Guide</a></li>
        </ul>
      </div>

      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Company</h4>
        <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <li><a href="/about.html" class="hover:text-blue-600 dark:hover:text-blue-400">About Us</a></li>
          <li><a href="/contact.html" class="hover:text-blue-600 dark:hover:text-blue-400">Contact & Support</a></li>
          <li><a href="/privacy-policy.html" class="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-slate-100 dark:border-slate-700/60 pt-6 text-center">
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto">
        <strong>Disclaimer:</strong> MarginWize provides educational tools and estimations for business planning. Results are derived from user input figures. They do not constitute formal financial, legal, or accounting advice. Always consult a certified accountant or professional financial advisor before making critical business decisions.
      </p>
    </div>
  </div>
`;

export function injectHeadTags() {
  if (!document.querySelector('script[src*="G-N8DD8SV8Z3"]')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = SHARED_HEAD_TAGS;
    Array.from(tempDiv.children).forEach(el => {
      document.head.appendChild(el);
    });
  }
}

export function renderHeader() {
  let headerEl = document.querySelector('site-header') || document.querySelector('header#site-header') || document.querySelector('#header-placeholder');
  if (headerEl) {
    if (headerEl.children.length === 0) {
      headerEl.innerHTML = SHARED_HEADER_HTML;
    }
    if (headerEl.tagName === 'SITE-HEADER' || headerEl.id === 'header-placeholder') {
      headerEl.className = "bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-xs";
    }
  } else if (!document.querySelector('header')) {
    const newHeader = document.createElement('header');
    newHeader.id = 'site-header';
    newHeader.className = "bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-xs";
    newHeader.innerHTML = SHARED_HEADER_HTML;
    document.body.insertBefore(newHeader, document.body.firstChild);
  }
}

export function renderFooter() {
  let footerEl = document.querySelector('site-footer') || document.querySelector('footer#site-footer') || document.querySelector('#footer-placeholder');
  if (footerEl) {
    if (footerEl.children.length === 0) {
      footerEl.innerHTML = SHARED_FOOTER_HTML;
    }
    if (footerEl.tagName === 'SITE-FOOTER' || footerEl.id === 'footer-placeholder') {
      footerEl.className = "bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto";
    }
  } else if (!document.querySelector('footer')) {
    const newFooter = document.createElement('footer');
    newFooter.id = 'site-footer';
    newFooter.className = "bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto";
    newFooter.innerHTML = SHARED_FOOTER_HTML;
    document.body.appendChild(newFooter);
  }
}

export function highlightActiveNav() {
  const path = window.location.pathname;
  
  let key = 'home';
  if (path.includes('profit-margin')) key = 'profit-margin';
  else if (path.includes('markup')) key = 'markup';
  else if (path.includes('sales-tax')) key = 'sales-tax';
  else if (path.includes('break-even')) key = 'break-even';
  else if (path.includes('discount')) key = 'discount';
  else if (path.includes('roi')) key = 'roi';
  else if (path.includes('blog') || path.includes('article')) key = 'blog';
  else if (path.includes('about')) key = 'about';
  else if (path.includes('contact')) key = 'contact';

  const isCalc = ['profit-margin', 'markup', 'sales-tax', 'break-even', 'discount', 'roi'].includes(key);

  // Desktop links
  const navLinks = document.querySelectorAll('nav [data-nav]');
  navLinks.forEach(link => {
    const navVal = link.getAttribute('data-nav');
    if (navVal === key) {
      if (isCalc) {
        link.className = 'block px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40';
      } else {
        link.className = 'text-blue-600 dark:text-blue-400 font-semibold';
      }
    } else {
      if (!['profit-margin', 'markup', 'sales-tax', 'break-even', 'discount', 'roi'].includes(navVal)) {
        link.className = 'hover:text-blue-600 dark:hover:text-blue-400 transition-colors';
      } else {
        link.className = 'block px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400';
      }
    }
  });

  // Calculators dropdown button styling
  const dropdownBtn = document.getElementById('calc-dropdown-btn');
  if (dropdownBtn) {
    if (isCalc) {
      dropdownBtn.className = 'flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold py-2';
      const svg = dropdownBtn.querySelector('svg');
      if (svg) svg.setAttribute('class', 'w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:rotate-180');
    } else {
      dropdownBtn.className = 'flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2';
      const svg = dropdownBtn.querySelector('svg');
      if (svg) svg.setAttribute('class', 'w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:rotate-180');
    }
  }

  // Mobile nav links
  const mobileNavLinks = document.querySelectorAll('#mobile-menu [data-mobile-nav]');
  mobileNavLinks.forEach(link => {
    const navVal = link.getAttribute('data-mobile-nav');
    if (navVal === key) {
      if (isCalc) {
        link.className = 'block px-2 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 rounded-md';
      } else {
        link.className = 'block px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40';
      }
    } else {
      if (['profit-margin', 'markup', 'sales-tax', 'break-even', 'discount', 'roi'].includes(navVal)) {
        link.className = 'block px-2 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400';
      } else {
        link.className = 'block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700';
      }
    }
  });
}

export function updateThemeIcons() {
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const isDark = document.documentElement.classList.contains('dark');

  if (darkIcon && lightIcon) {
    if (isDark) {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
    } else {
      lightIcon.classList.add('hidden');
      darkIcon.classList.remove('hidden');
    }
  }
}

export function initLayout() {
  injectHeadTags();
  renderHeader();
  renderFooter();
  highlightActiveNav();
  updateThemeIcons();
}
