/**
 * @file menu_handler.js
 * @brief JS implementation of the menu injection handler.
 */

'use strict';

// Define a namespace for C2C
if (!window.SkypeClick2Call) {
    window.SkypeClick2Call = {};
}

if (!SkypeClick2Call.MenuInjectionHandler) {
    SkypeClick2Call.MenuInjectionHandler = {};
}

/**
 * Maximum number of iteration allowed to check if mouse is over an element.
 */
SkypeClick2Call.MenuInjectionHandler.MOUSE_OVER_MAX_ITERATION = 10;

/**
 * How long should you mouseover over highlight to make popup appear, millisecs
 */
SkypeClick2Call.MenuInjectionHandler.HOVER_TIMER =  500;

/**
 * How long should mouse be out of highlight to make popup hide, millisecs
 */
SkypeClick2Call.MenuInjectionHandler.MOUSEOUT_TIMER = 600;

/**
 * Variables to manage delayed menu display
 */
SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer = null;
SkypeClick2Call.MenuInjectionHandler.lastTarget = null;

// Timer variable to measure mouse out time and click time
SkypeClick2Call.hoverTime = 0;

SkypeClick2Call.MenuInjectionHandler.menu = null;
SkypeClick2Call.MenuInjectionHandler.SkypeAction = null;

/*
* Returns the skype menu properties
*/
SkypeClick2Call.GetMenuProps = function(containerElement) {
    return {
        "numberToCall" : containerElement.getAttribute("data-numbertocall"),
        "isFreecall" : containerElement.getAttribute("data-isfreecall") == "true",
        "isRtl" : containerElement.getAttribute("data-isrtl") == "true",
        "isMobile" : containerElement.getAttribute("data-ismobile") == "true"
    };
};

/*
* Returns the menu container element
*/
SkypeClick2Call.GetMenu = function() {
    if(!SkypeClick2Call.MenuInjectionHandler.menu)
    {
        SkypeClick2Call.MenuInjectionHandler.menu = document.getElementById("skype_c2c_menu_container");
    }
    return SkypeClick2Call.MenuInjectionHandler.menu;
};

/**
* Returns the action elements from menu container
*/
SkypeClick2Call.GetSkypeAction = function() {
    if(!SkypeClick2Call.MenuInjectionHandler.SkypeAction)
    {
        SkypeClick2Call.MenuInjectionHandler.SkypeAction = {
            call: document.getElementById("skype_c2c_menu_click2call_action"),
            sendSMS: document.getElementById("skype_c2c_menu_click2sms_action"),
            addToSkype: document.getElementById("skype_c2c_menu_add2skype_text")
        };
        
        if(SkypeClick2Call.UIID() === 1)
        {
            SkypeClick2Call.MenuInjectionHandler.SkypeAction.helpLink = document.getElementById("skype_c2c_menu_help_page_text_ui1");
        }
    }
    
    return SkypeClick2Call.MenuInjectionHandler.SkypeAction;
}

/**
 * Return string to append to class name based on UI id.
 * This will help pick the right css class
**/
SkypeClick2Call.UI = function() {
    var uiStr = "";
    var uiId = SkypeClick2Call.UIID();
    if ( uiId != 0 ) {
        uiStr = "_ui" + uiId;
    } 

    return uiStr;
};

/**
 * Return a valid UI id.
 * If UI id is undefined then returns 0
**/
SkypeClick2Call.UIID = function() {

    var menu = SkypeClick2Call.GetMenu();
    if(menu) {
        var uiid = menu.getAttribute('data-uiid');
        if(null === uiid || ("" === uiid)) {
            uiid = "0";
        }
        return parseInt(uiid);
    } else {
        return 0;
    }
};

/**
 * Return a valid fingerprint.
 * If fingerprint is undefined then returns "0"
**/
SkypeClick2Call.FP = function() {

    var menu = SkypeClick2Call.GetMenu();
    if(menu) {
        var fp = menu.getAttribute('data-fp');
        if((null === fp) || ("" === fp)) {
            fp = "0";
        }
        return fp;
    } else {
        return "0";
    }
};

