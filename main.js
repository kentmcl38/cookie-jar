// Configuration constants - centralize all magic strings
const BANNER_CONFIG = {
  CONSENT_COOKIE_NAME: 'ofcPer',
  COOKIE_DURATION_DAYS: 7,
  INIT_TIMEOUT_MS: 100,
  PRESERVED_COOKIES: ['ofcPer', 'Strictly', 'Performance', 'Analytics', 'Marketing', 'Functional'],
  SELECTORS: {
    BANNER_CONTAINER: "[data-item='js-banner-container']",
    SETTINGS_CONTAINER: "[data-item='js-settings-container']",
    SETTINGS_CONTENT: "[data-item='js-settings-content']",
    SETTINGS_BUTTON: "[data-item='js-settings-button']",
    SETTINGS_BUTTON_2: "[data-item='js-settings-button-2']",
    REJECT_BUTTON: "[data-item='js-reject-button']",
    ACCEPT_BUTTON: "[data-item='js-accept-button']",
    SETTINGS_CLOSE_BUTTON: "[data-item='js-settings-close-button']",
    SETTINGS_ACCORDION_HEAD: "[data-item='js-settings-accordion-head']",
    CONFIRM_BUTTON: "[data-item='js-confirm-button']",
    COOKIE_CONTAINER: "[data-item='js-cookie-container']",
    CLOSE_BUTTON: "[data-item='js-close-button']",
    TOGGLE_PERFORMANCE: "[data-item='js-toggle-pC'] input",
    TOGGLE_ANALYTICS: "[data-item='js-toggle-aC'] input",
    TOGGLE_MARKETING: "[data-item='js-toggle-mC'] input",
    TOGGLE_FUNCTIONAL: "[data-item='js-toggle-fC'] input",
  },
  CONSENT_VALUES: {
    ACCEPTED: 'yes',
    REJECTED: 'no',
  },
  COOKIE_CATEGORIES: {
    STRICTLY_NECESSARY: 'Strictly necessary cookies',
    PERFORMANCE: 'Performance cookies',
    ANALYTICS: 'Analytic cookies',
    MARKETING: 'Marketing cookies',
    FUNCTIONAL: 'Functional cookies',
  },
};

class Banner {
  bannerContainer;
  settingsMenu;
  settingsContent;
  settingsButton;
  settingsAccordions;
  rejectButtons;
  acceptButtons;
  settingsCloseButton;
  closeButton;
  pendingCookies;
  confirmButton;
  csvData;
  cookieCrumb;
  categorizedCookies;
  loadedScripts;

  constructor(data) {
    // Validate input
    if (!data || typeof data !== 'object') {
      console.warn('Banner initialized with invalid CSV data');
    }

    this.pendingCookies = [];
    this.categorizedCookies = {};
    this.loadedScripts = new Set();

    this.initialize();
    setTimeout(() => {
      // Query all DOM elements once and cache them
      this.bannerContainer = document.querySelector(BANNER_CONFIG.SELECTORS.BANNER_CONTAINER);
      this.settingsMenu = document.querySelector(BANNER_CONFIG.SELECTORS.SETTINGS_CONTAINER);
      this.settingsContent = document.querySelector(BANNER_CONFIG.SELECTORS.SETTINGS_CONTENT);
      this.settingsButton = document.querySelector(BANNER_CONFIG.SELECTORS.SETTINGS_BUTTON);
      this.settingsButton2 = document.querySelector(BANNER_CONFIG.SELECTORS.SETTINGS_BUTTON_2);
      this.rejectButtons = document.querySelectorAll(BANNER_CONFIG.SELECTORS.REJECT_BUTTON);
      this.acceptButtons = document.querySelectorAll(BANNER_CONFIG.SELECTORS.ACCEPT_BUTTON);
      this.settingsCloseButton = document.querySelector(BANNER_CONFIG.SELECTORS.SETTINGS_CLOSE_BUTTON);
      this.settingsAccordions = document.querySelectorAll(BANNER_CONFIG.SELECTORS.SETTINGS_ACCORDION_HEAD);
      this.confirmButton = document.querySelector(BANNER_CONFIG.SELECTORS.CONFIRM_BUTTON);
      this.cookieCrumb = document.querySelector(BANNER_CONFIG.SELECTORS.COOKIE_CONTAINER);
      this.closeButton = document.querySelector(BANNER_CONFIG.SELECTORS.CLOSE_BUTTON);

      this.csvData = data ?? {};

      this.categorizeCookies(this.csvData);
      this.initializeAccordions();
      this.createEventListeners();

      const userConsented = this.checkCookie();
      if (!userConsented) {
        this.blockCookies();
      } else {
        this.loadConsentedScripts();
      }
      this.syncTogglesToPreferences();
    }, BANNER_CONFIG.INIT_TIMEOUT_MS);
  }

