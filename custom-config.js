import { throttling, screenEmulationMetrics, userAgents } from './node_modules/lighthouse/core/config/constants.js';

export default {
  desktop: {
    extends: 'lighthouse:default',
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    maxWaitForFcp: 15 * 1000,
    maxWaitForLoad: 35 * 1000,
    formFactor: 'desktop',
    throttling: throttling.desktopDense4G,
    screenEmulation: screenEmulationMetrics.desktop,
    emulatedUserAgent: userAgents.desktop,
    skipAudits: [
      // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
      'uses-http2',
      // There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
      'bf-cache',
      'expect-ct'
    ],

  },
  mobile: {
    extends: 'lighthouse:default',
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    maxWaitForFcp: 15 * 1000,
    maxWaitForLoad: 35 * 1000,
    skipAudits: [
      // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
      'uses-http2',
      // There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
      'bf-cache',
      'expect-ct'
    ],
  }
};