/**
 * Return a valid metrics url
 * If metrics url is undefined then returns ""
**/
SkypeClick2Call.MetricsUrl = function() {

    var menu = SkypeClick2Call.GetMenu();
    if(menu) {
        var murl = menu.getAttribute('data-murl');
        if(null === murl) {
            murl = "";
        }
        return murl;
    } else {
        return "";
    }
};

/**
 * Identify browser name and version
 */
SkypeClick2Call.MenuInjectionHandler.fillBrowserInformation = function(userAgent) {
    var userAgent = userAgent.toLowerCase(),
        match,
        browser = {"name": "unknown", "version": "0"};

    match = /(chrome)[ \/]([\w\.]+)/.exec(userAgent) ||
        /(webkit)[ \/]([\w\.]+)/.exec(userAgent) ||
        /(msie) ([\w\.]+)/.exec(userAgent) ||
        /(trident)(?:[\s\S]*? rv:([\w\.]+)|)/.exec(userAgent) ||
        userAgent.indexOf("compatible") < 0 && /(mozilla)(?:[\s\S]*? rv:([\w\.]+)|)/.exec(userAgent) ||
        [];

    if (match.length >= 3) {
        browser[match[1]] = true;
        browser.name = match[1];
        browser.version = match[2];
    }
    if (browser.webkit) { // Drop safari browser
        browser = {"name": "unknown", "version": "0"};
    } else if (browser.trident) {
        browser.msie = true;
        browser.name = "msie";
    }

    SkypeClick2Call.MenuInjectionHandler.browser = browser;
};

SkypeClick2Call.MenuInjectionHandler.fillBrowserInformation(navigator.userAgent);

/**
 * Based on the specified event (mouse over), extracts mouse position, and page
 * and element scroll offsets to compute menu coordinates.
 *
 * @param element   the element which triggered the event
 * @param event     the mouse event
 * @return menu coordinates
 */
SkypeClick2Call.MenuInjectionHandler.getMenuCoordinates = function (element, event) {
    // Adjust event according to browser
    event = event || window.event;

    // Menu coordinates
    var coordinates = {};

    // Compute menu position based on the method getBoundingClientRect
    var textElement = SkypeClick2Call.MenuInjectionHandler.getChildElement(element, "span", "skype_c2c_text_span");

    if (textElement != null && textElement.getBoundingClientRect) {
        var elementRect = textElement.getBoundingClientRect();

        // If 'Free' text span visible use it as X reference, otherwise use number
        // text span. In case hightlighted number spans into two or more lines,
        // always use number text span as reference.
        var freeTextElement = SkypeClick2Call.MenuInjectionHandler.getChildElement(element, "span", "skype_c2c_free_text_span");

        // Use 'Free' text span bounding rect to check if highlight spans into more
        // than one line.
        var freeElementRect = freeTextElement.getBoundingClientRect();

        //TBAR-4687 - FREE is now on right
        //          - with FREE on right we should not configure the menu next to the FREE
        coordinates.y = elementRect.bottom;
        coordinates.x = SkypeClick2Call.MenuInjectionHandler.isRtl ? elementRect.right : elementRect.left;

        // this is a placeholder for future work to make menu position configurable
        var alignWithFree = 0;
        if (alignWithFree > 0) {
            if (freeTextElement != null &&
                freeTextElement.offsetWidth > 0 &&
            // Free text is now bold and may get higher value for bottom than phone number
                freeElementRect.bottom >= elementRect.bottom) {
                coordinates.x = SkypeClick2Call.MenuInjectionHandler.isRtl ?
                                    freeTextElement.getBoundingClientRect().right :
                                    freeTextElement.getBoundingClientRect().left;
            }
        }

        // Get width considering phone number may be wrapped
        coordinates.width = elementRect.right - coordinates.x;
        // Get height based on skype_c2c_highlighting_inactive_free or skype_c2c_highlighting_inactive_common
        var pnhElement = SkypeClick2Call.MenuInjectionHandler.getChildElement(element, "span", "skype_c2c_highlighting");

        coordinates.height = textElement.offsetHeight;
        if (pnhElement != null && pnhElement.offsetHeight > coordinates.height) {
            coordinates.height = pnhElement.offsetHeight;
        }

        // Adjust the coordinates provided by getBoundingClientRect() considering the element and body borders
        if (SkypeClick2Call.MenuInjectionHandler.browser.msie) {
            var borderOffset;
            if (element.currentStyle) {
                if (!isNaN(borderOffset = parseInt(element.currentStyle["borderLeftWidth"]))) {
                    coordinates.x -= borderOffset;
                }
                if (!isNaN(borderOffset = parseInt(element.currentStyle["borderTopWidth"]))) {
                    coordinates.y -= borderOffset;
                }
            }
            if (document.body.currentStyle) {
                if (!isNaN(borderOffset = parseInt(document.body.currentStyle["borderLeftWidth"]))) {
                    coordinates.x -= borderOffset;
                }
                if (!isNaN(borderOffset = parseInt(document.body.currentStyle["borderTopWidth"]))) {
                    coordinates.y -= borderOffset;
                }
            }
        }
    }

    // Compute document offset
    var xScroll = 0;
    var yScroll = 0;
    if (typeof (window.pageYOffset) == 'number' || typeof (window.pageXOffset) == 'number') {
        yScroll = window.pageYOffset;
        xScroll = window.pageXOffset;
    }
    else if (document.documentElement &&
             (typeof (document.documentElement.scrollLeft) == 'number' || typeof (document.documentElement.scrollTop) == 'number')) {
        yScroll = document.documentElement.scrollTop;
        xScroll = document.documentElement.scrollLeft;
    }
    else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        yScroll = document.body.scrollTop;
        xScroll = document.body.scrollLeft;
    }

    coordinates.x += xScroll;
    coordinates.y += yScroll;
    // Adjust gap between number and menu
    coordinates.y += 2;
    coordinates.x += 2;

    // TBAR-3647 + 3328 adjust the coordinates provided by
    // getBoundingClientRect() for bodies with relative and absolute position.
    var bodyPos = SkypeClick2Call.MenuInjectionHandler.getCurrentStyle(document.body, "position");
    if (bodyPos == "absolute" || bodyPos == "relative") {
        var box = document.body.getBoundingClientRect();
        coordinates.x -= (box.left + xScroll);
        coordinates.y -= (box.top + yScroll);
    }

    return coordinates;
};

