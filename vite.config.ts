import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { SHARED_HEAD_TAGS, SHARED_HEADER_HTML, SHARED_FOOTER_HTML } from './src/js/layout.js';

function sharedLayoutPlugin(): Plugin {
  return {
    name: 'shared-layout-plugin',
    transformIndexHtml(html) {
      let res = html;
      if (res.includes('<site-head>')) {
        res = res.replace(/<site-head\s*>\s*<\/site-head>|<site-head\s*\/>/gi, SHARED_HEAD_TAGS);
      }
      if (res.includes('<site-header>')) {
        res = res.replace(
          /<site-header\s*>\s*<\/site-header>|<site-header\s*\/>/gi,
          `<header id="site-header" class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-xs">${SHARED_HEADER_HTML}</header>`
        );
      }
      if (res.includes('<site-footer>')) {
        res = res.replace(
          /<site-footer\s*>\s*<\/site-footer>|<site-footer\s*\/>/gi,
          `<footer id="site-footer" class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">${SHARED_FOOTER_HTML}</footer>`
        );
      }
      return res;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sharedLayoutPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          profitMargin: path.resolve(__dirname, 'profit-margin-calculator.html'),
          markup: path.resolve(__dirname, 'markup-calculator.html'),
          salesTax: path.resolve(__dirname, 'sales-tax-calculator.html'),
          breakEven: path.resolve(__dirname, 'break-even-calculator.html'),
          discount: path.resolve(__dirname, 'discount-calculator.html'),
          roi: path.resolve(__dirname, 'roi-calculator.html'),
          blog: path.resolve(__dirname, 'blog.html'),
          marginVsMarkupPricingMistake: path.resolve(__dirname, 'margin-vs-markup-pricing-mistake.html'),
          howToCalculateBreakEvenPoint: path.resolve(__dirname, 'how-to-calculate-break-even-point.html'),
          ebayProfitMarginCalculator: path.resolve(__dirname, 'ebay-profit-margin-calculator.html'),
          markupVsMargin: path.resolve(__dirname, 'markup-vs-margin.html'),
          whatIsVat: path.resolve(__dirname, 'what-is-vat-simple-guide.html'),
          about: path.resolve(__dirname, 'about.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          privacyPolicy: path.resolve(__dirname, 'privacy-policy.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
