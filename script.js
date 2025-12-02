document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
const body = document.body;

/* Theme toggle (persist) */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('st_theme');
if(savedTheme) body.classList.toggle('dark', savedTheme === 'dark');
else { body.classList.add('dark'); localStorage.setItem('st_theme','dark'); }
function updateToggleText(){ themeToggle.textContent = body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark'; }
updateToggleText();
themeToggle.addEventListener('click', ()=>{ body.classList.toggle('dark'); localStorage.setItem('st_theme', body.classList.contains('dark') ? 'dark' : 'light'); updateToggleText(); });

/* Backdrop helpers */
function showBackdrop(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = 'flex';
  el.setAttribute('aria-hidden','false');
  const box = el.querySelector('.box');
  if(box){ box.style.animation = 'none'; void box.offsetWidth; box.style.animation = 'pop .36s cubic-bezier(.2,.9,.3,1) both'; }
}
function hideBackdrop(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = 'none';
  el.setAttribute('aria-hidden','true');
}

/* Loading helper */
const loadingOverlay = document.getElementById('loadingOverlay');
function showLoading(message){
  document.getElementById('loadingMessage').textContent = message;
  loadingOverlay.classList.add('visible');
}
function hideLoading(){
  loadingOverlay.classList.remove('visible');
}

/* Cookie helpers (small) */
function getCookie(name){ const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'); return v ? v.pop() : ''; }
function setCookie(name,value,days=365){ const d=new Date(); d.setTime(d.getTime() + (days*24*60*60*1000)); document.cookie = name+"="+value+";path=/;expires="+d.toUTCString(); }

/* Simple storage helpers for demo (localStorage). PRODUCTION: replace with server */
function loadUsers(){ try{ return JSON.parse(localStorage.getItem('st_users')||'[]'); }catch(e){ return []; } }
function saveUser(u){ const arr = loadUsers(); arr.push(u); localStorage.setItem('st_users', JSON.stringify(arr)); }
function findUserByEmail(email){ const arr = loadUsers(); return arr.find(x => x.email && x.email.toLowerCase() === (email||'').toLowerCase()); }

/* ============================================================
   COUNTRY / STATE / PHONE DATA (complete lists for 10 countries)
   - Each country record: { name, code, states: [...] }
   ============================================================ */
const COUNTRY_DATA = {
  ng: { name:'Nigeria', code:'+234', states:[
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta',
    'Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina',
    'Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo',
    'Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT (Abuja)'
  ]},
  gh: { name:'Ghana', code:'+233', states:[
    'Greater Accra','Ashanti','Eastern','Northern','Volta','Central','Western','Upper East','Upper West','Bono'
  ]},
  ke: { name:'Kenya', code:'+254', states:[
    'Nairobi','Mombasa','Kisumu','Nakuru','Uasin Gishu','Meru','Machakos','Kiambu','Kajiado','Garissa'
  ]},
  za: { name:'South Africa', code:'+27', states:[
    'Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape'
  ]},
  eg: { name:'Egypt', code:'+20', states:[
    'Cairo','Giza','Alexandria','Aswan','Luxor','Ismailia','Suez','Sharqia','Gharbia','Dakahlia'
  ]},
  us: { name:'United States', code:'+1', states:[
    'Alabama','Alaska','Arizona','California','Colorado','Florida','Georgia','Illinois','New York','Texas'
  ]},
  gb: { name:'United Kingdom', code:'+44', states:[
    'England','Scotland','Wales','Northern Ireland','Greater London','West Midlands','Greater Manchester','Merseyside','Tyne and Wear','South Yorkshire'
  ]},
  ca: { name:'Canada', code:'+1', states:[
    'Ontario','Quebec','British Columbia','Alberta','Manitoba','Saskatchewan','Nova Scotia','New Brunswick','Newfoundland & Labrador','Prince Edward Island'
  ]},
  in: { name:'India', code:'+91', states:[
    'Andhra Pradesh','Assam','Bihar','Gujarat','Haryana','Karnataka','Kerala','Maharashtra','Rajasthan','Tamil Nadu'
  ]},
  de: { name:'Germany', code:'+49', states:[
    'Bavaria','North Rhine-Westphalia','Baden-Württemberg','Hesse','Lower Saxony','Saxony','Rhineland-Palatinate','Berlin','Brandenburg','Thuringia'
  ]}
};

/* ============================================================
   FORM ELEMENT REFERENCES
   ============================================================ */
const countrySelect = document.getElementById('su_country');
const phonePrefixEl = document.getElementById('phonePrefix');
const phoneInput = document.getElementById('su_phone');
const stateSelect = document.getElementById('su_state_select');
const stateText = document.getElementById('su_state_text');

const nameField = document.getElementById('su_name');
const emailField = document.getElementById('su_email');
const passField = document.getElementById('su_pass');
const dobField = document.getElementById('su_dob');
const rememberField = document.getElementById('su_remember');

const signupErrors = document.getElementById('signupErrors');

/* ============================================================
   POPULATE COUNTRY SELECT (ordered, clear)
   ============================================================ */
function populateCountrySelect(){
  countrySelect.innerHTML = '';
  const defaultOpt = document.createElement('option'); defaultOpt.value=''; defaultOpt.textContent='Select country'; countrySelect.appendChild(defaultOpt);
  // Ensure consistent ordering (keys in array)
  const keys = ['ng','gh','ke','za','eg','us','gb','ca','in','de'];
  keys.forEach(k => {
    const opt = document.createElement('option'); opt.value = k; opt.textContent = COUNTRY_DATA[k].name; countrySelect.appendChild(opt);
  });
}
populateCountrySelect();

/* ============================================================
   Set UI when country changes: phone prefix + states
   ============================================================ */
function setCountryUI(countryKey){
  if(!countryKey || !COUNTRY_DATA[countryKey]){
    phonePrefixEl.textContent = '+234';
    stateSelect.innerHTML = '<option value="">Select state / region</option>';
    stateText.style.display = 'none';
    return;
  }
  const data = COUNTRY_DATA[countryKey];
  phonePrefixEl.textContent = data.code;

  // populate states
  stateSelect.innerHTML = '';
  const def = document.createElement('option'); def.value=''; def.textContent = 'Select state / region'; stateSelect.appendChild(def);
  data.states.forEach(s => {
    const o = document.createElement('option'); o.value = s; o.textContent = s; stateSelect.appendChild(o);
  });
  const other = document.createElement('option'); other.value = '__other__'; other.textContent = 'Other / Not listed'; stateSelect.appendChild(other);
  stateText.style.display = 'none';
  stateText.value = '';
}

/* init default country to Nigeria for convenience */
countrySelect.value = 'ng';
setCountryUI('ng');

/* event when user picks country */
countrySelect.addEventListener('change', (e) => {
  setCountryUI(e.target.value);
  // Update placeholder guidance for phone
  const code = phonePrefixEl.textContent.replace('+','');
  phoneInput.placeholder = (code === '234') ? '8061234567' : 'Enter phone number';
  validateField(countrySelect);
});

/* state select logic: show text input if not listed */
stateSelect.addEventListener('change', () => {
  if(stateSelect.value === '__other__'){ stateText.style.display = 'block'; stateText.focus(); } else { stateText.style.display = 'none'; stateText.value=''; }
  validateField(stateSelect);
});

/* ============================================================
   PASSWORD STRENGTH CHECK (live)
   ============================================================ */
const rules = {
  len: document.getElementById('ruleLen'),
  upper: document.getElementById('ruleUpper'),
  lower: document.getElementById('ruleLower'),
  number: document.getElementById('ruleNumber'),
  special: document.getElementById('ruleSpecial')
};

function checkPasswordRules(val){
  const hasLen = val.length >= 8;
  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasNumber = /\d/.test(val);
  const hasSpecial = /[!@#\$%\^&\*\(\)\-_=\+\[\]\{\};:'",.<>\/\?\\|`~]/.test(val);
  // toggle classes
  rules.len.classList.toggle('ok', hasLen); rules.len.classList.toggle('bad', !hasLen);
  rules.upper.classList.toggle('ok', hasUpper); rules.upper.classList.toggle('bad', !hasUpper);
  rules.lower.classList.toggle('ok', hasLower); rules.lower.classList.toggle('bad', !hasLower);
  rules.number.classList.toggle('ok', hasNumber); rules.number.classList.toggle('bad', !hasNumber);
  rules.special.classList.toggle('ok', hasSpecial); rules.special.classList.toggle('bad', !hasSpecial);
  const allGood = hasLen && hasUpper && hasLower && hasNumber && hasSpecial;
  // visual on the input
  if(val.length === 0){ passField.classList.remove('input-error'); passField.classList.remove('input-valid'); }
  else if(allGood){ passField.classList.add('input-valid'); passField.classList.remove('input-error'); }
  else { passField.classList.add('input-error'); passField.classList.remove('input-valid'); }
  return allGood;
}
passField.addEventListener('input', ()=>{ checkPasswordRules(passField.value); validateField(passField); });

/* ============================================================
   LIVE VALIDATION (email, phone, name, dob, country/state)
   - shows red highlight + inline message if invalid
   - shows green highlight if valid
   ============================================================ */
function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v){ return /^[0-9]{6,15}$/.test(v); } // basic numeric-only check (6-15 digits)
function validateField(el){
  if(!el) return false;
  const id = el.id;
  const val = (el.value || '').trim();
  let ok = true;

  if(id === 'su_email') ok = validateEmail(val);
  else if(id === 'su_phone') ok = validatePhone(val);
  else if(id === 'su_pass') ok = checkPasswordRules(val);
  else if(id === 'su_name') ok = val.length >= 2;
  else if(id === 'su_dob') ok = !!val;
  else if(id === 'su_country') ok = !!val;
  else if(id === 'su_state_select') ok = !!val && val !== '__other__';
  else if(id === 'su_state_text') ok = !!val;

  // apply classes and inline messages
  if(ok){
    el.classList.remove('input-error'); el.classList.add('input-valid'); hideInlineError(el);
  } else {
    el.classList.add('input-error'); el.classList.remove('input-valid'); showInlineError(el);
  }
  return ok;
}

function showInlineError(el){
  // do not duplicate
  const next = el.nextElementSibling;
  if(next && next.classList && next.classList.contains('field-error-inline')) return;
  const msg = document.createElement('div'); msg.className = 'field-error field-error-inline';
  msg.style.display = 'block';
  let text = 'Please correct this field';
  if(el.id === 'su_email') text = 'Please enter a valid email (ex: you@mail.com)';
  if(el.id === 'su_phone') 
  if(el.id === 'su_pass') text = 'Password weak. See rules above.';
  if(el.id === 'su_name') text = 'Please enter your full name';
  if(el.id === 'su_dob') text = 'Please enter your date of birth';
  if(el.id === 'su_country') text = 'Please select a country';
  if(el.id === 'su_state_select' || el.id === 'su_state_text') text = 'Please provide your state/region';
  msg.textContent = text;
  msg.style.marginTop = '6px';
  el.insertAdjacentElement('afterend', msg);
}
function hideInlineError(el){
  const next = el.nextElementSibling;
  if(next && next.classList && next.classList.contains('field-error-inline')) next.remove();
}

/* attach live validation events */
[nameField, emailField, phoneInput, passField, dobField, countrySelect, stateSelect, stateText].forEach(inp=>{
  if(!inp) return;
  inp.addEventListener('input', ()=>{ validateField(inp); });
  inp.addEventListener('change', ()=>{ validateField(inp); });
});

/* ============================================================
   POLICY SCROLL REQUIREMENT
   - user must scroll to bottom to enable "I Agree"
   ============================================================ */
const policyFull = document.getElementById('policyFull');
const policyAgreeBtn = document.getElementById('policyAgreeBtn');
policyAgreeBtn.disabled = true;

policyFull.addEventListener('scroll', ()=>{
  const inner = document.querySelector('.policy-inner');
  if(!inner) return;
  const atBottom = (policyFull.scrollTop + policyFull.clientHeight) >= (inner.scrollHeight - 40);
  if(atBottom){ policyAgreeBtn.classList.add('enabled'); policyAgreeBtn.disabled = false; }
});

/* open policy from signup */
document.getElementById('openPolicyFromSignup').addEventListener('click', (e)=>{
  e.preventDefault();
  policyFull.style.display = 'block';
  policyFull.setAttribute('aria-hidden','false');
  policyFull.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  if(sessionStorage.getItem('st_policyAgreed')){ policyAgreeBtn.classList.add('enabled'); policyAgreeBtn.disabled = false; }
  else { policyAgreeBtn.classList.remove('enabled'); policyAgreeBtn.disabled = true; }
});

/* policy agree click */
policyAgreeBtn.addEventListener('click', ()=>{
  if(policyAgreeBtn.disabled) return;
  sessionStorage.setItem('st_policyAgreed','1');
  window._policyAgreed = true;
  policyFull.style.display = 'none';
  policyFull.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  // small non-blocking confirmation (could be replaced by toast)
  setTimeout(()=>{}, 100);
});

/* cookie banner handling */
const cookieBanner = document.getElementById('cookieBanner');
if(!getCookie('st_cookies_accepted')) cookieBanner.style.display = 'flex';
document.getElementById('cookieAccept').addEventListener('click', ()=>{ setCookie('st_cookies_accepted','1',365); cookieBanner.style.display='none'; });
document.getElementById('cookieManage').addEventListener('click', ()=>{ policyFull.style.display='block'; policyFull.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; });

/* ============================================================
   SIGNUP FLOW
   - Validate all fields
   - Require policy agreement
   - Save demo user to localStorage
   - Show creating animation, then welcome -> login
   ============================================================ */
document.getElementById('signupSubmit').addEventListener('click', (ev)=>{
  ev.preventDefault();
  signupErrors.style.display = 'none'; signupErrors.textContent = '';

  // gather values
  const name = nameField.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailField.value.trim().toLowerCase();
  const password = passField.value;
  const dob = dobField.value;
  const country = countrySelect.value;
  const state = (stateSelect.value === '__other__') ? stateText.value.trim() : stateSelect.value;
  const prefix = phonePrefixEl.textContent;

  // field-by-field validation (will highlight errors)
  let valid = true;
  [nameField, phoneInput, emailField, passField, dobField, countrySelect].forEach(i => { if(i) validateField(i); });

  // validate state
  if(stateSelect.value === '__other__'){
    if(!stateText.value.trim()){ stateText.classList.add('input-error'); showInlineError(stateText); valid = false; } else { stateText.classList.remove('input-error'); hideInlineError(stateText); }
  } else {
    if(!stateSelect.value){ stateSelect.classList.add('input-error'); showInlineError(stateSelect); valid = false; } else { stateSelect.classList.remove('input-error'); hideInlineError(stateSelect); }
  }

  // policy check
  if(!sessionStorage.getItem('st_policyAgreed')){
    signupErrors.style.display = 'block';
    signupErrors.textContent = 'You must read and agree to the Website Rules, Regulations & Privacy Policy before creating an account.';
    valid = false;
  }

  // re-check password rules
  const pwOk = checkPasswordRules(password);

  valid = valid && pwOk && validateField(nameField) && validateField(phoneInput) && validateField(emailField) && validateField(dobField) && validateField(countrySelect);

  if(!valid){
    if(!signupErrors.textContent) { signupErrors.style.display='block'; signupErrors.textContent = 'Please correct the highlighted fields.'; }
    return;
  }

  // prevent duplicate account (by email)
  if(findUserByEmail(email)){
    signupErrors.style.display = 'block';
    signupErrors.textContent = 'An account with that email already exists. Please login instead.';
    emailField.classList.add('input-error');
    return;
  }

  // Save user (demo) — localStorage (production: use server + hashing)
  const user = {
    name, phone, phonePrefix: prefix, email, password, dob,
    country, state, remember: rememberField.checked, createdAt: new Date().toISOString()
  };
  saveUser(user);

  // Show "Creating your account..." loader
  hideBackdrop('signupBackdrop');
  showLoading('Creating your account...');
  setTimeout(()=>{
    hideLoading();
    // show welcome and proceed to login
    document.getElementById('welcomeName').textContent = user.name.split(' ')[0] || user.name;
    showBackdrop('welcomeBackdrop');
  }, 2000);
});

/* open login from signup link */
document.getElementById('openLoginFromSignup').addEventListener('click', ()=>{
  hideBackdrop('signupBackdrop');
  showBackdrop('loginBackdrop');
});

/* proceed to login after welcome */
document.getElementById('proceedToLoginBtn').addEventListener('click', ()=>{
  hideBackdrop('welcomeBackdrop');
  showBackdrop('loginBackdrop');
});

/* ============================================================
   LOGIN FLOW
   - Validates fields
   - Checks against demo users in localStorage
   - On success: show loading then unlock site
   ============================================================ */
document.getElementById('loginSubmit').addEventListener('click', (ev)=>{
  ev.preventDefault();
  const n = document.getElementById('li_name');
  const em = document.getElementById('li_email');
  const pw = document.getElementById('li_pass');
  const loginErrors = document.getElementById('loginErrors');

  loginErrors.style.display = 'none'; loginErrors.textContent = '';
  [n,em,pw].forEach(i => i.classList.remove('input-error'));

  let ok = true;
  if(!n.value.trim()){ n.classList.add('input-error'); ok=false; }
  if(!em.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())){ em.classList.add('input-error'); ok=false; }
  if(!pw.value || pw.value.length < 6){ pw.classList.add('input-error'); ok=false; }
  if(!ok){ loginErrors.style.display='block'; loginErrors.textContent='Please correct the highlighted fields.'; return; }

  const stored = findUserByEmail(em.value.trim());
  if(!stored || stored.password !== pw.value){
    loginErrors.style.display='block'; loginErrors.textContent = 'Invalid credentials (demo). Please check your email/password.';
    if(!stored) em.classList.add('input-error'); else pw.classList.add('input-error');
    return;
  }

  // success: show loading then unlock
  hideBackdrop('loginBackdrop');
  showLoading('Logging you in...');
  setTimeout(()=>{
    hideLoading();
    unlockSite();
    alert('Welcome back, ' + (n.value.trim().split(' ')[0] || n.value.trim()) + ' — you are logged in.');
    hideBackdrop('signupBackdrop'); hideBackdrop('loginBackdrop'); hideBackdrop('welcomeBackdrop');
    policyFull.style.display = 'none'; document.body.style.overflow = '';
  }, 1400);
});

/* lock/unlock helpers */
function lockSite(){ body.classList.add('locked'); }
function unlockSite(){ body.classList.remove('locked'); sessionStorage.setItem('st_logged_in','1'); }

/* close backdrops on outside click but keep lock if not logged */
document.querySelectorAll('.backdrop').forEach(b => {
  b.addEventListener('click', (e) => {
    if(e.target === b){ hideBackdrop(b.id); if(!sessionStorage.getItem('st_logged_in')) lockSite(); }
  });
});

/* close policy by clicking outside */
policyFull.addEventListener('click', (e) => {
  if(e.target === policyFull){ policyFull.style.display='none'; policyFull.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
});

/* ESC to close overlays (not to unlock) */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    if(policyFull.style.display === 'block'){ policyFull.style.display='none'; document.body.style.overflow=''; }
    ['signupBackdrop','loginBackdrop','welcomeBackdrop'].forEach(id=>{
      const el = document.getElementById(id);
      if(el && el.style.display === 'flex') hideBackdrop(id);
    });
  }
});

