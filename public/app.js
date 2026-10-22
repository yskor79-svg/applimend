'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');

}
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', expanded);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu(); menu.focus();
  }
});
const areas = AppliMendRegion.areas;
const areaFromPath = location.pathname.split('/').pop().replace(/\.html$/, '');
const query = new URLSearchParams(location.search);
const areaCandidate = Object.hasOwn(areas, areaFromPath) ? areaFromPath : query.get('area');
const selectedArea = Object.hasOwn(areas, areaCandidate) ? areaCandidate : '';
if (selectedArea) {
  const contextPages = new Set(['request-service.html','refrigerator-repair.html','washer-repair.html','dryer-repair.html','dishwasher-repair.html','oven-range-repair.html','refrigerator-not-cooling.html','washer-not-draining.html','dryer-not-heating.html','dishwasher-not-draining.html','oven-not-heating.html','preparing-for-service.html','repair-estimates.html','how-it-works.html','brands.html','sub-zero-repair.html','viking-repair.html','wolf-repair.html','thermador-repair.html','miele-repair.html','samsung-repair.html','lg-repair.html','whirlpool-repair.html','microwave-repair.html','dryer-maintenance.html','refrigerator-leaking-water.html','ice-maker-not-working.html','washer-not-spinning.html','dryer-takes-too-long.html','washer-leaking-water.html','dryer-wont-start.html','dishwasher-not-cleaning.html','dishwasher-leaking.html','oven-wont-turn-on.html','oven-temperature-not-accurate.html','refrigerator-freezing-food.html','freezer-not-freezing.html','refrigerator-making-noise.html']);
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.getAttribute('href'), location.href);
    if (url.origin === location.origin && contextPages.has(url.pathname.split('/').pop())) {
      url.searchParams.set('area', selectedArea);
      link.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
    }
  });
}
const serviceBrands = ['Sub-Zero','Viking','Wolf','Thermador','Miele','Samsung','LG','Whirlpool'];
if (serviceBrands.includes(query.get('brand'))) {
  document.querySelectorAll('a[href*="request-service.html"]').forEach(link => {
    const url = new URL(link.href, location.href);
    if (!url.searchParams.has('brand')) {url.searchParams.set('brand', query.get('brand'));link.href = url.pathname.split('/').pop() + url.search;}
  });
}
const form = document.querySelector('#request-form');
if (form) initializeRequest();
function initializeRequest() {
  const review = document.querySelector('#review-panel');
  const success = document.querySelector('#success-panel');
  const heading = document.querySelector('#request-title');
  const intro = document.querySelector('#form-intro');
  const step = document.querySelector('#step-label');
  const appliance = document.querySelector('#appliance');
  const requestedAppliance = query.get('appliance');
  if (serviceBrands.includes(query.get('brand'))) document.querySelector('#model').value = query.get('brand');
  if (selectedArea) {
    document.querySelector('#location').value = areas[selectedArea];
    const context = document.querySelector('#request-context');
    context.hidden = false;
    context.textContent = 'Request area: ' + areas[selectedArea] + '. Availability must be checked; no visit is confirmed.';
  }
  if ([...appliance.options].some(option => option.value === requestedAppliance)) appliance.value = requestedAppliance;
  step.setAttribute('aria-live', 'polite');
  const errors = {
    location: 'Choose a Treasure Valley request city or enter a local ZIP for an availability check.',
    appliance: 'Choose an appliance, or select “Other / not sure”.',
    symptom: 'Describe the problem in at least 8 characters.',
    contact: 'Enter a valid email or a phone number with 10–15 digits.'
  };
  function isValid(field) {
    const value = field.value.trim();
    if (field.id === 'location') return AppliMendRegion.classify(value).canReview;
    if (field.id === 'appliance') return value !== '' && [...appliance.options].some(option => option.value === value);
    if (field.id === 'symptom') return value.length >= 8 && value.length <= 1200;
    if (field.id === 'contact') return value.length <= 120 && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || (/^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15));
    return true;
  }
  function clearError(field) {
    field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby');
    document.getElementById(field.id + '-error').textContent = '';
  }
  function focusHeading() { heading.tabIndex = -1; heading.focus(); }
  Object.keys(errors).forEach(id => {
    const field = document.getElementById(id);
    const clearIfValid = () => { if (field.getAttribute('aria-invalid') === 'true' && isValid(field)) clearError(field); };
    field.addEventListener('input', clearIfValid); field.addEventListener('change', clearIfValid);
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); // Local demonstration: no transport, storage or provider assignment.
    const invalid = [];
    Object.keys(errors).forEach(id => {
      const field = document.getElementById(id);
      if (!isValid(field)) {
        field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', id + '-error');
        document.getElementById(id + '-error').textContent = id === 'location' ? AppliMendRegion.classify(field.value).message : errors[id]; invalid.push(field);
      } else clearError(field);
    });
    document.querySelector('#form-error').hidden = invalid.length === 0;
    if (invalid.length) { invalid[0].focus(); return; }
    const region = AppliMendRegion.classify(document.querySelector('#location').value);
    document.querySelector('#location').value = region.display;
    document.querySelector('#review-location-status').textContent = region.message;
    const data = new FormData(form);
    const labels = {location:'Area',appliance:'Appliance',model:'Brand / model',symptom:'Problem',contact:'Contact',time:'Preferred time (America/Boise)'};
    const dl = document.querySelector('#review-details'); dl.replaceChildren();
    for (const [key, label] of Object.entries(labels)) {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = String(data.get(key) || '').trim() || 'Not provided';
      row.append(dt, dd); dl.append(row);
    }
    form.hidden = true; review.hidden = false; heading.textContent = 'A quick check.';
    intro.textContent = 'Review an availability request. No provider or appointment is confirmed.';
    step.textContent = '02 / REVIEW'; focusHeading();
  });
  document.querySelector('#edit-request').addEventListener('click', () => {
    form.hidden = false; review.hidden = true; success.hidden = true;
    heading.textContent = 'Tell us what’s not working.';
    intro.textContent = 'Demo only. Use sample details — this form sends nothing.';
    step.textContent = '01 / DETAILS'; document.querySelector('#location').focus();
  });
  document.querySelector('#finish-demo').addEventListener('click', () => {
    review.hidden = true; success.hidden = false; heading.textContent = 'Demo complete.';
    intro.textContent = 'Demonstration complete.'; step.textContent = '03 / DEMO COMPLETE';
    form.reset(); document.querySelector('#review-details').replaceChildren(); success.focus();
  });
}