/**
 * Get current style property applied to the given element.
 *
 * @param element      the element
 * @param styleProp    the style property to be retrieved
 * @return the styleProp value
 */
SkypeClick2Call.MenuInjectionHandler.getCurrentStyle = function(element, styleProp)
{
    var propValue;
    if (element.currentStyle) {
        // IE
        propValue = element.currentStyle[styleProp];
    }
    else if (window.getComputedStyle) {
        // FF and Chrome
        propValue = document.defaultView.getComputedStyle(element, null)[styleProp];
    }

    return propValue;
};

/**
 * Get child element based on its tagId and className
 *
 * @param parentElement   the parent element
 * @param childTag     childs tag id
 * @param childClassName     childs class name
 * @return the child element
 */
SkypeClick2Call.MenuInjectionHandler.getChildElement = function(parentElement, childTag,  childClassName)
{
    var result = null;
    var spanElements = parentElement.getElementsByTagName(childTag);
    for (var i=0; i<spanElements.length; i++) {
        if (spanElements[i].className.indexOf(childClassName) == 0) {
            result = spanElements[i];
            break;
        }
    }

    return result;
};

/**
 * Check menu visibility.
 *
 * @return true if menu is visible, false otherwise.
 */
SkypeClick2Call.MenuInjectionHandler.isVisible = function()
{
    return (SkypeClick2Call.GetMenu().style.display != 'none');
};

/**
 * Set menu visibility.
 *
 * @param visible     boolean which tells whether menu should be visible or not.
 * @param coordinates coordinates where to place menu
 */
SkypeClick2Call.MenuInjectionHandler.displayMenu = function(visible, coordinates)
{
    var menu = SkypeClick2Call.GetMenu();

    // Convert parameter into CSS value and set up menu visibility
    var visibility = visible ? "" : "none";

    if (visible && coordinates) {
        menu.style.left = coordinates.x + "px";
        menu.style.top = coordinates.y + "px";
    }

    menu.style.display = visibility;
};

SkypeClick2Call.MenuInjectionHandler.switchToFree = function()
{
    SkypeClick2Call.GetMenu().className = "skype_c2c_menu_container" + SkypeClick2Call.UI() + " skype_c2c_free_active notranslate";
};