/* ============================================================
   INITIAL LOAD: show signup if not logged in
   ============================================================ */
window.addEventListener('load', ()=>{
  if(sessionStorage.getItem('st_logged_in')){
    unlockSite();
    hideBackdrop('signupBackdrop'); hideBackdrop('loginBackdrop'); hideBackdrop('welcomeBackdrop');
    return;
  }
  lockSite();
  setTimeout(()=> showBackdrop('signupBackdrop'), 700);
});

/* ============================================================
   Simple cookie behavior (banner)
   ============================================================ */
document.getElementById('cookieAccept').addEventListener('click', ()=>{ setCookie('st_cookies_accepted','1',365); document.getElementById('cookieBanner').style.display='none'; });







const sections = {
      home: document.getElementById('home'),
      about: document.getElementById('about'),
      strategies: document.getElementById('strategies'),
      proofs: document.getElementById('proofs'),
      testimonies: document.getElementById('testimonies'),
      contact: document.getElementById('contact')
    };
    function showSection(name){
      Object.values(sections).forEach(s => s.classList.remove('active'));
      if (sections[name]) sections[name].classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    }
    
    
    document.querySelectorAll('button[data-show]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.getAttribute('data-show');
        showSection(target);
      });
    });
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.addEventListener('click', () => {
        const target = b.getAttribute('data-show');
        showSection(target);
      });
    });
    
    
        // Tabs in strategies
    const tabButtons = document.querySelectorAll('#strategyTabs .tab');
    tabButtons.forEach(tb => tb.addEventListener('click', () => {
      tabButtons.forEach(x => x.classList.remove('active'));
      tb.classList.add('active');
      document.querySelectorAll('#strategyTabs .tab-content').forEach(c => c.classList.remove('active'));
      const id = tb.dataset.tab;
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
      el && el.scrollIntoView({behavior:'smooth',block:'start'});
    }));



    // Collapsible lessons inside strategies
    document.querySelectorAll('.lesson .title').forEach(title => {
      title.addEventListener('click', () => {
        const body = title.nextElementSibling;
        if (!body) return;
        body.style.display = body.style.display === 'block' ? 'none' : 'block';
      });
    });
    
   
    
        // Image popup (delegation) — works for gallery images, proof images, etc.
    const popup = document.getElementById('popup');
    const popupImg = document.getElementById('popupImg');
    const closePopup = document.getElementById('closePopup');
    document.addEventListener('click', (e) => {
      const tgt = e.target;
      if (tgt.tagName === 'IMG' && (tgt.closest('.gallery') || tgt.closest('.proof-row') || tgt.closest('.testi') || tgt.closest('.strategy-gallery'))) {
        popupImg.src = tgt.src;
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
    closePopup.addEventListener('click', () => { popup.style.display = 'none'; document.body.style.overflow = ''; });
    popup.addEventListener('click', (e) => { if (e.target === popup) { popup.style.display = 'none'; document.body.style.overflow = ''; } });




    // Press Escape to return home
    document.addEventListener('keydown', e => { if(e.key === 'Escape') showSection('home'); });

    // ensure home visible initially
    showSection('home');