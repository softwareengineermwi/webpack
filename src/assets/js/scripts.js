// Utility function
function Util () {};

/* class manipulation functions */
Util.hasClass = function(el, className) {
	return el.classList.contains(className);
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	el.classList.add(classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	el.classList.remove(classList[0]);	
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* DOM manipulation */
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length;

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* Animate height of an element */
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* Smooth Scroll */
Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* Move Focus */
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* Misc */

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* Animation curves */
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
	var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
	if( menuBtns.length > 0 ) {
		for(var i = 0; i < menuBtns.length; i++) {(function(i){
			initMenuBtn(menuBtns[i]);
		})(i);}

		function initMenuBtn(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !btn.classList.contains('anim-menu-btn--state-b');
				btn.classList.toggle('anim-menu-btn--state-b', status);
				// emit custom event
				var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_cursor-movement-effects
// Usage: codyhouse.co/license
(function() {
    var CursorFx = function(opts) {
      this.target = opts.target;
      this.objects = opts.objects;
      this.animating = false;
      this.animatingId = false;
      this.rotateValue = [];
      initCursorFx(this);
    };
  
    function initCursorFx(element) {
      // detect mouse move on card element
      element.target.addEventListener('mousemove', function(event){
        if(element.animating) return;
        element.animating = true;
        element.animatingId = window.requestAnimationFrame(moveObjs.bind(element, event));
      });
  
      element.target.addEventListener('mouseleave', function(event){
        // reset style
        if(element.animatingId) {
          window.cancelAnimationFrame(element.animatingId);
          element.animatingId = false;
          element.animating = false;
        }
        resetObjs(element);
      });
    };
  
    function moveObjs(event) {
      // update target size info
      this.targetInfo = this.target.getBoundingClientRect();
      for(var i = 0; i < this.objects.length; i++) {
        if(!this.rotateValue[i]) this.rotateValue[i] = false;
        moveSingleObj(this, this.objects[i], event, i);
      }
      this.animating = false;
    };
  
    function moveSingleObj(element, objDetails, event, index) {
      var effect = 'parallax'; 
      if(objDetails['effect']) effect = objDetails['effect'];
      
      if( effect == 'parallax') {
        moveObjParallax(element, objDetails, event);
      } else if( effect == 'follow') {
        moveObjFollow(element, objDetails, event);
      } else if( effect == 'rotate') {
        moveObjRotate(element, objDetails, event, index);
      }
    };
  
    function moveObjParallax(element, objDetails, event) {
      // get translateX and translateY values
      var deltaTranslate = parseInt(objDetails['delta']);
      var translateX = (2*deltaTranslate/element.targetInfo.width)*(element.targetInfo.left + element.targetInfo.width/2 - event.clientX);
      var translateY = (2*deltaTranslate/element.targetInfo.height)*(element.targetInfo.top + element.targetInfo.height/2 - event.clientY);
      // check if we need to change direction
      if(objDetails['direction'] && objDetails['direction'] == 'follow') {
        translateX = -1 * translateX;
        translateY = -1 * translateY;
      }
  
      objDetails.element.style.transform = 'translateX('+translateX+'px) translateY('+translateY+'px)';
    };
  
    function moveObjFollow(element, objDetails, event) {
      var objInfo = objDetails.element.getBoundingClientRect();
      objDetails.element.style.transform = 'translateX('+parseInt(event.clientX - objInfo.width/2)+'px) translateY('+parseInt(event.clientY - objInfo.height/2)+'px)';
    };
  
    function moveObjRotate(element, objDetails, event, index) {
      var boxBoundingRect = objDetails.element.getBoundingClientRect();
      var boxCenter = {
          x: boxBoundingRect.left + boxBoundingRect.width/2, 
          y: boxBoundingRect.top + boxBoundingRect.height/2
      };
  
      var angle = Math.atan2(event.pageX - boxCenter.x, - (event.pageY - boxCenter.y) )*(180 / Math.PI);      
  
      // if this is the first time the mouse enters the onject - this angle will be the delta rotation
      if(element.rotateValue[index] === false) {
        element.rotateValue[index] = angle;
      };
  
      angle = angle - element.rotateValue[index];
      objDetails.element.style.transform = 'rotate('+angle+'deg)';
    };
  
    function resetObjs(element) {
      for(var i = 0; i < element.objects.length; i++) {
        resetSingleObj(element, element.objects[i]);
        element.rotateValue[i] = false;
      }
    };
  
    function resetSingleObj(element, objDetails) {
      var effect = 'parallax'; 
      if(objDetails['effect']) effect = objDetails['effect'];
  
      if( effect == 'parallax' || effect == 'rotate') {
        objDetails.element.style.transform = '';
      }
  
    };
  
    window.CursorFx = CursorFx;
  }());
  
  (function() {
    // demo code - initialize the CursorFx element
    var cursorFx = document.getElementsByClassName('js-cursor-fx-target');
    if(cursorFx.length > 0) {
      var obj1 = document.getElementsByClassName('js-cursor-fx-object--1');
      var obj2 = document.getElementsByClassName('js-cursor-fx-object--2');
      var objects = [];
      if(obj1.length > 0) {
        objects.push({element: obj1[0], effect: 'parallax', delta: '20'});
      }
      if(obj2.length > 0) {
        objects.push({element: obj2[0], effect: 'parallax', delta: '10', direction: 'follow'});
      }
  
      new CursorFx({
        target: cursorFx[0],
        objects: objects
      });
    }
  }());
// File#: _1_custom-cursor
// Usage: codyhouse.co/license
(function() {
    var CustomCursor = function(element) {
      this.element = element;
      this.targets = document.querySelectorAll('[data-custom-cursor="'+this.element.getAttribute('id')+'"]');
      this.target = false;
      this.moving = false;
  
      // cursor classes
      this.inClass = 'c-cursor--in';
      this.outClass = 'c-cursor--out';
      this.positionClass = 'c-cursor--';
    
      initCustomCursor(this);
    };
  
    function initCustomCursor(obj) {
      if(obj.targets.length == 0) return;
      // init events
      for( var i = 0; i < obj.targets.length; i++) {
        (function(i){
          obj.targets[i].addEventListener('mouseenter', handleEvent.bind(obj));
        })(i);
      }
    };
  
    function handleEvent(event) {
      switch(event.type) {
        case 'mouseenter': {
          initMouseEnter(this, event);
          break;
        }
        case 'mouseleave': {
          initMouseLeave(this, event);
          break;
        }
        case 'mousemove': {
          initMouseMove(this, event);
          break;
        }
      }
    };
  
    function initMouseEnter(obj, event) {
      removeTargetEvents(obj);
      obj.target = event.currentTarget;
      // listen for move and leave events
      obj.target.addEventListener('mousemove', handleEvent.bind(obj));
      obj.target.addEventListener('mouseleave', handleEvent.bind(obj));
      // show custom cursor
      toggleCursor(obj, true);
      // place custom cursor
      moveCursor(obj, event);
    };
  
    function initMouseLeave(obj, event) {
      removeTargetEvents(obj);
      toggleCursor(obj, false);
      if(obj.moving) {
        window.cancelAnimationFrame(obj.moving);
        obj.moving = false;
      }
    };
  
    function removeTargetEvents(obj) {
      if(obj.target) {
        obj.target.removeEventListener('mousemove', handleEvent.bind(obj));
            obj.target.removeEventListener('mouseleave', handleEvent.bind(obj));
        obj.target = false;
      }
    };
  
    function initMouseMove(obj, event) {
      if(obj.moving) return;
      obj.moving = window.requestAnimationFrame(function(){
        moveCursor(obj, event);
      });
    };
  
    function moveCursor(obj, event) {
      obj.element.style.transform = 'translateX('+event.clientX+'px) translateY('+event.clientY+'px)';
      // set position classes
      updatePositionClasses(obj, event.clientX, event.clientY);
      obj.moving = false;
    };
  
    function updatePositionClasses(obj, xposition, yposition) {
      if(!obj.target) return;
      var targetBoundingRect = obj.target.getBoundingClientRect();
      var isLeft = xposition < (targetBoundingRect.left + targetBoundingRect.width/2),
        isTop = yposition < (targetBoundingRect.top + targetBoundingRect.height/2);
  
      // reset classes
      obj.element.classList.toggle(obj.positionClass+'left', isLeft);
      obj.element.classList.toggle(obj.positionClass+'right', !isLeft);
      obj.element.classList.toggle(obj.positionClass+'top', isTop);
      obj.element.classList.toggle(obj.positionClass+'bottom', !isTop);
    };
  
    function toggleCursor(obj, bool) {
      obj.element.classList.toggle(obj.outClass, !bool);
      obj.element.classList.toggle(obj.inClass, bool);
    };
  
    window.CustomCursor = CustomCursor;
  
    var cCursor = document.getElementsByClassName('js-c-cursor');
    if( cCursor.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for( var i = 0; i < cCursor.length; i++) {
        (function(i){new CustomCursor(cCursor[i]);})(i);
      }
    }
  }());
// File#: _1_google-maps
// Usage: codyhouse.co/license
function initGoogleMap() {
	var contactMap = document.getElementsByClassName('js-google-maps');
	if(contactMap.length > 0) {
		for(var i = 0; i < contactMap.length; i++) {
			initContactMap(contactMap[i]);
		}
	}
};

function initContactMap(wrapper) {
	var coordinate = wrapper.getAttribute('data-coordinates').split(',');
	var map = new google.maps.Map(wrapper, {zoom: 10, center: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}});
	var marker = new google.maps.Marker({position: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}, map: map});
};
// File#: _1_immersive-section-transition
// Usage: codyhouse.co/license
(function() {
    var ImmerseSectionTr = function(element) {
      this.element = element;
      this.media = this.element.getElementsByClassName('js-immerse-section-tr__media');
      this.scrollContent = this.element.getElementsByClassName('js-immerse-section-tr__content');
      if(this.media.length < 1) return;
      this.figure = this.media[0].getElementsByClassName('js-immerse-section-tr__figure');
      if(this.figure.length < 1) return;
      this.visibleFigure = false;
      this.mediaScale = 1;
      this.mediaInitHeight = 0;
      this.elementPadding = 0;
      this.scrollingFn = false;
      this.scrolling = false;
      this.active = false;
      this.scrollDelta = 0; // amount to scroll for full-screen scaleup
      initImmerseSectionTr(this);
    };
  
    function initImmerseSectionTr(element) {
      initContainer(element);
      resetSection(element);
  
      // listen to resize event and reset values
      element.element.addEventListener('update-immerse-section', function(event){
        resetSection(element);
      });
  
      // detect when the element is sticky - update scale value and opacity layer 
      var observer = new IntersectionObserver(immerseSectionTrCallback.bind(element));
      observer.observe(element.media[0]);
    };
  
    function resetSection(element) {
      getVisibleFigure(element);
      checkEffectActive(element);
      if(element.active) {
        element.element.classList.remove('immerse-section-tr--disabled');
        updateMediaHeight(element);
        getMediaScale(element); 
        updateMargin(element);
        setScaleValue.bind(element)();
      } else {
        // reset appearance
        element.element.classList.add('immerse-section-tr--disabled');
        element.media[0].style = '';
        element.scrollContent[0].style = '';
        updateScale(element, 1);
        updateOpacity(element, 0);
      }
      element.element.dispatchEvent(new CustomEvent('immersive-section-updated', {detail: {active: element.active, asset: element.visibleFigure}}));
    };
  
    function getVisibleFigure(element) { // get visible figure element
      element.visibleFigure = false;
      for(var i = 0; i < element.figure.length; i++) {
        if(window.getComputedStyle(element.figure[i]).getPropertyValue('display') != 'none') {
          element.visibleFigure = element.figure[i];
          break;
        }
      }
    };
  
    function updateMediaHeight(element) { // set sticky element padding/margin + height
      element.mediaInitHeight = element.visibleFigure.offsetHeight;
      element.scrollDelta = (window.innerHeight - element.visibleFigure.offsetHeight) > (window.innerWidth - element.visibleFigure.offsetWidth)
        ? (window.innerHeight - element.visibleFigure.offsetHeight)/2
        : (window.innerWidth - element.visibleFigure.offsetWidth)/2;
      if(element.scrollDelta > window.innerHeight) element.scrollDelta = window.innerHeight;
      if(element.scrollDelta < 200) element.scrollDelta = 200;
      element.media[0].style.height = window.innerHeight+'px';
      element.media[0].style.paddingTop = (window.innerHeight - element.visibleFigure.offsetHeight)/2+'px';
      element.media[0].style.marginTop = (element.visibleFigure.offsetHeight - window.innerHeight)/2+'px';
    };
  
    function getMediaScale(element) { // get media final scale value
      var scaleX = roundValue(window.innerWidth/element.visibleFigure.offsetWidth),
        scaleY = roundValue(window.innerHeight/element.visibleFigure.offsetHeight);
  
      element.mediaScale = Math.max(scaleX, scaleY);
      element.elementPadding = parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top'));
    };
  
    function roundValue(value) {
      return (Math.ceil(value*100)/100).toFixed(2);
    };
  
    function updateMargin(element) { // update distance between media and content elements
      if(element.scrollContent.length > 0) element.scrollContent[0].style.marginTop = element.scrollDelta+'px';
    };
  
    function setScaleValue() { // update asset scale value
      if(!this.active) return; // effect is not active
      var offsetTop = (window.innerHeight - this.mediaInitHeight)/2;
      var top = this.element.getBoundingClientRect().top + this.elementPadding;
  
      if( top < offsetTop && top > offsetTop - this.scrollDelta) {
        var scale = 1 + (top - offsetTop)*(1 - this.mediaScale)/this.scrollDelta;
        updateScale(this, scale);
        updateOpacity(this, 0);
      } else if(top >= offsetTop) {
        updateScale(this, 1);
        updateOpacity(this, 0);
      } else {
        updateScale(this, this.mediaScale);
        updateOpacity(this, 1.8*( offsetTop - this.scrollDelta - top)/ window.innerHeight);
      }
  
      this.scrolling = false;
    };
  
    function updateScale(element, value) { // apply new scale value
      element.visibleFigure.style.transform = 'scale('+value+')';
      element.visibleFigure.style.msTransform = 'scale('+value+')';
    };
  
    function updateOpacity(element, value) { // update layer opacity
      element.element.style.setProperty('--immerse-section-tr-opacity', value);
    };
  
    function immerseSectionTrCallback(entries) { // intersectionObserver callback
      if(entries[0].isIntersecting) {
        if(this.scrollingFn) return; // listener for scroll event already added
        immerseSectionTrScrollEvent(this);
      } else {
        if(!this.scrollingFn) return; // listener for scroll event already removed
        window.removeEventListener('scroll', this.scrollingFn);
        this.scrollingFn = false;
      }
    };
  
    function immerseSectionTrScrollEvent(element) { // listen to scroll when asset element is inside the viewport
      element.scrollingFn = immerseSectionTrScrolling.bind(element);
      window.addEventListener('scroll', element.scrollingFn);
    };
  
    function immerseSectionTrScrolling() { // update asset scale on scroll
      if(this.scrolling) return;
      this.scrolling = true;
      window.requestAnimationFrame(setScaleValue.bind(this));
    };
  
    function initContainer(element) {
      // add a padding to the container to fix the collapsing-margin issue
      if(parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top')) == 0) element.element.style.paddingTop = '1px';
    };
  
    function checkEffectActive(element) { //check if effect needs to be activated
      element.active = true;
      if(element.visibleFigure.offsetHeight >= window.innerHeight) element.active = false;
      if( window.innerHeight - element.visibleFigure.offsetHeight >= 600) element.active = false;
    };
  
    //initialize the ImmerseSectionTr objects
    var immerseSections = document.getElementsByClassName('js-immerse-section-tr'),
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      intObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
    if(immerseSections.length < 1 ) return;
      if( !reducedMotion && intObserverSupported) {
      var immerseSectionsArray = [];
          for( var i = 0; i < immerseSections.length; i++) {
        (function(i){immerseSectionsArray.push(new ImmerseSectionTr(immerseSections[i]));})(i);
      }
  
      if(immerseSectionsArray.length > 0) {
        var resizingId = false,
          customEvent = new CustomEvent('update-immerse-section');
        
        window.addEventListener('resize', function() {
          clearTimeout(resizingId);
          resizingId = setTimeout(doneResizing, 500);
        });
  
        function doneResizing() {
          for( var i = 0; i < immerseSectionsArray.length; i++) {
            (function(i){immerseSectionsArray[i].element.dispatchEvent(customEvent)})(i);
          };
        };
      };
    } else { // effect deactivated
      for( var i = 0; i < immerseSections.length; i++) immerseSections[i].classList.add('immerse-section-tr--disabled');
      
    }
  }());
// File#: _1_masonry
// Usage: codyhouse.co/license
(function() {
    var Masonry = function(element) {
      this.element = element;
      this.list = this.element.getElementsByClassName('js-masonry__list')[0];
      this.items = this.element.getElementsByClassName('js-masonry__item');
      this.activeColumns = 0;
      this.colStartWidth = 0; // col min-width (defined in CSS using --masonry-col-auto-size variable)
      this.colWidth = 0; // effective column width
      this.colGap = 0;
      // store col heights and items
      this.colHeights = [];
      this.colItems = [];
      // flex full support
      this.flexSupported = checkFlexSupported(this.items[0]);
      getGridLayout(this); // get initial grid params
      setGridLayout(this); // set grid params (width of elements)
      initMasonryLayout(this); // init gallery layout
    };
  
    function checkFlexSupported(item) {
      var itemStyle = window.getComputedStyle(item);
      return itemStyle.getPropertyValue('flex-basis') != 'auto';
    };
  
    function getGridLayout(grid) { // this is used to get initial grid details (width/grid gap)
      var itemStyle = window.getComputedStyle(grid.items[0]);
      if( grid.colStartWidth == 0) {
        grid.colStartWidth = parseFloat(itemStyle.getPropertyValue('width'));
      }
      grid.colGap = parseFloat(itemStyle.getPropertyValue('margin-right'));
    };
  
    function setGridLayout(grid) { // set width of items in the grid
      var containerWidth = parseFloat(window.getComputedStyle(grid.element).getPropertyValue('width'));
      grid.activeColumns = parseInt((containerWidth + grid.colGap)/(grid.colStartWidth+grid.colGap));
      if(grid.activeColumns == 0) grid.activeColumns = 1;
      grid.colWidth = parseFloat((containerWidth - (grid.activeColumns - 1)*grid.colGap)/grid.activeColumns);
      for(var i = 0; i < grid.items.length; i++) {
        grid.items[i].style.width = grid.colWidth+'px'; // reset items width
      }
    };
  
    function initMasonryLayout(grid) {
      if(grid.flexSupported) {
        checkImgLoaded(grid); // reset layout when images are loaded
      } else {
        grid.element.classList.add('masonry--loaded'); // make sure the gallery is visible
      }
  
      grid.element.addEventListener('masonry-resize', function(){ // window has been resized -> reset masonry layout
        getGridLayout(grid);
        setGridLayout(grid);
        if(grid.flexSupported) layItems(grid); 
      });
  
      grid.element.addEventListener('masonry-reset', function(event){ // reset layout (e.g., new items added to the gallery)
        getGridLayout(grid);
        setGridLayout(grid);
        if(grid.flexSupported) checkImgLoaded(grid); 
      });
  
      // if there are fonts to be loaded -> reset masonry 
      if(document.fonts) {
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
          if(!grid.masonryLaid) return;
          getGridLayout(grid);
          setGridLayout(grid);
          if(grid.flexSupported) layItems(grid); 
        };
      }
    };
  
    function layItems(grid) {
      grid.element.classList.add('masonry--loaded'); // make sure the gallery is visible
      grid.colHeights = [];
      grid.colItems = [];
  
      // grid layout has already been set -> update container height and order of items
      for(var j = 0; j < grid.activeColumns; j++) {
        grid.colHeights.push(0); // reset col heights
        grid.colItems[j] = []; // reset items order
      }
      
      for(var i = 0; i < grid.items.length; i++) {
        var minHeight = Math.min.apply( Math, grid.colHeights ),
          index = grid.colHeights.indexOf(minHeight);
        if(grid.colItems[index]) grid.colItems[index].push(i);
        grid.items[i].style.flexBasis = 0; // reset flex basis before getting height
        var itemHeight = grid.items[i].getBoundingClientRect().height || grid.items[i].offsetHeight || 1;
        grid.colHeights[index] = grid.colHeights[index] + grid.colGap + itemHeight;
      }
  
      // reset height of container
      var masonryHeight = Math.max.apply( Math, grid.colHeights ) + 5;
      grid.list.style.cssText = 'height: '+ masonryHeight + 'px;';
  
      // go through elements and set flex order
      var order = 0;
      for(var i = 0; i < grid.colItems.length; i++) {
        for(var j = 0; j < grid.colItems[i].length; j++) {
          grid.items[grid.colItems[i][j]].style.order = order;
          order = order + 1;
        }
        // change flex-basis of last element of each column, so that next element shifts to next col
        var lastItemCol = grid.items[grid.colItems[i][grid.colItems[i].length - 1]];
        if(lastItemCol) lastItemCol.style.flexBasis = masonryHeight - grid.colHeights[i] + lastItemCol.getBoundingClientRect().height - 5 + 'px';
      }
  
      grid.masonryLaid = true;
      // emit custom event when grid has been reset
      grid.element.dispatchEvent(new CustomEvent('masonry-laid'));
    };
  
    function checkImgLoaded(grid) {
      var imgs = grid.list.getElementsByTagName('img');
  
      function countLoaded() {
        var setTimeoutOn = false;
        for(var i = 0; i < imgs.length; i++) {
          if(imgs[i].complete && imgs[i].naturalHeight == 0) {
            continue; // broken image -> skip
          }
  
          if(!imgs[i].complete) {
            setTimeoutOn = true;
            break;
          } else if (typeof imgs[i].naturalHeight !== "undefined" && imgs[i].naturalHeight == 0) {
            setTimeoutOn = true;
            break;
          }
        }
  
        if(!setTimeoutOn) {
          layItems(grid);
        } else {
          setTimeout(function(){
            countLoaded();
          }, 100);
        }
      };
  
      if(imgs.length == 0) {
        layItems(grid); // no need to wait -> no img available
      } else {
        countLoaded();
      }
    };
  
    //initialize the Masonry objects
    var masonries = document.getElementsByClassName('js-masonry'), 
      flexSupported = CSS.supports('flex-basis', 'auto'),
      masonriesArray = [];
  
    if( masonries.length > 0) {
      for( var i = 0; i < masonries.length; i++) {
        if(!flexSupported) {
          masonries[i].classList.add('masonry--loaded'); // reveal gallery
        } else {
          (function(i){masonriesArray.push(new Masonry(masonries[i]));})(i); // init Masonry Layout
        }
      }
  
      if(!flexSupported) return;
  
      // listen to window resize -> reorganize items in gallery
      var resizingId = false,
        customEvent = new CustomEvent('masonry-resize');
        
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });
  
      function doneResizing() {
        for( var i = 0; i < masonriesArray.length; i++) {
          (function(i){masonriesArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };
    };
  }());

// File#: _1_sliding-panels
// Usage: codyhouse.co/license
(function() {
    var SlidingPanels = function(element) {
      this.element = element;
      this.itemsList = this.element.getElementsByClassName('js-s-panels__projects-list');
      this.items = this.itemsList[0].getElementsByClassName('js-s-panels__project-preview');
      this.navigationToggle = this.element.getElementsByClassName('js-s-panels__nav-control');
      this.navigation = this.element.getElementsByClassName('js-s-panels__nav-wrapper');
      this.transitionLayer = this.element.getElementsByClassName('js-s-panels__overlay-layer');
      this.selectedSection = false; // will be used to store the visible project content section
      this.animating = false;
      // aria labels for the navigationToggle button
      this.toggleAriaLabels = ['Toggle navigation', 'Close Project'];
      initSlidingPanels(this);
    };
  
    function initSlidingPanels(element) {
      // detect click on toggle menu
      if(element.navigationToggle.length > 0 && element.navigation.length > 0) {
        element.navigationToggle[0].addEventListener('click', function(event) {
          if(element.animating) return;
          
          // if project is open -> close project
          if(closeProjectIfVisible(element)) return;
          
          // toggle navigation
          var openNav = element.navigation[0].classList.contains('is-hidden');
          toggleNavigation(element, openNav);
        });
      }
  
      // open project
      element.element.addEventListener('click', function(event) {
        if(element.animating) return;
  
        var link = event.target.closest('.js-s-panels__project-control');
        if(!link) return;
        event.preventDefault();
        openProject(element, event.target.closest('.js-s-panels__project-preview'), link.getAttribute('href').replace('#', ''));
      });
    };
  
    // check if there's a visible project to close and close it
    function closeProjectIfVisible(element) {
      var visibleProject = element.element.getElementsByClassName('s-panels__project-preview--selected');
      if(visibleProject.length > 0) {
        element.animating = true;
        closeProject(element);
        return true;
      }
  
      return false;
    };
  
    function toggleNavigation(element, openNavigation) {
      element.animating = true;
      if(openNavigation) element.navigation[0].classList.remove('is-hidden');
      slideProjects(element, openNavigation, false, function(){
        element.animating = false;
        if(!openNavigation) element.navigation[0].classList.add('is-hidden');
      });
      element.navigationToggle[0].classList.toggle('s-panels__nav-control--arrow-down', openNavigation);
    };
  
    function openProject(element, project, id) {
      element.animating = true;
      var projectIndex = Array.prototype.indexOf.call(element.items, project);
      // hide navigation
      element.itemsList[0].classList.remove('bg-opacity-0');
      // expand selected projects
      project.classList.add('s-panels__project-preview--selected');
      // hide remaining projects
      slideProjects(element, true, projectIndex, function() {
        // reveal section content
        element.selectedSection = document.getElementById(id);
        if(element.selectedSection) element.selectedSection.classList.remove('is-hidden');
        element.animating = false;
        // trigger a custom event - this can be used to init the project content (if required)
            element.element.dispatchEvent(new CustomEvent('slidingPanelOpen', {detail: projectIndex}));
      });
      // modify toggle button appearance
      element.navigationToggle[0].classList.add('s-panels__nav-control--close');
      // modify toggle button aria-label
      element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[1]);
    };
  
    function closeProject(element) {
      // remove transitions from projects
      toggleTransitionProjects(element, true);
      // hide navigation
      element.itemsList[0].classList.remove('bg-opacity-0');
      // reveal transition layer
      element.transitionLayer[0].classList.add('s-panels__overlay-layer--visible');
      // wait for end of transition layer effect
      element.transitionLayer[0].addEventListener('transitionend', function cb(event) {
        if(event.propertyName != 'opacity') return;
        element.transitionLayer[0].removeEventListener('transitionend', cb);
        // update projects classes
        resetProjects(element);
  
        setTimeout(function(){
          // hide transition layer
          element.transitionLayer[0].classList.remove('s-panels__overlay-layer--visible');
          // reveal projects
          slideProjects(element, false, false, function() {
            element.itemsList[0].classList.add('bg-opacity-0');
            element.animating = false;
          });
        }, 200);
      });
  
      // modify toggle button appearance
      element.navigationToggle[0].classList.remove('s-panels__nav-control--close');
      // modify toggle button aria-label
      element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[0]);
    };
  
    function slideProjects(element, openNav, exclude, cb) {
      // projects will slide out in a random order
      var randomList = getRandomList(element.items.length, exclude);
      for(var i = 0; i < randomList.length; i++) {(function(i){
        setTimeout(function(){
          element.items[randomList[i]].classList.toggle('s-panels__project-preview--hide', openNav);
          toggleProjectAccessibility(element.items[randomList[i]], openNav);
          if(cb && i == randomList.length - 1) {
            // last item to be animated -> execute callback function at the end of the animation
            element.items[randomList[i]].addEventListener('transitionend', function cbt() {
              if(event.propertyName != 'transform') return;
              if(cb) cb();
              element.items[randomList[i]].removeEventListener('transitionend', cbt);
            });
          }
        }, i*100);
      })(i);}
    };
  
    function toggleTransitionProjects(element, bool) {
      // remove transitions from project elements
      for(var i = 0; i < element.items.length; i++) {
        element.items[i].classList.toggle('s-panels__project-preview--no-transition', bool);
      }
    };
  
    function resetProjects(element) {
      // reset projects classes -> remove selected/no-transition class + add hide class
      for(var i = 0; i < element.items.length; i++) {
        element.items[i].classList.remove('s-panels__project-preview--selected', 's-panels__project-preview--no-transition');
        element.items[i].classList.add('s-panels__project-preview--hide');
      }
  
      // hide project content
      if(element.selectedSection) element.selectedSection.classList.add('is-hidden');
      element.selectedSection = false;
    };
  
    function getRandomList(maxVal, exclude) {
      // get list of random integer from 0 to (maxVal - 1) excluding (exclude) if defined
      var uniqueRandoms = [];
      var randomArray = [];
      
      function makeUniqueRandom() {
        // refill the array if needed
        if (!uniqueRandoms.length) {
          for (var i = 0; i < maxVal; i++) {
            if(exclude === false || i != exclude) uniqueRandoms.push(i);
          }
        }
        var index = Math.floor(Math.random() * uniqueRandoms.length);
        var val = uniqueRandoms[index];
        // now remove that value from the array
        uniqueRandoms.splice(index, 1);
        return val;
      }
  
      for(var j = 0; j < maxVal; j++) {
        randomArray.push(makeUniqueRandom());
      }
  
      return randomArray;
    };
  
    function toggleProjectAccessibility(project, bool) {
      bool ? project.setAttribute('aria-hidden', 'true') : project.removeAttribute('aria-hidden');
      var link = project.getElementsByClassName('js-s-panels__project-control');
      if(link.length > 0) {
        bool ? link[0].setAttribute('tabindex', '-1') : link[0].removeAttribute('tabindex');
      }
    };
  
    //initialize the SlidingPanels objects
      var slidingPanels = document.getElementsByClassName('js-s-panels');
      if( slidingPanels.length > 0 ) {
          for( var i = 0; i < slidingPanels.length; i++) {
              (function(i){new SlidingPanels(slidingPanels[i]);})(i);
          }
      }
  }());
// File#: _1_sticky-feature
// Usage: codyhouse.co/license
(function() {
    var StickyFeature = function(element) {
      this.element = element;
      this.contentList = this.element.getElementsByClassName('js-sticky-feature__content-list');
      this.assetsList = this.element.getElementsByClassName('js-sticky-feature__media-list');
      
      if(this.contentList.length < 1 || this.assetsList.length < 1) return;
  
      this.contentItems = this.contentList[0].getElementsByClassName('js-sticky-feature__content-item');
      this.assetItems = this.assetsList[0].getElementsByClassName('js-sticky-feature__media-item');
  
      this.titleItems = this.contentList[0].getElementsByClassName('js-sticky-feature__title');
      this.activeSectionClass = 'sticky-feature-current-item';
      this.bindScroll = false;
      this.scrolling = false;
      initStickyFeature(this);
    };
  
    function initStickyFeature(el) {
      // init observer - detect when feature list enters the viewport and change section
      var observer = new IntersectionObserver(stickyFeatureObserve.bind(el));
      observer.observe(el.contentList[0]);
  
      // init click on title
      for(var i = 0; i < el.titleItems.length; i++) {
        (function(i){
          el.titleItems[i].addEventListener('click', function(event){
            scrollToSection(el, i);
          });
        })(i);
      }
    };
  
    function stickyFeatureObserve(entries) {
      if(entries[0].isIntersecting) {
        if(!this.bindScroll) {
          getSelectSection(this); // update selected section
          bindScroll(this); // bind window scroll
        }
      } else if(this.bindScroll) {
        unbindScroll(this); // unbind window scroll
        resetSectionVisibility(this); // reset selected section
      }
    };
  
    function updateVisibleSection(el) {
      // on scroll, detect which section should be selected
      var self = this;
      if(this.scrolling) return;
      this.scrolling = true;
      window.requestAnimationFrame(function(){
        getSelectSection(self);
        self.scrolling = false;
      });
    };
  
    function getSelectSection(el) {
      resetSectionVisibility(el); // remove selected class from all sections
      // get the section to select
      var index = [];
      for(var i = 0; i < el.contentItems.length; i++) {
        if(el.contentItems[i].getBoundingClientRect().top <= window.innerHeight/2) index.push(i);
      }
      var itemIndex = (index.length > 0) ? index[index.length - 1] : 0; // select either the first section or the one in the center of the viewport
      selectSection(el, itemIndex);
    };
  
    function resetSectionVisibility(el) {
      // no section is selected -> remove selected class
      var selectedItems = el.element.getElementsByClassName(el.activeSectionClass);
      while (selectedItems[0]) {
        selectedItems[0].classList.remove(el.activeSectionClass);
      }
    };
  
    function selectSection(el, index) {
      el.contentItems[index].classList.add(el.activeSectionClass);
      el.assetItems[index].classList.add(el.activeSectionClass);
    };
  
    function scrollToSection(el, index) {
      // on click - scroll to the selected section
      if(el.assetsList[0].offsetWidth < 1) return;
      window.scrollBy({
        top: el.titleItems[index].getBoundingClientRect().top - window.innerHeight/2 + 10,
        behavior: 'smooth'
      });
    };
  
    function bindScroll(el) {
      if(!el.bindScroll) {
        el.bindScroll = updateVisibleSection.bind(el);
        window.addEventListener('scroll', el.bindScroll);
      }
    };
  
    function unbindScroll(el) {
      if(el.bindScroll) {
        window.removeEventListener('scroll', el.bindScroll);
        el.bindScroll = false;
      }
    };
  
    window.StickyFeature = StickyFeature;
  
      //initialize the StickyFeature objects
      var stickyFeatures = document.getElementsByClassName('js-sticky-feature');
      if( stickyFeatures.length > 0 ) {
          for( var i = 0; i < stickyFeatures.length; i++) {
              (function(i){new StickyFeature(stickyFeatures[i]);})(i);
          }
      }
  }());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _1_switch-icon
// Usage: codyhouse.co/license
(function() {
	var switchIcons = document.getElementsByClassName('js-switch-icon');
	if( switchIcons.length > 0 ) {
		for(var i = 0; i < switchIcons.length; i++) {(function(i){
			if( !switchIcons[i].classList.contains('switch-icon--hover') ) initswitchIcons(switchIcons[i]);
		})(i);}

		function initswitchIcons(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !btn.classList.contains('switch-icon--state-b');
				btn.classList.toggle('switch-icon--state-b', status);
				// emit custom event
				var event = new CustomEvent('switch-icon-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
if(!Util) function Util () {};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if(bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};


// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
	var Tab = function(element) {
		this.element = element;
		this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
		this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
		this.hideClass = this.element.getAttribute('data-hide-panel-class') ? this.element.getAttribute('data-hide-panel-class') : 'is-hidden';
		this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
		this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init tabs
		this.initTab();
	};

	Tab.prototype.initTab = function() {
		//set initial aria attributes
		this.tabList.setAttribute('role', 'tablist');
		Util.addClass(this.element, 'tabs--no-interaction');

		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == 0),
				panelId = this.panels[i].getAttribute('id');
			this.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
			Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
			Util.toggleClass(this.panels[i], this.hideClass, !bool)
			
			if(bool && this.customShowClass) Util.addClass(this.panels[i], this.customShowClass);

			if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
		}

		//listen for Tab events
		this.initTabEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Tab.prototype.initTabEvents = function() {
		var self = this;
		//click on a new tab -> select content
		this.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
		});
		//arrow keys to navigate through tabs 
		this.tabList.addEventListener('keydown', function(event) {
			;
			if( !event.target.closest('.js-tabs__trigger') ) return;
			if( tabNavigateNext(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('next');
			} else if( tabNavigatePrev(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('prev');
			}
		});
	};

	Tab.prototype.selectNewTab = function(direction) {
		var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
			index = Util.getIndexInArray(this.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = this.listItems.length - 1;
		if(index >= this.listItems.length) index = 0;	
		this.triggerTab(this.triggers[index]);
		this.triggers[index].focus();
	};

	Tab.prototype.triggerTab = function(tabTrigger, event) {
		var self = this;
		event && event.preventDefault();	
		var index = Util.getIndexInArray(this.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
		
		Util.removeClass(this.element, 'tabs--no-interaction');
		
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == index);
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
			this.triggers[i].setAttribute('aria-selected', bool);
			bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
		}

		// update url if deepLink is on
		if(this.deepLinkOn) {
			history.replaceState(null, '', '#'+tabTrigger.getAttribute('aria-controls'));
		}
	};

	Tab.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		var self = this;
		if(!hash || hash == '') return;
		for(var i = 0; i < this.panels.length; i++) {
			if(this.panels[i].getAttribute('id') == hash) {
				this.triggerTab(this.triggers[i], false);
				setTimeout(function(){self.panels[i].scrollIntoView(true);});
				break;
			}
		};
	};

	function tabNavigateNext(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
		else {return false;}
	};

	function tabNavigatePrev(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
		else {return false;}
	};

	window.Tab = Tab;
	
	//initialize the Tab objects
	var tabs = document.getElementsByClassName('js-tabs');
	if( tabs.length > 0 ) {
		for( var i = 0; i < tabs.length; i++) {
			(function(i){new Tab(tabs[i]);})(i);
		}
	}
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
    var flexHeader = document.getElementsByClassName('js-f-header');
      if(flexHeader.length > 0) {
          var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
              firstFocusableElement = getMenuFirstFocusable();
  
          // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
          var focusMenu = false;
  
          resetFlexHeaderOffset();
          setAriaButtons();
  
          menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
              toggleMenuNavigation(event.detail);
          });
  
          // listen for key events
          window.addEventListener('keyup', function(event){
              // listen for esc key
              if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
                  // close navigation on mobile if open
                  if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
                      focusMenu = menuTrigger; // move focus to menu trigger when menu is close
                      menuTrigger.click();
                  }
              }
              // listen for tab key
              if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
                  // close navigation on mobile if open when nav loses focus
                  if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
              }
          });
  
          // detect click on a dropdown control button - expand-on-mobile only
          flexHeader[0].addEventListener('click', function(event){
              var btnLink = event.target.closest('.js-f-header__dropdown-control');
              if(!btnLink) return;
              !btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
          });
  
          // detect mouseout from a dropdown control button - expand-on-mobile only
          flexHeader[0].addEventListener('mouseout', function(event){
              var btnLink = event.target.closest('.js-f-header__dropdown-control');
              if(!btnLink) return;
              // check layout type
              if(getLayout() == 'mobile') return;
              btnLink.removeAttribute('aria-expanded');
          });
  
          // close dropdown on focusout - expand-on-mobile only
          flexHeader[0].addEventListener('focusin', function(event){
              var btnLink = event.target.closest('.js-f-header__dropdown-control'),
                  dropdown = event.target.closest('.f-header__dropdown');
              if(dropdown) return;
              if(btnLink && btnLink.hasAttribute('aria-expanded')) return;
              // check layout type
              if(getLayout() == 'mobile') return;
              var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
              if(openDropdown) openDropdown.removeAttribute('aria-expanded');
          });
  
          // listen for resize
          var resizingId = false;
          window.addEventListener('resize', function() {
              clearTimeout(resizingId);
              resizingId = setTimeout(doneResizing, 500);
          });
  
          function getMenuFirstFocusable() {
              var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
                  firstFocusable = false;
              for(var i = 0; i < focusableEle.length; i++) {
                  if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
                      firstFocusable = focusableEle[i];
                      break;
                  }
              }
  
              return firstFocusable;
      };
      
      function isVisible(element) {
        return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
          };
  
          function doneResizing() {
              if( !isVisible(menuTrigger) && flexHeader[0].classList.contains('f-header--expanded')) {
                  menuTrigger.click();
              }
              resetFlexHeaderOffset();
          };
          
          function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
              document.getElementsByClassName('f-header__nav')[0].classList.toggle('f-header__nav--is-visible', bool);
              flexHeader[0].classList.toggle('f-header--expanded', bool);
              menuTrigger.setAttribute('aria-expanded', bool);
              if(bool) firstFocusableElement.focus(); // move focus to first focusable element
              else if(focusMenu) {
                  focusMenu.focus();
                  focusMenu = false;
              }
          };
  
          function resetFlexHeaderOffset() {
              // on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
              document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
          };
  
          function setAriaButtons() {
              var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
              for(var i = 0; i < btnDropdown.length; i++) {
                  var id = 'f-header-dropdown-'+i,
                      dropdown = btnDropdown[i].nextElementSibling;
                  if(dropdown.hasAttribute('id')) {
                      id = dropdown.getAttribute('id');
                  } else {
                      dropdown.setAttribute('id', id);
                  }
                  btnDropdown[i].setAttribute('aria-controls', id);	
              }
          };
  
          function getLayout() {
              return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
          };
      }
  }());