SkypeClick2Call.MenuInjectionHandler.switchToMobile = function()
{
    SkypeClick2Call.GetMenu().className = "skype_c2c_menu_container" + SkypeClick2Call.UI() + " skype_c2c_mobile_active notranslate";
};

/**
* Returns the product version number
*
* @return Product version number
*/
function getProductVersion() {
    return "7.3.16540.9015";
}

/**
 * Compose call origin field for specified number
 *
 * @param skypeProps   the set of Skype properties
 * @return originField   Call origin field
 */
SkypeClick2Call.MenuInjectionHandler.createOriginField = function(skypeProps) {
    // Add toolbar info 
    var toolbarAgentsMap = {
        "msie":    "IETB",
        "chrome":  "CHROMETB",
        "mozilla": "FFTB",
        "unknown": "WIN_UNKNOWN_TB"
    }
    
    var origin = {};
    origin.agent = toolbarAgentsMap[SkypeClick2Call.MenuInjectionHandler.browser.name];
    origin.agent += "/" + getProductVersion();
    
    origin.browser = SkypeClick2Call.MenuInjectionHandler.browser.name + "/" +
        SkypeClick2Call.MenuInjectionHandler.browser.version;
        
    origin.fingerprint = SkypeClick2Call.FP();
    origin.uiid = SkypeClick2Call.UIID().toString();
    // Add number info
    origin.number_type = skypeProps.isFreecall ? "FPNR" : "SPNR";
    // Add URL (without parameters and hash)
    origin.url = document.URL.split("?")[0].split("#")[0];
    
    // If its a local file then make it a fixed path for privacy
    if(origin.url.indexOf("file:") === 0) {
        origin.url = "file://localpath";
    }

    // Later we are going to replace all double quotes in the JSON with single quotes
    // Any single quote in the URL will cause an issue, so we need to replace it with %27
    origin.url = origin.url.replace(new RegExp("'", 'g'), "%27");

    // Stringify the json
    // Use JSON if available, if not revert to our own custom method    
    var originString = "";
    try
    {
        originString = JSON.stringify(origin);
    }
    catch(e)
    {
        originString = SkypeC2CTelemetry.JsonStringify(origin);
    }
        
    // Replace all double quotes in the JSON with single quotes
    // because Skype (or something else downstream) is unable to deal with double quotes
    // and we end up with empty call origin in the backend. To avoid this we use single quotes in the JSON.
    originString = originString.replace(new RegExp('"', 'g'), "'");

    return window.encodeURIComponent(originString);
}

/**
 * Builds the skype URI based on the action needed
 *
 * @param skypeProps   the set of Skype properties
 */
SkypeClick2Call.MenuInjectionHandler.buildSkypeURI = function(action, skypeProps)
{
    var originField = SkypeClick2Call.MenuInjectionHandler.createOriginField(skypeProps);

    return 'skype:' + skypeProps.numberToCall + '?' + action + '&origin=' + originField;    
}

/**
 * Add the skype action attribute for all actions. Basically the attribute
 * carries the phone number, that is, the actions target.
 *
 * @param skypeProps   the set of Skype properties
 */
