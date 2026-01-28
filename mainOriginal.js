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

  sNC;
  pC;
  fC;
  mC;
  aC;

  categorizedCookies;
  acceptedCategories;

  constructor(data) {
    this.sNC = false;
    this.pC = false;
    this.tC = false;
    this.fC = false;
    this.mC = false;
    this.aC = false;

    this.initialize();
    setTimeout(()=>{
      this.bannerContainer = document.querySelector(
      "[data-item='js-banner-container']"
    );
    this.settingsMenu = document.querySelector(
      "[data-item='js-settings-container']"
    );
    this.settingsContent = document.querySelector(
      "[data-item='js-settings-content']"
    );
    this.settingsButton = document.querySelector(
      "[data-item='js-settings-button']"
    );
    this.rejectButtons = document.querySelectorAll(
      "[data-item='js-reject-button']"
    );
    this.acceptButtons = document.querySelectorAll(
      "[data-item='js-accept-button']"
    );
    this.settingsCloseButton = document.querySelector(
      "[data-item='js-settings-close-button']"
    );
    this.settingsAccordions = document.querySelectorAll(
      "[data-item='js-settings-accordion-head']"
    );
    this.confirmButton = document.querySelector(
      "[data-item='js-confirm-button']"
    );
    this.cookieCrumb = document.querySelector(
      "[data-item='js-cookie-container']"
    );
    
    this.csvData = data;
    this.blockCookies();
    this.categorizeCookies(data);
    
    this.initializeAccordions();
    this.closeButton = document.querySelector("[data-item='js-close-button']");
    this.createEventListeners();
    this.hideElement(this.bannerContainer);
    this.checkCookie();
    },100);
    
  }

  initialize() {
    const containerNode = document.createElement("div");
    const settingsNode = document.createElement("div");
    const cookieNode = document.createElement("div");

    containerNode.classList.add("ofc-banner-container");
    containerNode.classList.add("visible");
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
    <div class='ofc-message-container'>
        <p>By clicking "Accept All Cookies", you agree to the storing of cookies on your device to enhance site navigation, analyse site usage, and assist in our marketing efforts.</p>
    </div>
    <div class='cookie-button-container'>
        <button data-item='js-settings-button' type='button' class='cookie-button'>Cookie Settings</button>
        <button data-item='js-reject-button' type='button' class='cookie-button'>Reject All</button>
        <button data-item='js-accept-button' type='button' class='cookie-button'>Accept All</button>
    </div>
    <div class='ofc-close-container'>
        <button class='cookie-button ofc-close' data-item='js-close-button'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg></button>
    </div>
    `;

    const settings = `
  <div data-item='js-settings-content' class='ofc-settings-content'>
  <img src="https://raw.githubusercontent.com/JoshOpenform/cookieCDN/main/images/cookieJar.jpg" class="cookieJar-logo" />
    <div class='ofc-settings-content-header'>
      <p>Privacy Preference Centre</p>
      <button class='ofc-close ofc-popclose' data-item='js-settings-close-button'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg></button>
    </div>
    <div>
        <p class="ofc-privacytext">When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is mostly used to make the site work as you expect it to. The information does not usually directly identify you, but it can give you a more personalised web experience. Because we respect your right to privacy, you can choose not to allow some types of cookies. Click on the different category headings to find out more and change our default settings. However, blocking some types of cookies may impact your experience of the site and the services we are able to offer.<br><a href="https://cookiepedia.co.uk/giving-consent-to-cookies">Click to view GDPR complience breakdown.</a></p>
        <button class='ofc-popbutton' data-item='js-accept-button'>Allow All</button>
    </div>
    <div class='ofc-settings'>
        <div class='ofc-accordion'>
          <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
              <p>Strictly Necessary Cookies</p>
              <label class="ofc-toggle-switch" data-item="js-toggle-sNC">
              <input type="checkbox">
              <span class="ofc-toggle-slider"></span>
            </label>
          </div>            
          <div class='ofc-accordion-body' style='display:none;'>
              <p>These are essential cookies that are necessary for a website to function properly. 
              They enable basic functions such as page navigation, access to secure areas, and ensuring that the website operates correctly. 
              Strictly necessary cookies are typically set in response to user actions, such as logging in or filling out forms. 
              They do not require user consent as they are crucial for the website's operation.</p>
          </div>
        </div>
        <div class='ofc-accordion'>
          <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
              <p>Performance Cookies</p>
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
        <div class='ofc-accordion'>
          <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
              <p>Marketing Cookies</p>
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
        <div class='ofc-accordion'>
          <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
              <p>Functional Cookies</p>
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
        <div class='ofc-accordion'>
          <div class="ofc-accordion-head" data-item="js-settings-accordion-head">
              <p>Analytic Cookies</p>
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
    </div>
    <div>
    <button class='ofc-popbutton' data-item='js-reject-button'>Reject All</button>
    <button class='ofc-popbutton' data-item='js-confirm-button'>Confirm My Choices</button>
    </div>
    </div>`;
    containerNode.innerHTML = banner;
    settingsNode.innerHTML = settings;
    cookieNode.innerHTML = cookieCrumb;

    document.body.appendChild(containerNode);
    document.body.appendChild(settingsNode);
    document.body.appendChild(cookieNode);
    
  }

  showElement(element) {
    element.classList.add("visible");
  }

  hideElement(element) {
    element.classList.remove("visible");
  }

  categorizeCookies(data) {
    let categorizedCookies = {};
    try {
      this.pendingCookies.forEach((cookie) => {
        let cookieName = cookie.split("=")[0].trim();

        let cookieEntry = data.find(
          (entry) =>
            entry["Cookie / Data Key name"] &&
            entry["Cookie / Data Key name"].trim() === cookieName
        );

        if (cookieEntry) {
          let category = cookieEntry["Category"];

          // If the category doesn't exist yet, create it
          if (!categorizedCookies[category]) {
            categorizedCookies[category] = [];
            // this.acceptedCategories.push(category);
          }

          categorizedCookies[category].push(cookie);
        } else {
          // If "Other" category doesn't exist yet, create it
          if (!categorizedCookies["Other"]) {
            categorizedCookies["Other"] = [];
          }

          categorizedCookies["Other"].push(cookie);
        }
      });
      this.categorizeCookies = categorizedCookies;
      console.log(this.categorizeCookies);
    } catch (e) {}
  }

  createEventListeners() {
    this.settingsButton.addEventListener("click", () => {
      this.showElement(this.settingsMenu);
    });
    this.settingsCloseButton.addEventListener("click", () => {
      this.hideElement(this.settingsMenu);
    });
    this.closeButton.addEventListener("click", () => {
      this.hideElement(this.bannerContainer);
    });
    for (let i = 0; i < this.acceptButtons.length; i++) {
      this.acceptButtons[i].addEventListener("click", () => {
        this.handleConsent();
      });
    }
    for (let i = 0; i < this.rejectButtons.length; i++) {
      this.rejectButtons[i].addEventListener("click", () => {
        this.handleRejection();
      });
    }
    this.confirmButton.addEventListener("click", () => {
      this.updatePreference();
      this.hideElement(this.bannerContainer);
      this.hideElement(this.settingsMenu);
    });
    this.cookieCrumb.addEventListener("click", () => {
      this.showElement(this.settingsMenu);
    });
  }

  initializeAccordions() {
    this.settingsAccordions.forEach(function (head) {
      head.addEventListener("click", function () {
        let accordionBody = head.nextElementSibling;
        accordionBody.style.display =
          accordionBody.style.display === "none" ? "block" : "none";
      });
    });
  }

  blockCookies() {
    this.pendingCookies = document.cookie.split(";");
      for (let i = 0; i < this.pendingCookies.length; i++) {
        let cookieName = this.pendingCookies[i].split("=")[0].trim(); // get name of cookie
        if(cookieName){
          let cookieValue = this.pendingCookies[i].split("=")[1].trim(); // get value of cookie update
          if (cookieName === "ofcPer") {
            cookieValue === "yes" ? this.handleConsent() : this.handleRejection();
            break;
          }
          this.setCookie(cookieName, "", -1);
      } 
  }
}

  getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  setCookie(name, value, days) {
    let expires = "";

    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  handleConsent() {
    for (let i = 0; i < this.pendingCookies.length; i++) {
      let cookieName = this.pendingCookies[i].split("=")[0].trim(); // get name of cookie
      if(cookieName){
        let cookieValue = this.pendingCookies[i].split("=")[1].trim(); // get value of cookie if there is a corrisponding name 
        this.setCookie(cookieName, cookieValue, 7);
      }
    }
    this.pendingCookies = [];
    this.setCookie("ofcPer", "yes", 7);
    this.hideElement(this.bannerContainer);
    this.hideElement(this.settingsMenu);
    this.showElement(this.cookieCrumb);
  }

  handleRejection() {
    let list = [];
    if (this.pendingCookies.length <= 0) {
      list = document.cookie.split(";");
    } else {
      list = this.pendingCookies;
    }
    for (let i = 0; i < list.length; i++) {
      let cookieName = list[i].split("=")[0].trim(); // get name of cookie
      this.setCookie(cookieName, "", -1);
    }
    this.setCookie("ofcPer", "no", 7);
    this.pendingCookies = [];
    this.list = [];
    this.hideElement(this.bannerContainer);
    this.hideElement(this.settingsMenu);
  }

  checkCookie() {
    let consent = this.getCookie("ofcPer");
    if (consent === "" || consent === "no") {
      this.showElement(this.bannerContainer);
    } else {
      this.showElement(this.cookieCrumb);
    }
    return consent;
  }

  updatePreference() {
    this.blockCookies();
    this.setCookie("ofcPer", "yes", 7);
    let approvedCookies = [];
    let cookieList = [];
    let sNCToggle = document.querySelector("[data-item='js-toggle-sNC'] input");
    let pCToggle = document.querySelector("[data-item='js-toggle-pC'] input");
    let aCToggle = document.querySelector("[data-item='js-toggle-aC'] input");
    let mCToggle = document.querySelector("[data-item='js-toggle-mC'] input");
    let fCToggle = document.querySelector("[data-item='js-toggle-fC'] input");

    sNCToggle.checked ? approvedCookies.push("Strictly") : "";
    pCToggle.checked ? approvedCookies.push("Performance") : "";
    aCToggle.checked ? approvedCookies.push("Analytics") : "";
    mCToggle.checked ? approvedCookies.push("Marketing") : "";
    fCToggle.checked ? approvedCookies.push("Functional") : "";

    if (sNCToggle.checked && this.categorizeCookies["Strictly"]) {
      cookieList.push(...this.categorizeCookies["Strictly"]);
    }
    if (pCToggle.checked && this.categorizeCookies["Performance"]) {
      cookieList.push(...this.categorizeCookies["Performance"]);
    }
    if (aCToggle.checked && this.categorizeCookies["Analytics"]) {
      cookieList.push(...this.categorizeCookies["Analytics"]);
    }
    if (mCToggle.checked && this.categorizeCookies["Marketing"]) {
      cookieList.push(...this.categorizeCookies["Marketing"]);
    }
    if (fCToggle.checked && this.categorizeCookies["Functional"]) {
      cookieList.push(...this.categorizeCookies["Functional"]);
    }

    // Add the approved cookies to document.cookie
    cookieList.forEach((cookie) => {
      document.cookie = cookie;
    });
  }
}

function readCSVFile(fileUrl) {
  return fetch(fileUrl)
    .then((response) => response.text())
    .then((csvData) => parseCSV(csvData));
}

function parseCSV(csvData) {
  // Split the CSV data into rows
  var rows = csvData.split("\n");

  // Stitch rows above and below an empty row (including random empty rows)
  var stitchedRows = [];
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].trim() !== "") {
      stitchedRows.push(rows[i].trim());
    } else if (i > 0 && i < rows.length - 1) {
      // Check if the empty row is not the first or last row
      var mergedRow = stitchedRows.pop() + rows[i + 1].trim();
      stitchedRows.push(mergedRow);
      i++; // Skip the next row as it has been merged
    }
  }

  // Remove empty rows
  stitchedRows = stitchedRows.filter((row) => row.trim() !== "");

  // Extract headers from the first row
  var headers = stitchedRows[0].split(",");

  // Parse the remaining rows
  var parsedData = stitchedRows.slice(1).map((row) => {
    var rowData = row.split(",");
    var entry = {};
    headers.forEach((header, index) => {
      entry[header] = rowData[index];
    });
    return entry;
  });

  return parsedData;
}

readCSVFile(
  "https://raw.githubusercontent.com/jkwakman/Open-Cookie-Database/master/open-cookie-database.csv"
)
  .then((data) => {
    const banner = new Banner(data);
  })
  .catch((error) => {
    console.error(error);
  });
