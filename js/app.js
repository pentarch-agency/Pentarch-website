class DCLogic{constructor(){this.props={}}}
class Component extends DCLogic {renderVals() {return { accent: this.props.accent ?? '#DCE3EF' };}
$q(s) { return (this._scope || document).querySelector(s); }
$qa(s) { return Array.from((this._scope || document).querySelectorAll(s)); }
paHdr() {const bar = this.$q('[data-hdr]');
const sp = this.$q('[data-hsp]');
if (!bar) { return; }
const nav = bar.querySelector('nav');
const sy = () => (window.scrollY || document.documentElement.scrollTop || 0);
const meas = () => { if (!sp || !nav) { return; } const st = bar.classList.contains('stuck'); sp.style.setProperty('--hh', Math.round(nav.getBoundingClientRect().height + (st ? 28 : 0)) + 'px'); };
const on = () => { bar.classList.toggle('stuck', sy() > 24); };
window.addEventListener('scroll', on, { passive: true });
window.addEventListener('resize', meas);
on(); meas(); setTimeout(meas, 600);
this._hdrOff = () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', meas); };}
paTheme() {const html = document.documentElement;
const btn = this.$q('[data-themebtn]');
if (!btn) { return; }
const label = btn.querySelector('[data-themelabel]');
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const apply = (t) => {if (t === 'light') { html.setAttribute('data-theme', 'light'); } else { html.removeAttribute('data-theme'); }
btn.setAttribute('aria-checked', t === 'light' ? 'true' : 'false');
btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
if (label) { label.textContent = t === 'light' ? 'Light' : 'Dark'; }
try { localStorage.setItem('pa-theme', t); } catch (e) {}};
let saved = null;
try { saved = localStorage.getItem('pa-theme'); } catch (e) {}
apply(saved === 'light' ? 'light' : 'dark');
if (this._paThemeOff) { this._paThemeOff(); }
const onClick = () => {const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
const r = btn.getBoundingClientRect();
const x = r.left + r.width / 2;
const y = r.top + r.height / 2;
const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
if (document.startViewTransition && !reduce) {const vt = document.startViewTransition(() => apply(next));
vt.ready.then(() => {html.animate(
{ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
{ duration: 1100, easing: 'cubic-bezier(.65,0,.25,1)', pseudoElement: '::view-transition-new(root)' }
);}).catch(() => {});} else {apply(next);}};
btn.addEventListener('click', onClick);
this._paThemeOff = () => btn.removeEventListener('click', onClick);}
paMenu() {const html = document.documentElement;
const sheet = this.$q('[data-mnav]');
const burger = this.$q('[data-burger]');
if (!sheet || !burger) { return; }
const closeBtn = sheet.querySelector('[data-mclose]');
if (this._paMenuOff) { this._paMenuOff(); }
const setOpen = (open) => {if (open) {try {const lg = this.$q('.mnav-logo');
const src = this.$q('a[aria-label="Pentarch home"] .shim');
if (lg && src) {const r = src.getBoundingClientRect();
if (r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0) { lg.style.left = r.left + 'px'; lg.style.top = (r.top - (46 - r.height) / 2) + 'px'; }
else { lg.style.left = ''; lg.style.top = ''; }}} catch (e) {}}
sheet.classList.toggle('open', open);
clearTimeout(this._paMenuT);
if (open) { document.documentElement.classList.add('pa-menu'); }
else { this._paMenuT = setTimeout(() => document.documentElement.classList.remove('pa-menu'), 640); }
sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
burger.setAttribute('aria-expanded', open ? 'true' : 'false');
if (open && closeBtn) { closeBtn.focus({ preventScroll: true }); }
if (!open) { burger.focus({ preventScroll: true }); }};
const bd = this.$q('[data-mbd]');
const onBd = () => setOpen(false);
if (bd) { bd.addEventListener('click', onBd); }
const onOpen = () => setOpen(true);
const onClose = () => setOpen(false);
const onKey = (e) => {if (!sheet.classList.contains('open')) { return; }
if (e.key === 'Escape') { setOpen(false); return; }
if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(e.key) !== -1) { e.preventDefault(); }};
const onResize = () => {};
const links = Array.from(sheet.querySelectorAll('[data-mlink]'));
const onLink = () => { clearTimeout(this._paMenuT); this._paMenuT = setTimeout(() => document.documentElement.classList.remove('pa-menu'), 640); sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); };
burger.addEventListener('click', onOpen);
if (closeBtn) { closeBtn.addEventListener('click', onClose); }
links.forEach((a) => a.addEventListener('click', onLink));
document.addEventListener('keydown', onKey);
window.addEventListener('resize', onResize);
const lensOff = [];
{links.forEach((a) => {const t = a.querySelector('.t');
if (!t || t.querySelector('.lt')) { return; }
const txt = t.textContent;
t.setAttribute('aria-label', txt);
t.textContent = '';
Array.from(txt).forEach((ch, i) => {const lt = document.createElement('span'); lt.className = 'lt'; lt.setAttribute('aria-hidden', 'true'); lt.style.setProperty('--d', (i * 0.032).toFixed(3) + 's');
const w = document.createElement('span'); w.className = 'lw';
const x = document.createElement('span'); x.className = 'la'; x.textContent = ch;
const y = document.createElement('span'); y.className = 'lb'; y.textContent = ch;
w.appendChild(x); w.appendChild(y); lt.appendChild(w); t.appendChild(lt);});});}
this._paMenuOff = () => {lensOff.forEach((f) => f());
burger.removeEventListener('click', onOpen);
if (closeBtn) { closeBtn.removeEventListener('click', onClose); }
links.forEach((a) => a.removeEventListener('click', onLink));
document.removeEventListener('keydown', onKey);
window.removeEventListener('resize', onResize);
if (bd) { bd.removeEventListener('click', onBd); }};}
paRescue() {const root = this.$q('[data-pa-root]');
const ld = root && root.querySelector('[data-ld="root"]');
if (ld) { ld.style.display = 'none'; }
try { document.documentElement.style.overflow = ''; document.documentElement.style.paddingRight = ''; } catch (e) {}
try { if (window.gsap && root) { window.gsap.set(root.querySelectorAll('[data-up],[data-in],[data-lines] .mk>span,[data-stagger]>*,[data-card],[data-tblock]>*,[data-wm],.w,.drow,.plate'), { clearProps: 'all' }); } } catch (e) {}}
paInit() {const root = this.$q('[data-pa-root]');
if (!root) { return; }
const gsap = window.gsap;
const ST = window.ScrollTrigger;
gsap.registerPlugin(ST);
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ldEl = root.querySelector('[data-ld="root"]');
if (reduce) { if (ldEl) { ldEl.style.display = 'none'; } return; }
(this._paOff || []).forEach((fn) => { try { fn(); } catch (e) {} });
if (this._paCtx) { try { this._paCtx.revert(); } catch (e) {} }
this._paOff = [];
const off = this._paOff;
const q = (s, c) => (c || root).querySelector(s);
const qa = (s, c) => Array.from((c || root).querySelectorAll(s));
const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[pentarch] ' + name, e); } };
const accent = () => (getComputedStyle(root).getPropertyValue('--accent') || '#DCE3EF').trim();
const prep = (els) => {requestAnimationFrame(() => {els.forEach((el) => {let L = 0;
try { L = el.getTotalLength(); } catch (e) { L = 0; }
el.__L = L || 1;
gsap.set(el, { strokeDasharray: el.__L, strokeDashoffset: el.__L });});});};
const pad = (n, w) => String(n).padStart(w, '0');
try { const de = document.documentElement; const pr = document.createElement('div'); pr.style.cssText = 'position:absolute;top:-99px;width:60px;height:60px;overflow:scroll;visibility:hidden'; document.body.appendChild(pr); const sbw = pr.offsetWidth - pr.clientWidth; pr.remove(); if (sbw > 0) de.style.paddingRight = sbw + 'px'; de.style.overflow = 'hidden'; } catch (e) {}
this._paCtx = gsap.context(() => {const navIn = qa('[data-in="nav"]');
const lines = qa('[data-in="line"]');
const fades = qa('[data-in="fade"]');
const hd = qa('.hd');
const hdFill = qa('.hd[data-fill]');
const hl = qa('.hl');
const hdots = qa('.hdot');
const hg = qa('.hg');
const spark = qa('.hspark');
const slabs = qa('.slab');
gsap.set(navIn, { y: -24, opacity: 0 });
gsap.set(lines, { yPercent: 118 });
gsap.set(fades, { y: 28, opacity: 0 });
prep(hd);
gsap.set(hdFill, { fillOpacity: 0 });
gsap.set(slabs, { y: (i, el) => (parseInt(el.getAttribute('data-i'), 10) - 1) * 76 });
gsap.set(hl, { opacity: 0, x: -14 });
gsap.set(hg, { opacity: 0 });
gsap.set(hdots, { scale: 0, transformOrigin: '50% 50%' });
gsap.set(spark, { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
const ldWords = qa('.ldw');
gsap.set(ldWords, { opacity: 0 });
let ldIdx = -1;
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const GL = '!<>-_/[]{}=+*^?#%&01';
const rnd = (a, b) => a + Math.random() * (b - a);
const calm = (el) => { el.style.transform = ''; el.style.clipPath = ''; el.style.textShadow = ''; el.style.filter = ''; };
const stopG = (el) => { if (el._gt) { clearInterval(el._gt); el._gt = null; } };
ldWords.forEach((el) => { el.setAttribute('data-orig', el.textContent); });
const glitchIn = (el) => {stopG(el);
const orig = el.getAttribute('data-orig');
const n = orig.length; let f = 0; const F = 10;
el.style.opacity = '1';
el._gt = setInterval(() => {f++;
const p = f / F;
const keep = 0;
el.textContent = Array.from(orig).map((c, i) => (c === ' ' || c === '&' || (p > 0.3 && Math.random() < (p - 0.3) * 1.6)) ? c : GL[Math.floor(Math.random() * GL.length)]).join('');
if (f >= F) { stopG(el); el.textContent = orig; calm(el); return; }
const amp = (1 - p) * (1 - p) * 40 + 2;
const dx = rnd(-amp, amp);
el.style.transform = 'translateX(' + dx.toFixed(1) + 'px) skewX(' + (Math.random() < 0.5 ? rnd(-16, 16) * (1 - p) * (1 - p) : 0).toFixed(1) + 'deg)';
el.style.textShadow = (-dx).toFixed(1) + 'px 0 rgba(255,50,110,.95),' + (dx).toFixed(1) + 'px 0 rgba(50,230,255,.95)'; el.style.filter = Math.random() < 0.35 ? 'hue-rotate(' + Math.floor(rnd(-70, 70)) + 'deg) contrast(1.4)' : '';
if (p < 0.7 && Math.random() < 0.65 - p * 0.6) { const t = rnd(0, 60), b = rnd(0, 60); el.style.clipPath = 'inset(' + t.toFixed(0) + '% 0 ' + b.toFixed(0) + '% 0)'; } else { el.style.clipPath = ''; }}, 28);};
const glitchOut = (el) => {stopG(el);
const orig = el.getAttribute('data-orig');
let f = 0; const F = 3;
el._gt = setInterval(() => {f++;
if (f >= F) { stopG(el); el.style.opacity = '0'; el.textContent = orig; calm(el); return; }
const dx = rnd(-30, 30);
el.textContent = Array.from(orig).map((c) => (c === ' ' || c === '&' || Math.random() < 0.55) ? c : GL[Math.floor(Math.random() * GL.length)]).join('');
el.style.transform = 'translateX(' + dx.toFixed(1) + 'px) skewX(' + rnd(-18, 18).toFixed(1) + 'deg)';
el.style.textShadow = (-dx).toFixed(1) + 'px 0 rgba(255,50,110,1),' + (dx).toFixed(1) + 'px 0 rgba(50,230,255,1)';
const t = rnd(0, 50); el.style.clipPath = 'inset(' + t.toFixed(0) + '% 0 ' + rnd(0, 50).toFixed(0) + '% 0)';
el.style.opacity = String(1 - f / F);}, 36);};
const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
this._intro = intro;
intro.to(navIn, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0)
.to(lines, { yPercent: 0, duration: 1.4, ease: 'power4.out', stagger: 0.15 }, 0.1)
.to(fades, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.6);
[1, 2, 3, 4, 5].forEach((g, i) => {const els = qa('.hd[data-g="' + g + '"]');
const t = 0.35 + i * 0.3;
intro.to(els, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.05 }, t);
intro.to(qa('.hd[data-g="' + g + '"][data-fill]'), { fillOpacity: 1, duration: 0.4, ease: 'none' }, t + 0.55);});
intro.to(slabs, { y: 0, duration: 1.3, ease: 'power4.inOut', stagger: { each: 0.09, from: 'start' } }, 1.8);
intro.set(hg, { visibility: 'visible' }, 3.6).to(hg, { opacity: 1, duration: 0.7, stagger: 0.05 }, 3.6)
.set(spark, { visibility: 'visible' }, 3.7).to(spark, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' }, 3.7)
.set(qa('.hd[data-g="6"]'), { visibility: 'visible' }, 3.7).to(qa('.hd[data-g="6"]'), { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', stagger: 0.06 }, 3.7)
.set(hdots, { visibility: 'visible' }, 4.1).to(hdots, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.08 }, 4.1)
.set(hl, { visibility: 'visible' }, 4.2).to(hl, { opacity: 1, x: 0, duration: 0.5, stagger: 0.06 }, 4.2);
intro.add(() => {safe('idle', () => {gsap.to(q('[data-hero-art] svg'), { y: -9, yoyo: true, repeat: -1, duration: 3.4, ease: 'sine.inOut', force3D: true });
const cue = q('[data-cue]');
if (cue) {gsap.fromTo(cue, { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 1.1, ease: 'power2.inOut', repeat: -1, repeatDelay: 0.3, yoyo: true });}});}, '>');
safe('plateObs', () => {
const obs = new IntersectionObserver((entries) => {
entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
}, { rootMargin: '100px' });
qa('.plate').forEach(p => obs.observe(p));
off.push(() => obs.disconnect());
});
safe('cpmarks', () => {const ticks = qa('.hud .tick');
const segs = qa('.hud .cp-seg');
const fill = q('.hud .fill');
if (!ticks.length) return;
let prev = -1;
const stops = [0, 0.167, 0.333, 0.5, 0.667, 0.833];
const activate = (n) => {if (n === prev) return;
prev = n;
ticks.forEach((t, i) => {t.classList.remove('current', 'passed', 'burst');
if (i < n) {t.classList.add('passed');} else if (i === n) {t.classList.add('current');
void t.offsetWidth;
t.classList.add('burst');
setTimeout(() => t.classList.remove('burst'), 800);}});
segs.forEach((s, i) => {if (i < n) { s.classList.add('on'); } else { s.classList.remove('on'); }});
if (fill) {gsap.to(fill, { scaleY: stops[n] || 0, duration: 0.6, ease: 'power2.out', overwrite: true });}};
activate(0);
const sections = qa('[data-sheet]');
sections.forEach((sec, i) => {ST.create({trigger: sec,
start: 'top 50%',
end: 'bottom 50%',
onEnter: () => activate(i),
onEnterBack: () => activate(i)});});});
const counter = q('[data-ld="count"]');
const status = q('[data-ld="status"]');
const bar = q('[data-ld="bar"]');
const prog = { v: 0 };
const stages = ['01 — Research', '02 — Design', '03 — Develop', '04 — Test', '05 — Launch', 'Ready'];
const unlock = () => { try { document.documentElement.style.overflow = ''; document.documentElement.style.paddingRight = ''; } catch (e) {} try { document.querySelectorAll('[data-tc]').forEach(el => { const p = el.closest('[style*="z-index:20"]'); if (p && !p.closest('[data-ld]')) p.remove(); }); } catch(e) {} setTimeout(() => { window.__paBusy = false; }, 250); setTimeout(() => { try { ST.refresh(); } catch (e) {} }, 2400); };
const _tcClean = () => { try { document.querySelectorAll('[data-titlecard]').forEach(el => el.remove()); document.querySelectorAll('body > div[style*="z-index:20"]').forEach(el => { if (!el.hasAttribute('data-ld') && !el.id) el.remove(); }); } catch(e) {} };
const _tcTimer = setInterval(() => { if (!window.__paBusy) { _tcClean(); clearInterval(_tcTimer); } }, 1000);
setTimeout(() => { clearInterval(_tcTimer); _tcClean(); }, 10000);
document.addEventListener('visibilitychange', function _tcVis() { if (document.visibilityState === 'visible' && !window.__paBusy) { _tcClean(); document.removeEventListener('visibilitychange', _tcVis); } });
window.__paSkipLd = (location.pathname !== '/' && !location.pathname.endsWith('/index.html') && location.pathname !== '/index.html');
if (ldEl && !window.__paSkipLd) {window.__paBusy = true; setTimeout(() => { window.__paBusy = false; }, 12000);
const loadTl = gsap.timeline({ paused: true });
this._loadTl = loadTl;
loadTl.to(prog, {v: 100, duration: 3.5, ease: 'none',
onUpdate: () => {const v = prog.v;
if (counter) { counter.textContent = pad(Math.round(v), 3); }
if (bar) { gsap.set(bar, { scaleX: v / 100 }); }
const idx = Math.min(ldWords.length - 1, Math.floor(v / (100 / ldWords.length)));
if (idx !== ldIdx) {if (ldIdx >= 0) { glitchOut(ldWords[ldIdx]); }
const nx = ldWords[idx];
if (reduceMotion) { nx.style.opacity = '1'; } else { setTimeout(() => glitchIn(nx), ldIdx >= 0 ? 80 : 0); }
ldIdx = idx;}
if (status) { status.textContent = stages[idx]; }}}, 0.15);
loadTl.add(() => { if (ldWords[ldIdx]) { if (reduceMotion) { ldWords[ldIdx].style.opacity = '0'; } else { glitchOut(ldWords[ldIdx]); } } }, '+=0.45');
loadTl.to(qa('.ld-fade'), { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in', stagger: 0.06 }, '<');
const card = document.createElement('div');
card.setAttribute('aria-hidden', 'true');
card.style.cssText = 'position:fixed;inset:0;z-index:201;pointer-events:none;display:grid;grid-template-rows:1fr auto 1fr;justify-items:center;opacity:0;background:#0C101B';card.setAttribute('data-titlecard','1');
card.innerHTML = '<div data-tc="t" style="font-family:\'Space Grotesk\',system-ui,sans-serif;font-weight:500;text-transform:uppercase;font-size:clamp(36px,9.4vw,76px);color:#DCE3EF;letter-spacing:.9em;padding-left:.9em;white-space:nowrap;line-height:1;align-self:end;margin-bottom:clamp(16px,2.6vw,30px)">Pentarch</div><div data-tc="l" style="height:1px;width:min(260px,46vw);background:linear-gradient(90deg,transparent,#8FB4FF,transparent)"></div><div data-tc="s" style="align-self:start;margin-top:clamp(16px,2.6vw,30px);font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:clamp(11px,2.9vw,13px);letter-spacing:.34em;padding-left:.34em;text-transform:uppercase;color:#98A9C4;opacity:0">Action is our Dharma</div>';
document.body.appendChild(card);
const tcT = card.querySelector('[data-tc="t"]'); const tcL = card.querySelector('[data-tc="l"]'); const tcS = card.querySelector('[data-tc="s"]');
loadTl.addLabel('lift', '<+=0.15');
loadTl.set(card, { opacity: 1 }, 'lift');
const tcN = window.innerWidth < 600; const tcA = tcN ? '0.5em' : '0.9em'; const tcB = tcN ? '0.2em' : '0.26em';
tcT.style.letterSpacing = tcA; tcT.style.paddingLeft = tcA;
loadTl.fromTo(tcT, { opacity: 0, letterSpacing: tcA, paddingLeft: tcA, filter: 'blur(10px)' }, { opacity: 1, letterSpacing: tcB, paddingLeft: tcB, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }, 'lift');
loadTl.fromTo(tcL, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 'lift');
loadTl.to(tcS, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 'lift+=0.65');
const bgc = (() => { try { return getComputedStyle(ldEl).backgroundColor || '#0C101B'; } catch (e) { return '#0C101B'; } })();
const bgc2 = (bgc === 'rgba(0, 0, 0, 0)' || !bgc) ? '#0C101B' : bgc;
const VH = Math.round(ldEl.getBoundingClientRect().height || window.innerHeight); const HH = Math.round(VH / 2);
const mkHalf = (top) => {const h = document.createElement('div');h.setAttribute('data-titlecard','1');
h.setAttribute('aria-hidden', 'true');
h.style.cssText = 'position:fixed;left:0;right:0;height:' + HH + 'px;overflow:hidden;will-change:transform;z-index:203;pointer-events:none;visibility:hidden;background:' + bgc2 + ';' + (top ? 'top:0' : 'bottom:0');
const inner = document.createElement('div');
inner.style.cssText = 'position:absolute;left:0;right:0;height:' + (HH * 2) + 'px;' + (top ? 'top:0' : 'top:-' + HH + 'px');
h.appendChild(inner); document.body.appendChild(h); return h;};
const hT = mkHalf(true); const hB = mkHalf(false);
const seam = document.createElement('div');
seam.setAttribute('aria-hidden', 'true');seam.setAttribute('data-titlecard','1');
seam.style.cssText = 'position:fixed;left:0;right:0;top:' + HH + 'px;height:2px;margin-top:-1px;z-index:204;pointer-events:none;visibility:hidden;background:linear-gradient(90deg,transparent,#8FB4FF 20%,#fff 50%,#8FB4FF 80%,transparent);box-shadow:0 0 24px 5px rgba(143,180,255,.7)';
document.body.appendChild(seam);
gsap.set(seam, { scaleX: Math.min(260, window.innerWidth * 0.46) / Math.max(1, window.innerWidth) });
loadTl.add(() => {[hT, hB].forEach((h) => {const c = card.cloneNode(true); const cl = c.querySelector('[data-tc="l"]'); if (cl) { cl.style.visibility = 'hidden'; } const ct = c.querySelector('[data-tc="t"]'); if (ct) { ct.style.filter = 'none'; } c.style.opacity = '1'; c.style.inset = '0'; c.style.position = 'absolute';
h.firstChild.appendChild(c); h.style.visibility = 'visible';});
seam.style.visibility = 'visible';
ldEl.style.display = 'none'; card.style.display = 'none';}, 'lift+=1.6');
loadTl.addLabel('split', 'lift+=1.65');
loadTl.add(() => {const fl = document.createElement('div');
fl.style.cssText = 'position:fixed;inset:0;z-index:205;background:rgba(143,180,255,.18);pointer-events:none';
document.body.appendChild(fl);
gsap.to(fl, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => fl.remove() });}, 'split+=0.08');
loadTl.to(seam, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, 'split');
loadTl.fromTo(q('#top'), { scale: 1.1, transformOrigin: '50% 50%' }, { scale: 1, duration: 1.4, ease: 'power3.out', clearProps: 'transform' }, 'split');
loadTl.to(hT, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 'split+=0.15');
loadTl.to(hB, { yPercent: 100, duration: 0.8, ease: 'power4.inOut' }, 'split+=0.15');
loadTl.to(seam, { opacity: 0, duration: 0.4, ease: 'power1.out' }, 'split+=0.5');
loadTl.add(intro.play.bind(intro), 'split+=0.3');
loadTl.add(() => { [hT, hB, seam, card].forEach((d) => { try { d && d.remove(); } catch (e) {} }); unlock(); }, 'split+=1.0');loadTl.add(() => { document.querySelectorAll('[data-titlecard]').forEach(el => el.remove()); }, 'split+=1.1');
const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1000))]).then(() => loadTl.play());} else {if (ldEl) { ldEl.style.display = 'none'; }
window.__paSkipLd = false;
intro.play();
unlock();}
safe('glow', () => {const g = q('[data-glow]');
gsap.to(g, { x: 80, y: 60, scale: 1.14, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
gsap.to(g, { yPercent: -28, ease: 'none', scrollTrigger: { trigger: q('#top'), start: 'top top', end: 'bottom top', scrub: true } });});
safe('grid', () => {});
safe('hud', () => {const fill = q('[data-hudfill]');
const lab = q('[data-hudlab]');
qa('[data-sheet]').forEach((sec) => {ST.create({trigger: sec, start: 'top 55%', end: 'bottom 55%',
onToggle: (self) => { if (self.isActive && lab) { lab.textContent = 'SHEET ' + sec.getAttribute('data-sheet') + ' / 06'; } }});});});
setTimeout(() => {
safe('magnetic', () => {qa('[data-mag]').forEach((btn) => {const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power2' });
const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power2' });
let active = false;
const en = () => { active = true; };
const mv = (e) => { if (!active) return;
const r = btn.getBoundingClientRect();
xTo((e.clientX - (r.left + r.width / 2)) * 0.12);
yTo((e.clientY - (r.top + r.height / 2)) * 0.12);};
const lv = () => { active = false; xTo(0); yTo(0); };
btn.addEventListener('pointerenter', en);
btn.addEventListener('pointermove', mv);
btn.addEventListener('pointerleave', lv);
off.push(() => { btn.removeEventListener('pointerenter', en); btn.removeEventListener('pointermove', mv); btn.removeEventListener('pointerleave', lv); });});});
safe('navcta', () => {qa('.navcta').forEach((el) => {const setOrigin = (e) => {const r = el.getBoundingClientRect();
el.style.setProperty('--x', (e.clientX - r.left) + 'px');
el.style.setProperty('--y', (e.clientY - r.top) + 'px');};
el.addEventListener('pointerenter', setOrigin);
el.addEventListener('pointerleave', setOrigin);
off.push(() => { el.removeEventListener('pointerenter', setOrigin); el.removeEventListener('pointerleave', setOrigin); });});});
}, 200);
safe('stackhover', () => {const names = qa('.hl');
const leaders = qa('.hd[data-g="6"]');
const dots = qa('.hdot');
const setStack = (n) => {if (intro.progress() < 1) { return; }
const a = accent();
slabs.forEach((s) => {const k = parseInt(s.getAttribute('data-i'), 10);
const on = k === n;
gsap.to(s, { y: on ? -18 : 0, opacity: (n === 0 || on) ? 1 : 0.4, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
const top = qa('.hd[data-g="' + k + '"][data-fill]', s)[2];
if (top) { gsap.to(top, { fill: on ? '#536684' : '#303D59', duration: 0.4, overwrite: 'auto' }); }});
for (let k = 1; k <= 5; k++) {const on = k === n;
const nm = names[(5 - k) * 2];
const sb = names[(5 - k) * 2 + 1];
gsap.to([nm, sb], { x: on ? 12 : 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
gsap.to(nm, { fill: on ? a : '#DCE3EF', duration: 0.3, overwrite: 'auto' });
gsap.to(leaders[5 - k], { strokeWidth: on ? 3 : 1.6, duration: 0.3, overwrite: 'auto' });
gsap.to(dots[5 - k], { attr: { r: on ? 8 : 4.5 }, duration: 0.35, ease: 'back.out(3)', overwrite: 'auto' });}};
const bind = (el, n) => {const en = () => setStack(n);
const lv = () => setStack(0);
el.addEventListener('pointerenter', en);
el.addEventListener('pointerleave', lv);
off.push(() => { el.removeEventListener('pointerenter', en); el.removeEventListener('pointerleave', lv); });};
qa('.hhit').forEach((r) => bind(r, parseInt(r.getAttribute('data-n'), 10)));
slabs.forEach((s) => bind(s, parseInt(s.getAttribute('data-i'), 10)));});
safe('heroart', () => {const art = q('[data-hero-art]');
const hero = q('#top');
gsap.set(art, { force3D: true });
const ax = gsap.quickTo(art, 'x', { duration: 0.7, ease: 'power3.out' });
const ay = gsap.quickTo(art, 'y', { duration: 0.7, ease: 'power3.out' });
let hr = hero.getBoundingClientRect(); let hrDirty = false;
const rz = () => { hrDirty = true; };
window.addEventListener('resize', rz); window.addEventListener('scroll', rz, { passive: true });
off.push(() => { window.removeEventListener('resize', rz); window.removeEventListener('scroll', rz); });
const mv = (e) => {if (hrDirty) { hr = hero.getBoundingClientRect(); hrDirty = false; }
ax(((e.clientX - hr.left) / hr.width - 0.5) * -26);
ay(((e.clientY - hr.top) / hr.height - 0.5) * -18);};
hero.addEventListener('pointermove', mv, { passive: true });
off.push(() => hero.removeEventListener('pointermove', mv));});
safe('marquee', () => {const rows = qa('[data-mq]');
const tweens = rows.map((row) => {const dir = parseInt(row.getAttribute('data-mq'), 10);
return gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, ease: 'none', duration: 34, repeat: -1 });});
const hv = { v: 1 };
const tick = () => { tweens.forEach((t, i) => t.timeScale(i === 0 ? hv.v : 1)); };
gsap.ticker.add(tick);
off.push(() => gsap.ticker.remove(tick));
const sec = q('[data-marquee]');
const slow = () => gsap.to(hv, { v: 0.1, duration: 0.9, ease: 'power3.out', overwrite: true });
const fast = () => gsap.to(hv, { v: 1, duration: 1.4, ease: 'power2.inOut', overwrite: true });
const hoverEl = q('[data-mqwrap]');
hoverEl.addEventListener('pointerenter', slow);
hoverEl.addEventListener('pointerleave', fast);
off.push(() => { hoverEl.removeEventListener('pointerenter', slow); hoverEl.removeEventListener('pointerleave', fast); });
gsap.from(qa('[data-mqwrap]'), { opacity: 0, y: 60, duration: 1, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: sec, start: 'top 90%' } });});
setTimeout(() => {
safe('drowReveal', () => {
const rows = qa('.drow');
rows.forEach((row, i) => {
ST.create({
trigger: row,
start: 'top 90%',
onEnter: () => {
gsap.delayedCall(i * 0.12, () => row.classList.add('revealed'));
},
once: true
});
});
});
safe('manifesto', () => {const sec = q('[data-manifesto]');
gsap.fromTo(qa('.w'), { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: sec, start: 'top 68%', end: 'center 45%', scrub: true } });
qa('[data-readlight]').forEach((el) => {gsap.fromTo(el, { backgroundPositionY: '100%' }, { backgroundPositionY: '0%', ease: 'none', scrollTrigger: { trigger: el, start: 'top 88%', end: 'bottom 42%', scrub: 0.6 } });});
qa('[data-count]').forEach((el) => {const target = parseInt(el.getAttribute('data-count'), 10);
const o = { v: 0 };
gsap.to(o, { v: target, duration: 1.4, ease: 'power2.out', snap: { v: 1 }, onUpdate: () => { el.textContent = pad(Math.round(o.v), 2); }, scrollTrigger: { trigger: el, start: 'top 92%' } });});});
safe('reveals', () => {qa('[data-lines]').forEach((el) => {gsap.from(qa('.mk > span', el), { yPercent: 118, duration: 1.2, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 88%' } });});
qa('[data-up]').forEach((el) => {gsap.from(el, { y: 46, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });});
qa('[data-stagger]').forEach((p) => {gsap.from(Array.from(p.children), { y: 44, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: p, start: 'top 85%' } });});});
safe('disciplines', () => {const mp = qa('.mp');
prep(mp);
const box = q('[data-minibuild]');
gsap.to(mp, { strokeDashoffset: 0, ease: 'none', stagger: 0.03, scrollTrigger: { trigger: box, start: 'top 85%', end: 'top 30%', scrub: true } });
const names = ['', 'Strategy', 'Brand', 'Web & Product', 'Content', 'Growth'];
const cap = q('[data-partname]');
const loadEl = q('[data-load]');
const rowsWrap = q('[data-rows]');
const GL = '01#%&/<>+=*';
const scramble = (el, txt) => {if (!el) { return; }
if (el.__sc) { el.__sc.kill(); }
const o = { p: 0 };
el.__sc = gsap.to(o, { p: 1, duration: 0.7, ease: 'none', onUpdate: () => {const k = Math.floor(o.p * txt.length);
let s = txt.slice(0, k);
for (let i = k; i < txt.length; i++) { s += txt[i] === ' ' ? ' ' : GL[Math.floor(Math.random() * GL.length)]; }
el.textContent = s;}, onComplete: () => { el.textContent = txt; } });};
let cur = 0;
const setPart = (n) => {if (cur === n) { return; }
cur = n;
gsap.to(mp, { stroke: '#536684', strokeWidth: 1.5, duration: 0.4, overwrite: 'auto' });
gsap.to(qa('.mp[data-face="top"]'), { fill: '#303D59', duration: 0.4, overwrite: 'auto' });
for (let k = 1; k < n; k++) { gsap.to(qa('.mp[data-part="' + k + '"][data-face="top"]'), { fill: '#3B4C72', duration: 0.4, overwrite: 'auto' }); }
gsap.to(qa('.mp[data-part="' + n + '"]'), { stroke: accent(), strokeWidth: 2.2, duration: 0.4, overwrite: 'auto' });
gsap.to(qa('.mp[data-part="' + n + '"][data-face="top"]'), { fill: '#536684', duration: 0.4, overwrite: 'auto' });
for (let k = 1; k <= 5; k++) {gsap.to(qa('.mslab[data-part="' + k + '"]'), { y: k > n ? -46 : (k === n ? -16 : 0), opacity: k > n ? 0.5 : 1, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });}
const up = 5 - n;
const dn = n - 1;
scramble(cap, 'Layer ' + pad(n, 2) + ' — ' + names[n]);
scramble(loadEl, 'Carries ' + up + (up === 1 ? ' layer' : ' layers') + ' · ' + (dn ? 'Rests on ' + dn + (dn === 1 ? ' layer' : ' layers') : 'Rests on ground'));
qa('.drow').forEach((r) => { r.classList.toggle('on', parseInt(r.getAttribute('data-part'), 10) === n); });
if (rowsWrap) { rowsWrap.classList.add('has-on'); }};
const tiltSvg = q('svg', box);
if (tiltSvg && window.matchMedia('(hover:hover)').matches) {gsap.set(tiltSvg, { transformPerspective: 900 });
const rx = gsap.quickTo(tiltSvg, 'rotationX', { duration: 0.9, ease: 'power3' });
const ry = gsap.quickTo(tiltSvg, 'rotationY', { duration: 0.9, ease: 'power3' });
const mvT = (e) => { const r = box.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 18); rx(-((e.clientY - r.top) / r.height - 0.5) * 14); };
const lvT = () => { rx(0); ry(0); };
box.addEventListener('pointermove', mvT);
box.addEventListener('pointerleave', lvT);
off.push(() => { box.removeEventListener('pointermove', mvT); box.removeEventListener('pointerleave', lvT); });}
const rowsEl = qa('.drow');
const calcRow = () => {const mid = window.innerHeight * 0.5;
let pick = 1;
rowsEl.forEach((r, k) => {const b = r.getBoundingClientRect();
if (b.top <= mid) { pick = k + 1; }});
setPart(pick);};
rowsEl.forEach((row) => {const n = parseInt(row.getAttribute('data-part'), 10);
const on = () => setPart(n);
row.addEventListener('focus', on);
off.push(() => { row.removeEventListener('focus', on); });});
if (rowsWrap) { ST.create({ trigger: rowsWrap, start: 'top bottom', end: 'bottom top', onUpdate: calcRow, onRefresh: calcRow }); }
calcRow();});
safe('work', () => {const sec = q('[data-work]');
const track = q('[data-track]');
const cnt = q('[data-wcount]');
const wd = qa('.wd');
prep(wd);
const plates = qa('[data-plate]');
plates.forEach((p) => {const els = qa('.wd', p);
const replay = () => gsap.fromTo(els, { strokeDashoffset: (i, el) => el.__L }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.03, overwrite: true });
p.addEventListener('pointerenter', replay);
const mv = (e) => { const r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px'); };
p.addEventListener('pointermove', mv);
off.push(() => p.removeEventListener('pointermove', mv));
off.push(() => p.removeEventListener('pointerenter', replay));});
const mm = gsap.matchMedia();
off.push(() => mm.revert());
mm.add('(min-width: 900px)', () => {const dist = () => Math.max(0, track.scrollWidth - sec.clientWidth);
const rfill = q('[data-rfill]');
const rl = qa('[data-rl]');
const wbg = q('[data-wbg]');
const tween = gsap.to(track, {x: () => -dist(), ease: 'none', force3D: true,
scrollTrigger: {trigger: sec, pin: true, anticipatePin: 1, fastScrollEnd: true, scrub: 0.6, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true,
onUpdate: (self) => {const k = Math.min(2, Math.floor(self.progress * 3));
if (cnt) { cnt.textContent = '0' + (k + 1) + ' / 03'; }
if (rfill) { rfill.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; }
rl.forEach((n, i) => n.classList.toggle('on', i === k));}}});
if (wbg) { gsap.to(wbg, { x: () => -dist() * 0.45, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true } }); }
plates.forEach((p) => {gsap.to(qa('.wd', p), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.03, scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 85%', toggleActions: 'play none none none' } });
gsap.fromTo(p, { rotateY: 28, scale: 0.86, opacity: 0.35, transformPerspective: 1400, transformOrigin: '50% 50%' }, { rotateY: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 98%', end: 'right 97%', scrub: true } });
if (p !== plates[plates.length - 1]) gsap.fromTo(p, { rotateY: 0, scale: 1, opacity: 1 }, { rotateY: -22, scale: 0.9, opacity: 0.4, ease: 'none', immediateRender: false, scrollTrigger: { trigger: p, containerAnimation: tween, start: 'right 28%', end: 'right 0%', scrub: true } });
const gn = q('.gn', p);
if (gn) { gsap.fromTo(gn, { x: 90 }, { x: -90, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 100%', end: 'right 0%', scrub: true } }); }});});
mm.add('(max-width: 899.98px)', () => {plates.forEach((p) => {gsap.to(qa('.wd', p), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.03, scrollTrigger: { trigger: p, start: 'top 85%' } });});});});
safe('process', () => {const wrap = q('[data-core]');
if (!wrap) { return; }
const segs = qa('.st');
const cards = qa('.sc');
const marker = q('[data-cmark]');
const cap = q('[data-corecap]');
const dep = q('[data-coredepth]');
const names = ['Listen', 'Map', 'Build', 'Launch', 'Grow'];
let cur = -1;
if (marker) { gsap.set(marker, { y: 98 }); }
const set = (a) => {if (a === cur) { return; }
cur = a;
segs.forEach((sg) => {const i = parseInt(sg.getAttribute('data-s'), 10);
sg.classList.toggle('act', i === a);
gsap.to(sg, { opacity: i <= a ? 1 : 0.28, duration: 0.6, overwrite: 'auto' });});
cards.forEach((c, i) => { c.classList.toggle('act', i === a); });
if (cap) { cap.textContent = 'Stratum ' + pad(a + 1, 2) + ' / 05 \u2014 ' + names[a]; }
if (dep) { dep.textContent = 'Depth ' + (a * 1.2).toFixed(1) + ' \u2013 ' + ((a + 1) * 1.2).toFixed(1) + ' m'; }};
set(0);
const mq = marker ? gsap.quickTo(marker, 'y', { duration: 0.35, ease: 'power3.out' }) : null;
const calc = () => {if (!cards.length) { return; }
const line = window.innerHeight * 0.5;
let idx = 0; let frac = 0;
const first = cards[0].getBoundingClientRect();
const last = cards[cards.length - 1].getBoundingClientRect();
if (line < first.top) { idx = 0; frac = 0; }
else if (line >= last.bottom) { idx = cards.length - 1; frac = 1; }
else {for (let i = 0; i < cards.length; i++) {const r = cards[i].getBoundingClientRect();
if (line >= r.top && line < r.bottom) { idx = i; frac = (line - r.top) / Math.max(1, r.height); break; }}}
set(idx);
if (mq) { mq(98 + Math.max(0, Math.min(cards.length - 1, idx + frac - 0.5)) * 116); }};
ST.create({ trigger: wrap, start: 'top bottom', end: 'bottom top', onUpdate: calc, onRefresh: calc });
calc();});
safe('contact', () => {const tb = q('[data-tblock]');
gsap.from(Array.from(tb.children), { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: tb, start: 'top 90%' } });
const wm = q('[data-wm]');
if (wm) { wm.style.opacity = '1'; wm.style.transform = 'none'; }});
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => { setTimeout(() => { try { ST.refresh(); } catch (e) {} }, 2600); }); }
const wd = setInterval(() => {try {ST.getAll().forEach((st) => {const a = st.animation; const v = st.vars;
if (!a || !st.trigger || v.scrub || v.pin || v.containerAnimation || a.progress() > 0 || a.isActive()) { return; }
const r = st.trigger.getBoundingClientRect();
if (r.top < window.innerHeight && r.bottom > 0) { a.play(); }});} catch (e) {}}, 700);
off.push(() => clearInterval(wd));}, 500);
}, root);}
paCta() {const sec = this.$q('[data-hx]');
if (!sec) { return; }
if (this._ctaOff) { this._ctaOff(); }
const btn = sec.querySelector('[data-hxbtn]');
const fine = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
let io = null;
if ('IntersectionObserver' in window) {io = new IntersectionObserver((es) => { es.forEach((e) => { live = e.isIntersecting; sec.classList.toggle('run', live); if (live) { if (!sec.classList.contains('in')) { } sec.classList.add('in'); startDust(); } else { stopDust(); } }); }, { threshold: 0.15 });
io.observe(sec);} else { sec.classList.add('in', 'run'); }
const h = sec.querySelector('.hx-h');
if (h && !h.getAttribute('data-split')) {h.setAttribute('data-split', '1'); h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
let n = 0;
const walk = (node) => {Array.from(node.childNodes).forEach((c) => {if (c.nodeType === 3) {const f = document.createDocumentFragment();
Array.from(c.textContent).forEach((ch) => {if (ch === ' ') { f.appendChild(document.createTextNode(' ')); return; }
const sp = document.createElement('span'); sp.className = 'hx-c'; sp.setAttribute('aria-hidden', 'true'); sp.style.setProperty('--i', String(n++)); sp.textContent = ch; f.appendChild(sp);});
node.replaceChild(f, c);} else if (c.nodeType === 1) { walk(c); }});};
sec.querySelectorAll('.hx-l').forEach((l, k) => { const inner = l.firstElementChild; if (inner) { inner.classList.add('sp'); inner.style.setProperty('--d', (k * 0.18).toFixed(2) + 's'); walk(inner); } });}
const cv = sec.querySelector('[data-hxcv]'); const stg = sec.querySelector('[data-hxstage]');
const ctx2 = cv && cv.getContext ? cv.getContext('2d') : null;
const reduceM = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
let cw = 0; let chh = 0; let dpr = 1; let parts = []; let pr = 0; let last = 0; let speed = 1; let live = false;
const fit = () => {if (!cv || !stg) { return; }
dpr = Math.min(2, window.devicePixelRatio || 1);
cw = Math.round(cv.clientWidth * dpr); chh = Math.round(cv.clientHeight * dpr);
if (cv.width !== cw) { cv.width = cw; } if (cv.height !== chh) { cv.height = chh; }};
const mk = (init) => ({ t: init ? Math.random() : 0, life: 2.8 + Math.random() * 3, a0: Math.random() * 6.283, sp: (1.4 + Math.random() * 1.6) * (Math.random() < 0.5 ? 1 : -1), z: 0.7 + Math.random() * 1.3, px: 0, py: 0 });
const draw = (now) => {pr = 0;
if (!live) { return; }
const dt = Math.min(0.05, (now - last) / 1000); last = now;
speed += ((sec.classList.contains('hot') ? 2.4 : 1) - speed) * 0.05;
ctx2.clearRect(0, 0, cw, chh);
const cx0 = cw / 2; const cy0 = chh / 2; const rb = cw * 0.147 * 1.04; const rm = cw * 0.5;
for (let i = 0; i < parts.length; i++) {const p = parts[i]; p.t += dt * speed / p.life;
if (p.t >= 1) { parts[i] = mk(false); continue; }
const e = Math.pow(1 - p.t, 1.7); const r = rb + (rm - rb) * e; const a = p.a0 + p.t * p.sp;
const x = cx0 + Math.cos(a) * r; const y = cy0 + Math.sin(a) * r;
const al = Math.pow(Math.sin(Math.PI * p.t), 0.7) * 0.85;
if (p.px) { ctx2.strokeStyle = 'rgba(160,195,255,' + (al * 0.55).toFixed(3) + ')'; ctx2.lineWidth = p.z * dpr * 0.8; ctx2.beginPath(); ctx2.moveTo(p.px, p.py); ctx2.lineTo(x, y); ctx2.stroke(); }
ctx2.fillStyle = 'rgba(190,215,255,' + al.toFixed(3) + ')'; ctx2.beginPath(); ctx2.arc(x, y, p.z * dpr * (1 - p.t * 0.4), 0, 6.283); ctx2.fill();
p.px = x; p.py = y;}
pr = requestAnimationFrame(draw);};
const startDust = () => { if (!ctx2 || reduceM || pr) { return; } fit(); if (!parts.length) { const N = window.innerWidth < 700 ? 48 : 90; for (let i = 0; i < N; i++) { parts.push(mk(true)); } } last = performance.now(); pr = requestAnimationFrame(draw); };
const stopDust = () => { if (pr) { cancelAnimationFrame(pr); pr = 0; } };
window.addEventListener('resize', fit);
let raf = 0; let tx = 0; let ty = 0; let cx = 0; let cy = 0;
const loop = () => {cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
if (btn) { btn.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)'; }
raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : 0;};
const kick = () => { if (!raf) { raf = requestAnimationFrame(loop); } };
const mv = (e) => {if (!btn) { return; }
const b = btn.getBoundingClientRect();
const dx = e.clientX - (b.left + b.width / 2); const dy = e.clientY - (b.top + b.height / 2);
if (Math.hypot(dx, dy) < b.width * 0.95) { tx = dx * 0.3; ty = dy * 0.3; sec.classList.add('hot'); } else { tx = 0; ty = 0; sec.classList.remove('hot'); }
kick();};
const enter = () => sec.classList.add('hov');
const leave = () => { sec.classList.remove('hov', 'hot'); tx = 0; ty = 0; kick(); };
if (fine) { sec.addEventListener('pointermove', mv, { passive: true }); sec.addEventListener('pointerenter', enter); sec.addEventListener('pointerleave', leave); }
this._ctaOff = () => {if (io) { io.disconnect(); }
live = false; stopDust(); window.removeEventListener('resize', fit);
if (raf) { cancelAnimationFrame(raf); }
sec.removeEventListener('pointermove', mv); sec.removeEventListener('pointerenter', enter); sec.removeEventListener('pointerleave', leave);};}
paStudio() {const root = this.$q('[data-pa-root]');
if (!root) { return; }
const items = Array.from(root.querySelectorAll('.st-l'));
let io = null;
if ('IntersectionObserver' in window) {root.classList.add('rvon');
io = new IntersectionObserver((es) => {es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
items.forEach((el) => io.observe(el));}
const art = root.querySelector('[data-art]');
const mq = root.querySelector('.st-mq');
const mqi = root.querySelector('.st-mqi');
let mqOff = null;
if (mq && mqi && mqi.getAnimations) {let target = 1; let rate = 1; let raf = 0;
const tick = () => {raf = 0;
const a = mqi.getAnimations()[0];
rate += (target - rate) * 0.08;
if (Math.abs(target - rate) < 0.004) { rate = target; }
if (a) { a.playbackRate = rate; }
if (rate !== target) { raf = requestAnimationFrame(tick); }};
const go = (t) => { target = t; if (!raf) { raf = requestAnimationFrame(tick); } };
const mv = (e) => { go(e.target && mq.contains(e.target) ? 0.18 : 1); };
const lv = () => go(1);
window.addEventListener('pointermove', mv, { passive: true });
mq.addEventListener('pointerleave', lv);
document.addEventListener('mouseleave', lv);
document.documentElement.addEventListener('mouseleave', lv);
window.addEventListener('blur', lv);
mqOff = () => { window.removeEventListener('pointermove', mv); mq.removeEventListener('pointerleave', lv); document.removeEventListener('mouseleave', lv); document.documentElement.removeEventListener('mouseleave', lv); window.removeEventListener('blur', lv); if (raf) { cancelAnimationFrame(raf); } };}
const hero = root.querySelector('svg[data-hero]');
const hoverOff = [];
if (hero) {const set = (n) => { if (n) { hero.setAttribute('data-h', n); } else { hero.removeAttribute('data-h'); } };
const over = (e) => { const t = e.target && e.target.closest ? e.target.closest('[data-n]') : null; set(t ? t.getAttribute('data-n') : null); };
const clear = () => set(null);
hero.addEventListener('pointerover', over);
hero.addEventListener('pointermove', over);
hero.addEventListener('pointerleave', clear);
hero.addEventListener('pointercancel', clear);
hero.addEventListener('mouseleave', clear);
window.addEventListener('blur', clear);
hoverOff.push(() => { hero.removeEventListener('pointerover', over); hero.removeEventListener('pointermove', over); hero.removeEventListener('pointerleave', clear); hero.removeEventListener('pointercancel', clear); hero.removeEventListener('mouseleave', clear); window.removeEventListener('blur', clear); });}
const prog = root.querySelector('[data-prog]');
const glow = root.querySelector('[data-glow]');
const words = Array.from(root.querySelectorAll('[data-words] .st-w'));
const wordsEl = root.querySelector('[data-words]');
const pin = root.querySelector('[data-pin]');
const wk = root.querySelector('[data-wk]');
const tm = root.querySelector('[data-tm]');
const sxs = Array.from(root.querySelectorAll('[data-sxs]'));
const sxSec = root.querySelector('[data-sx]');
const sxF = root.querySelector('[data-sxf]');
const sxR = root.querySelector('[data-sxr]');
let sel = -1; let ret = -1; let retT = 0;
const down = [true, true, true, true, true];
const deck = root.querySelector('[data-deck]');
const cds = Array.from(root.querySelectorAll('[data-cd]'));
const cnt = root.querySelector('[data-cnt]');
const mobileQ = window.matchMedia('(max-width:900px)');
const phoneQ = window.matchMedia('(max-width:600px)');
const tiltOff = [];
const syncA11y = () => cds.forEach((c) => {if (phoneQ.matches) { c.removeAttribute('tabindex'); c.removeAttribute('role'); c.setAttribute('aria-hidden', 'false'); }
else { c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button'); }});
syncA11y();
if (phoneQ.addEventListener) { phoneQ.addEventListener('change', syncA11y); tiltOff.push(() => phoneQ.removeEventListener('change', syncA11y)); }
if (deck) {const old = deck.parentNode.querySelector('.st-dots'); if (old) { old.remove(); }
const dotsBox = document.createElement('div'); dotsBox.className = 'st-dots';
cds.forEach((_, i) => {const b = document.createElement('button'); b.type = 'button'; b.className = 'st-dt'; b.setAttribute('aria-label', 'Show team card ' + (i + 1));
b.addEventListener('click', () => { go(ctr(i)); });
dotsBox.appendChild(b);});
deck.parentNode.insertBefore(dotsBox, deck.nextSibling);
let dk = 0;
const onDeck = () => {if (dk) { return; }
dk = requestAnimationFrame(() => {dk = 0;
const mid = deck.scrollLeft + deck.clientWidth / 2; let best = 0; let bd = 1e9;
const ph = phoneQ.matches;
cds.forEach((c, i) => {const raw = c.offsetLeft + c.offsetWidth / 2 - mid; const d = Math.abs(raw); if (d < bd) { bd = d; best = i; }
if (ph && !reduce.matches) {const n = Math.max(-2, Math.min(2, raw / ((c.offsetWidth + 14) || 1))); const a = Math.abs(n);
c.style.setProperty('transform', 'translate3d(' + (n * -9).toFixed(2) + '%,' + (a * 14).toFixed(1) + 'px,' + (a * -150).toFixed(1) + 'px) rotateY(' + (n * -46).toFixed(2) + 'deg)', 'important');
c.style.opacity = Math.max(0.3, 1 - a * 0.55).toFixed(3);} else { c.style.removeProperty('transform'); c.style.removeProperty('opacity'); }});
cds.forEach((c, i) => c.classList.toggle('cur', i === best));
dotsBox.querySelectorAll('.st-dt').forEach((d, i) => d.classList.toggle('on', i === best));
if (best !== curIdx) { if (curIdx >= 0 && phoneQ.matches) { } curIdx = best; plan(); }});};
const AP = 3800; let curIdx = -1; let apT = 0; let held = false; let seen = false; let settleT = 0; let resumeT = 0;
const ctr = (i) => { const c = cds[i]; return c.offsetLeft - (deck.clientWidth - c.offsetWidth) / 2; };
const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
const canPlay = () => phoneQ.matches && seen && !held && !document.hidden && !reduce.matches && !deck.classList.contains('sel');
let tw = 0;
function stopTw() { if (tw) { cancelAnimationFrame(tw); tw = 0; deck.style.scrollSnapType = ''; } }
function go(to) {stopTw();
const from = deck.scrollLeft; const dist = to - from;
if (Math.abs(dist) < 1) { return; }
const dur = Math.min(1500, 700 + Math.abs(dist) / (cds[0].offsetWidth + 14) * 260);
const t0 = performance.now();
deck.style.scrollSnapType = 'none';
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const step = (now) => {const k = Math.min(1, (now - t0) / dur);
deck.scrollLeft = from + dist * ease(k);
if (k < 1) { tw = requestAnimationFrame(step); } else { tw = 0; deck.scrollLeft = to; deck.style.scrollSnapType = ''; }};
tw = requestAnimationFrame(step);}
function plan() {clearTimeout(apT); dotsBox.classList.toggle('hold', !canPlay());
if (!canPlay()) { return; }
apT = setTimeout(() => { if (canPlay()) { go(ctr((curIdx + 1) % cds.length)); } else { plan(); } }, AP);}
const settle = () => {clearTimeout(settleT);
if (tw) { return; }
settleT = setTimeout(() => {if (!phoneQ.matches || held || tw) { return; }
const i = Math.max(0, curIdx); const off = deck.scrollLeft - ctr(i);
if (Math.abs(off) > 2) { go(ctr(i)); }}, 200);};
const hold = () => { stopTw(); held = true; clearTimeout(resumeT); clearTimeout(apT); dotsBox.classList.add('hold'); };
const free = () => { clearTimeout(resumeT); resumeT = setTimeout(() => { held = false; settle(); plan(); }, 1400); };
const onScr = () => { onDeck(); settle(); };
deck.addEventListener('scroll', onScr, { passive: true }); window.addEventListener('resize', onDeck);
deck.addEventListener('touchstart', hold, { passive: true }); deck.addEventListener('touchend', free, { passive: true }); deck.addEventListener('touchcancel', free, { passive: true });
deck.addEventListener('pointerdown', hold); deck.addEventListener('pointerup', free); deck.addEventListener('pointercancel', free);
dotsBox.addEventListener('click', () => { hold(); free(); });
const onVis = () => plan(); document.addEventListener('visibilitychange', onVis); phoneQ.addEventListener && phoneQ.addEventListener('change', onVis);
let vio = null;
if ('IntersectionObserver' in window) { vio = new IntersectionObserver((es) => { seen = es[0].isIntersecting; plan(); }, { threshold: 0.6 }); vio.observe(deck); }
onDeck();
tiltOff.push(() => { clearTimeout(apT); clearTimeout(settleT); clearTimeout(resumeT); stopTw(); if (vio) { vio.disconnect(); } document.removeEventListener('visibilitychange', onVis); deck.removeEventListener('scroll', onScr); window.removeEventListener('resize', onDeck); dotsBox.remove(); });}
cds.forEach((el) => {const tl = el.querySelector('.st-tilt');
const gls = el.querySelectorAll('.st-glare');
const mv = (e) => {if (!el.classList.contains('rdy')) { return; }
const b = el.getBoundingClientRect();
const nx = (e.clientX - b.left) / b.width; const ny = (e.clientY - b.top) / b.height;
tl.style.setProperty('--ry', ((nx - 0.5) * 22).toFixed(1) + 'deg');
tl.style.setProperty('--rx', ((0.5 - ny) * 18).toFixed(1) + 'deg');
gls.forEach((gl) => { gl.style.setProperty('--gx', (nx * 100).toFixed(0) + '%'); gl.style.setProperty('--gy', (ny * 100).toFixed(0) + '%'); });};
const lv = () => { tl.style.setProperty('--ry', '0deg'); tl.style.setProperty('--rx', '0deg'); };
el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv);
tiltOff.push(() => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); });});
const wheel = root.querySelector('[data-wheel]');
const wheelBox = wheel ? wheel.parentNode : null;
const wa = root.querySelector('[data-wheel-a]');
const wb = root.querySelector('[data-wheel-b]');
const pns = Array.from(root.querySelectorAll('[data-pn]'));
const rls = Array.from(root.querySelectorAll('[data-rl]'));
const mc = root.querySelector('.mcurve');
const md = root.querySelector('.mdot');
const md2 = root.querySelector('.mdot2');
const pbar = root.querySelector('[data-pbar]');
const stk = root.querySelector('[data-stk]');
const rows = Array.from(root.querySelectorAll('[data-lrow]'));
const cap = root.querySelector('[data-stkcap]');
const names = ['', 'Strategy', 'Brand', 'Web & Product', 'Content', 'Growth'];
const fill = root.querySelector('[data-hudfill]');
const lab = root.querySelector('[data-hudlab]');
const marks = ['#top', '#story', '[data-sec="rules"]', '[data-sec="layers"]', '#team'];
const labels = ['02 / 06 ABOUT', '03 / 06 BELIEF', '04 / 06 METHOD', '05 / 06 LAYERS', '06 / 06 TEAM'];
let curL = 0;
const setLayer = (n) => {if (n === curL || !stk) { return; }
curL = n;
stk.querySelectorAll('.stk-s').forEach((g) => {const k = parseInt(g.getAttribute('data-s'), 10);
g.style.transform = 'translateY(' + (k > n ? -44 : (k === n ? -16 : 0)) + 'px)';
g.style.opacity = k > n ? '0.45' : '1';
const top = g.querySelector('.stk-top');
if (top) { top.setAttribute('fill', k === n ? '#536684' : (k < n ? '#3B4C72' : '#303D59')); top.setAttribute('stroke', k === n ? '#DCE3EF' : '#98A9C4'); }});
if (cap) { cap.textContent = 'Layer ' + n + ': ' + names[n]; }
rows.forEach((r) => r.classList.toggle('on', parseInt(r.getAttribute('data-lrow'), 10) === n));};
let ticking = false;
const frame = () => {ticking = false;
const vh = window.innerHeight;
const y = window.scrollY || document.documentElement.scrollTop || 0;
const max = Math.max(1, document.documentElement.scrollHeight - vh);
if (prog) { prog.style.setProperty('--p2', Math.min(1, y / max).toFixed(4)); }
if (fill) { fill.style.transform = 'scaleY(' + Math.min(1, y / max).toFixed(4) + ')'; }
if (art) { art.style.setProperty('--p', Math.min(1, y / 520).toFixed(3)); }
if (glow) { glow.style.transform = 'translate3d(0,' + (-y * 0.18).toFixed(1) + 'px,0)'; }
if (words.length && pin) {const r = pin.getBoundingClientRect();
const span = Math.max(1, r.height - vh);
const p = Math.min(1, Math.max(0, -r.top / span));
const n = words.length; const win = 7;
words.forEach((w, k) => {const q = Math.min(1, Math.max(0, (p * (n + win) - k) / win));
w.style.setProperty('--q', q.toFixed(3));
w.style.setProperty('--g', (4 * q * (1 - q)).toFixed(3));});
if (pbar) { pbar.style.setProperty('--pp', p.toFixed(3)); }}
if (wk) {const r = wk.getBoundingClientRect();
const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
const idx = Math.min(3, Math.floor(p * 4 - 0.001 + (p >= 1 ? 0 : 0.001)));
pns.forEach((el, k) => {el.classList.toggle('on', k === idx);
el.classList.toggle('past', k < idx);
const t = Math.min(1, Math.max(0, (p * 4 - k) * 1.5));
el.style.setProperty('--t', t.toFixed(3));
if (k === 2 && mc && md) {const L = mc.getTotalLength();
const pt = mc.getPointAtLength(L * t);
md.setAttribute('cx', pt.x.toFixed(1)); md.setAttribute('cy', pt.y.toFixed(1)); if (md2) { md2.setAttribute('cx', pt.x.toFixed(1)); md2.setAttribute('cy', pt.y.toFixed(1)); }}});
rls.forEach((el, k) => {const f = Math.min(1, Math.max(0, p * 4 - k));
el.style.setProperty('--rp', f.toFixed(3));
el.classList.toggle('on', k === idx);});}
if (wheel) {const wr = wheelBox.getBoundingClientRect();
const prog = (vh - wr.top) / (vh + wr.height);
const deg = prog * 140;
if (wa) { wa.style.transformOrigin = '300px 300px'; wa.style.transform = 'rotate(' + (-deg * 0.6).toFixed(2) + 'deg)'; }
if (wb) { wb.style.transformOrigin = '300px 300px'; wb.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)'; }}
if (sxSec && !mobileQ.matches) {const gr = sxSec.getBoundingClientRect();
const gp = Math.min(1, Math.max(0, -gr.top / Math.max(1, gr.height - vh)));
const rr = Math.min(1, Math.max(0, (gp - 0.06) / 0.9));
if (sxF) { sxF.style.transform = 'scaleX(' + rr.toFixed(4) + ')'; }
if (sxR) { sxR.style.left = (rr * 100).toFixed(2) + '%'; }
sxs.forEach((st, i) => {const q = Math.min(1, Math.max(0, (gp - 0.06 - i * 0.3) / 0.3));
st.style.setProperty('--q', q.toFixed(3));
st.style.setProperty('--a', Math.sin(Math.PI * q).toFixed(3));
const on = q >= 0.98;
if (on !== st.classList.contains('on')) { st.classList.toggle('on', on); }});}
if (tm && deck && !phoneQ.matches) {const r = tm.getBoundingClientRect();
const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
const W = deck.clientWidth || 1000;
const cw = Math.max(104, Math.min(270, W / (cds.length + 0.6), vh * 0.34));
const sp = cw * 1.07;
const e = 1 - Math.pow(1 - Math.min(1, p / 0.55), 3);
let dealt = 0;
cds.forEach((el, k) => {const d = k - (cds.length - 1) / 2;
const sw = Math.sin(Math.PI * e);
const f = 0;
const x = d * 3 * (1 - e) + d * sp * e;
const y = -d * 5 * (1 - e) + Math.abs(d) * 16 * sw - Math.sin(Math.PI * f) * 30;
const rot = d * (1.5 * (1 - e) + 10 * sw);
const sc = 0.9 + 0.1 * e + Math.sin(Math.PI * f) * 0.06;
el.style.setProperty('--cw', cw.toFixed(1) + 'px');
el.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
el.style.zIndex = String((k === sel || k === ret) ? 60 : (f > 0 && f < 1 ? 20 : k + 1));
const fl = el.querySelector('.st-flip');
if (fl) { fl.style.transform = 'rotateY(' + (down[k] ? 180 : 0).toFixed(1) + 'deg)'; }
const ready = e >= 0.985;
if (ready) { dealt++; }
if (ready !== el.classList.contains('rdy')) { el.classList.toggle('rdy', ready); if (ready) { } }});
if (sel >= 0 && p < 0.3) { closePick(); }
if (cnt) { const t = dealt + ' / ' + cds.length; if (cnt.textContent !== t) { cnt.textContent = t; } }
tm.classList.toggle('all', dealt === cds.length);}
if (rows.length) {let pick = 1;
rows.forEach((r, k) => { if (r.getBoundingClientRect().top <= vh * 0.5) { pick = k + 1; } });
setLayer(pick);}
items.forEach((el) => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.92) { el.classList.add('in'); } });
if (lab) {let idx = 0;
marks.forEach((m, k) => { const el = root.querySelector(m); if (el && el.getBoundingClientRect().top <= vh * 0.5) { idx = k; } });
lab.textContent = 'SHEET ' + labels[idx];}};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
frame();
setTimeout(frame, 400);
const dsc = root.querySelector('[data-dsc]');
const pop = root.querySelector('[data-pop]');
const popp = root.querySelector('[data-popp]');
const dq = (k) => dsc && dsc.querySelector('[data-' + k + ']');
let pickT = [];
function pickClear() { pickT.forEach(clearTimeout); pickT = []; }
function closePick() {if (sel < 0) { return; }
pickClear();
const el = cds[sel]; sel = -1;
deck.classList.remove('sel');
if (dsc) { dsc.classList.remove('on'); }
if (pop) { pop.classList.remove('on'); }
el.classList.remove('lift', 'spin');
el.style.translate = ''; el.querySelector('.st-tilt').style.scale = '';
const ci = cds.indexOf(el); down[ci] = true; ret = ci;
el.classList.add('fl'); clearTimeout(retT);
retT = setTimeout(() => { el.classList.remove('fl'); ret = -1; requestAnimationFrame(frame); }, 1150);
requestAnimationFrame(frame);}
const openPick = (el) => {pickClear();
sel = cds.indexOf(el);
const wasDown = down[sel]; down[sel] = false;
if (wasDown) { el.classList.add('fl'); clearTimeout(retT); retT = setTimeout(() => el.classList.remove('fl'), 1000); }
const d0 = wasDown ? 1000 : 450;
deck.classList.add('sel');
dq('dlay').textContent = el.dataset.lay || '';
dq('dname').textContent = el.dataset.name || el.dataset.role || '';
dq('ddes').textContent = el.dataset.des || '';
dq('dmain').textContent = el.dataset.main || '';
const ul = dq('dlist'); ul.textContent = '';
(el.dataset.list || '').split('|').forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
Array.from(dsc.children).forEach((c, n) => c.style.setProperty('--i', n));
requestAnimationFrame(frame);
el.classList.add('lift');
if (pop && !phoneQ.matches) { pop.classList.add('on'); }
if (phoneQ.matches) { pickT.push(setTimeout(() => el.classList.add('spin'), 200)); dsc.classList.add('on'); return; }
if (!wasDown) { pickT.push(setTimeout(() => el.classList.add('spin'), d0)); }
pickT.push(setTimeout(() => {const r = el.getBoundingClientRect(); const dr = deck.getBoundingClientRect();
const pr = popp.getBoundingClientRect();
const k = (dr.width / (deck.offsetWidth || 1)) || 1;
const bw = el.offsetWidth; const bh = el.offsetHeight;
const sc = Math.min(1.62, (pr.height / k - 56) / bh, (pr.width / k * 0.46) / bw);
const padL = Math.max(24, Math.min(48, pr.width / k * 0.04)) * k;
const cw2 = bw * sc * k;
const tx = pr.left + padL + cw2 / 2;
const ty = pr.top + pr.height / 2;
const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
el.querySelector('.st-tilt').style.scale = sc.toFixed(3);
el.style.translate = ((tx - cx) / k).toFixed(1) + 'px ' + ((ty - cy) / k - 16).toFixed(1) + 'px';
const leftV = tx + cw2 / 2 + 48 * k;
dsc.style.left = ((leftV - dr.left) / k).toFixed(0) + 'px';
dsc.style.top = ((ty - dr.top) / k).toFixed(0) + 'px';
dsc.style.width = Math.max(240, (pr.right - padL - leftV) / k).toFixed(0) + 'px';
pickT.push(setTimeout(() => { dsc.classList.add('on'); }, 350));}, d0 + (wasDown ? 80 : 1200)));};
const pickClick = (e) => {const el = e.currentTarget;
if (phoneQ.matches) { return; }
if (!(phoneQ.matches || el.classList.contains('rdy') || el.classList.contains('lift'))) { return; }
if (sel === cds.indexOf(el)) { closePick(); return; }
if (sel >= 0) { closePick(); pickT.push(setTimeout(() => openPick(el), 600)); return; }
openPick(el);};
const pickKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickClick(e); } };
function pickEsc(e) { if (e.key === 'Escape') { closePick(); } }
cds.forEach((el) => { el.addEventListener('click', pickClick); el.addEventListener('keydown', pickKey); });
if (pop) { pop.addEventListener('click', (e) => { if (!e.target.closest('[data-popp]')) { closePick(); } }); }
window.addEventListener('keydown', pickEsc);
this._stOff = () => { hoverOff.forEach((f) => f()); tiltOff.forEach((f) => f()); window.removeEventListener('keydown', pickEsc); pickClear(); if (mqOff) { mqOff(); } window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (io) { io.disconnect(); } };}
paServices() {const root = this.$q('[data-pa-root]');
if (!root) { return; }
const offs = [];
const items = Array.from(root.querySelectorAll('.st-l'));
let io = null;
if ('IntersectionObserver' in window) {root.classList.add('rvon');
io = new IntersectionObserver((es) => {es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
items.forEach((el) => io.observe(el));}
const prog = root.querySelector('[data-prog]');
const fill = root.querySelector('[data-hudfill]');
const lab = root.querySelector('[data-hudlab]');
const cards = Array.from(root.querySelectorAll('[data-svc]'));
const mobileQ = window.matchMedia('(max-width:900px)');
let tops = [];
const measure = () => {tops = cards.map((c) => parseFloat(getComputedStyle(c).top) || 0);};
measure();
if ('IntersectionObserver' in window) {const cio = new IntersectionObserver((es) => {es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); cio.unobserve(e.target); } });}, { threshold: 0.3 });
cards.forEach((c) => cio.observe(c));
offs.push(() => cio.disconnect());} else { cards.forEach((c) => c.classList.add('on')); }
const marks = ['#top', '#sv-stack', '#sv-ways', '#sv-incl', '#sv-faq'];
const labels = ['SERVICES', 'THE FIVE LAYERS', 'WAYS TO WORK', 'INCLUDED', 'QUESTIONS'];
let curLab = -1;
let ticking = false;
const frame = () => {ticking = false;
const vh = window.innerHeight;
const y = window.scrollY || document.documentElement.scrollTop || 0;
const max = Math.max(1, document.documentElement.scrollHeight - vh);
const pr = Math.min(1, y / max);
if (prog) { prog.style.setProperty('--p2', pr.toFixed(4)); }
if (fill) { fill.style.transform = 'scaleY(' + pr.toFixed(4) + ')'; }
items.forEach((el) => {if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.92) { el.classList.add('in'); }});
let li = 0;
marks.forEach((m, i) => { const t = root.querySelector(m); if (t && t.getBoundingClientRect().top < vh * 0.5) { li = i; } });
if (li !== curLab && lab) { curLab = li; lab.textContent = '03 / 06 ' + labels[li]; }
if (!mobileQ.matches) {cards.forEach((c, i) => {const nx = cards[i + 1];
if (!nx) { c.style.setProperty('--s', '1'); c.style.setProperty('--dk', '0'); return; }
const nt = nx.getBoundingClientRect().top;
const bottom = tops[i] + c.offsetHeight;
const span = Math.max(1, bottom - tops[i + 1]);
const p = Math.min(1, Math.max(0, (bottom - nt) / span));
c.style.setProperty('--s', (1 - 0.055 * p).toFixed(4));
c.style.setProperty('--dk', (0.6 * p).toFixed(3));});}};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
const onResize = () => { measure(); onScroll(); };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onResize);
offs.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); });
frame();
setTimeout(() => { measure(); frame(); }, 400);
root.querySelectorAll('[data-jump]').forEach((a) => {const go = (e) => {const t = root.querySelector(a.getAttribute('data-jump'));
if (!t) { return; }
e.preventDefault();
const top = t.getBoundingClientRect().top + (window.scrollY || 0) - 84 - (parseFloat(getComputedStyle(t).top) - 84 || 0);
window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });};
a.addEventListener('click', go);
offs.push(() => a.removeEventListener('click', go));});
const ways = Array.from(root.querySelectorAll('[data-way]'));
let wProg = 0;
const openWay = (w) => { wProg = 0; ways.forEach((x) => { x.classList.toggle('is-open', x === w); if (x !== w) { x.style.setProperty('--p', '0'); } }); };
ways.forEach((w) => {const en = () => { if (!mobileQ.matches) { openWay(w); } };
const mv = (e) => {const r = w.getBoundingClientRect();
w.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
w.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');};
const kd = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWay(w); } };
w.addEventListener('pointerenter', en); w.addEventListener('focus', en); w.addEventListener('click', en);
w.addEventListener('pointermove', mv); w.addEventListener('keydown', kd);
offs.push(() => { w.removeEventListener('pointerenter', en); w.removeEventListener('focus', en); w.removeEventListener('click', en); w.removeEventListener('pointermove', mv); w.removeEventListener('keydown', kd); });});
const fis = Array.from(root.querySelectorAll('[data-fi]'));
fis.forEach((fi) => {const b = fi.querySelector('button');
const tg = () => {const open = !fi.classList.contains('open');
fis.forEach((o) => { o.classList.remove('open'); const ob = o.querySelector('button'); if (ob) { ob.setAttribute('aria-expanded', 'false'); } });
if (open) { fi.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }};
const fmv = (e) => { const r = fi.getBoundingClientRect(); fi.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px'); fi.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px'); };
fi.addEventListener('pointermove', fmv);
b.addEventListener('click', tg);
offs.push(() => { b.removeEventListener('click', tg); fi.removeEventListener('pointermove', fmv); });});
{const bar = root.querySelector('[data-hdr]');
if (bar) {const bs = () => { bar.classList.toggle('stuck', (window.scrollY || document.documentElement.scrollTop || 0) > 24); };
window.addEventListener('scroll', bs, { passive: true }); bs();
offs.push(() => window.removeEventListener('scroll', bs));}}
{const inc = root.querySelector('[data-inc]');
const items = inc ? Array.from(inc.querySelectorAll('[data-ii]')) : [];
const iReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (inc && items.length && !iReduce) {const sec = root.querySelector('#sv-incl');
let T = [0.05, 0.3, 0.55, 0.8]; let raf = 0; let last = -1; let tw = 0;
const th = () => { const r = inc.getBoundingClientRect(); const w = r.width || 1; return items.map((it) => { const n = it.querySelector('.sv-in').getBoundingClientRect(); return (n.left + n.width / 2 - r.left) / w; }); };
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const upd = () => {raf = 0;
if (mobileQ.matches) { items.forEach((it) => it.classList.add('on')); inc.classList.remove('arm'); return; }
const r = sec.getBoundingClientRect();
const span = Math.max(1, r.height - window.innerHeight);
const prog = Math.min(1, Math.max(0, -r.top / span));
const q = Math.min(1, prog / 0.86);
if (Math.abs(q - last) < 0.0005 && T.length) { return; }
last = q;
if (inc.getBoundingClientRect().width !== tw) { tw = inc.getBoundingClientRect().width; T = th(); }
const p = q;
inc.classList.add('arm');
inc.classList.toggle('done', q >= 1);
inc.style.setProperty('--p', p.toFixed(4));
items.forEach((it, i) => { it.classList.toggle('on', p >= T[i]); });};
const kick = () => { if (!raf) { raf = requestAnimationFrame(upd); } };
T = th(); tw = inc.getBoundingClientRect().width;
window.addEventListener('scroll', kick, { passive: true }); window.addEventListener('resize', kick);
kick();
const mvs = items.map((it) => { const f = (e) => { const r = it.getBoundingClientRect(); it.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px'); it.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px'); }; it.addEventListener('pointermove', f); return () => it.removeEventListener('pointermove', f); });
offs.push(() => { cancelAnimationFrame(raf); window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick); mvs.forEach((f) => f()); });} else if (items.length) {items.forEach((it) => it.classList.add('on'));}}
{const wsec = root.querySelector('#sv-ways');
const wReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (wsec && ways.length && !wReduce) {let inV = false; let wHov = false; let wl = 0; let wr = 0;
const wio = new IntersectionObserver((es) => { inV = es[0].isIntersecting; }, { threshold: 0.5 });
wio.observe(wsec);
const wEnter = () => { wHov = true; }; const wLeave = () => { wHov = false; };
ways.forEach((w) => { w.addEventListener('pointerenter', wEnter); w.addEventListener('pointerleave', wLeave); w.addEventListener('focusin', wEnter); w.addEventListener('focusout', wLeave); });
const wtick = (t) => {wr = requestAnimationFrame(wtick);
const dt = Math.min(80, t - wl); wl = t;
const cur = ways.findIndex((x) => x.classList.contains('is-open'));
if (cur < 0) { return; }
if (inV && !wHov && !mobileQ.matches && !document.hidden) {wProg += dt / 6500;
if (wProg >= 1) { openWay(ways[(cur + 1) % ways.length]); }}
ways[cur].style.setProperty('--p', wHov ? '1' : wProg.toFixed(3));};
wr = requestAnimationFrame(wtick);
offs.push(() => { cancelAnimationFrame(wr); wio.disconnect(); ways.forEach((w) => { w.removeEventListener('pointerenter', wEnter); w.removeEventListener('pointerleave', wLeave); w.removeEventListener('focusin', wEnter); w.removeEventListener('focusout', wLeave); }); });}}
const pent = root.querySelector('[data-pent]');
if (pent) {const nodes = Array.from(pent.querySelectorAll('[data-pnode]'));
const pc = pent.querySelector('[data-pc]');
const pck = pent.querySelector('[data-pck]'); const pct = pent.querySelector('[data-pct]'); const pcd = pent.querySelector('[data-pcd]');
const def = { k: pck.textContent, t: pct.textContent, d: pcd.textContent };
let hov = false; let auto = 0; let cur = -1;
const show = (k) => {if (k === cur) { return; }
cur = k;
nodes.forEach((n, i) => n.classList.toggle('act', i === k));
if (k >= 0) {const n = nodes[k];
pent.setAttribute('data-h', String(k));
pck.textContent = n.getAttribute('data-n'); pct.textContent = n.getAttribute('data-t'); pcd.textContent = n.getAttribute('data-d');} else {pent.removeAttribute('data-h'); pck.textContent = def.k; pct.textContent = def.t; pcd.textContent = def.d;}
pc.classList.remove('sw'); void pc.offsetWidth; pc.classList.add('sw');};
nodes.forEach((n, i) => {const en = () => { hov = true; show(i); };
const lv = () => { hov = false; };
n.addEventListener('pointerenter', en); n.addEventListener('focus', en);
n.addEventListener('pointerleave', lv); n.addEventListener('blur', lv);
offs.push(() => { n.removeEventListener('pointerenter', en); n.removeEventListener('focus', en); n.removeEventListener('pointerleave', lv); n.removeEventListener('blur', lv); });});
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prgs = nodes.map((n) => n.querySelector('[data-prg]'));
const DUR = 3600; let prog = 0; let last = 0; let raf = 0;
const paint = () => { prgs.forEach((c, i) => { if (c) { c.style.strokeDashoffset = String(i === cur ? (hov ? 0 : 1 - prog) : 1); } }); };
const tick = (t) => {raf = requestAnimationFrame(tick);
const dt = Math.min(80, t - last); last = t;
if (!hov && !document.hidden) {prog += dt / DUR;
if (prog >= 1) { prog = 0; show((cur + 1) % 5); }}
paint();};
nodes.forEach((n) => {const en = () => { prog = 0; };
n.addEventListener('pointerenter', en); n.addEventListener('focus', en);
offs.push(() => { n.removeEventListener('pointerenter', en); n.removeEventListener('focus', en); });});
if (!reduce) {const t0 = setTimeout(() => { prog = 0; show(0); last = performance.now(); raf = requestAnimationFrame(tick); }, 3000);
offs.push(() => { clearTimeout(t0); cancelAnimationFrame(raf); });}}
this._svOff = () => { offs.forEach((f) => f()); if (io) { io.disconnect(); } };}
paProjects() {const root = this.$q('[data-pa-root]');
if (!root) { return; }
const offs = [];
const items = Array.from(root.querySelectorAll('.st-l'));
let io = null;
if ('IntersectionObserver' in window) {root.classList.add('rvon');
io = new IntersectionObserver((es) => {es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
items.forEach((el) => io.observe(el));
offs.push(() => io.disconnect());}
const prog = root.querySelector('[data-prog]');
const fill = root.querySelector('[data-hudfill]');
const lab = root.querySelector('[data-hudlab]');
const reg = root.querySelector('[data-pj-reg]');
const hero = root.querySelector('[data-pj-hero]');
const stage = root.querySelector('[data-pj-stage]');
const tilt = root.querySelector('[data-pj-tilt]');
const ring = root.querySelector('[data-pj-ring]');
const plates = Array.from(root.querySelectorAll('.pj-c3'));
const dotsEl = root.querySelector('[data-pj-dots]');
const noEl = root.querySelector('[data-pj-no]');
const tyEl = root.querySelector('[data-pj-ty]');
const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const fine = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
root.classList.remove('pj-on');
const N = plates.length || 1;
const STEP = 360 / N;
const types = plates.map((p) => (p.querySelector('em') || {}).textContent || '');
let dots = [];
if (dotsEl) {dotsEl.innerHTML = '';
dots = plates.map((p, i) => {const d = document.createElement('button');
d.type = 'button'; d.setAttribute('aria-label', 'Show plate ' + String(i + 1).padStart(2, '0'));
dotsEl.appendChild(d); return d;});}
let ang = 0;
let tgt = null;
let vel = 0.12;
let hov = false;
let tx = 0; let ty = 0; let cx = 0; let cy = 0;
let scrollP = 0;
let dragging = false; let down = false; let sx = 0; let lx = 0; let inertia = 0; let dragMoved = 0; let released = false;
let t0 = 0; let started = false; let vis = true; let raf = 0; let front = -1;
let PW = 250; let R = 330;
const ease = (t) => 1 - Math.pow(1 - t, 3);
const measure = () => {if (!stage) { return; }
const sr = stage.getBoundingClientRect();
const sw = stage.clientWidth || 600;
const txb = root.querySelector('.pj-tx');
const tr = txb ? txb.getBoundingClientRect() : null;
const cxm = sr.left + sr.width / 2;
let maxW = 290;
if (tr && tr.bottom <= sr.top + 4) {maxW = Math.min(maxW, sw / 3.1);} else if (tr) {maxW = Math.min(maxW, (cxm - tr.right) / 1.2, (window.innerWidth - 60 - cxm) / 1.35);}
PW = Math.max(120, Math.floor(maxW));
stage.style.setProperty('--pw', PW + 'px');
stage.style.setProperty('--ph', Math.round(PW * 1.31) + 'px');
stage.classList.toggle('pj-narrow', sw < 560);
R = Math.round(PW * 1.34);};
measure();
const norm = (a) => ((a % 360) + 540) % 360 - 180;
const setFront = (i) => {if (i === front) { return; }
front = i;
if (noEl) { noEl.textContent = String(i + 1).padStart(2, '0'); }
if (tyEl) { tyEl.textContent = types[i] || ''; }
dots.forEach((d, k) => d.classList.toggle('on', k === i));};
const draw = (now) => {raf = 0;
if (!vis) { return; }
if (!t0) { t0 = now; }
const it = reduce ? 1 : Math.min(1, (now - t0) / 2600);
const e = ease(it);
if (it >= 0.28 && !started) { started = true; root.classList.add('pj-on'); }
if (it >= 1) {if (dragging) {} else if (Math.abs(inertia) > 0.03) {ang += inertia; inertia *= 0.94;} else if (released) {released = false; inertia = 0;
tgt = Math.round(ang / STEP) * STEP;} else if (tgt !== null) {const d = norm(tgt - ang);
ang += d * 0.085;
if (Math.abs(d) < 0.05) { ang = tgt; tgt = null; }} else if (!hov && !reduce) { ang -= vel; }}
const intro = (1 - e) * -420;
const a = ang + intro - scrollP * 140;
const r = R * e;
cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
if (tilt) { tilt.style.transform = 'rotateX(' + (-9 + cy).toFixed(2) + 'deg) rotateY(' + cx.toFixed(2) + 'deg) translate3d(0,' + (scrollP * -50).toFixed(1) + 'px,0)'; }
if (ring) { ring.style.transform = 'translateZ(' + (-R * 0.34).toFixed(0) + 'px) rotateY(' + a.toFixed(2) + 'deg)'; }
let best = 0; let bestF = -2;
plates.forEach((p, i) => {const th = i * STEP;
const f = Math.cos((th + a) * Math.PI / 180);
p.style.transform = 'rotateY(' + th + 'deg) translateZ(' + r.toFixed(1) + 'px)';
p.style.opacity = String(Math.max(0, Math.min(1, (0.28 + 0.72 * Math.max(0, f)) * e)).toFixed(3));
p.style.pointerEvents = f > 0.2 ? 'auto' : 'none';
if (f > bestF) { bestF = f; best = i; }});
setFront(best);
const moving = !reduce && (it < 1 || dragging || released || Math.abs(inertia) > 0.03 || tgt !== null || !hov || Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02);
if (moving || it < 1) { raf = requestAnimationFrame(draw); }};
const kick = () => { if (!raf && vis) { raf = requestAnimationFrame(draw); } };
plates.forEach((p, i) => {const go = () => { if (dragMoved > 6) { dragMoved = 0; return; } inertia = 0; tgt = -i * STEP; hov = true; kick(); };
p.addEventListener('click', go);
offs.push(() => p.removeEventListener('click', go));});
dots.forEach((d, i) => {const go = () => { tgt = -i * STEP; kick(); };
d.addEventListener('click', go);
offs.push(() => d.removeEventListener('click', go));});
if (stage) {const en = () => { hov = true; };
const lv = () => { hov = false; tx = 0; ty = 0; kick(); };
stage.addEventListener('pointerenter', en); stage.addEventListener('pointerleave', lv);
offs.push(() => { stage.removeEventListener('pointerenter', en); stage.removeEventListener('pointerleave', lv); });
if (fine) {const mv = (e) => {const r = stage.getBoundingClientRect();
tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
ty = ((e.clientY - r.top) / r.height - 0.5) * -8;
kick();};
stage.addEventListener('pointermove', mv, { passive: true });
offs.push(() => stage.removeEventListener('pointermove', mv));}}
if (stage) {const K = 0.36;
const onDown = (e) => {if (e.button !== undefined && e.button !== 0) { return; }
if (e.target.closest && e.target.closest('.pj-dots')) { return; }
down = true; sx = e.clientX; lx = e.clientX; dragMoved = 0; inertia = 0;};
const onMove = (e) => {if (!down) { return; }
const dx = e.clientX - lx; lx = e.clientX;
dragMoved += Math.abs(dx);
if (!dragging && Math.abs(e.clientX - sx) > 5) {dragging = true; tgt = null; released = false; hov = true;
stage.classList.add('drag', 'used');
try { stage.setPointerCapture(e.pointerId); } catch (er) {}}
if (dragging) { ang += dx * K; inertia = dx * K * 0.9; kick(); }};
const onUp = (e) => {if (!down) { return; }
down = false;
if (dragging) {dragging = false; released = true; stage.classList.remove('drag');
try { stage.releasePointerCapture(e.pointerId); } catch (er) {}
kick();}};
const onKey = (e) => {if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }
e.preventDefault();
const base = Math.round((tgt !== null ? tgt : ang) / STEP);
tgt = (base + (e.key === 'ArrowRight' ? 1 : -1)) * STEP; inertia = 0; kick();};
stage.addEventListener('pointerdown', onDown);
stage.addEventListener('pointermove', onMove);
stage.addEventListener('pointerup', onUp);
stage.addEventListener('pointercancel', onUp);
stage.addEventListener('keydown', onKey);
offs.push(() => {stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove);
stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp); stage.removeEventListener('keydown', onKey);});}
if ('IntersectionObserver' in window && hero) {const hio = new IntersectionObserver((es) => { es.forEach((e) => { vis = e.isIntersecting; if (vis) { kick(); } }); }, { threshold: 0 });
hio.observe(hero);
offs.push(() => hio.disconnect());}
const onRes = () => { measure(); kick(); };
window.addEventListener('resize', onRes);
offs.push(() => { window.removeEventListener('resize', onRes); cancelAnimationFrame(raf); });
this._pjScroll = (y, vh) => { scrollP = Math.max(0, Math.min(1, y / (vh * 0.9))); if (scrollP < 1) { kick(); } };
kick();
const rows = Array.from(root.querySelectorAll('.pj-row'));
const chips = Array.from(root.querySelectorAll('.pj-ch'));
const cnt = root.querySelector('[data-pj-cnt]');
const list = root.querySelector('[data-pj-list]');
const num = root.querySelector('[data-pj-num]');
const bl = root.querySelector('.pj-bl');
const fi = root.querySelector('[data-pj-fi]');
const vw = root.querySelector('[data-pj-vw]');
const vf = root.querySelector('[data-vw-f]');
const vs = root.querySelector('[data-vw-s]');
const q = (k) => root.querySelector('[data-vw-' + k + ']');
const mqD = window.matchMedia ? window.matchMedia('(min-width: 901px)') : { matches: true };
const finePtr = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastPtr = 0; let curKey = 'all';
const pad = (n) => String(n).padStart(2, '0');
const setOpen = (row, open) => {row.classList.toggle('open', open);
const b = row.querySelector('.pj-hd');
if (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); }};
const fillVw = (r) => {const t = (k, v) => { const el = q(k); if (el) { el.textContent = v; } };
const vis = rows.filter((x) => !x.classList.contains('out'));
t('fig', r.getAttribute('data-fig') || '');
t('n', pad(vis.indexOf(r) + 1));
t('gh', r.getAttribute('data-n') || '');
t('t', pad(vis.length));
t('nm', (r.querySelector('.pj-nm') || {}).textContent || '');
t('ty', (r.querySelector('.pj-ty') || {}).textContent || '');
t('br', (r.querySelector('.pj-bf p') || {}).textContent || '');
const dos = q('do');
if (dos) { dos.innerHTML = Array.from(r.querySelectorAll('.pj-pg ul li')).map((li) => '<li>' + li.textContent + '</li>').join(''); }
const art = q('art'); const src = r.querySelector('.pj-ar svg');
if (art) { art.innerHTML = src ? src.outerHTML : ''; }
if (vw) { vw.classList.remove('sw'); void vw.offsetWidth; vw.classList.add('sw'); }};
let active = null;
const activate = (r, byUser) => {if (!r || r === active) { return; }
active = r;
rows.forEach((o) => { if (o !== r) { setOpen(o, false); } });
setOpen(r, true);
if (list) { list.classList.add('has-act'); }
if (mqD.matches) { fillVw(r); }};
const moveFi = () => {if (!fi) { return; }
const on = chips.find((c) => c.getAttribute('aria-pressed') === 'true');
if (!on) { return; }
fi.style.width = on.offsetWidth + 'px';
fi.style.transform = 'translate3d(' + on.offsetLeft + 'px,' + on.offsetTop + 'px,0)';
fi.style.height = on.offsetHeight + 'px';};
const apply = (key) => {curKey = key;
let n = 0; let first = null;
rows.forEach((r) => {const on = key === 'all' || (r.getAttribute('data-d') || '').split(' ').indexOf(key) !== -1;
r.classList.remove('ent');
r.classList.toggle('out', !on);
if (on) {r.style.setProperty('--n', String(n));
r.classList.add('rin');
void r.offsetWidth;
r.classList.add('ent');
if (!first) { first = r; }
n++;} else { setOpen(r, false); if (r === active) { active = null; } }});
const total = pad(rows.length);
if (cnt) { cnt.textContent = pad(n) + ' of ' + total + ' projects shown'; }
if (num) { num.textContent = pad(n); num.classList.remove('roll'); void num.offsetWidth; num.classList.add('roll'); }
if (bl) { bl.textContent = 'of ' + total + ' shown'; }
chips.forEach((c) => c.setAttribute('aria-pressed', c.getAttribute('data-f') === key ? 'true' : 'false'));
moveFi();
if (!rows.some((r) => r.classList.contains('open') && !r.classList.contains('out'))) {if (first) { if (active === first) { fillVw(first); } else { activate(first); } }}};
chips.forEach((c) => {const on = () => apply(c.getAttribute('data-f'));
c.addEventListener('click', on);
offs.push(() => c.removeEventListener('click', on));});
rows.forEach((r) => {const b = r.querySelector('.pj-hd');
if (!b) { return; }
const tg = () => {lastPtr = Date.now();
const open = !r.classList.contains('open');
rows.forEach((o) => { if (o !== r) { setOpen(o, false); } });
setOpen(r, open);};
const en = () => { lastPtr = Date.now(); };
const fc = () => { lastPtr = Date.now(); };
b.addEventListener('click', tg);
b.addEventListener('pointerenter', en);
b.addEventListener('pointermove', () => { lastPtr = Date.now(); }, { passive: true });
b.addEventListener('focus', fc);
offs.push(() => { b.removeEventListener('click', tg); b.removeEventListener('pointerenter', en); b.removeEventListener('focus', fc); });});
const onRz = () => { moveFi(); };
window.addEventListener('resize', onRz);
offs.push(() => window.removeEventListener('resize', onRz));
apply('all');
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(moveFi); }
if (vf && vs && finePtr && !reduceM) {let tx = 0; let ty = 0; let sx = 0; let sy = 0; let cx2 = 0; let cy2 = 0; let rx = 0; let ry = 0; let vraf = 0; let inside = false;
const vl = () => {rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12; sx += (cx2 - sx) * 0.2; sy += (cy2 - sy) * 0.2;
vf.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
vs.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0)';
if (inside || Math.abs(tx - rx) > 0.02 || Math.abs(ty - ry) > 0.02) { vraf = requestAnimationFrame(vl); } else { vraf = 0; }};
const vm = (e) => {const b = vf.getBoundingClientRect();
const px = (e.clientX - b.left) / b.width; const py = (e.clientY - b.top) / b.height;
cx2 = e.clientX - b.left; cy2 = e.clientY - b.top;
tx = (0.5 - py) * 7; ty = (px - 0.5) * 9; inside = true;
if (!vraf) { vraf = requestAnimationFrame(vl); }};
const vlv = () => { inside = false; tx = 0; ty = 0; if (!vraf) { vraf = requestAnimationFrame(vl); } };
vf.addEventListener('pointermove', vm, { passive: true }); vf.addEventListener('pointerleave', vlv);
vs.style.transform = 'translate3d(300px,200px,0)'; sx = cx2 = 300; sy = cy2 = 200;
offs.push(() => { vf.removeEventListener('pointermove', vm); vf.removeEventListener('pointerleave', vlv); cancelAnimationFrame(vraf); });}
const regScroll = (vh) => {rows.forEach((r) => {if (r.classList.contains('rin') || r.classList.contains('out')) { return; }
const t = r.getBoundingClientRect().top;
if (t < vh * 0.94) { r.style.setProperty('--rd', String(Math.max(0, rows.indexOf(r)) * 0)); r.classList.add('rin'); }});
if (reg && !reg.classList.contains('hin') && reg.getBoundingClientRect().top < vh * 0.7) { reg.classList.add('hin'); }};
const pv = root.querySelector('[data-pj-pv]');
if (pv && finePtr && !reduceM) {let cx = 0; let cy = 0; let x = 0; let y = 0; let raf2 = 0; let on = false; let bx = 0;
const loop = () => {const vy = cy - y;
x += (cx - x) * 0.08; y += vy * 0.14;
const ty2 = Math.max(84, Math.min(window.innerHeight - pv.offsetHeight - 24, y - pv.offsetHeight * 0.5));
pv.style.transform = 'translate3d(' + (bx + (x - bx) * 0.06).toFixed(1) + 'px,' + ty2.toFixed(1) + 'px,0) rotate(' + Math.max(-7, Math.min(7, vy * 0.05)).toFixed(2) + 'deg)';
if (on || Math.abs(cy - y) > 0.4 || Math.abs(cy - y) > 0.4) { raf2 = requestAnimationFrame(loop); } else { raf2 = 0; }};
rows.forEach((r) => {const b = r.querySelector('.pj-hd');
if (!b) { return; }
const en = (e) => {cx = e.clientX; cy = e.clientY; if (!on) { y = cy; const lr2 = list ? list.getBoundingClientRect() : { right: window.innerWidth }; bx = Math.max(20, lr2.right - pv.offsetWidth - 110); x = bx; }
const art = r.querySelector('.pj-ar svg');
pv.innerHTML = '<i>' + (r.getAttribute('data-fig') || '') + '</i>' + (art ? art.outerHTML : '');
on = true; pv.classList.add('on'); if (!raf2) { raf2 = requestAnimationFrame(loop); }};
const mv = (e) => { cx = e.clientX; cy = e.clientY; };
const lv = () => { on = false; pv.classList.remove('on'); };
b.addEventListener('pointerenter', en); b.addEventListener('pointermove', mv, { passive: true }); b.addEventListener('pointerleave', lv);
offs.push(() => { b.removeEventListener('pointerenter', en); b.removeEventListener('pointermove', mv); b.removeEventListener('pointerleave', lv); });});
const hide = () => { on = false; pv.classList.remove('on'); };
const chk = () => {if (!on) { return; }
const el = document.elementFromPoint(cx, cy);
if (!el || !el.closest || !el.closest('.pj-hd')) { hide(); }};
window.addEventListener('scroll', chk, { passive: true });
window.addEventListener('blur', hide);
document.addEventListener('pointerleave', hide);
offs.push(() => { cancelAnimationFrame(raf2); hide(); window.removeEventListener('scroll', chk); window.removeEventListener('blur', hide); document.removeEventListener('pointerleave', hide); });}
const rvs = Array.from(root.querySelectorAll('.pj-rv'));
const prSec = root.querySelector('#pj-process');
const trk = root.querySelector('[data-pj-trk]');
const stEls = Array.from(root.querySelectorAll('[data-st]'));
const secs = Array.from(root.querySelectorAll('[data-pj-sec]'));
const endEl = root.querySelector('[data-pj-end]');
if (endEl) {if ('IntersectionObserver' in window) {const eio = new IntersectionObserver((es) => { es.forEach((e) => { endEl.classList.toggle('off', !e.isIntersecting); }); }, { rootMargin: '120px' });
eio.observe(endEl); offs.push(() => eio.disconnect());}
const bt = endEl.querySelector('[data-pj-bt]');
if (bt) {const hot = (v) => () => { endEl.classList.toggle('hot', v); };
const hi = hot(true); const ho = hot(false);
bt.addEventListener('pointerenter', hi); bt.addEventListener('focus', hi); bt.addEventListener('pointerleave', ho); bt.addEventListener('blur', ho);
offs.push(() => { bt.removeEventListener('pointerenter', hi); bt.removeEventListener('focus', hi); bt.removeEventListener('pointerleave', ho); bt.removeEventListener('blur', ho); });
if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !(window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {let mx = 0; let my = 0; let cx3 = 0; let cy3 = 0; let mraf = 0;
const mloop = () => {cx3 += (mx - cx3) * 0.14; cy3 += (my - cy3) * 0.14;
bt.style.transform = 'translate3d(' + cx3.toFixed(1) + 'px,' + cy3.toFixed(1) + 'px,0)';
if (Math.abs(mx - cx3) > 0.1 || Math.abs(my - cy3) > 0.1) { mraf = requestAnimationFrame(mloop); } else { mraf = 0; }};
const mm = (e) => {const r = bt.getBoundingClientRect();
const ccx = r.left + r.width / 2 - cx3; const ccy = r.top + r.height / 2 - cy3;
const dx = e.clientX - ccx; const dy = e.clientY - ccy; const d = Math.hypot(dx, dy);
const R = r.width * 0.95;
if (d < R) { mx = dx * 0.32; my = dy * 0.32; } else { mx = 0; my = 0; }
if (!mraf) { mraf = requestAnimationFrame(mloop); }};
window.addEventListener('pointermove', mm, { passive: true });
offs.push(() => { window.removeEventListener('pointermove', mm); cancelAnimationFrame(mraf); });}}}
const qEl = root.querySelector('[data-pj-q]');
const qWs = qEl ? Array.from(qEl.querySelectorAll('.w')) : [];
let qLit = -1;
const lys = Array.from(root.querySelectorAll('.pj-ly'));
const scs = Array.from(root.querySelectorAll('[data-sc]'));
const nds = Array.from(root.querySelectorAll('[data-nd]'));
let lastAct = -2;
const procFrame = (vh) => {if (!mqD.matches) { lys.forEach((l) => { l.style.transform = ''; l.style.opacity = ''; l.classList.remove('act'); }); return; }
const pb = prSec.getBoundingClientRect();
const total = Math.max(1, pb.height - vh);
const pr = Math.max(0, Math.min(1, -pb.top / total));
const sp = pr * 5;
const act = Math.min(4, Math.floor(sp));
lys.forEach((l, i) => {const t = Math.max(0, Math.min(1, (sp - i + 0.45) / 0.9));
const e = 1 - Math.pow(1 - t, 3);
l.style.opacity = e.toFixed(3);
l.style.transform = 'translate3d(0,' + ((1 - e) * -190).toFixed(1) + 'px,0)';});
if (trk) { prSec.style.setProperty('--pp', pr.toFixed(3)); }
if (act !== lastAct) {lastAct = act;
lys.forEach((l, i) => { l.classList.toggle('act', i === act); });
scs.forEach((s, i) => { s.classList.toggle('on', i === act); s.classList.toggle('past', i < act); });
nds.forEach((n, i) => { n.classList.toggle('lit', i <= act); });}};
const marks = [root, reg];
const labels = ['PROJECTS', 'THE REGISTER', 'THE PROCESS', 'CLIENT WORDS', 'START'];
let curLab = -1; let ticking = false;
const frame = () => {ticking = false;
const vh = window.innerHeight;
const y = window.scrollY || document.documentElement.scrollTop || 0;
const max = Math.max(1, document.documentElement.scrollHeight - vh);
const pr = Math.min(1, y / max);
if (this._pjScroll) { this._pjScroll(y, vh); }
if (prog) { prog.style.setProperty('--p2', pr.toFixed(4)); }
if (fill) { fill.style.transform = 'scaleY(' + pr.toFixed(4) + ')'; }
regScroll(vh);
rvs.forEach((el) => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.9) { el.classList.add('in'); } });
if (endEl && !endEl.classList.contains('go') && endEl.getBoundingClientRect().top < vh * 0.7) { endEl.classList.add('go'); }
if (prSec) { procFrame(vh); }
if (qEl && qWs.length) {const qb = qEl.getBoundingClientRect();
const qp = Math.max(0, Math.min(1, (vh * 0.82 - qb.top) / (vh * 0.5 + qb.height * 0.4)));
const n = Math.round(qp * qWs.length * 1.04);
if (n !== qLit) { qLit = n; qWs.forEach((w, i) => { w.classList.toggle('lit', i < n); }); }}
items.forEach((el) => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.92) { el.classList.add('in'); } });
let li = 0;
if (reg && reg.getBoundingClientRect().top < vh * 0.5) { li = 1; }
secs.forEach((s, k) => { if (s.getBoundingClientRect().top < vh * 0.5) { li = 2 + k; } });
if (li !== curLab && lab) { curLab = li; lab.textContent = '04 / 06 ' + labels[li]; }};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
frame();
offs.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });
this._pjOff = () => { offs.forEach((fn) => { try { fn(); } catch (e) {} }); };}
paApproach() {const root = this.$q('[data-pa-root]');
if (!root) { return; }
const offs = [];
const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const finePtr = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
const hero = root.querySelector('[data-ap-hero]');
const prog = root.querySelector('[data-prog]');
const fill = root.querySelector('[data-hudfill]');
const lab = root.querySelector('[data-hudlab]');
const rvs = Array.from(root.querySelectorAll('[data-rv],[data-ck]'));
const pcs = Array.from(root.querySelectorAll('[data-pc]'));
const hz = root.querySelector('[data-hz]'), pl = root.querySelector('[data-hzt]'), hbf = root.querySelector('[data-hzf]') && root.querySelector('[data-hzf]').parentNode;
const secs = Array.from(root.querySelectorAll('[data-ap-sec]'));
const endEl = root.querySelector('[data-ap-end]');
if (hero) { hero.classList.remove('go'); setTimeout(() => { hero.classList.add('go'); }, 120); }
rvs.forEach((el) => el.classList.remove('in'));
if (endEl) { endEl.classList.remove('go'); }
const cvw = root.querySelector('[data-ap-cv]');
if (cvw) {const card = cvw.querySelector('[data-cv-card]');
const chips = Array.from(cvw.querySelectorAll('[data-sc]'));
const capn = cvw.querySelector('[data-ap-capn]'); const capt = cvw.querySelector('[data-ap-capt]'); const cap = cvw.querySelector('[data-ap-cap]');
const names = ['Decide', 'Structure', 'Style', 'Fill', 'Measure'];
const caps = ['Write down the goal, the audience and how we will measure it.', 'Lay out the pages and the parts they are made from.', 'Add type, colour and the rules that hold them together.', 'Bring in the words, images and film that say it.', 'Launch, read the numbers and keep improving.'];
let cur = -1; let prog = 0; let hov = false; let vis = true; let last = 0; let raf = 0;
const DUR = 2200;
const show = (k) => {if (k === cur) { return; }
cur = k; prog = 0;
card.className = 'ap-cv ' + [0, 1, 2, 3, 4].filter((n) => n <= k).map((n) => 's' + n).join(' ');
chips.forEach((c, i) => { c.classList.toggle('on', i === k); c.classList.toggle('done', i < k); c.style.removeProperty('--p'); });
if (capn) { capn.textContent = String(k + 1).padStart(2, '0') + ' ' + names[k]; }
if (capt) { capt.textContent = caps[k]; }
if (cap) { cap.classList.remove('sw'); void cap.offsetWidth; cap.classList.add('sw'); }};
chips.forEach((c, i) => {const go = () => { show(i); };
c.addEventListener('click', go);
offs.push(() => c.removeEventListener('click', go));});
const hi = () => { hov = true; }; const ho = () => { hov = false; };
cvw.addEventListener('pointerenter', hi); cvw.addEventListener('pointerleave', ho);
offs.push(() => { cvw.removeEventListener('pointerenter', hi); cvw.removeEventListener('pointerleave', ho); });
if ('IntersectionObserver' in window) {const vio = new IntersectionObserver((es) => { es.forEach((e) => { vis = e.isIntersecting; }); });
vio.observe(cvw); offs.push(() => vio.disconnect());}
show(0);
if (!reduce) {const tick = (t) => {raf = requestAnimationFrame(tick);
const dt = Math.min(80, t - last); last = t;
if (!hov && vis && !document.hidden) {prog += dt / DUR;
if (prog >= 1) { if (cur === 4) { show(0); } else { show(cur + 1); } }}
const c = chips[cur]; if (c) { c.style.setProperty('--p', Math.min(1, prog).toFixed(3)); }};
const t0 = setTimeout(() => { last = performance.now(); raf = requestAnimationFrame(tick); }, 1800);
offs.push(() => { clearTimeout(t0); cancelAnimationFrame(raf); });} else { show(4); }
if (finePtr && !reduce) {let tx = 0; let ty = 0; let rx = 0; let ry = 0; let tr = 0;
const loop = () => {rx += (tx - rx) * 0.1; ry += (ty - ry) * 0.1;
card.style.transform = 'perspective(1400px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
if (Math.abs(tx - rx) > 0.02 || Math.abs(ty - ry) > 0.02) { tr = requestAnimationFrame(loop); } else { tr = 0; }};
const mv = (e) => { const b = card.getBoundingClientRect(); tx = (0.5 - (e.clientY - b.top) / b.height) * 6; ty = ((e.clientX - b.left) / b.width - 0.5) * 8; if (!tr) { tr = requestAnimationFrame(loop); } };
const lv = () => { tx = 0; ty = 0; if (!tr) { tr = requestAnimationFrame(loop); } };
card.addEventListener('pointermove', mv, { passive: true }); card.addEventListener('pointerleave', lv);
offs.push(() => { card.removeEventListener('pointermove', mv); card.removeEventListener('pointerleave', lv); cancelAnimationFrame(tr); });}}
if (endEl) {if ('IntersectionObserver' in window) {const eio = new IntersectionObserver((es) => { es.forEach((e) => { endEl.classList.toggle('off', !e.isIntersecting); }); }, { rootMargin: '120px' });
eio.observe(endEl); offs.push(() => eio.disconnect());}
const bt = endEl.querySelector('[data-ap-bt]');
if (bt) {const hi = () => { endEl.classList.add('hot'); }; const ho = () => { endEl.classList.remove('hot'); };
bt.addEventListener('pointerenter', hi); bt.addEventListener('focus', hi); bt.addEventListener('pointerleave', ho); bt.addEventListener('blur', ho);
offs.push(() => { bt.removeEventListener('pointerenter', hi); bt.removeEventListener('focus', hi); bt.removeEventListener('pointerleave', ho); bt.removeEventListener('blur', ho); });
if (finePtr && !reduce) {let mx = 0; let my = 0; let cx = 0; let cy = 0; let raf = 0;
const loop = () => {cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
bt.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) { raf = requestAnimationFrame(loop); } else { raf = 0; }};
const mm = (e) => {const r = bt.getBoundingClientRect();
const ox = r.left + r.width / 2 - cx; const oy = r.top + r.height / 2 - cy;
const dx = e.clientX - ox; const dy = e.clientY - oy;
if (Math.hypot(dx, dy) < r.width * 0.95) { mx = dx * 0.32; my = dy * 0.32; } else { mx = 0; my = 0; }
if (!raf) { raf = requestAnimationFrame(loop); }};
window.addEventListener('pointermove', mm, { passive: true });
offs.push(() => { window.removeEventListener('pointermove', mm); cancelAnimationFrame(raf); });}}}
if ('IntersectionObserver' in window) {const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
rvs.forEach((el) => rio.observe(el));
offs.push(() => rio.disconnect());}
const labels = ['APPROACH', 'PRINCIPLES', 'WORKING WITH US', 'WHAT WE LEAVE OUT', 'START'];
let curLab = -1; let ticking = false;
const frame = () => {ticking = false;
const vh = window.innerHeight;
const y = window.scrollY || document.documentElement.scrollTop || 0;
const max = Math.max(1, document.documentElement.scrollHeight - vh);
const pr = Math.min(1, y / max);
if (prog) { prog.style.setProperty('--p2', pr.toFixed(4)); }
if (fill) { fill.style.transform = 'scaleY(' + pr.toFixed(4) + ')'; }
rvs.forEach((el) => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.9) { el.classList.add('in'); } });
if (endEl && !endEl.classList.contains('go') && endEl.getBoundingClientRect().top < vh * 0.7) { endEl.classList.add('go'); }
if (hz && pl) {const mob = window.innerWidth <= 900;
if (mob) { pl.style.transform = ''; pcs.forEach((el) => el.classList.add('cur')); }
else {const r = hz.getBoundingClientRect();
const tot = Math.max(1, hz.offsetHeight - vh);
const hp = Math.max(0, Math.min(1, -r.top / tot));
const max = Math.max(0, pl.scrollWidth - window.innerWidth + 0.08 * window.innerWidth);
pl.style.transform = 'translate3d(' + (-hp * max).toFixed(1) + 'px,0,0)';
if (hbf) { hbf.style.setProperty('--hp', hp.toFixed(4)); }
const idx = Math.min(pcs.length - 1, Math.round(hp * (pcs.length - 1)));
pcs.forEach((el, i) => el.classList.toggle('cur', i === idx));}}
let li = 0;
secs.forEach((s, k) => { if (s.getBoundingClientRect().top < vh * 0.5) { li = k + 1; } });
if (li !== curLab && lab) { curLab = li; lab.textContent = '05 / 06 ' + labels[li]; }};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
frame();
offs.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });
this._apOff = () => { offs.forEach((fn) => { try { fn(); } catch (e) {} }); };}
paContact() {const root = this.$q('[data-pa-root]');
if (!root) { return; }
const offs = [];
const hero = root.querySelector('[data-ct-hero]');
const prog = root.querySelector('[data-prog]');
const fill = root.querySelector('[data-hudfill]');
const lab = root.querySelector('[data-hudlab]');
const cks = Array.from(root.querySelectorAll('[data-ck]'));
const secs = Array.from(root.querySelectorAll('[data-ct-sec]'));
if (hero) { hero.classList.remove('go'); setTimeout(() => { hero.classList.add('go'); }, 120); }
cks.forEach((el) => el.classList.remove('in'));
if ('IntersectionObserver' in window) {const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
cks.forEach((el) => rio.observe(el));
const hio = new IntersectionObserver((es) => es.forEach((e) => { if (hero) { hero.classList.toggle('off', !e.isIntersecting); } }));
if (hero) { hio.observe(hero); }
offs.push(() => { rio.disconnect(); hio.disconnect(); });} else { cks.forEach((el) => el.classList.add('in')); }
const form = root.querySelector('[data-ct-form]');
const q = (s) => root.querySelector(s);
const ringEl = q('[data-ct-ring]'), pct = q('[data-ct-pct]'), tk = q('[data-ct-tk]');
const out = { need: q('[data-ct-o-need]'), budget: q('[data-ct-o-budget]'), time: q('[data-ct-o-time]'), from: q('[data-ct-o-from]'), msg: q('[data-ct-o-msg]') };
const done = q('[data-ct-done]'), err = q('[data-ct-err]'), copyBtn = q('[data-ct-copy]');
const MAIL = '';
let brief = '';
const set = (el, v) => { if (!el) { return; } el.textContent = v || '—'; el.classList.toggle('on', !!v); };
const vals = () => {const need = Array.from(root.querySelectorAll('input[name=need]:checked')).map((i) => i.value);
const pick = (n) => { const i = root.querySelector('input[name=' + n + ']:checked'); return i ? i.value : ''; };
return { need, budget: pick('budget'), time: pick('time'), name: q('[data-ct-name]').value.trim(), email: q('[data-ct-email]').value.trim(), company: q('[data-ct-company]').value.trim(), msg: q('[data-ct-msg]').value.trim() };};
const okMail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const update = () => {const v = vals();
const n = (v.need.length ? 1 : 0) + (v.budget ? 1 : 0) + (v.time ? 1 : 0) + (v.name ? 1 : 0) + (okMail(v.email) ? 1 : 0) + (v.msg ? 1 : 0);
const p = n / 6;
if (ringEl) { ringEl.style.setProperty('--cp', p.toFixed(3)); }
if (pct) { pct.textContent = Math.round(p * 100) + '%'; }
set(out.need, v.need.join(', ')); set(out.budget, v.budget); set(out.time, v.time);
set(out.from, [v.name, v.company].filter(Boolean).join(', ') + (v.email ? (v.name || v.company ? ' · ' : '') + v.email : ''));
set(out.msg, v.msg.length > 140 ? v.msg.slice(0, 140) + '…' : v.msg);
if (done && !done.hidden) { done.hidden = true; }
return v;};
if (form) {form.addEventListener('input', update); form.addEventListener('change', update);
form.addEventListener('submit', (e) => {e.preventDefault();
const v = update();
if (!v.name) { err.textContent = 'Add your name so we know who to reply to.'; q('[data-ct-name]').focus(); return; }
if (!okMail(v.email)) { err.textContent = 'Add a valid email address so we can reply.'; q('[data-ct-email]').focus(); return; }
if (!v.need.length && !v.msg) { err.textContent = 'Pick what you need or write a line about the project.'; return; }
err.textContent = '';
brief = ['New project brief', '', 'Needs: ' + (v.need.join(', ') || '-'), 'Budget: ' + (v.budget || '-'), 'Timing: ' + (v.time || '-'), 'Name: ' + v.name, 'Company: ' + (v.company || '-'), 'Email: ' + v.email, '', v.msg || ''].join('\n');
if (MAIL) { window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Project brief from ' + v.name) + '&body=' + encodeURIComponent(brief); }
done.hidden = false;
if (tk && tk.scrollIntoView && window.innerWidth <= 900) { tk.scrollIntoView({ behavior: 'smooth', block: 'center' }); }});
update();}
if (copyBtn) {const cp = () => {const fin = () => { copyBtn.textContent = 'Copied'; setTimeout(() => { copyBtn.textContent = 'Copy brief'; }, 1800); };
if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(brief).then(fin, fin); } else { fin(); }};
copyBtn.addEventListener('click', cp); offs.push(() => copyBtn.removeEventListener('click', cp));}
root.querySelectorAll('[data-ct-q]').forEach((b) => {const t = () => { const open = b.getAttribute('aria-expanded') === 'true'; root.querySelectorAll('[data-ct-q]').forEach((x) => x.setAttribute('aria-expanded', 'false')); b.setAttribute('aria-expanded', open ? 'false' : 'true'); };
b.addEventListener('click', t); offs.push(() => b.removeEventListener('click', t));});
const labels = ['CONTACT', 'YOUR BRIEF', 'WHAT HAPPENS NEXT', 'BEFORE YOU ASK', 'START'];
let curLab = -1; let ticking = false;
const frame = () => {ticking = false;
const vh = window.innerHeight;
const y = window.scrollY || document.documentElement.scrollTop || 0;
const max = Math.max(1, document.documentElement.scrollHeight - vh);
const pr = Math.min(1, y / max);
if (prog) { prog.style.setProperty('--p2', pr.toFixed(4)); }
if (fill) { fill.style.transform = 'scaleY(' + pr.toFixed(4) + ')'; }
let li = 0;
secs.forEach((s, k) => { if (s.getBoundingClientRect().top < vh * 0.5) { li = k + 1; } });
if (li !== curLab && lab) { curLab = li; lab.textContent = '06 / 06 ' + labels[li]; }};
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
frame();
offs.push(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); });
this._ctOff = () => { offs.forEach((fn) => { try { fn(); } catch (e) {} }); };}
paDust() { }
paGyro() {if (this._gyroOff) { this._gyroOff(); }
const coarse = (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) || (navigator.maxTouchPoints || 0) > 0;
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const G = window.__gyro = { x: 0, y: 0, on: false };
if (!coarse || reduce || typeof window.DeviceOrientationEvent === 'undefined') { return; }
let want = true; try { want = localStorage.getItem('pa-gyro') !== '0'; } catch (e) {}
const needPerm = typeof window.DeviceOrientationEvent.requestPermission === 'function';
let oriReal = false; let fbT = 0; let listening = false; let granted = !needPerm; let base = null; let tx = 0; let ty = 0; let cx = 0; let cy = 0; let raf = 0; let tgt = []; let tgtAt = 0; let gotData = false;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const targets = (now) => {if (now - tgtAt < 700 && tgt.length) { return tgt; }
tgtAt = now; tgt = [];
document.querySelectorAll('.hx-pent').forEach((el) => tgt.push({ el: el, k: 'p' }));
document.querySelectorAll('.hx-mq').forEach((el) => tgt.push({ el: el, k: 'm' }));
document.querySelectorAll('[data-route] h1').forEach((h) => {if (!h.offsetParent) { return; }
tgt.push({ el: h, k: 'h' });
let a = h;
for (let i = 0; i < 3 && a.parentElement; i++) {a = a.parentElement; let hit = false;
for (let j = 0; j < a.children.length; j++) {const c = a.children[j]; if (c.contains(h) || /bg$/.test(String(c.className))) { continue; }
const b = c.getBoundingClientRect();
if (b.width > 150 && b.height > 120) { tgt.push({ el: c, k: 'v' }); hit = true; if (a.style.perspective !== '1100px') { a.style.perspective = '1100px'; } }}
if (hit) { break; }}});
document.querySelectorAll('[data-glow]').forEach((el) => tgt.push({ el: el, k: 'g' }));
document.querySelectorAll('.hh-p').forEach((el) => { if (el.offsetParent) { tgt.push({ el: el, k: 'q' }); } });
document.querySelectorAll('.st-cd .st-tilt').forEach((el) => tgt.push({ el: el, k: 't' }));
return tgt;};
const apply = (now) => {const L = targets(now); const x = cx; const y = cy;
for (let i = 0; i < L.length; i++) {const o = L[i]; const s = o.el.style;
if (o.k === 'p') { s.translate = (x * 18).toFixed(1) + 'px ' + (y * 14).toFixed(1) + 'px'; }
else if (o.k === 'v') { const m = Math.hypot(x, y); s.rotate = m > 0.002 ? ((-y).toFixed(3) + ' ' + x.toFixed(3) + ' 0 ' + (m * 7).toFixed(2) + 'deg') : ''; }
else if (o.k === 'g') { s.translate = (x * 36).toFixed(1) + 'px ' + (y * 24).toFixed(1) + 'px'; }
else if (o.k === 'q') { s.translate = (-x * 3).toFixed(1) + 'px ' + (-y * 2).toFixed(1) + 'px'; }
else if (o.k === 'h') { s.translate = (-x * 5).toFixed(1) + 'px ' + (-y * 3).toFixed(1) + 'px'; }
else if (o.k === 'm') { s.translate = (-x * 26).toFixed(1) + 'px ' + (-y * 8).toFixed(1) + 'px'; }
else if (!o.el.parentNode.classList.contains('lift') && !o.el.parentNode.classList.contains('spin')) {s.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); s.setProperty('--ry', (x * 9).toFixed(2) + 'deg');}}};
const clear = () => {tgtAt = 0; targets(performance.now()).forEach((o) => { if (o.k === 't') { o.el.style.removeProperty('--rx'); o.el.style.removeProperty('--ry'); } else { o.el.style.translate = ''; o.el.style.rotate = ''; } });};
const frame = (now) => {raf = 0;
cx += (tx - cx) * 0.085; cy += (ty - cy) * 0.085;
G.vx = cx - (G.x || 0); G.vy = cy - (G.y || 0);
G.x = cx; G.y = cy; apply(now);
if (ico) { ico.style.transform = 'rotate(' + (cx * 38).toFixed(1) + 'deg)'; }
if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) { raf = requestAnimationFrame(frame); } else { G.vx = 0; G.vy = 0; }};
const kick = () => { if (!raf && !document.hidden) { raf = requestAnimationFrame(frame); } };
const onOri = (e) => {if (!want || e.gamma == null || e.beta == null) { return; }
if (!e.fromMotion) { oriReal = true; }
gotData = true; hideChip();
const a = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0);
let rx = e.gamma; let ry = e.beta;
if (a === 90) { rx = e.beta; ry = -e.gamma; } else if (a === 270 || a === -90) { rx = -e.beta; ry = e.gamma; } else if (a === 180) { rx = -e.gamma; ry = -e.beta; }
if (!base) { base = { x: rx, y: ry }; }
base.x += (rx - base.x) * 0.012; base.y += (ry - base.y) * 0.012;
const dz = (v) => { const a = Math.abs(v); return a < 0.05 ? 0 : Math.sign(v) * (a - 0.05) / 0.95; };
tx = dz(clamp((rx - base.x) / 16, -1, 1)); ty = dz(clamp((ry - base.y) / 16, -1, 1));
if (!granted) { granted = true; paint(true); }
G.on = true; kick();};
const onMot = (e) => {if (oriReal) { return; }
const a = e.accelerationIncludingGravity; if (!a || a.x == null || a.y == null || a.z == null) { return; }
const g = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z); if (!(g > 5)) { return; }
const sgn = /iP(hone|ad|od)/.test(navigator.userAgent) ? 1 : -1;
onOri({ gamma: sgn * Math.asin(Math.max(-1, Math.min(1, a.x / g))) * 57.2958, beta: sgn * Math.asin(Math.max(-1, Math.min(1, a.y / g))) * 57.2958, fromMotion: true });};
const listen = () => { if (listening) { return; } listening = true; window.addEventListener('deviceorientation', onOri, { passive: true }); window.addEventListener('deviceorientationabsolute', onOri, { passive: true }); window.addEventListener('devicemotion', onMot, { passive: true }); };
const unlisten = () => { if (!listening) { return; } listening = false; window.removeEventListener('deviceorientation', onOri); window.removeEventListener('deviceorientationabsolute', onOri); window.removeEventListener('devicemotion', onMot); };
let inFrame = false; try { inFrame = window.self !== window.top; } catch (e) { inFrame = true; }
let permAsked = false; let chip = null;
const SITE = 'https://pentarch-site-pentarch.vercel.app';
const hideChip = () => { if (chip && chip.parentNode) { chip.parentNode.removeChild(chip); } chip = null; };
const showChip = (kind) => {hideChip();
if (!document.getElementById('pa-gyro-chip-css')) {const st = document.createElement('style'); st.id = 'pa-gyro-chip-css';
st.textContent = '#pa-gyro-chip{position:fixed;z-index:171;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));width:min(calc(100vw - 32px),372px);box-sizing:border-box;display:grid;grid-template-columns:auto 1fr;gap:4px 14px;align-items:center;padding:16px 16px 16px 16px;border-radius:24px;background:linear-gradient(160deg,rgba(34,44,68,.96),rgba(17,21,34,.97));border:1px solid rgba(143,180,255,.28);box-shadow:0 24px 60px -12px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03) inset,0 1px 0 rgba(255,255,255,.07) inset;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);color:#DCE3EF;opacity:0;translate:-50% 18px;animation:paGcIn .7s cubic-bezier(.2,.9,.2,1) .05s forwards}'
+ '@keyframes paGcIn{to{opacity:1;translate:-50% 0}}'
+ '#pa-gyro-chip .ic{grid-row:1 / span 2;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,rgba(143,180,255,.30),rgba(143,180,255,.06));border:1px solid rgba(143,180,255,.35);color:#8FB4FF}'
+ '#pa-gyro-chip .ic svg{width:28px;height:28px;overflow:visible}#pa-gyro-chip .ph{transform-origin:12px 12px;animation:paGcRock 2.8s ease-in-out infinite}'
+ '@keyframes paGcRock{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(16deg)}}'
+ '#pa-gyro-chip .t{margin:0;font:600 16px/1.25 "Space Grotesk",system-ui,sans-serif;letter-spacing:-.01em;color:#EEF2F9;padding-right:26px}'
+ '#pa-gyro-chip .d{margin:0;font:400 13px/1.45 "Space Grotesk",system-ui,sans-serif;color:#98A9C4}'
+ '#pa-gyro-chip .row{grid-column:1 / -1;display:flex;gap:10px;margin-top:12px}'
+ '#pa-gyro-chip .go{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border:0;border-radius:999px;background:#DCE3EF;color:#111522;font:600 12px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}'
+ '#pa-gyro-chip .go:active{transform:scale(.98)}'
+ '#pa-gyro-chip .no{min-height:44px;padding:0 16px;border:1px solid rgba(152,169,196,.3);border-radius:999px;background:transparent;color:#98A9C4;font:500 12px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent}'
+ '#pa-gyro-chip .x{position:absolute;top:8px;right:8px;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:#536684;font-size:20px;line-height:1;cursor:pointer;display:grid;place-items:center}'
+ '@media (prefers-reduced-motion:reduce){#pa-gyro-chip{animation-duration:.01s}#pa-gyro-chip .ph{animation:none}}';
document.head.appendChild(st);}
const T = { perm: ['Tilt to explore', 'Move your phone and the page leans with you.'], frame: ['Motion needs the full site', 'This preview blocks your phone’s motion sensors.'], blocked: ['Motion is switched off', 'Allow motion sensors for this site in your browser settings.'] }[kind];
chip = document.createElement('div'); chip.id = 'pa-gyro-chip'; chip.setAttribute('role', 'status');
chip.innerHTML = '<div class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><g class="ph"><rect x="7.5" y="3.5" width="9" height="17" rx="2.2" fill="currentColor" fill-opacity=".14"/><path d="M11 17.6h2"/></g><path d="M3 8.5a10 10 0 0 1 2.2-3.4M21 15.5a10 10 0 0 1-2.2 3.4" opacity=".6"/></svg></div><p class="t"></p><p class="d"></p><button class="x" type="button" aria-label="Dismiss">×</button>';
chip.querySelector('.t').textContent = T[0]; chip.querySelector('.d').textContent = T[1];
const row = document.createElement('div'); row.className = 'row';
if (kind === 'perm') { const b = document.createElement('button'); b.type = 'button'; b.className = 'go'; b.textContent = 'Enable motion'; b.addEventListener('click', (e) => { e.stopPropagation(); enable(); }); row.appendChild(b); }
else if (kind === 'frame') { const a = document.createElement('a'); a.className = 'go'; a.href = SITE; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Open full site'; row.appendChild(a); }
const n = document.createElement('button'); n.type = 'button'; n.className = 'no'; n.textContent = kind === 'blocked' ? 'Got it' : 'Not now'; if (kind === 'blocked') { n.style.flex = '1'; }
n.addEventListener('click', (e) => { e.stopPropagation(); hideChip(); }); row.appendChild(n);
chip.appendChild(row);
chip.querySelector('.x').addEventListener('click', (e) => { e.stopPropagation(); hideChip(); });
document.body.appendChild(chip);};
const check = () => {if (!want || gotData) { return; }
if (needPerm && !permAsked) { showChip('perm'); } else if (inFrame) { showChip('frame'); } else { showChip('blocked'); }};
const ask = () => {if (!needPerm) { granted = true; return Promise.resolve(true); }
if (granted) { return Promise.resolve(true); }
permAsked = true; return window.DeviceOrientationEvent.requestPermission().then(() => { granted = true; return true; }).catch(() => { granted = true; return true; });};
const enable = () => { want = true; base = null; gotData = false; oriReal = false; return ask().then((ok) => { if (ok) { listen(); } else { want = false; } paint(ok); if (ok) { clearTimeout(fbT); fbT = setTimeout(check, 2400); } return ok; }); };
const disable = () => { want = false; clearTimeout(fbT); hideChip(); unlisten(); tx = ty = 0; cx = cy = 0; G.on = false; G.x = G.y = 0; clear(); paint(false); };
let btn = document.getElementById('pa-gyro');
if (!btn) {const st = document.createElement('style'); st.id = 'pa-gyro-css';
st.textContent = '#pa-gyro{position:fixed;z-index:170;width:46px;height:46px;border-radius:50%;border:1px solid rgba(152,169,196,.35);background:rgba(17,21,34,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#DCE3EF;display:grid;place-items:center;cursor:pointer;padding:0;bottom:clamp(16px,2vw,28px);transition:border-color .3s,color .3s;-webkit-tap-highlight-color:transparent}#pa-gyro svg{width:21px;height:21px;overflow:visible}#pa-gyro .o{opacity:.45;transition:opacity .3s}#pa-gyro[aria-pressed="true"]{color:#8FB4FF;border-color:rgba(143,180,255,.6)}#pa-gyro[aria-pressed="true"] .o{opacity:1}';
document.head.appendChild(st);
btn = document.createElement('button'); btn.id = 'pa-gyro'; btn.type = 'button'; btn.setAttribute('aria-label', 'Motion tilt');
btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="6" width="8" height="12" rx="1.8" transform="rotate(-14 12 12)" fill="currentColor" fill-opacity=".15"/><path class="o" d="M3.5 9.5a9 9 0 0 1 3-4M20.5 14.5a9 9 0 0 1-3 4"/></svg>';
document.body.appendChild(btn);}
const ico = btn.querySelector('svg');
function paint(ok) { const v = want && ok !== false; btn.setAttribute('aria-pressed', v ? 'true' : 'false'); btn.title = v ? 'Tilt on' : 'Tilt off'; }
const place = () => {const s = null; const t = document.querySelector('[data-themebtn]'); const r = s && s.getBoundingClientRect().width ? s.getBoundingClientRect() : (t && t.getBoundingClientRect());
if (!r || !r.width) { return; }
if (window.innerWidth >= 900) { btn.style.left = Math.round(r.right + 10) + 'px'; btn.style.right = 'auto'; }
else { btn.style.left = 'auto'; btn.style.right = Math.round(window.innerWidth - r.left + 10) + 'px'; }};
const onBtn = (e) => { e.stopPropagation(); const v = btn.getAttribute('aria-pressed') === 'true'; if (v && !gotData) { enable(); return; } if (v) { try { localStorage.setItem('pa-gyro', '0'); } catch (er) {} disable(); } else { try { localStorage.setItem('pa-gyro', '1'); } catch (er) {} enable(); } };
btn.addEventListener('click', onBtn);
place(); setTimeout(place, 800); setTimeout(place, 2000); window.addEventListener('resize', place);
paint(true);
const TAP = ['click', 'touchend', 'pointerup'];
const firstTap = (e) => {if (e && e.target && e.target.closest && e.target.closest('#pa-gyro')) { return; }
TAP.forEach((t) => document.removeEventListener(t, firstTap, true));
if (want) { enable(); }};
if (want) { fbT = setTimeout(check, 1800); listen(); if (!needPerm) { enable(); } else { TAP.forEach((t) => document.addEventListener(t, firstTap, true)); } } else { paint(false); }
const vis = () => { if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } } else { kick(); } };
document.addEventListener('visibilitychange', vis);
const rot = () => { base = null; };
const hc = () => { [300, 900, 1800].forEach((d) => setTimeout(() => { tgtAt = 0; if (G.on) { apply(performance.now()); } }, d)); };
window.addEventListener('hashchange', hc);
window.addEventListener('orientationchange', rot);
this._gyroOff = () => { clearTimeout(fbT); hideChip(); unlisten(); if (raf) { cancelAnimationFrame(raf); } TAP.forEach((t) => document.removeEventListener(t, firstTap, true)); document.removeEventListener('visibilitychange', vis); window.removeEventListener('orientationchange', rot); window.removeEventListener('hashchange', hc); window.removeEventListener('resize', place); btn.removeEventListener('click', onBtn); clear(); window.__gyro = { x: 0, y: 0, on: false }; };}
paRouter() {const doc = document;
try { if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } } catch (e) {}
try { if (location.hash) { history.replaceState(null, '', location.pathname + location.search); } } catch (e) {}
try { window.scrollTo(0, 0); doc.documentElement.scrollTop = 0; doc.body.scrollTop = 0; } catch (e) {}
const toTop = () => { try { window.scrollTo(0, 0); } catch (e) {} };
const T0 = Date.now(); const WD = window.__PA_WD || 25000; let healed = false; let healT = 0;
const heal = () => {if (healed || document.visibilityState !== 'visible' || (Date.now() - T0) < WD) { return; }
healed = true;
try { const tl = this._loadTl; if (tl && tl.progress() < 1) { tl.progress(1, false); } } catch (e) {}
try { const it = this._intro; if (it && it.progress() < 1) { it.progress(1, false); } } catch (e) {}
try { document.documentElement.style.overflow = ''; document.documentElement.style.paddingRight = ''; window.__paBusy = false; } catch (e) {}
try { const ld = doc.querySelector('[data-ld="root"]'); if (ld && (Date.now() - T0) >= WD) { ld.style.display = 'none'; } } catch (e) {}};
const refreshSoon = () => { clearTimeout(refreshSoon.t); refreshSoon.t = setTimeout(() => { try { if (window.ScrollTrigger) { window.ScrollTrigger.refresh(); } } catch (e) {} }, 350); };
const onVis = () => { if (document.visibilityState === 'visible') { heal(); refreshSoon(); } };
const onShow = (e) => { if (e && e.persisted) { heal(); refreshSoon(); } };
healT = setTimeout(heal, WD + 500);
window.addEventListener('beforeunload', toTop); window.addEventListener('pageshow', onShow); doc.addEventListener('visibilitychange', onVis);
const PAGES = { home: ['Pentarch', '01', 'Pentarch'], studio: ['About', '02', 'Pentarch — About'], services: ['Services', '03', 'Pentarch — Services'], projects: ['Projects', '04', 'Pentarch — Projects'], approach: ['Approach', '05', 'Pentarch — Approach'], contact: ['Contact', '06', 'Pentarch — Contact'] };
const PATHS = doc.documentElement.hasAttribute('data-paths');
const URLS = { home: '/', studio: '/about', services: '/services', projects: '/projects', approach: '/approach', contact: '/contact' };
const fromPath = (p) => { const m = /^\/(about|studio|services|projects|approach|contact)(?:\.html)?\/?$/.exec(p || ''); return m ? (m[1] === 'about' ? 'studio' : m[1]) : 'home'; };
const META = window.__PA_META || {};
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ov = doc.getElementById('pa-pt');
if (ov) { ov.classList.remove('boot'); ov.className = ''; }
const ctx = this._ctx;
const fitWm = () => {doc.querySelectorAll('[data-wm]').forEach((el) => {const host = el.closest('[data-route]');
if (host && !host.classList.contains('act')) { return; }
const inner = el.querySelector('.shimxl') || el;
const node = inner.firstChild;
if (!node || !el.clientWidth) { return; }
const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
if (inner !== el && inner.style.display !== 'inline-block') { inner.style.display = 'inline-block'; }
const tw = inner.getBoundingClientRect().width;
if (!tw) { return; }
const target = el.clientWidth * 0.975;
const nf = Math.max(40, Math.min(fs * target / tw, el.clientWidth * 0.26));
if (Math.abs(nf - fs) > 0.5) { el.style.fontSize = nf.toFixed(2) + 'px'; }});};
this._fitWm = fitWm;
window.addEventListener('resize', () => { requestAnimationFrame(fitWm); });
if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(() => { fitWm(); }); }
setTimeout(fitWm, 400); setTimeout(fitWm, 1500);
const box = (k) => doc.querySelector('[data-route="' + k + '"]');
let cur = 'home';
let busy = false;
const setT = (name, sheet) => {if (!ov) { return; }
ov.querySelector('[data-ptn]').textContent = sheet + ' / 06';
ov.querySelector('[data-ptt]').innerHTML = name.split('').map((ch, i) => '<b style="--l:' + i + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</b>').join('');};
const stop = (k) => {const c = ctx[k];
if (k === 'studio' && c._stOff) { try { c._stOff(); } catch (e) {} c._stOff = null; }
if (k === 'services' && c._svOff) { try { c._svOff(); } catch (e) {} c._svOff = null; }
if (k === 'approach' && c._apOff) { try { c._apOff(); } catch (e) {} c._apOff = null; }
if (k === 'contact' && c._ctOff) { try { c._ctOff(); } catch (e) {} c._ctOff = null; }
if (k === 'projects' && c._pjOff) { try { c._pjOff(); } catch (e) {} c._pjOff = null; }
const b = box(k);
if (b && k !== 'home') {b.querySelectorAll('.st-l.in').forEach((el) => el.classList.remove('in'));
b.querySelectorAll('.pj-row.open').forEach((el) => el.classList.remove('open'));
b.querySelectorAll('[data-svc].on').forEach((el) => el.classList.remove('on'));}};
const syncTheme = () => {const light = doc.documentElement.getAttribute('data-theme') === 'light';
doc.querySelectorAll('[data-themebtn]').forEach((btn) => {btn.setAttribute('aria-checked', light ? 'true' : 'false');
btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
const lb = btn.querySelector('[data-themelabel]');
if (lb) { lb.textContent = light ? 'Light' : 'Dark'; }});};
const closeMenus = () => {doc.querySelectorAll('[data-mnav].open').forEach((s) => { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); });
doc.querySelectorAll('[data-burger]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
doc.documentElement.classList.remove('pa-menu');};
let wio = null;
const watch = (k) => {if (wio) { try { wio.disconnect(); } catch (e) {} wio = null; }
const b = box(k);
if (!b || !('IntersectionObserver' in window)) { return; }
wio = new IntersectionObserver((es) => {es.forEach((e) => {e.target.classList.toggle('pa-off', !e.isIntersecting);
if (e.isIntersecting && e.target.tagName === 'FOOTER') {const x = e.target.querySelector('.shimxl');
if (x && !x.__go) { x.__go = true; x.classList.remove('go'); void x.offsetWidth; x.classList.add('go'); }}
if (!e.isIntersecting && e.target.tagName === 'FOOTER') { const x = e.target.querySelector('.shimxl'); if (x) { x.__go = false; x.classList.remove('go'); } }});}, { rootMargin: '120px 0px' });
b.querySelectorAll('section, footer, .sv-card, .sv-ii, .st-mq, .st-bm').forEach((el) => wio.observe(el));};
this._watch = watch;
const swap = (key, defer) => {closeMenus();
stop(cur);
const from = box(cur); if (from) { from.classList.remove('act'); from.style.visibility = ''; }
const to = box(key); if (to) { to.classList.add('act'); }
cur = key;
this._route = key;
try { window.scrollTo(0, 0); } catch (e) {}
try { doc.documentElement.scrollTop = 0; doc.body.scrollTop = 0; } catch (e) {}
try { doc.title = (META[key] && META[key].title) || PAGES[key][2]; } catch (e) {}
try {if (META[key]) {const d = doc.querySelector('meta[name="description"]'); if (d) { d.setAttribute('content', META[key].description); }
const c = doc.querySelector('link[rel="canonical"]'); if (c) { c.setAttribute('href', META[key].url); }}} catch (e) {}
syncTheme();
setTimeout(fitWm, 60);
const init = () => {setTimeout(() => watch(key), 50);
if (key === 'studio') { try { ctx.studio.paStudio(); } catch (e) { console.warn('[pentarch] studio', e); } }
if (key === 'projects') { try { ctx.projects.paProjects(); } catch (e) { console.warn('[pentarch] projects', e); } }
if (key === 'contact') { try { ctx.contact.paContact(); } catch (e) { console.warn('[pentarch] contact', e); } }
if (key === 'approach') { try { ctx.approach.paApproach(); } catch (e) { console.warn('[pentarch] approach', e); } }
if (key === 'services') { try { ctx.services.paServices(); } catch (e) { console.warn('[pentarch] services', e); } }
try { window.dispatchEvent(new Event('resize')); } catch (e) {}};
if (defer) { requestAnimationFrame(init); } else { init(); }
if (key === 'home' && window.ScrollTrigger) { try { window.ScrollTrigger.refresh(); } catch (e) {} }};
const go = (key, fromPop) => {if (busy || !PAGES[key]) { return; }
if (key === cur) { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); } return; }
closeMenus();
if (PATHS && !fromPop) { try { history.pushState({ r: key }, '', URLS[key]); } catch (e) {} }
if (reduce || !ov) { swap(key); return; }
busy = true;
const lite = !!(window.matchMedia && window.matchMedia('(max-width: 900px), (pointer: coarse)').matches);
const T = lite ? { cov: 380, swap: 500, gap: 150, clear: 600 } : { swap: 1550, gap: 260, clear: 1500 };
setT(PAGES[key][0], PAGES[key][1]);
ov.className = lite ? 'on lite' : 'on'; void ov.offsetWidth;
doc.documentElement.classList.add('pa-tr');
ov.classList.add('cov');
if (lite) { this._rt0 = setTimeout(() => { const f = box(cur); if (f) { f.style.visibility = 'hidden'; } }, T.cov); }
this._rt1 = setTimeout(() => {swap(key, lite);
this._rt2 = setTimeout(() => {requestAnimationFrame(() => requestAnimationFrame(() => {ov.classList.add('out');
this._rt3 = setTimeout(() => { ov.className = ''; busy = false; doc.documentElement.classList.remove('pa-tr'); }, T.clear);}));}, T.gap);}, T.swap);};
const onClick = (e) => {const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
if (!a) { return; }
const hrefv = a.getAttribute('href') || '';
const m = /^#\/(home|studio|services|projects|approach|contact)$/.exec(hrefv) || (PATHS && (/^\/(about|services|projects|approach|contact)?$/.exec(hrefv) || (hrefv === '/studio' ? [0, 'studio'] : null)));
if (!m) { return; }
if (!m[1]) { m[1] = 'home'; }
if (m[1] === 'about') { m[1] = 'studio'; }
e.preventDefault();
if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
go(m[1]);};
const onPop = () => { go(fromPath(location.pathname), true); };
if (PATHS) {window.addEventListener('popstate', onPop);
try { history.replaceState({ r: fromPath(location.pathname) }, '', location.pathname + location.search); } catch (e) {}
const k0 = fromPath(location.pathname);
if (k0 !== 'home') { swap(k0); }}
setTimeout(() => watch(cur), 400);
doc.addEventListener('click', onClick, true);
this._routerOff = () => { window.removeEventListener('beforeunload', toTop); window.removeEventListener('pageshow', onShow); doc.removeEventListener('visibilitychange', onVis); clearTimeout(healT); if (wio) { try { wio.disconnect(); } catch (e) {} } doc.removeEventListener('click', onClick, true); window.removeEventListener('popstate', onPop); clearTimeout(this._rt1); clearTimeout(this._rt2); clearTimeout(this._rt3); };
this._go = go;}
componentDidMount() {const doc = document;
const proto = Object.getPrototypeOf(this);
const box = (k) => doc.querySelector('[data-route="' + k + '"]');
this._scope = box('home');
const st = Object.create(proto); st._scope = box('studio');
const sv = Object.create(proto); sv._scope = box('services');
const pj = Object.create(proto); pj._scope = box('projects');
const ap = Object.create(proto); ap._scope = box('approach');
const ct = Object.create(proto); ct._scope = box('contact');
this._ctx = { home: this, studio: st, services: sv, projects: pj, approach: ap, contact: ct };
[['home', this], ['studio', st], ['services', sv], ['projects', pj], ['approach', ap], ['contact', ct]].forEach((p) => {const c = p[1];
try { c.paTheme(); } catch (e) { console.warn('[pentarch] theme', e); }
try { c.paMenu(); } catch (e) { console.warn('[pentarch] menu', e); }
if (p[0] !== 'services') { try { c.paHdr(); } catch (e) { console.warn('[pentarch] hdr', e); } }});
try { this.paGyro(); } catch (e) { console.warn('[pentarch] gyro', e); }
try { this.paCta(); } catch (e) { console.warn('[pentarch] cta', e); }
try { this.paRouter(); } catch (e) { console.warn('[pentarch] route', e); }
const go = () => {try { this.paInit(); } catch (e) { console.warn('[pentarch] init failed', e); this.paRescue(); }};
if (window.gsap && window.ScrollTrigger) { go(); return; }
let tries = 0;
this._paPoll = setInterval(() => {tries++;
if (window.gsap && window.ScrollTrigger) { clearInterval(this._paPoll); go(); }
else if (tries > 150) { clearInterval(this._paPoll); this.paRescue(); }}, 100);}
componentWillUnmount() {const all = this._ctx ? [this._ctx.home, this._ctx.studio, this._ctx.services, this._ctx.projects, this._ctx.approach, this._ctx.contact] : [this];
all.forEach((c) => {['_paThemeOff', '_paMenuOff', '_hdrOff', '_stOff', '_svOff', '_pjOff', '_apOff', '_ctOff'].forEach((k) => { if (c && c[k]) { try { c[k](); } catch (e) {} } });});
if (this._gyroOff) { try { this._gyroOff(); } catch (e) {} }
if (this._ctaOff) { try { this._ctaOff(); } catch (e) {} }
if (this._routerOff) { this._routerOff(); }
clearInterval(this._paPoll);
(this._paOff || []).forEach((fn) => { try { fn(); } catch (e) {} });
if (this._paCtx) { try { this._paCtx.revert(); } catch (e) {} }
try { document.documentElement.style.overflow = ''; } catch (e) {}}}
window.__c=new Component();(function(){var go=function(){try{__c.componentDidMount()}catch(e){console.error(e)}};if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",go)}else{go()}})();