// File#: _2_gallery-v2
// Usage: codyhouse.co/license
(function() {
    var ParallaxCard = function(element) {
      this.element = element;
      this.bgCard = this.element.getElementsByClassName('js-gallery-v2__icon-bg');
      this.deltaTranslate = 10;
      if(this.bgCard.length < 1) return;
      initParallaxCard(this);
    };
  
    function initParallaxCard(element) {
      // init the CursorFx object
      new CursorFx({
        target: element.element,
        objects: [{element: element.bgCard[0], effect: 'parallax', delta: element.deltaTranslate}]
      });
    };
  
    // init ParallaxCard object
    var parallaxcard = document.getElementsByClassName('js-gallery-v2__img-wrapper');
    if( parallaxcard.length > 0 ) {
      for( var i = 0; i < parallaxcard.length; i++) {
        new ParallaxCard(parallaxcard[i]);
      }
    }
  }());
// File#: _2_main-header-v3
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header-v3');
	if(mainHeader.length > 0) {
		var menuTrigger = mainHeader[0].getElementsByClassName('js-toggle-menu')[0],
			searchTrigger = mainHeader[0].getElementsByClassName('js-toggle-search'),
			navigation = mainHeader[0].getElementsByClassName('header-v3__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu/search input are closed 
		var focusSearch = false,
			focusMenu = false;
			
		// set delays for list items inside navigation -> mobile animation
		var navItems = getChildrenByClassName(navigation.getElementsByClassName('header-v3__nav-list')[0], 'header-v3__nav-item');
		for(var i = 0; i < navItems.length; i++) {
			setTransitionDelay(navItems[i], i);
		}
		// toggle navigation on mobile
		menuTrigger.addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
			toggleNavigation(event.detail);
		});
		// toggle search on desktop
		if(searchTrigger.length > 0) {
			searchTrigger[0].addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
				toggleSearch(event.detail);
			});
		}
		
		window.addEventListener('keyup', function(event){
			// listen for esc key events
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
				// close search if open
				if(searchTrigger.length > 0 && searchTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(searchTrigger[0])) {
					focusSearch = searchTrigger[0]; // move focus to search trigger when search is close
					searchTrigger[0].click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-header-v3')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 300);
		});

		function toggleNavigation(bool) {
			navigation.classList.add('header-v3__nav--is-visible');
			menuTrigger.classList.add('switch-icon--disabled');
			menuTrigger.setAttribute('aria-expanded', bool);
			// animate navigation height
			var finalHeight = bool ? window.innerHeight: 0,
				initHeight = bool ? 0 : window.innerHeight; 
			navigation.style.height = initHeight+'px';

			setTimeout(function(){
				navigation.style.height = finalHeight+'px';
				navigation.classList.toggle('header-v3__nav--animate-children', bool);
			}, 50);

			navigation.addEventListener('transitionend', function cb(event){
				if (event.propertyName !== 'height') return;
				if(finalHeight > 0) {
					var firstFocusableElement = getMenuFirstFocusable();
					firstFocusableElement.focus(); // move focus to first focusable element
				} else {
					navigation.classList.remove('header-v3__nav--is-visible', 'header-v3__nav--animate-children');
					if(focusMenu) { // we may need to move the focus to a new element
						focusMenu.focus();
						focusMenu = false;
					}
				}
				
				navigation.removeEventListener('transitionend', cb);
				navigation.removeAttribute('style');
				menuTrigger.classList.remove('switch-icon--disabled');
			});
			// toggle expanded class to header
			mainHeader[0].classList.toggle('header-v3--expanded', bool);
		};

		function toggleSearch(bool){
			searchTrigger[0].classList.add('switch-icon--disabled');
			mainHeader[0].classList.toggle('header-v3--show-search', bool);
			searchTrigger[0].setAttribute('aria-expanded', bool);
			mainHeader[0].addEventListener('transitionend', function cb(){
				mainHeader[0].removeEventListener('transitionend', cb);
				searchTrigger[0].classList.remove('switch-icon--disabled');
				if(bool) mainHeader[0].getElementsByClassName('header-v3__nav-item--search-form')[0].getElementsByTagName('input')[0].focus();
				else if(focusSearch) {// move focus to a new element when closing the search
					focusSearch.focus();
					focusSearch = false;
				}
			});

			// toggle expanded class to header
			mainHeader[0].classList.toggle('header-v3--expanded', bool);
		};

		function doneResizing() {
			// check if main nav is visible (small devices only)
			if( !isVisible(menuTrigger) && menuTrigger.getAttribute('aria-expanded') == 'true') menuTrigger.click();
			// check if search input is visible
			if( searchTrigger.length > 0 && !isVisible(searchTrigger[0]) && searchTrigger[0].getAttribute('aria-expanded') == 'true') searchTrigger[0].click();
		};

		function getMenuFirstFocusable() {
			var focusableEle = mainHeader[0].getElementsByClassName('header-v3__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
		};

		function setTransitionDelay(element, index) {
			element.style.transitionDelay = parseFloat((index/20) + 0.1).toFixed(2)+'s';
		};

		function isVisible(element) {
			return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function getChildrenByClassName(el, className) {
			var children = el.children,
				childrenByClass = [];
			for (var i = 0; i < children.length; i++) {
				if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
			}
			return childrenByClass;
		};
	}
}());
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};


Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};


Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