  initialize() {
    const containerNode = document.createElement("div");
    const settingsNode = document.createElement("div");
    const cookieNode = document.createElement("div");

    containerNode.classList.add("ofc-banner-container");
    containerNode.setAttribute("data-item", "js-banner-container");
    containerNode.style.width = "calc(100% - 17px)";

    cookieNode.classList.add("ofc-cookie-container");
    cookieNode.setAttribute("data-item", "js-cookie-container");

    settingsNode.classList.add("ofc-settings-container");
    settingsNode.setAttribute("data-item", "js-settings-container");

    const cookieCrumb = `
		  <div class='ofc-crumb-container'>
			<div class='ofc-crumb-image-wrapper'>
			<img src="https://raw.githubusercontent.com/JoshOpenform/cookieCDN/main/images/cookie_icon.svg">
			</div>
		  </div>`;

    const banner = `
		  <div class="cookiejar-container">
			<div class='ofc-message-container'>
				<h3>This website uses cookies</h3>
				<p>This website uses cookies to improve user experience. By using our website you consent to all cookies in accordance with our Cookie Policy.</p>
			</div>
			<div class='cookie-button-container'>
				<button data-item='js-accept-button' type='button' class='cookie-button'>ACCEPT</button>
				<button data-item='js-reject-button' type='button' class='cookie-button'>DECLINE</button>
			</div>
			<div class='ofc-close-container'>
				<button class='cookie-button ofc-close' data-item='js-close-button'><img src="https://raw.githubusercontent.com/JoshOpenform/cookieCDN/main/images/close_icon.svg" /></button>
			</div>
			<div class='settings'>
				<button data-item='js-settings-button' type='button' class='cookie-button'>Settings</button>
				<p>Powered by <span class='cookie-jar-link'>CookieJar</span></p>
			</div>
		  </div>
		  `;

    const settings = `
		<div class="cookiejar-container">
		  <div data-item='js-settings-content' class='ofc-settings-content'>
			<h2>This website uses cookies</h2>
			<div class="settings-content-container">
			<div class='ofc-settings-content-header'>
			  <p>PRIVACY PREFERENCE CENTER</p>
			  <button class='ofc-close ofc-popclose' data-item='js-settings-close-button'><img src="https://raw.githubusercontent.com/JoshOpenform/cookieCDN/main/images/close_icon.svg" /></button>
			</div>
			<div class="privacy-content-text">
				<p class="ofc-privacytext">Cookies are small text files that are placed on your computer by websites that you visit. Websites use cookies to help users navigate efficiently and perform certain functions. Cookies that are required for the website to operate properly are allowed to be set without your permission. All other cookies need to be approved before they can be set in the browser.</p> <br />
				<p>You can change your consent to cookie usage at any time on our Privacy Policy page.<br />
				We also use cookies to collect data for the purpose of personalizing and measuring the effectiveness of our advertising. <br />
				For more details, visit the <a href="https://policies.google.com/privacy" target=_blank>Google Privacy Policy</a>.</p>
				
			</div>
			<div class='ofc-settings'>
				<div class='ofc-accordion'>
				  <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
					  <p>Strictly necessary cookies</p>
					  <img class="lock-icon" src="https://raw.githubusercontent.com/JoshOpenform/cookieCDN/main/images/lock-locked_icon.svg" />
				  </div>            
				  <div class='ofc-accordion-body' style='display:none;'>
					  <p>These are essential cookies that are necessary for a website to function properly. 
					  They enable basic functions such as page navigation, access to secure areas, and ensuring that the website operates correctly. 
					  Strictly necessary cookies are typically set in response to user actions, such as logging in or filling out forms. 
					  They do not require user consent as they are crucial for the website's operation.</p>
				  </div>
				</div>
				<hr>
				<div class='ofc-accordion'>
				  <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
					  <p>Performance cookies</p>
					  <label class="ofc-toggle-switch" data-item="js-toggle-pC">
					  <input type="checkbox">
					  <span class="ofc-toggle-slider"></span>
					</label>
				  </div>       
				  <div class='ofc-accordion-body' style='display:none;'>
					<p>Performance cookies collect anonymous information about how visitors use a website. 
					They are used to improve website performance and provide a better user experience. 
					These cookies gather data about the pages visited, the time spent on the website, and any error messages encountered. 
					The information collected is aggregated and anonymised, and it helps website owners understand and analyse website traffic patterns.</p>
				  </div>
				</div>
				<hr>
				<div class='ofc-accordion'>
				  <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
					  <p>Marketing cookies</p>
					  <label class="ofc-toggle-switch" data-item="js-toggle-mC">
					  <input type="checkbox">
					  <span class="ofc-toggle-slider"></span>
					</label>
				  </div>       
				  <div class='ofc-accordion-body' style='display:none;'>
					<p>Marketing cookies are used to track users across websites and build a profile of their interests. 
					These cookies are often set by advertising networks or third-party advertisers. 
					They are used to deliver targeted advertisements and measure the effectiveness of marketing campaigns. 
					Marketing cookies may collect data such as browsing habits, visited websites, and interaction with ads. 
					Consent from the user is usually required for the use of marketing cookies.</p>
				  </div>
				</div>
				<hr>
				<div class='ofc-accordion'>
				  <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
					  <p>Functional cookies</p>
					  <label class="ofc-toggle-switch" data-item="js-toggle-fC">
					  <input type="checkbox">
					  <span class="ofc-toggle-slider"></span>
					</label>
				  </div>       
				  <div class='ofc-accordion-body' style='display:none;'>
					<p>Functional cookies enable enhanced functionality and customisation on a website. 
					They remember user preferences, such as language settings and personalised preferences, to provide a more personalised experience. 
					These cookies may also be used to remember changes made by the user, such as font size or layout preferences. 
					Functional cookies do not track or store personal information and are usually set in response to user actions.</p>
				  </div>
				</div>
				<hr>
				<div class='ofc-accordion'>
				  <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
					  <p>Analytic cookies</p>
					  <label class="ofc-toggle-switch" data-item="js-toggle-aC">
					  <input type="checkbox">
					  <span class="ofc-toggle-slider"></span>
					</label>
				  </div>       
				  <div class='ofc-accordion-body' style='display:none;'>
					<p>Analytic cookies are similar to performance cookies as they collect information about how users interact with a website. However, 
					unlike performance cookies, analytic cookies provide more detailed and comprehensive data. 
					They track and analyse user behaviour, such as click patterns, mouse movements, and scroll depth, 
					to gain insights into user engagement and website performance. 
					Analytic cookies help website owners make data-driven decisions to optimize their websites.</p>
				  </div>
				</div>
				<hr>
			</div>
			</div>
			<div class="button-container">
			  <div class="left-buttons">
				<button class='ofc-popbutton' data-item='js-accept-button'>ACCEPT</button>
				<button class='ofc-popbutton' data-item='js-reject-button'>DECLINE</button>
			  </div>
			  <button class='ofc-popbutton' data-item='js-confirm-button'>SAVE & CLOSE</button>
			  <p class="powered-by">Powered by <span class='cookie-jar-link'>CookieJar</span></p>
			</div>
			</div>
		  </div>`;
    containerNode.innerHTML = banner;
    settingsNode.innerHTML = settings;
    cookieNode.innerHTML = cookieCrumb;

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap";
    document.head.appendChild(fontLink);

    document.body.appendChild(containerNode);
    document.body.appendChild(settingsNode);
    document.body.appendChild(cookieNode);

    const button = document.querySelector('[data-item="js-reject-button"]');
    if (button) {
      button.textContent = "DECLINE";
    }
  }

