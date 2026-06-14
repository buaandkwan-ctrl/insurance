/**
 * BLA Insurance — DataLayer & Tracking Helpers
 * Sets window.blaDataLayer (populated per-page before this script loads)
 * and window.blaTrack with SalesforceInteractions wrappers.
 *
 * All SalesforceInteractions calls are wrapped in try/catch.
 * If the beacon is not loaded, events are logged to console for demo purposes.
 */

(function () {
  'use strict';

  // Ensure blaDataLayer exists (pages should pre-seed it before loading this script)
  window.blaDataLayer = window.blaDataLayer || {};

  // ─── Helper ───────────────────────────────────────────────────────────────
  function sendInteraction(interactionName, payload) {
    var eventPayload = {
      interaction: { name: interactionName },
      user: {
        attributes: {
          anonymousId: _getOrCreateAnonymousId()
        }
      },
      catalog: payload && payload.catalog ? payload.catalog : undefined,
      attributes: payload && payload.attributes ? payload.attributes : undefined
    };

    try {
      if (
        typeof window.SalesforceInteractions !== 'undefined' &&
        typeof window.SalesforceInteractions.sendEvent === 'function'
      ) {
        window.SalesforceInteractions.sendEvent(eventPayload);
        console.log('[blaTrack] SalesforceInteractions.sendEvent:', interactionName, eventPayload);
      } else {
        console.log('[blaTrack] (SalesforceInteractions not loaded) Event:', interactionName, eventPayload);
      }
    } catch (e) {
      console.warn('[blaTrack] sendEvent error:', e, '| Event:', interactionName, eventPayload);
    }
  }

  function _getOrCreateAnonymousId() {
    try {
      var key = '_bla_anon';
      var id = sessionStorage.getItem(key);
      if (!id) {
        id = 'anon-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now();
        sessionStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return 'anon-unknown';
    }
  }

  // ─── blaTrack public API ──────────────────────────────────────────────────
  window.blaTrack = {

    /**
     * Called when user clicks "คำนวณ" (Calculate Premium).
     * @param {Object} d - { code, gender, ageBand, plan, premium }
     */
    calculate: function (d) {
      var dl = window.blaDataLayer;
      dl.calc = {
        code:     d.code     || '',
        gender:   d.gender   || '',
        ageBand:  d.ageBand  || '',
        plan:     d.plan     || '',
        premium:  d.premium  || 0
      };

      sendInteraction('Calculate Premium', {
        attributes: {
          productCode: d.code,
          gender:      d.gender,
          ageBand:     d.ageBand,
          plan:        d.plan,
          premium:     d.premium
        }
      });
    },

    /**
     * Called when user clicks "ซื้อออนไลน์" (Buy Online).
     * Fires the event then performs the redirect passed in d.redirectUrl.
     * @param {Object} d - { code, plan, premium, redirectUrl }
     */
    buyClick: function (d) {
      sendInteraction('Click Buy Online', {
        attributes: {
          productCode:  d.code,
          plan:         d.plan,
          premium:      d.premium,
          premiumBand:  d.premiumBand || ''
        }
      });

      // Redirect after a short tick so the event can fire
      var url = d.redirectUrl;
      if (url) {
        setTimeout(function () {
          window.location.href = url;
        }, 150);
      }
    },

    /**
     * Called at each form step transition.
     * Updates blaDataLayer.form and calls SalesforceInteractions.reinit() so
     * the sitemap can re-evaluate pageType with the updated step data.
     * @param {number} n         - new step number (1-based)
     * @param {string} stepName  - e.g. "personal", "health-questions", …
     */
    formStep: function (n, stepName) {
      var dl = window.blaDataLayer;
      dl.form = dl.form || {};
      dl.form.step     = n;
      dl.form.stepName = stepName;

      sendInteraction('Form Step', {
        attributes: {
          step:     n,
          stepName: stepName,
          productCode: (dl.product && dl.product.code) ? dl.product.code : (dl.page && dl.page.code) || ''
        }
      });

      // Reinit so Salesforce Interactions re-evaluates the sitemap
      try {
        if (
          typeof window.SalesforceInteractions !== 'undefined' &&
          typeof window.SalesforceInteractions.reinit === 'function'
        ) {
          window.SalesforceInteractions.reinit();
          console.log('[blaTrack] SalesforceInteractions.reinit() called for step', n, stepName);
        } else {
          console.log('[blaTrack] (SalesforceInteractions not loaded) reinit() skipped for step', n, stepName);
        }
      } catch (e) {
        console.warn('[blaTrack] reinit error:', e);
      }
    },

    /**
     * Called on confirmation page load to record a purchase.
     * @param {Object} d - { code, value }
     */
    purchase: function (d) {
      if (window._blaPurchaseFired) { return; }
      window._blaPurchaseFired = true;

      var dl = window.blaDataLayer;
      dl.order = dl.order || {};
      dl.order.confirmed = true;
      dl.order.value     = d.value || 0;

      sendInteraction('Order Confirmed', {
        catalog: {
          Product: {
            id: d.code || ''
          }
        },
        attributes: {
          productCode:   d.code  || '',
          purchaseValue: d.value || 0,
          currency:      'THB'
        }
      });
    }
  };

  console.log('[blaDataLayer] Initialized:', window.blaDataLayer);
})();