Util.extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
	var Slideshow = function(opts) {
		this.options = Util.extend(Slideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
		this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
		this.animatingClass = 'slideshow--is-animating';
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
	};

	Slideshow.prototype.showNext = function() {
		showNewItem(this, this.selectedSlide + 1, 'next');
	};

	Slideshow.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	Slideshow.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	Slideshow.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext();
			}, self.options.autoplayInterval);
		}
	};

	Slideshow.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			// check if navigation has already been included
			if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
				var navigation = document.createElement('ol'),
					navChildren = '';

				var navClasses = slideshow.options.navigationClass+' js-slideshow__navigation';
				if(slideshow.items.length <= 1) {
					navClasses = navClasses + ' is-hidden';
				}
				
				navigation.setAttribute('class', navClasses);
				for(var i = 0; i < slideshow.items.length; i++) {
					var className = (i == slideshow.selectedSlide) ? 'class="'+slideshow.options.navigationItemClass+' '+slideshow.options.navigationItemClass+'--selected js-slideshow__nav-item"' :  'class="'+slideshow.options.navigationItemClass+' js-slideshow__nav-item"',
						navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
					navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
				}
				navigation.innerHTML = navChildren;
				slideshow.element.appendChild(navigation);
			}
			
			slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

			var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

			dotsNavigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			dotsNavigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			// hide controls if one item available
			if(slideshow.items.length <= 1) {
				Util.addClass(slideshow.controls[0], 'is-hidden');
				Util.addClass(slideshow.controls[1], 'is-hidden');
			}
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext();
				updateAriaLive(slideshow);
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext();
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			if(!slideshow.options.autoplayOnHover) {
				slideshow.element.addEventListener('mouseenter', function(event){
					slideshow.pauseAutoplay();
					slideshow.autoplayPaused = true;
				});
				slideshow.element.addEventListener('mouseleave', function(event){
					slideshow.autoplayPaused = false;
					slideshow.startAutoplay();
				});
			}
			if(!slideshow.options.autoplayOnFocus) {
				slideshow.element.addEventListener('focusin', function(event){
					slideshow.pauseAutoplay();
					slideshow.autoplayPaused = true;
				});
				slideshow.element.addEventListener('focusout', function(event){
					slideshow.autoplayPaused = false;
					slideshow.startAutoplay();
				});
			}
		}
		// detect if external buttons control the slideshow
		var slideshowId = slideshow.element.getAttribute('id');
		if(slideshowId) {
			var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
			for(var i = 0; i < externalControls.length; i++) {
				(function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
			}
		}
		// custom event to trigger selection of a new slide element
		slideshow.element.addEventListener('selectNewItem', function(event){
			// check if slide is already selected
			if(event.detail) {
				if(event.detail - 1 == slideshow.selectedSlide) return;
				showNewItem(slideshow, event.detail - 1, false);
			}
		});

		// keyboard navigation
		slideshow.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				slideshow.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				slideshow.showPrev();
			}
		});
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function initAnimationEndEvents(slideshow) {
		// remove animation classes at the end of a slide transition
		for( var i = 0; i < slideshow.items.length; i++) {
			(function(i){
				slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
				slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
			})(i);
		}
	};

	function resetAnimationEnd(slideshow, item) {
		setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
			if(Util.hasClass(item,'slideshow__item--selected')) {
				if(slideshow.moveFocus) Util.moveFocus(item);
				emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
				slideshow.moveFocus = false;
			}
			Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
			item.removeAttribute('aria-hidden');
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass); 
		}, 100);
	};

	function showNewItem(slideshow, index, bool) {
		if(slideshow.items.length <= 1) return;
		if(slideshow.animating && slideshow.supportAnimation) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass); 
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// skip slideshow item if it is hidden
		if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
			slideshow.animating = false;
			index = bool == 'next' ? index + 1 : index - 1;
			showNewItem(slideshow, index, bool);
			return;
		}
		// index of new slide is equal to index of slide selected item
		if(index == slideshow.selectedSlide) {
			slideshow.animating = false;
			return;
		}
		var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
		var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
		// transition between slides
		if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		if(slideshow.animationOff) {
			Util.addClass(slideshow.items[index], 'slideshow__item--selected');
		} else {
			Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
		}
		// reset slider navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		// reset autoplay
		slideshow.pauseAutoplay();
		slideshow.startAutoplay();
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
		// emit event
		emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
		if(slideshow.animationOff) {
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}
	};

	function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
		}
		return className;
	};

	function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
		}
		return className;
	};

	function resetSlideshowNav(slideshow, newIndex, oldIndex) {
		if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};

	function resetSlideshowTheme(slideshow, newIndex) {
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

	function emitSlideshowEvent(slideshow, eventName, detail) {
		var event = new CustomEvent(eventName, {detail: detail});
		slideshow.element.dispatchEvent(event);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function externalControlSlide(slideshow, button) { // control slideshow using external element
		button.addEventListener('click', function(event){
			var index = button.getAttribute('data-index');
			if(!index || index == slideshow.selectedSlide + 1) return;
			event.preventDefault();
			showNewItem(slideshow, index - 1, false);
		});
	};

	Slideshow.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
		autoplayOnHover: false,
		autoplayOnFocus: false,
    autoplayInterval: 5000,
		navigationItemClass: 'slideshow__nav-item',
    navigationClass: 'slideshow__navigation',
    swipe: false
  };

	window.Slideshow = Slideshow;
	
	//initialize the Slideshow objects
	var slideshows = document.getElementsByClassName('js-slideshow');
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayOnHover = (slideshows[i].getAttribute('data-autoplay-hover') && slideshows[i].getAttribute('data-autoplay-hover') == 'on') ? true : false,
					autoplayOnFocus = (slideshows[i].getAttribute('data-autoplay-focus') && slideshows[i].getAttribute('data-autoplay-focus') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false,
					navigationItemClass = slideshows[i].getAttribute('data-navigation-item-class') ? slideshows[i].getAttribute('data-navigation-item-class') : 'slideshow__nav-item',
          navigationClass = slideshows[i].getAttribute('data-navigation-class') ? slideshows[i].getAttribute('data-navigation-class') : 'slideshow__navigation';
				new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayOnHover: autoplayOnHover, autoplayOnFocus: autoplayOnFocus, autoplayInterval : autoplayInterval, swipe : swipe, navigationItemClass: navigationItemClass, navigationClass: navigationClass});
			})(i);
		}
	}
}());
// File#: _3_hiding-nav
// Usage: codyhouse.co/license
(function() {
    var hidingNav = document.getElementsByClassName('js-hide-nav');
    if(hidingNav.length > 0 && window.requestAnimationFrame) {
      var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
        return element.classList.contains('js-hide-nav--main');
      }),
      subNav = Array.prototype.filter.call(hidingNav, function(element) {
        return element.classList.contains('js-hide-nav--sub');
      });
      
      var scrolling = false,
        previousTop = window.scrollY,
        currentTop = window.scrollY,
        scrollDelta = 10,
        scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
        headerHeight = 0; 
  
      var navIsFixed = false; // check if main navigation is fixed
      if(mainNav.length > 0 && mainNav[0].classList.contains('hide-nav--fixed')) navIsFixed = true;
  
      // store button that triggers navigation on mobile
      var triggerMobile = getTriggerMobileMenu();
      var prevElement = createPrevElement();
      var mainNavTop = 0;
      // list of classes the hide-nav has when it is expanded -> do not hide if it has those classes
      var navOpenClasses = hidingNav[0].getAttribute('data-nav-target-class'),
        navOpenArrayClasses = [];
      if(navOpenClasses) navOpenArrayClasses = navOpenClasses.split(' ');
      getMainNavTop();
      if(mainNavTop > 0) {
        scrollOffset = scrollOffset + mainNavTop;
      }
      
      // init navigation and listen to window scroll event
      getHeaderHeight();
      initSecondaryNav();
      initFixedNav();
      resetHideNav();
      window.addEventListener('scroll', function(event){
        if(scrolling) return;
        scrolling = true;
        window.requestAnimationFrame(resetHideNav);
      });
  
      window.addEventListener('resize', function(event){
        if(scrolling) return;
        scrolling = true;
        window.requestAnimationFrame(function(){
          if(headerHeight > 0) {
            getMainNavTop();
            getHeaderHeight();
            initSecondaryNav();
            initFixedNav();
          }
          // reset both navigation
          hideNavScrollUp();
  
          scrolling = false;
        });
      });
  
      function getHeaderHeight() {
        headerHeight = mainNav[0].offsetHeight;
      };
  
      function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
        if(subNav.length < 1 || mainNav.length < 1) return;
        subNav[0].style.top = (headerHeight - 1)+'px';
      };
  
      function initFixedNav() {
        if(!navIsFixed || mainNav.length < 1) return;
        mainNav[0].style.marginBottom = '-'+headerHeight+'px';
      };
  
      function resetHideNav() { // check if navs need to be hidden/revealed
        currentTop = window.scrollY;
        if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
          hideNavScrollDown();
        } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
          hideNavScrollUp();
        } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
          setTranslate(subNav[0], '0%');
        }
        // if primary nav is fixed -> toggle bg class
        if(navIsFixed) {
          var scrollTop = window.scrollY || window.pageYOffset;
          mainNav[0].classList.toggle('hide-nav--has-bg', (scrollTop > headerHeight + mainNavTop));
        }
        previousTop = currentTop;
        scrolling = false;
      };
  
      function hideNavScrollDown() {
        // if there's a secondary nav -> it has to reach the top before hiding nav
        if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
        // on mobile -> hide navigation only if dropdown is not open
        if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
        // check if main nav has one of the following classes
        if( mainNav.length > 0 && (!navOpenClasses || !checkNavExpanded())) {
          setTranslate(mainNav[0], '-100%'); 
          mainNav[0].addEventListener('transitionend', addOffCanvasClass);
        }
        if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
      };
  
      function hideNavScrollUp() {
        if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); mainNav[0].classList.remove('hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
        if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
      };
  
      function addOffCanvasClass() {
        mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
        mainNav[0].classList.add('hide-nav--off-canvas');
      };
  
      function setTranslate(element, val) {
        element.style.transform = 'translateY('+val+')';
      };
  
      function getTriggerMobileMenu() {
        // store trigger that toggle mobile navigation dropdown
        var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
        if(!triggerMobileClass) return false;
        if(triggerMobileClass.indexOf('#') == 0) { // get trigger by ID
          var trigger = document.getElementById(triggerMobileClass.replace('#', ''));
          if(trigger) return trigger;
        } else { // get trigger by class name
          var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
          if(trigger.length > 0) return trigger[0];
        }
        
        return false;
      };
  
      function createPrevElement() {
        // create element to be inserted right before the mainNav to get its top value
        if( mainNav.length < 1) return false;
        var newElement = document.createElement("div"); 
        newElement.setAttribute('aria-hidden', 'true');
        mainNav[0].parentElement.insertBefore(newElement, mainNav[0]);
        var prevElement =  mainNav[0].previousElementSibling;
        prevElement.style.opacity = '0';
        return prevElement;
      };
  
      function getMainNavTop() {
        if(!prevElement) return;
        mainNavTop = prevElement.getBoundingClientRect().top + window.scrollY;
      };
  
      function checkNavExpanded() {
        var navIsOpen = false;
        for(var i = 0; i < navOpenArrayClasses.length; i++){
          if(mainNav[0].classList.contains(navOpenArrayClasses[i].trim())) {
            navIsOpen = true;
            break;
          }
        }
        return navIsOpen;
      };
      
    } else {
      // if window requestAnimationFrame is not supported -> add bg class to fixed header
      var mainNav = document.getElementsByClassName('js-hide-nav--main');
      if(mainNav.length < 1) return;
      if(mainNav[0].classList.contains('hide-nav--fixed')) mainNav[0].classList.add('hide-nav--has-bg');
    }
  }()); 
