/* Babakasa Global Investment Ltd - shared behaviour. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var PREVIEW = !!window.__BGI_PREVIEW__;
  var body = d.body;

  function closest(el, sel) { while (el && el.nodeType === 1) { if (el.matches(sel)) return el; el = el.parentNode; } return null; }

  /* ---------- menu drawer ---------- */
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    var b = d.querySelector('.burger'); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    var dr = d.querySelector('.drawer'); if (dr) dr.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  /* ---------- FAQ widget ---------- */
  function setFaq(open) {
    var p = d.querySelector('.faq-panel'), f = d.querySelector('.faq-fab');
    if (!p) return;
    p.classList.toggle('open', open);
    f.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = d.createElement('div');
    t.textContent = msg;
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:110px;background:#071B47;color:#fff;padding:.8rem 1.1rem;border-radius:14px;z-index:400;max-width:88vw;font-size:.9rem;box-shadow:0 20px 40px -14px rgba(0,0,0,.6)';
    d.body.appendChild(t); setTimeout(function () { t.remove(); }, 5200);
  }

  /* ---------- click delegation ---------- */
  d.addEventListener('click', function (e) {
    var t = e.target;
    if (closest(t, '.burger')) { setMenu(true); return; }
    if (closest(t, '.drawer-close') || closest(t, '.drawer-back')) { setMenu(false); return; }
    if (closest(t, '.drawer a')) { setMenu(false); }
    if (closest(t, '.faq-fab')) { setFaq(!d.querySelector('.faq-panel').classList.contains('open')); return; }
    if (closest(t, '.faq-x')) { setFaq(false); return; }

    var f = closest(t, '[data-filter]');
    if (f) {
      var val = f.getAttribute('data-filter');
      d.querySelectorAll('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', b === f ? 'true' : 'false'); });
      d.querySelectorAll('.product').forEach(function (p) { p.hidden = !(val === 'all' || p.getAttribute('data-cat') === val); });
      return;
    }
    var tab = closest(t, '[data-tab]');
    if (tab) { showTab(tab.getAttribute('data-tab')); return; }

    var fig = closest(t, '.gallery figure');
    if (fig) {
      var dlg = d.querySelector('dialog.lightbox'); if (!dlg) return;
      var img = fig.querySelector('img');
      dlg.querySelector('img').src = img.currentSrc || img.src;
      dlg.querySelector('img').alt = img.alt;
      if (dlg.showModal) dlg.showModal(); return;
    }
    if (closest(t, 'dialog.lightbox button')) { d.querySelector('dialog.lightbox').close(); return; }

    if (closest(t, '[data-install]')) { e.preventDefault(); installApp(); return; }
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setFaq(false); } });

  /* ---------- tabs on contact page ---------- */
  function showTab(name) {
    d.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === name ? 'true' : 'false'); });
    d.querySelectorAll('[data-tabpanel]').forEach(function (p) { p.hidden = p.getAttribute('data-tabpanel') !== name; });
  }
  window.__bgiShowTab = showTab;


  /* ---------- hash actions: filters, quote tab, quote prefill ---------- */
  function applyAnchor(a) {
    if (!a) return;
    if (a === 'precious' || a === 'industrial' || a === 'all') {
      var b = d.querySelector('[data-filter="' + a + '"]'); if (b) b.click(); return;
    }
    if (a === 'general') { showTab('general'); return; }
    if (a.indexOf('quote') === 0) {
      showTab('quote');
      var parts = a.split(':'), com = parts[1], prod = parts[2];
      var sel = d.getElementById('commodity');
      if (sel && com) { sel.value = com; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      if (prod) {
        var name = decodeURIComponent(prod);
        var msg = d.getElementById('message');
        if (msg && !msg.value) msg.value = 'Product of interest: ' + name;
      }
      var f = d.querySelector('form[name="quote-request"]'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  window.__bgiApplyAnchor = applyAnchor;
  if (!PREVIEW) {
    var run = function () { applyAnchor(location.hash.replace('#', '')); };
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', run); else run();
    window.addEventListener('hashchange', run);
  }

  /* ---------- adaptive quote fields ---------- */
  d.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'commodity') {
      var v = e.target.value;
      d.querySelectorAll('fieldset.spec').forEach(function (fs) { fs.hidden = fs.getAttribute('data-for') !== v; });
    }
  });

  /* ---------- form submit (Netlify Forms via fetch) ---------- */
  d.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('form[data-netlify]')) return;
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    var done = function () {
      var ok = d.createElement('div');
      ok.className = 'ok'; ok.setAttribute('role', 'status');
      ok.innerHTML = '<h3>Request received</h3><p>Thank you. Our export desk will reply by email or WhatsApp within 24 to 48 hours.' + (PREVIEW ? ' <b>(Preview only: nothing was sent.)</b>' : '') + '</p>';
      form.replaceWith(ok); ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    var fail = function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Send request'; }
      toast('Could not send. Please try again or message us on WhatsApp.');
    };
    if (PREVIEW) { setTimeout(done, 400); return; }
    var data = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
      .then(function (r) { if (r.ok) done(); else fail(); }).catch(fail);
  });

  /* ---------- PWA install ---------- */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  function installApp() {
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; }); return; }
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) toast('On iPhone: tap the Share icon, then "Add to Home Screen".');
    else if (PREVIEW) toast('Installing works on the live site once it is on your domain.');
    else toast('Open your browser menu and choose "Install app" or "Add to Home screen".');
  }
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    d.querySelectorAll('[data-install]').forEach(function (n) { n.hidden = true; });
  }
  if (!PREVIEW && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
})();