SkypeClick2Call.MenuInjectionHandler.addSkypeAction = function(skypeProps)
{
    var callHref = SkypeClick2Call.MenuInjectionHandler.buildSkypeURI('call', skypeProps);
    var smsHref = SkypeClick2Call.MenuInjectionHandler.buildSkypeURI('sms', skypeProps);
    var addHref = SkypeClick2Call.MenuInjectionHandler.buildSkypeURI('add', skypeProps);
    
    var sendMetricForMenuActions = function(metric) {
        var data = { phoneNumber : skypeProps.numberToCall, isFree : skypeProps.isFreecall ? "T" : "F" };
        if ( SkypeClick2Call.hoverTime != 0 ) {
            data.timeToClick = new Date().getTime() - SkypeClick2Call.hoverTime;
            SkypeClick2Call.postMetrics(metric, data);
            SkypeClick2Call.hoverTime = 0; // set it back to zero so we don't send the mouse out metric
        }
    };

    var skypeActions = SkypeClick2Call.GetSkypeAction();
    
    skypeActions.call.href = callHref;
    skypeActions.sendSMS.href = smsHref;
    // Check for null because there is no addToSkype menu in ui1 
    if(skypeActions.addToSkype != null) {
        skypeActions.addToSkype.href = addHref;
    }
    
    skypeActions.call.onclick = function() { 
                                                window.open(callHref, '_self'); 
                                                setTimeout( function() {
                                                                           sendMetricForMenuActions("menu_call_link_click"); 
                                                                       }, 300
                                                ); 
                                                
                                                return false;
                                           };

    skypeActions.sendSMS.onclick = function() { 
                                                    window.open(smsHref, '_self');
                                                    
                                                    return false;
                                              };
    // Check for null because there is no addToSkype menu in ui1 
    if(skypeActions.addToSkype != null) {
        skypeActions.addToSkype.onclick = function() { 
                                                        window.open(addHref, '_self'); 
                                                        setTimeout( function() {
                                                                                   sendMetricForMenuActions("add_to_skype"); 
                                                                               }, 300
                                                        );
                                                        
                                                        return false;
                                                      };
    }
    
    if(SkypeClick2Call.UIID() === 1) {
        var howToUseHref = "https://support.skype.com/faq/FA34437/";
        skypeActions.helpLink.href = howToUseHref;
        skypeActions.helpLink.onclick = function() { 
                                                        window.open(howToUseHref, '_blank');
                                                        setTimeout( function() {
                                                                                   sendMetricForMenuActions("how_to_use_link_click"); 
                                                                               }, 300
                                                        );
                                                        
                                                        return false;
                                                      };    
    }
};

/**
 * Render Click to Call menu components.
 *
 * @param element   the C2C button element
 */
SkypeClick2Call.MenuInjectionHandler.renderMenu = function(element)
{
    var skypeProps = SkypeClick2Call.GetMenuProps(element);
    
    // since skypeProps is coming from a global it will always be present if init was successful
    // this function gets called from both container and menu container, so we want to ignore any action
    // for menu container and bubble the event up to container so it can handle the mouse in events solely.
    if ( !skypeProps || element.className.indexOf("skype_c2c_menu_container") != -1 ) {
        return;
    }
    // Add skype action attribute for all actions
    SkypeClick2Call.MenuInjectionHandler.addSkypeAction(skypeProps);

    // Set whether menu is being rendered for RTL languages
    // This is hardcoded for now, when we implement it, we will need to add
    // a new attribute to the container to specify the rtl'ness
    SkypeClick2Call.MenuInjectionHandler.isRtl = skypeProps.isRtl;

    // Inject CSS class according to call or phone type
    SkypeClick2Call.GetMenu().className = "skype_c2c_menu_container" + SkypeClick2Call.UI() + " notranslate";
    if (skypeProps.isFreecall) {
        // Activate 'Free call' version of menu
        SkypeClick2Call.MenuInjectionHandler.switchToFree();
    }
    else if (skypeProps.isMobile) {
        // Activate 'Mobile' version of menu
        SkypeClick2Call.MenuInjectionHandler.switchToMobile();
    }

    // Store the skype props so we can access it while hiding the menu as well
    SkypeClick2Call.GetMenu().skypeProps = skypeProps;

    // Metric post action
    var hoverdata = { phoneNumber : skypeProps.numberToCall, isFree : skypeProps.isFreecall ? "T" : "F" };
    SkypeClick2Call.postMetrics("hover", hoverdata);

    return (skypeProps) ? true : false;
};

/**
 * WORKAROUND. Although there are CSS rules to auto adjust menu width due to
 * an IE limitation there can be some pages where browser fails to compute width
 * value correctly (IE5 Quirks mode, IE7 mode).
 *
 * Based on the longest string present in menu, compute the its width.
 * This method is highly dependent on menu structure and style, any changes in
 * menu CSS or structure may break it.
 */
