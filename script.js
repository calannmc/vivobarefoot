document.addEventListener('DOMContentLoaded', function() {
  // Key map
  var ENTER = 13;
  var ESCAPE = 27;
  var SPACE = 32;
  var UP = 38;
  var DOWN = 40;
  var TAB = 9;

  function closest(element, selector) {
    if (Element.prototype.closest) {
      return element.closest(selector);
    }
    do {
      if (Element.prototype.matches && element.matches(selector)
        || Element.prototype.msMatchesSelector && element.msMatchesSelector(selector)
        || Element.prototype.webkitMatchesSelector && element.webkitMatchesSelector(selector)) {
        return element;
      }
      element = element.parentElement || element.parentNode;
    } while (element !== null && element.nodeType === 1);
    return null;
  }

  // Hide the attachment field globally
  var attachmentField = document.querySelector('#request-attachments-pool');
  if (attachmentField) {
    attachmentField.style.display = 'none'; // Hides globally
  }

  // Show the attachment field only on the specific form page
  if (window.location.href.includes('requests/new?ticket_form_id=21510176455197')) {
    if (attachmentField) {
      attachmentField.style.display = ''; // Reset display to default
    }
  }

  // Event Listener on image to open chat widget
  function openChat() {
    const liveChat = document.getElementById('live__image');
    if (liveChat) {
      liveChat.addEventListener('click', function(e) {
        e.preventDefault();
        zE.setLocale('de');
        zE('messenger', 'open');
      });
    }
  }

  // Social share popups
  Array.prototype.forEach.call(document.querySelectorAll('.share a'), function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      window.open(this.href, '', 'height=500, width=500');
    });
  });

  // Preserve focus after page reload
  function saveFocus() {
    var activeElementId = document.activeElement.getAttribute("id");
    sessionStorage.setItem('returnFocusTo', '#' + activeElementId);
  }
  var returnFocusTo = sessionStorage.getItem('returnFocusTo');
  if (returnFocusTo) {
    sessionStorage.removeItem('returnFocusTo');
    var returnFocusToEl = document.querySelector(returnFocusTo);
    if (returnFocusToEl) {
      returnFocusToEl.focus();
    }
  }

  // Callback function to execute when mutations in form attachments or dropdown are observed: 
  var mutationObservedForm = function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (mutation.type == 'childList') {
        setFormAttachmentCheckbox();
      }
    });
  };

  // Define some variables for requiring form attachments
  var attachmentCheckboxField = 'request_custom_fields_4664149777693';
  var attachmentCheckboxId = '#' + attachmentCheckboxField;
  var attachmentErrorNotification = '';
  var formDropdownClass = '.request_custom_fields_360031285578';
  var formObserveMutationOptions = { childList: true, subtree: true };

  // Clear or select checkbox according to dropdown and attachments:
  function setFormAttachmentCheckbox() {
    if (isFormAttachmentRequired()) {
      if ($('#request-attachments-pool .upload-item').length) {
        selectCheckbox(attachmentCheckboxId);
      }
      else {
        clearCheckbox(attachmentCheckboxId);
      }
    } else {
      selectCheckbox(attachmentCheckboxId);
    }
  }

  // Determine if the attachment is required
  function isFormAttachmentRequired() {
    let empty = $(formDropdownClass + ' a.nesty-input').attr('aria-expanded') &&
                $(formDropdownClass + ' a.nesty-input').text() === '-';

    let order = $(formDropdownClass + ' a.nesty-input').attr('aria-expanded') &&
                $(formDropdownClass + ' a.nesty-input').text() === 'Faulty/Damaged Item'; 

    let returns = $(formDropdownClass + ' a.nesty-input').attr('aria-expanded') &&
                  $(formDropdownClass + ' a.nesty-input').text() === 'Product Quality'; 

    let amend = $(formDropdownClass + ' a.nesty-input').attr('aria-expanded') &&
                $(formDropdownClass + ' a.nesty-input').text() === 'Amend order details'; 
    
    if(order) {
      $('#request-attachments-pool').parent().show();
      return order;
    }
    
    if(returns) {
      $('#request-attachments-pool').parent().show();
      return returns;
    }
     
    $('#request-attachments-pool').parent().hide();
  }

  // Select and clear checkbox functions
  function selectCheckbox(eltselector) {
    $(eltselector).prop('checked', true);
  }

  function clearCheckbox(eltselector) {
    $(eltselector).prop('checked', false);
  }

  // If attachment checkbox field exists, watch for changes
  if ($(attachmentCheckboxId).length) {
    selectCheckbox(attachmentCheckboxId);
    startObserveMutations('#request-attachments-pool', formObserveMutationOptions, mutationObservedForm);
    startObserveMutations(formDropdownClass, formObserveMutationOptions, mutationObservedForm);
  }

  var attachmentErrorElt = $('.' + attachmentCheckboxField + ' .notification-error');
  if (attachmentErrorElt.length) {
    attachmentErrorElt.text(attachmentErrorNotification);
  }

  setFormAttachmentCheckbox();

  document.querySelector("label[for='request-attachments']").textContent = 'Please upload any relevant images or photos relating to your enquiry';

  // Expand Request comment form when Add to conversation is clicked
  var showRequestCommentContainerTrigger = document.querySelector('.request-container .comment-container .comment-show-container'),
      requestCommentFields = document.querySelectorAll('.request-container .comment-container .comment-fields'),
      requestCommentSubmit = document.querySelector('.request-container .comment-container .request-submit-comment');

  if (showRequestCommentContainerTrigger) {
    showRequestCommentContainerTrigger.addEventListener('click', function() {
      showRequestCommentContainerTrigger.style.display = 'none';
      Array.prototype.forEach.call(requestCommentFields, function(e) { e.style.display = 'block'; });
      requestCommentSubmit.style.display = 'inline-block';

      if (commentContainerTextarea) {
        commentContainerTextarea.focus();
      }
    });
  }

  // Mark as solved button
  var requestMarkAsSolvedButton = document.querySelector('.request-container .mark-as-solved:not([data-disabled])'),
      requestMarkAsSolvedCheckbox = document.querySelector('.request-container .comment-container input[type=checkbox]'),
      requestCommentSubmitButton = document.querySelector('.request-container .comment-container input[type=submit]');

  if (requestMarkAsSolvedButton) {
    requestMarkAsSolvedButton.addEventListener('click', function() {
      requestMarkAsSolvedCheckbox.setAttribute('checked', true);
      requestCommentSubmitButton.disabled = true;
      this.setAttribute('data-disabled', true);
      closest(this, 'form').submit();
    });
  }

  // Change Mark as solved text according to whether comment is filled
  var requestCommentTextarea = document.querySelector('.request-container .comment-container textarea');

  var usesWysiwyg = requestCommentTextarea && requestCommentTextarea.dataset.helper === "wysiwyg";

  function isEmptyPlaintext(s) {
    return s.trim() === '';
  }

  function isEmptyHtml(xml) {
    var doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
    var img = doc.querySelector("img");
    return img === null && isEmptyPlaintext(doc.children[0].textContent);
  }

  var isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

  if (requestCommentTextarea) {
    requestCommentTextarea.addEventListener('input', function() {
      if (isEmpty(requestCommentTextarea.value)) {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-translation');
        }
        requestCommentSubmitButton.disabled = true;
      } else {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-and-submit-translation');
        }
        requestCommentSubmitButton.disabled = false;
      }
    });
  }

  // Disable submit button if textarea is empty
  if (requestCommentTextarea && isEmpty(requestCommentTextarea.value)) {
    requestCommentSubmitButton.disabled = true;
  }

  // Submit requests filter form on status or organization change in the request list page
  Array.prototype.forEach.call(document.querySelectorAll('#request-status-select, #request-organization-select'), function(el) {
    el.addEventListener('change', function(e) {
      e.stopPropagation();
      saveFocus();
      closest(this, 'form').submit();
    });
  });

  // Submit requests filter form on search in the request list page
  var quickSearch = document.querySelector('#quick-search');
  quickSearch && quickSearch.addEventListener('keyup', function(e) {
    if (e.keyCode === ENTER) {
      e.stopPropagation();
      saveFocus();
      closest(this, 'form').submit();
    }
  });

  function toggleNavigation(toggle, menu) {
    var isExpanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', !isExpanded);
    toggle.setAttribute('aria-expanded', !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute('aria-expanded', false);
    toggle.setAttribute('aria-expanded', false);
    toggle.focus();
  }

  var menuButton = document.querySelector('.header .menu-button-mobile');
  var menuList = document.querySelector('#user-nav-mobile');

  menuButton.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleNavigation(this, menuList);
  });

  menuList.addEventListener('keyup', function(e) {
    if (e.keyCode === ESCAPE) {
      e.stopPropagation();
      closeNavigation(menuButton, this);
    }
  });

  // Toggles expanded aria to collapsible elements
  var collapsible = document.querySelectorAll('.collapsible-nav, .collapsible-sidebar');

  Array.prototype.forEach.call(collapsible, function(el) {
    var toggle = el.querySelector('.collapsible-nav-toggle, .collapsible-sidebar-toggle');

    el.addEventListener('click', function(e) {
      toggleNavigation(toggle, this);
    });

    el.addEventListener('keyup', function(e) {
      if (e.keyCode === ESCAPE) {
        closeNavigation(toggle, this);
      }
    });
  });

  // Submit organization form in the request page
  var requestOrganisationSelect = document.querySelector('#request-organization select');

  if (requestOrganisationSelect) {
    requestOrganisationSelect.addEventListener('change', function() {
      closest(this, 'form').submit();
    });
  }

  // If multibrand search has more than 5 help centers or categories collapse the list
  var multibrandFilterLists = document.querySelectorAll(".multibrand-filter-list");
  Array.prototype.forEach.call(multibrandFilterLists, function(filter) {
    if (filter.children.length > 6) {
      // Display the show more button
      var trigger = filter.querySelector(".see-all-filters");
      trigger.setAttribute("aria-hidden", false);

      // Add event handler for click
      trigger.addEventListener("click", function(e) {
        e.stopPropagation();
        trigger.parentNode.removeChild(trigger);
        filter.classList.remove("multibrand-filter-list--collapsed")
      })
    }
  });

  // If there are any error notifications below an input field, focus that field
  var notificationElm = document.querySelector(".notification-error");
  if (
    notificationElm &&
    notificationElm.previousElementSibling &&
    typeof notificationElm.previousElementSibling.focus === "function"
  ) {
    notificationElm.previousElementSibling.focus();
  }

  // Dropdowns
  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains("dropdown-menu-top"),
      end: menu.classList.contains("dropdown-menu-end")
    };

    this.toggle.addEventListener("click", this.clickHandler.bind(this));
    this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
    this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.menu.getAttribute("aria-expanded") === "true";
    },

    get menuItems() {
      return Array.prototype.slice.call(this.menu.querySelectorAll("[role='menuitem']"));
    },

    dismiss: function() {
      if (!this.isExpanded) return;

      this.menu.setAttribute("aria-expanded", false);
      this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
    },

    open: function() {
      if (this.isExpanded) return;

      this.menu.setAttribute("aria-expanded", true);
      this.handleOverflow();
    },

    handleOverflow: function() {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add("dropdown-menu-end");
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add("dropdown-menu-top");
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove("dropdown-menu-top")
      }
    },

    focusNextMenuItem: function(currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var nextIndex = currentIndex === this.menuItems.length - 1 || currentIndex < 0 ? 0 : currentIndex + 1;

      this.menuItems[nextIndex].focus();
    },

    focusPreviousMenuItem: function(currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var previousIndex = currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.menuItems[previousIndex].focus();
    },

    clickHandler: function() {
      if (this.isExpanded) {
        this.dismiss();
      } else {
        this.open();
      }
    },

    toggleKeyHandler: function(e) {
      switch (e.keyCode) {
        case ENTER:
        case SPACE:
        case DOWN:
          e.preventDefault();
          this.open();
          this.focusNextMenuItem();
          break;
        case UP:
          e.preventDefault();
          this.open();
          this.focusPreviousMenuItem();
          break;
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
      }
    },

    menuKeyHandler: function(e) {
      var firstItem = this.menuItems[0];
      var lastItem = this.menuItems[this.menuItems.length - 1];
      var currentElement = e.target;

      switch (e.keyCode) {
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
        case DOWN:
          e.preventDefault();
          this.focusNextMenuItem(currentElement);
          break;
        case UP:
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        case TAB:
          if (e.shiftKey) {
            if (currentElement === firstItem) {
              this.dismiss();
            } else {
              e.preventDefault();
              this.focusPreviousMenuItem(currentElement);
            }
          } else if (currentElement === lastItem) {
            this.dismiss();
          } else {
            e.preventDefault();
            this.focusNextMenuItem(currentElement);
          }
          break;
        case ENTER:
        case SPACE:
          e.preventDefault();
          currentElement.click();
          break;
      }
    }
  }

  var dropdowns = [];
  var dropdownToggles = Array.prototype.slice.call(document.querySelectorAll(".dropdown-toggle"));

  dropdownToggles.forEach(function(toggle) {
    var menu = toggle.nextElementSibling;
    if (menu && menu.classList.contains("dropdown-menu")) {
      dropdowns.push(new Dropdown(toggle, menu));
    }
  });

  document.addEventListener("click", function(evt) {
    dropdowns.forEach(function(dropdown) {
      if (!dropdown.toggle.contains(evt.target)) {
        dropdown.dismiss();
      }
    });
  });
});

// MW-Notification Banner
document.addEventListener('DOMContentLoaded', async function () {
  const label = 'alert';
  const showArticleBody = true;
  const locale = document.querySelector('html').getAttribute('lang').toLowerCase();
  const url = `/api/v2/help_center/${locale}/articles.json?label_names=${label}`;

  const data = await (await fetch(url)).json();
  const articles = (data && data.articles) || [];

  for (let i = 0; i < articles.length; i++) {
    const url = articles[i].html_url;
    const title = articles[i].title;
    const body = articles[i].body;

    const html = `
      <div class="ns-box ns-bar ns-effect-slidetop ns-type-notice ns-show">
        <div class="ns-box-inner">
          <span class="megaphone"></span>
          <p>
            <a href="${url}">${title}</a>
            ${showArticleBody ? body : ''}
          </p>
        </div>
        <span class="ns-close"></span>
      </div>
    `;

    document.querySelector('.alertbox').insertAdjacentHTML('beforeend', html);
  }
});

document.addEventListener('click', function (event) {
  if (event.target.matches('.ns-close')) {
    event.preventDefault();
    event.target.parentElement.remove();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }
});