// File#: _3_looping-slideshow
// Usage: codyhouse.co/license
(function() {
    var LoopSlideshow = function(element) {
      this.element = element;
      this.slideshowObj = false;
      this.navItems = this.element.getElementsByClassName('js-slideshow__nav-item');
      this.autoplayInterval = 5000;
      this.autoplayPaused = false;
      this.fillingCSS = '--loop-slideshow-filling';
      this.pauseBtnClass = 'js-loop-slideshow__pause-btn';
      this.pauseBtn = this.element.getElementsByClassName(this.pauseBtnClass);
      this.animating = false;
      this.currentTime = false;
  
      initLoopSlideshow(this);
      initEvents(this);
    };
  
    function initLoopSlideshow(obj) {
      var autoplay = true,
              autoplayInterval = (obj.element.getAttribute('data-autoplay-interval')) ? obj.element.getAttribute('data-autoplay-interval') : obj.autoplayInterval,
              swipe = (obj.element.getAttribute('data-swipe') && obj.element.getAttribute('data-swipe') == 'on') ? true : false;
          obj.slideshowObj = new Slideshow({element: obj.element, navigation: true, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, navigationClass: 'loop-slideshow__navigation', navigationItemClass: 'loop-slideshow__nav-item', autoplayOnHover: true, autoplayOnFocus: true});
      // update autoplay interval
      obj.autoplayInterval = autoplayInterval;
      // filling effect for first item
      initFilling(obj, obj.slideshowObj.selectedSlide);
    };
  
    function initEvents(obj) {
      obj.element.addEventListener('newItemSelected', function(event){
        // new slide has been selected
        initFilling(obj, event.detail);
        toggleAutoplay(obj, false);
      });
  
      // custom click on image -> animate slideshow
      obj.element.addEventListener('click', function(event){
        if(event.target.closest('.js-loop-slideshow__pause-btn')) {
          toggleAutoplay(obj, !obj.autoplayPaused); // pause/play autoplay
        } else if(event.target.closest('.js-slideshow__item')) {
          showNewSlide(obj, event);
        }
      });
    };
  
    function initFilling(obj, index) {
      cancelFilling(obj);
  
      for(var i = 0; i < obj.navItems.length; i++) {
        setFilling(obj.navItems[i], obj.fillingCSS, 0);
      }
      // trigger animation
      obj.currentTime = false;
      animateFilling(obj, index);
    };
  
    function cancelFilling(obj) {
      if(obj.animating) { // clear previous animation
        window.cancelAnimationFrame(obj.animating);
        obj.animating = false;
      }
    };
  
    function animateFilling(obj, index) {
      obj.animating = window.requestAnimationFrame(function(timestamp){
        if(!obj.currentTime) obj.currentTime = timestamp;
        var progress = timestamp - obj.currentTime;
        if(progress > obj.autoplayInterval) progress = obj.autoplayInterval;
        setFilling(obj.navItems[index], obj.fillingCSS, (progress/obj.autoplayInterval).toFixed(3));
        
        if(progress < obj.autoplayInterval) {
          animateFilling(obj, index);
        } else {
          // animation is over
          obj.animating = false;
          obj.currentTime = false;
        }
      });
    };
  
    function setFilling(element, property, value) {
      element.style.setProperty(property, value);
    };
  
    function showNewSlide(obj, event) {
      // check if we should go next or prev
      var boundingRect = obj.element.getBoundingClientRect(),
        isNext = event.clientX > boundingRect.left + boundingRect.width/2;
  
      isNext ? obj.slideshowObj.showNext() : obj.slideshowObj.showPrev();
    };
  
    function toggleAutoplay(obj, bool) {
      obj.autoplayPaused = bool;
      if(obj.autoplayPaused) {
        cancelFilling(obj);
        obj.slideshowObj.pauseAutoplay();
      } else {
        obj.slideshowObj.startAutoplay();
        initFilling(obj, obj.slideshowObj.selectedSlide);
      }
      if(obj.pauseBtn.length > 0) {
        // update btn appearance
        obj.pauseBtn[0].classList.toggle('btn-states--state-b', obj.autoplayPaused);
        // update pressed status 
        obj.autoplayPaused ? obj.pauseBtn[0].setAttribute('aria-pressed', 'true'): obj.pauseBtn[0].setAttribute('aria-pressed', 'false');
      }
    };
  
    //initialize the ThumbSlideshow objects
      var slideshow = document.getElementsByClassName('js-loop-slideshow');
    if( slideshow.length > 0 ) {
      for( var i = 0; i < slideshow.length; i++) {
        (function(i){
          new LoopSlideshow(slideshow[i]);
        })(i);
      }
    }
  }());