SkypeClick2Call.MenuInjectionHandler.computeMenuWidth = function()
{
  // Reference to menu
  var menu = SkypeClick2Call.GetMenu();

  // Menu should keep 13px of left and right margins.
  var marginsOffset = 26;

  // Minimum width allowed
  var minWidth = 204;

  // Reference to the longest string
  var longest = 0;

  // Map with all menu strings
  var tollInfo = menu.getElementsByTagName("div")[3];
  var skypeActions = SkypeClick2Call.GetSkypeAction();
  var menuStrings = [];
  for(var key in skypeActions) {
    var value = skypeActions[key];
    if (value) 
    {
        menuStrings.push(value);
    }
  }
  menuStrings.push(tollInfo.getElementsByTagName("span")[0]);
  menuStrings.push(tollInfo.getElementsByTagName("span")[1]);

  // Iterate over all menu strings to obtain the longest one.
  for (var ii = 0; ii < menuStrings.length; ii++)
  {
    var element = menuStrings[ii];
    if (element.offsetWidth > longest)
    {
      longest = element.offsetWidth;
    }
  }
  var newWidth = (longest + marginsOffset) > minWidth ?
                 (longest + marginsOffset) :
                 minWidth;

  // Return the correct menu width
  return newWidth;
};

/**
 * This method adjusts visible components of Click to Call to work with pages
 * running in compatibility mode in Internet Explorer. ( IE5 and 7 )
 *
 * If IE is running in compatibility mode, menu width cannot be computed by CSS
 * rules only.
 */
SkypeClick2Call.MenuInjectionHandler.applyCompatAdjustments = function()
{
  // Set up menu width properly
  var menuWidth = SkypeClick2Call.MenuInjectionHandler.computeMenuWidth();
  setTimeout(function(){
    SkypeClick2Call.GetMenu().style.width = menuWidth + "px";
  }, 0);
};

/**
 * Display the Click to Call menu.
 *
 * @param event     the mouse event
 * @param element   the C2C button element
 */
SkypeClick2Call.MenuInjectionHandler.showMenuDelayed = function(element, event)
{
    // Render menu according to the number being hovered
    if (SkypeClick2Call.MenuInjectionHandler.renderMenu(element)) {
    // Get menu position on the screen
    var position = SkypeClick2Call.MenuInjectionHandler.getMenuCoordinates(element, event);

    // Compute document offset
    var yScroll = 0;
    var xScroll = 0;
    if (typeof(window.pageYOffset) == 'number') {
        yScroll = window.pageYOffset;
        xScroll = window.pageXOffset;
    }
    else if ((document.compatMode != "BackCompat") && document.documentElement && (typeof(document.documentElement.scrollTop) == 'number')) {
        yScroll = document.documentElement.scrollTop;
        xScroll = document.documentElement.scrollLeft;
    }
    else if (document.body && (document.body.scrollTop)) {
        yScroll = document.body.scrollTop;
        xScroll = document.body.scrollLeft;
    }

    var windowHeight = 0;
    if (typeof (window.innerHeight) == 'number') {
        windowHeight = window.innerHeight; //Non-IE
    }
    else if (document.documentElement && (document.documentElement.clientHeight)) {
        windowHeight = document.documentElement.clientHeight; //IE 6+ in 'standards compliant mode
    }
    else if (document.body && (document.body.clientHeight)) {
        windowHeight = document.body.clientHeight; //IE 4 compatible
    }

    var docWidth = document.documentElement.scrollWidth;

    // Force menu displaying so that we can calculate its width and height.
    // Any UI update will only occur when we exit the current method, so this
    // step is not expected to cause menu flickering.
    SkypeClick2Call.MenuInjectionHandler.displayMenu(true, {'x': 0, 'y': 0});
    
    var menu = SkypeClick2Call.GetMenu();
    
        // If running in IE 7 mode and it is not RTL language we compute menu width
    // 'manually' only after making it visible, otherwise, IE fails to retrieve
    // elements offsetWidth property.
    if (SkypeClick2Call.MenuInjectionHandler.browser.msie && document.documentMode &&
        document.documentMode == 7)
    {
      if (SkypeClick2Call.MenuInjectionHandler.isRtl)
      {
        // If in RTL languages we have to force menu to its minimum width
        // before applying compatibility adjustments otherwise it will render
        // menu with 100% of screen width.
        menu.style.width = "200px";

        // Hide-show menu to update width
        SkypeClick2Call.MenuInjectionHandler.displayMenu(false);
        SkypeClick2Call.MenuInjectionHandler.displayMenu(true,
                                                         {'x': 0, 'y': 0});
      }

      // Apply compatibility adjustments for IE 7 mode.
      menu.style.width = "auto";
      SkypeClick2Call.MenuInjectionHandler.displayMenu(true,
                                                       {'x': 0, 'y': 0});
      SkypeClick2Call.MenuInjectionHandler.applyCompatAdjustments();

      // Hide-show menu to update width
      SkypeClick2Call.MenuInjectionHandler.displayMenu(false);
      SkypeClick2Call.MenuInjectionHandler.displayMenu(true,
                                                       {'x': 0, 'y': 0});
    }
    
    var menuHeight = menu.offsetHeight;
    var menuWidth = menu.offsetWidth;

    // We got what we need. Hide menu.
    SkypeClick2Call.MenuInjectionHandler.displayMenu(false);

    // IF menu bottom is under windows bottom border
    // AND there is enough room available for menu on the top of the number
    // THEN shift menu to the top of the number
    if (position.y + menuHeight >= windowHeight + yScroll) {
        if (position.y - position.height - menuHeight >  yScroll) {
            position.y -= menuHeight + position.height;

            // Adjust gap between number and menu
            position.y -= 4;
        }
        else
        {
            // TBAR-3283 hide menu if no room available for the menu either below or above the number
            if (document.body.clientHeight  && document.body.clientHeight <= windowHeight) {
                return;
            }
        }
    }

    // Adjustments for when menu is being rendered for RTL languages
    if (SkypeClick2Call.MenuInjectionHandler.isRtl) {
        position.x -= menuWidth;
        position.x = (position.x > 0) ? position.x : 0;
    }

    // Do not show menu if menu do not fit in document by X axis
    if (docWidth < menuWidth) {
        return;
    }

    // If menu is outside windows right border, shift it to the left
    if (position.x + menuWidth >= docWidth) {
        position.x -= (menuWidth + position.x) - docWidth;
    }

    // Update last target since it was really responsible to show menu
    SkypeClick2Call.MenuInjectionHandler.lastTarget = element;
    SkypeClick2Call.MenuInjectionHandler.displayMenu(true, position);
    }
};