  showElement(element) {
    if (element) element.classList.add("visible");
  }

  hideElement(element) {
    if (element) element.classList.remove("visible");
  }

  categorizeCookies(data) {
    const localCategorizedCookies = {};
    
    if (!this.pendingCookies?.length || !data) {
      this.categorizedCookies = localCategorizedCookies;
      return;
    }

    try {
      this.pendingCookies.forEach((cookie) => {
        const cookieName = cookie.split('=')[0]?.trim();
        const cookieEntry = data[cookieName];

        const category = cookieEntry?.Category ?? 'Other';
        
        if (!localCategorizedCookies[category]) {
          localCategorizedCookies[category] = [];
        }
        if (cookieName) {
          localCategorizedCookies[category].push(cookie);
        }
      });
      this.categorizedCookies = localCategorizedCookies;
    } catch (error) {
      console.error('Error categorizing cookies:', error);
      this.categorizedCookies = localCategorizedCookies;
    }
  }

  addEventListener(element, event, handler) {
    // Why: Centralized event listener attachment with null safety
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  addEventListenerToAll(elements, event, handler) {
    // Why: Batch event listener attachment for NodeLists
    elements?.forEach?.((el) => this.addEventListener(el, event, handler));
  }

  createEventListeners() {
    this.addEventListener(this.settingsButton, 'click', () => {
      this.syncTogglesToPreferences();
      this.showElement(this.settingsMenu);
    });

    this.addEventListener(this.settingsButton2, 'click', () => {
      this.syncTogglesToPreferences();
      this.showElement(this.settingsMenu);
    });

    this.addEventListener(this.settingsCloseButton, 'click', () => {
      this.hideElement(this.settingsMenu);
    });

    this.addEventListener(this.closeButton, 'click', () => {
      this.hideElement(this.bannerContainer);
    });

    this.addEventListenerToAll(this.acceptButtons, 'click', () => {
      this.handleConsent();
    });

    this.addEventListenerToAll(this.rejectButtons, 'click', () => {
      this.handleRejection();
    });

    this.addEventListener(this.confirmButton, 'click', () => {
      this.updatePreference();
    });

    this.addEventListener(this.cookieCrumb, 'click', () => {
      this.syncTogglesToPreferences();
      this.showElement(this.settingsMenu);
    });
  }

  initializeAccordions() {
    // Why: Use arrow functions for consistency and proper 'this' binding
    this.settingsAccordions?.forEach((head) => {
      head.addEventListener('click', () => {
        const accordionBody = head.nextElementSibling;
        if (accordionBody) {
          head.classList.toggle('active');
          accordionBody.style.display = accordionBody.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  }

  blockCookies() {
    // Why: Use constants for preserved cookie names, avoid magic strings
    this.pendingCookies = document.cookie
      .split(';')
      .map((c) => c.trim())
      .filter((c) => c !== '');

    this.pendingCookies.forEach((cookie) => {
      const cookieName = cookie.split('=')[0]?.trim();
      // Only delete cookies that are not in the preserved list
      if (cookieName && !BANNER_CONFIG.PRESERVED_COOKIES.includes(cookieName)) {
        this.setCookie(cookieName, '', -1);
      }
    });

    this.categorizeCookies(this.csvData);
  }

  getCookie(cname) {
    // Why: Use strict equality (===) and modern string methods
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name)) {
        return trimmed.substring(name.length);
      }
    }
    return '';
  }

  setCookie(name, value, days) {
    // Why: Use template literals and optional chaining
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
  }

  getToggleInputs() {
    // Why: Use constants for selectors, avoid magic strings
    return {
      pC: document.querySelector(BANNER_CONFIG.SELECTORS.TOGGLE_PERFORMANCE),
      aC: document.querySelector(BANNER_CONFIG.SELECTORS.TOGGLE_ANALYTICS),
      mC: document.querySelector(BANNER_CONFIG.SELECTORS.TOGGLE_MARKETING),
      fC: document.querySelector(BANNER_CONFIG.SELECTORS.TOGGLE_FUNCTIONAL),
    };
  }

  updateAllTogglesState(isAccepted) {
    // Why: Use optional chaining for null-safe property access
    const toggles = this.getToggleInputs();
    toggles.pC && (toggles.pC.checked = isAccepted);
    toggles.aC && (toggles.aC.checked = isAccepted);
    toggles.mC && (toggles.mC.checked = isAccepted);
    toggles.fC && (toggles.fC.checked = isAccepted);
  }

  syncTogglesToPreferences() {
    // Why: Use constants for cookie names and improve null safety
    const toggles = this.getToggleInputs();
    
    if (toggles.pC) toggles.pC.checked = this.getCookie('Performance') === 'true';
    if (toggles.aC) toggles.aC.checked = this.getCookie('Analytics') === 'true';
    if (toggles.mC) toggles.mC.checked = this.getCookie('Marketing') === 'true';
    if (toggles.fC) toggles.fC.checked = this.getCookie('Functional') === 'true';
  }

  handleConsent() {
    // Why: Use constants for cookie names and consolidate cookie setting
    this.setCookie(BANNER_CONFIG.CONSENT_COOKIE_NAME, BANNER_CONFIG.CONSENT_VALUES.ACCEPTED, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    
    // Set all category preferences to accepted
    ['Strictly', 'Performance', 'Analytics', 'Marketing', 'Functional'].forEach((category) => {
      this.setPrefCookie(category, true, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    });

    this.updateAllTogglesState(true);
    this.hideElement(this.bannerContainer);
    this.hideElement(this.settingsMenu);
    this.showElement(this.cookieCrumb);
    this.loadConsentedScripts();
  }

  handleRejection() {
    // Why: Use constants and consolidate cookie deletion logic
    this.setCookie(BANNER_CONFIG.CONSENT_COOKIE_NAME, BANNER_CONFIG.CONSENT_VALUES.REJECTED, BANNER_CONFIG.COOKIE_DURATION_DAYS);

    // Set only Strictly Necessary to accepted, others to rejected
    this.setPrefCookie('Strictly', true, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    ['Performance', 'Analytics', 'Marketing', 'Functional'].forEach((category) => {
      this.setPrefCookie(category, false, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    });

    this.updateAllTogglesState(false);

    // Delete non-essential cookies
    const currentCookies = document.cookie.split(';').map((c) => c.trim());
    currentCookies.forEach((cookieStr) => {
      const cookieName = cookieStr.split('=')[0].trim();
      if (cookieName && !BANNER_CONFIG.PRESERVED_COOKIES.includes(cookieName)) {
        this.setCookie(cookieName, '', -1);
      }
    });

    this.pendingCookies = [];
    this.hideElement(this.bannerContainer);
    this.hideElement(this.settingsMenu);
    this.hideElement(this.cookieCrumb);
  }

  checkCookie() {
    // Why: Use constants for consent values
    const consent = this.getCookie(BANNER_CONFIG.CONSENT_COOKIE_NAME);
    
    if (consent === BANNER_CONFIG.CONSENT_VALUES.ACCEPTED) {
      this.hideElement(this.bannerContainer);
      this.showElement(this.cookieCrumb);
      this.syncTogglesToPreferences();
      return true;
    } else if (consent === BANNER_CONFIG.CONSENT_VALUES.REJECTED) {
      this.hideElement(this.bannerContainer);
      this.hideElement(this.cookieCrumb);
      this.syncTogglesToPreferences();
      return false;
    } else {
      // No consent decision made yet
      this.showElement(this.bannerContainer);
      this.hideElement(this.cookieCrumb);
      return false;
    }
  }

  setPrefCookie(categoryName, agreed, days = BANNER_CONFIG.COOKIE_DURATION_DAYS) {
    // Why: Convert boolean to string for consistency, use default parameter
    this.setCookie(categoryName, String(agreed), days);
  }

  updatePreference() {
    // Why: Consolidate cookie management, use constants for category names
    this.blockCookies();
    this.setCookie(BANNER_CONFIG.CONSENT_COOKIE_NAME, BANNER_CONFIG.CONSENT_VALUES.ACCEPTED, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    
    const toggles = this.getToggleInputs();

    // Set base category (always strictly necessary)
    this.setPrefCookie('Strictly', true, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    
    // Set optional categories based on toggle state
    if (toggles.pC) this.setPrefCookie('Performance', toggles.pC.checked, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    if (toggles.aC) this.setPrefCookie('Analytics', toggles.aC.checked, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    if (toggles.mC) this.setPrefCookie('Marketing', toggles.mC.checked, BANNER_CONFIG.COOKIE_DURATION_DAYS);
    if (toggles.fC) this.setPrefCookie('Functional', toggles.fC.checked, BANNER_CONFIG.COOKIE_DURATION_DAYS);

    this.loadConsentedScripts();

    // Build list of approved cookies based on preferences
    const approvedCookiesToSet = [];
    const categoryMappings = [
      {
        category: BANNER_CONFIG.COOKIE_CATEGORIES.STRICTLY_NECESSARY,
        alwaysInclude: true,
      },
      {
        category: BANNER_CONFIG.COOKIE_CATEGORIES.PERFORMANCE,
        toggle: toggles.pC,
      },
      {
        category: BANNER_CONFIG.COOKIE_CATEGORIES.ANALYTICS,
        toggle: toggles.aC,
      },
      {
        category: BANNER_CONFIG.COOKIE_CATEGORIES.MARKETING,
        toggle: toggles.mC,
      },
      {
        category: BANNER_CONFIG.COOKIE_CATEGORIES.FUNCTIONAL,
        toggle: toggles.fC,
      },
    ];

    categoryMappings.forEach(({ category, alwaysInclude, toggle }) => {
      if (alwaysInclude || toggle?.checked) {
        approvedCookiesToSet.push(...(this.categorizedCookies[category] || []));
      }
    });

    // Set approved cookies
    approvedCookiesToSet.forEach((cookieString) => {
      const [name, ...valueParts] = cookieString.split('=');
      const cookieName = name?.trim();
      const value = valueParts.join('=').trim();
      
      if (cookieName) {
        this.setCookie(cookieName, value, BANNER_CONFIG.COOKIE_DURATION_DAYS);
      }
    });

    this.hideElement(this.bannerContainer);
    this.hideElement(this.settingsMenu);
    this.showElement(this.cookieCrumb);
  }

  /**
   * Dynamically loads and executes scripts based on user's consent preferences.
   * Why: Refactored for clarity and consistency with constants
   */
  loadConsentedScripts() {
    const consentedCategories = [];
    
    // Build list of consented categories
    if (this.getCookie('Performance') === 'true') consentedCategories.push('performance');
    if (this.getCookie('Analytics') === 'true') consentedCategories.push('analytics');
    if (this.getCookie('Marketing') === 'true') consentedCategories.push('marketing');
    if (this.getCookie('Functional') === 'true') consentedCategories.push('functional');

    // Early return if no data
    if (!this.csvData || Object.keys(this.csvData).length === 0) {
      return;
    }

    // Process each cookie entry
    Object.entries(this.csvData).forEach(([key, cookieInfo]) => {
      const categoryFromCSV = cookieInfo.Category?.toLowerCase() ?? '';

      if (!consentedCategories.includes(categoryFromCSV)) {
        return; // Category not consented
      }

      // Load external script if available and not already loaded
      if (cookieInfo.ScriptURL && !this.loadedScripts.has(cookieInfo.ScriptURL)) {
        console.log(`Loading script for ${cookieInfo.Category}: ${cookieInfo.ScriptURL}`);
        const scriptElement = document.createElement('script');
        scriptElement.src = cookieInfo.ScriptURL;
        scriptElement.async = true;
        document.head.appendChild(scriptElement);
        this.loadedScripts.add(cookieInfo.ScriptURL);
      }

      // Execute inline script if available and not already loaded
      if (cookieInfo.InlineScript && !this.loadedScripts.has(cookieInfo.InlineScript)) {
        console.log(`Executing inline script for ${cookieInfo.Category}`);
        const inlineScriptElement = document.createElement('script');
        inlineScriptElement.textContent = cookieInfo.InlineScript;
        document.head.appendChild(inlineScriptElement);
        this.loadedScripts.add(cookieInfo.InlineScript);
      }
    });
  }
}

// --- Global Helper Functions ---

/**
 * Fetches and parses CSV data from a given URL
 * Why: Better error handling with specific HTTP error messages
 */
function readCSVFile(fileUrl) {
  if (!fileUrl) {
    return Promise.reject(new Error('CSV file URL is required'));
  }

  return fetch(fileUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${fileUrl}`);
      }
      return response.text();
    })
    .then((csvData) => parseCSV(csvData))
    .catch((error) => {
      console.error(`Failed to fetch CSV from ${fileUrl}:`, error);
      throw error;
    });
}

/**
 * Parses CSV data into a structured object
 * Why: Handle BOM and whitespace more robustly, use modern iteration
 */
function parseCSV(csvData) {
  if (!csvData || typeof csvData !== 'string') {
    return {};
  }

  // Remove BOM if present
  const sanitizedData = csvData.charCodeAt(0) === 0xfeff ? csvData.substring(1) : csvData;

  const parsedData = {};
  const rows = sanitizedData
    .replace(/\r/g, '')
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row.length > 0);

  if (rows.length === 0) return parsedData;

  const headers = rows
    .shift()
    .split(';')
    .map((h) => h.trim());

  rows.forEach((row) => {
    const rowData = row.split(';');
    const cookieObj = {};
    let cookieNameKey = '';

    headers.forEach((header, index) => {
      const value = rowData[index]?.trim() ?? '';
      cookieObj[header] = value;
      
      if (header === 'Cookie / Data Key name') {
        cookieNameKey = value;
      }
    });

    // Only add entry if we have a cookie name
    if (cookieNameKey) {
      parsedData[cookieNameKey] = cookieObj;
    }
  });

  return parsedData;
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  const CSV_URL = 'https://raw.githubusercontent.com/OpenformDevs/cookieCDN-GDPR-Update/main/open-cookie-database.csv';

  readCSVFile(CSV_URL)
    .then((data) => {
      if (!data || Object.keys(data).length === 0) {
        console.warn('CSV data is empty or could not be parsed correctly. Banner will still function but cookies may not be categorized.');
      }
      new Banner(data ?? {});
    })
    .catch((error) => {
      console.error('Failed to initialize banner:', error);
      new Banner({});
    });