const faqSearch = document.querySelector('#faq-search');
if (faqSearch) {
  const controls = document.querySelector('[data-faq-search]');
  const groups = [...document.querySelectorAll('.faq-group')];
  const questions = [...document.querySelectorAll('.faq-group details')];
  const results = document.querySelector('#faq-results');
  const empty = document.querySelector('#faq-empty');
  const clear = document.querySelector('#faq-clear');
  controls.hidden = false;
  function filterQuestions() {
    const query = faqSearch.value.trim().toLocaleLowerCase('en-US');
    let count = 0;
    for (const question of questions) {
      const match = !query || question.textContent.toLocaleLowerCase('en-US').includes(query);
      question.hidden = !match;
      if (match) count++;
    }
    groups.forEach(group => {group.hidden = [...group.querySelectorAll('details')].every(question => question.hidden);});
    empty.hidden = count !== 0;
    results.textContent = query ? `${count} matching ${count === 1 ? 'question' : 'questions'}.` : `Browse all ${questions.length} questions.`;
  }
  faqSearch.addEventListener('input', filterQuestions);
  clear.addEventListener('click', () => {faqSearch.value = '';filterQuestions();faqSearch.focus();});
  document.querySelectorAll('.faq-topics a').forEach(link => link.addEventListener('click', () => {faqSearch.value = '';filterQuestions();}));
  filterQuestions();
}

const booking = document.querySelector('#booking-dialog');
if (booking) {
  document.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', event => {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('/request-service.html') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    form.reset(); form.hidden = false;
    document.querySelector('#review-panel').hidden = true;
    document.querySelector('#success-panel').hidden = true;
    document.querySelector('#form-error').hidden = true;
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    form.querySelectorAll('[aria-invalid]').forEach(el => {el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');});
    document.querySelector('#request-title').textContent = 'Tell us what’s not working.';
    document.querySelector('#form-intro').textContent = 'Demo only. Use sample details — this form sends nothing.';
    document.querySelector('#step-label').textContent = '01 / DETAILS';
    const city = url.searchParams.get('area') || selectedArea;
    const context = document.querySelector('#request-context');
    context.hidden = !Object.hasOwn(areas, city);
    context.textContent = context.hidden ? '' : 'Request area: ' + areas[city] + '. Availability must be checked; no visit is confirmed.';
    document.querySelector('#location').value = Object.hasOwn(areas, city) ? areas[city] : '';
    const appliance = document.querySelector('#appliance');
    const value = url.searchParams.get('appliance');
    if ([...appliance.options].some(option => option.value === value)) appliance.value = value;
    if (serviceBrands.includes(url.searchParams.get('brand'))) document.querySelector('#model').value = url.searchParams.get('brand');
    updateLocationStatus(); closeMenu(); booking.showModal(); document.querySelector('#location').focus();
  }));
  booking.querySelector('.dialog-close').addEventListener('click', () => booking.close());
  booking.querySelector('#close-success').addEventListener('click', () => booking.close());
  booking.addEventListener('close', () => {form.reset(); document.querySelector('#review-details').replaceChildren(); document.querySelector('#review-location-status').textContent = ''; updateLocationStatus();});
}

function updateLocationStatus() {
  const field = document.querySelector('#location');
  const status = document.querySelector('#location-status');
  if (!field || !status) return;
  const region = AppliMendRegion.classify(field.value);
  status.textContent = region.kind === 'empty' ? 'All cities and ZIPs require an availability check with an independent provider. No visit is confirmed.' : region.message;
  status.dataset.state = region.canReview || region.kind === 'empty' ? 'pending' : 'outside';
}
if (form) {
  document.querySelector('#location').addEventListener('input', updateLocationStatus);
  document.querySelector('#location').addEventListener('change', updateLocationStatus);
  form.addEventListener('reset', () => {document.querySelector('#location-status').textContent = 'All cities and ZIPs require an availability check. No visit is confirmed.';});
  updateLocationStatus();
}