/**
 * Hide the Click to Call menu.
 *
 * @param event   the mouse event
 */
SkypeClick2Call.MenuInjectionHandler.hideMenuDelayed = function(event)
{
    // Reset last target since menu is hidden
    SkypeClick2Call.MenuInjectionHandler.lastTarget = null;

    // Actually hide menu
    SkypeClick2Call.MenuInjectionHandler.displayMenu(false);
};

/**
 * Triggered by number or menu mouseover event, shows the Menu after hover
 * timer.
 *
 * @param elem    the C2C button element
 * @param event   the mouse event
 */
SkypeClick2Call.MenuInjectionHandler.showMenu = function(elem, event)
{
    event = event ? event : window.event;

    if (SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer) {
        clearTimeout(SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer);
        SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer = null;
    }

    // Compute menu width 'manually' if IE running in IE 5 mode. For IE7 we also
    // have to compute menu width, but it requires a more complex hack
    // in showDelayedMenu.
    if (SkypeClick2Call.MenuInjectionHandler.browser.msie && document.compatMode == "BackCompat")
    {
        SkypeClick2Call.MenuInjectionHandler.applyCompatAdjustments();
    }

    var eventTarget = event.target ? event.target : event.srcElement;
  
    if (eventTarget != SkypeClick2Call.GetMenu() &&
        eventTarget != SkypeClick2Call.MenuInjectionHandler.lastTarget) {

        SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer = setTimeout(function(event) {
            SkypeClick2Call.MenuInjectionHandler.showMenuDelayed(elem, event);
            // We need to check for SPAN even as we seem to have an issue with showMenu being called from registration to SPAN(number) and the DIV(menu box), needs refactoring later
            // a trigger by SPAN represents user intention most accurately now
            if ( SkypeClick2Call.hoverTime === 0 && elem.nodeName === "SPAN" ) {
                SkypeClick2Call.hoverTime = new Date().getTime();
            }
            // Check if a call was made
            else if ( SkypeClick2Call.hoverTime === -1 && elem.nodeName === "SPAN" ) {
                SkypeClick2Call.hoverTime = 0; // So that mouse out isn't called
            }
        }, SkypeClick2Call.MenuInjectionHandler.HOVER_TIMER);
    }
};

/**
 * Make call by click on highlighted number
 *
 * @param elem    the C2C element
 * @param event   the mouse event
 */
SkypeClick2Call.MenuInjectionHandler.makeCall = function(elem, event)
{
    event = event ? event : window.event;
    var skypeProps = SkypeClick2Call.GetMenuProps(elem);

    if(!skypeProps) {
        return;
    }

    // Call url
    var href = SkypeClick2Call.MenuInjectionHandler.buildSkypeURI('call', skypeProps);

    window.open(href, '_self');

    SkypeClick2Call.MenuInjectionHandler.displayMenu(false);
    var calldata = { phoneNumber : skypeProps.numberToCall, isFree : skypeProps.isFreecall ? "T" : "F" };
    // Metric post action
    setTimeout(function() {
        SkypeClick2Call.postMetrics("call_link_click", calldata);
    }, 1000);
    
     // We are not setting it to zero, so its indicative of a call being made only and not just hover.
     // in Hover we set it to zero, and it can happen the makeCall gets called before hover is executed so its important to know there
     // if the call was made
    SkypeClick2Call.hoverTime = -1;
};

SkypeClick2Call.postMetrics = function(event, userKVPs) {

    try {
        if ( event === "menu_call_link_click" || event === "add_to_skype" )
        {
            SkypeC2CTelemetry.post( SkypeClick2Call.MetricsUrl(),
                            event,
                            false ,
                            {
                                Fingerprint: SkypeClick2Call.FP(),
                                UiId: SkypeClick2Call.UIID().toString(),
                                PhoneNumber: userKVPs.phoneNumber,
                                Free : userKVPs.isFree,
                                TimeToClick: userKVPs.timeToClick
                            }
                        );
        }
        else if ( event === "hover" || event === "call_link_click" || event === "how_to_use_link_click" )
        {
            SkypeC2CTelemetry.post( SkypeClick2Call.MetricsUrl(),
                            event,
                            false ,
                            {
                                Fingerprint: SkypeClick2Call.FP(),
                                UiId: SkypeClick2Call.UIID().toString(),
                                PhoneNumber: userKVPs.phoneNumber,
                                Free : userKVPs.isFree
                            }
                        );
        }
        else if ( event === "mouse_out" )
        {
            SkypeC2CTelemetry.post( SkypeClick2Call.MetricsUrl(),
                            event,
                            false ,
                            {
                                Fingerprint: SkypeClick2Call.FP(),
                                UiId: SkypeClick2Call.UIID().toString(),
                                PhoneNumber: userKVPs.phoneNumber,
                                Free : userKVPs.isFree,
                                MouseOutHoverTime: userKVPs.mouseOutHoverTime
                            }
                        );
        }
    }
    catch(e) {
    }
};

/**
 * Triggered by number or menu mouseout event, hides Menu after mouseout timer
 *
 * @param event   the mouse event
 */
SkypeClick2Call.MenuInjectionHandler.hideMenu = function(element, event)
{
    event = event ? event : window.event;

    if (SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer) {
        clearTimeout(SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer);
        SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer = null;
    }

    SkypeClick2Call.MenuInjectionHandler.menuUpdateTimer = setTimeout(function() {
        SkypeClick2Call.MenuInjectionHandler.hideMenuDelayed(event);
        if ( SkypeClick2Call.hoverTime > 0 ) {
            SkypeClick2Call.hoverTime = new Date().getTime() - SkypeClick2Call.hoverTime;

            var skypeProps = SkypeClick2Call.GetMenu().skypeProps;

            if ( !skypeProps ) {
                skypeProps = {};
                skypeProps.numberToCall = "0";
                skypeProps.isFreecall = false;
            }

            SkypeClick2Call.postMetrics("mouse_out", 
                                        { 
                                            phoneNumber : skypeProps.numberToCall, 
                                            isFree : skypeProps.isFreecall ? "T" : "F", 
                                            mouseOutHoverTime : SkypeClick2Call.hoverTime 
                                        }
                                       );
            SkypeClick2Call.hoverTime = 0;
            
        }

    }, SkypeClick2Call.MenuInjectionHandler.MOUSEOUT_TIMER);
};