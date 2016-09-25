/*global $*/
var Hamburger = (function () {
  function bindUIActions () {
    $('.wp-hamburger').on('click', function () {
      $('.wp-hamburger__bar').toggleClass('wp-hamburger__bar--animate')
    })
  }

  return {
    init: function () {
      if (!window.jQuery) {
        console.warn('Error: jQuery is not loaded')
        return
      }
      if (typeof $('.wp-hamburger')[0] === 'undefined') {
        console.warn('Warning: Hamburger doesn\'t exist')
        return
      }
      bindUIActions()
    }
  }
})()

Hamburger.init()


// TODO: refactor in topbar.js style
/*global $ */
var s
var Dropdown = {

  settings: {
    dropdownToggle: $('*[data-dropdown]'), // all dropdown toggle elements
    dropdownMenu: $('.wp-dropdown') // all drop down menus
  },
// [aria-haspopup][aria-pressed]
  init: function () {
    s = this.settings
    this.bindUIActions()
  },

  bindUIActions: function () {
    s.dropdownToggle.each(function () {
      Dropdown.toggleDropdown.call(this)
    })

    $(document).click(function (event) {
      Dropdown.onClickOutsideClose(event)
    })
  },

  toggleDropdown: function () {
    $(this).bind('click', function (e) {
      var state = ($(this).attr('aria-pressed') === 'true')
      var next = $(this).next()
      $(this).attr('aria-pressed', !state)
      if (next.is('.wp-dropdown')) {
        next.attr('aria-expanded', !state)
        var links = $('[class$="__link"]', next)
        if (links[0]) { // if exist add tabindex for accessibility
          var nextTabindex = ($(links[0]).attr('tabindex') === '-1') ? '0' : '-1'
          links.each(function () {
            $(this).attr('tabindex', nextTabindex)
          })
        }
      }
    })
  },

  onClickOutsideClose: function (event) {
    // make sure .wp-dropdown or [data-dropdown] is not an ancestor or
    // the target of the clicked element (.closest(), .is()).
    var target = $(event.target)
    if (!target.closest('.wp-dropdown, [data-dropdown]').length &&
      !target.is('.wp-dropdown, [data-dropdown]')) {
      s.dropdownMenu.each(function () {
        if ($(this).attr('aria-expanded') === 'true') {
          $(this).attr('aria-expanded', false)
          $(this).prev().attr('aria-pressed', false)
        }
      })
    }
  }
}

Dropdown.init()

/*global $*/

// TODO: finish implementation
// Desktop Bug (prevent swipe)
// On init - check dependencies (and warn)

var leftOffset = 56
var NAV_WIDTH = $(window).width() - leftOffset
var speed = 200
var nav

var swipeOptions = {
  triggerOnTouchEnd: true,
  swipeStatus: swipeStatus,
  allowPageScroll: 'vertical',
  threshold: 100
}

$(function () {
  nav = $('.wp-nav__menu')
  nav.swipe(swipeOptions)
})

/**
* Catch each phase of the swipe.
* move : we drag the div
* cancel : we animate back to where we were
* end : we animate to the next image
*/
function swipeStatus (event, phase, direction, distance) {
  if (phase === 'move' && (direction === 'right')) {
    var duration = 0
    scrollNav(distance, duration)
  } else if (phase === 'cancel') {
    scrollNav(0, speed)
  } else if (phase === 'end') {
    hideNav()
  }
}
function hideNav () {
  scrollNav(NAV_WIDTH, speed)
}

/**
* Manually update the position of the nav on drag
*/
function scrollNav (distance, duration) {
  nav.css('transition-duration', (duration / 1000).toFixed(1) + 's')
  // inverse the number we set in the css
  var value = Math.abs(distance).toString()
  nav.css('transform', 'translateX(' + value + 'px)')

  if (value < 1) nav.removeAttr('style')
  console.log( value, NAV_WIDTH - 5 )
  if (value > NAV_WIDTH - 5) {
    nav.closest('.wp-nav__item').removeClass('wp-nav__item--open')
    nav.removeAttr('style')
  }
}


/*global $, Modernizr */

var Navigation = (function () {
  var largeScreenStartsFrom = 600 // px
  var isDesktopMode = (Modernizr.mq('only all and (min-width: ' + largeScreenStartsFrom + 'px)'))
  var menuToggle = $('.wp-nav__item') // all dropdown toggle elements

  function bindUIActions () {
    $(document).click(function (event) {
      onClickOutsideClose(event)
    })

    bindSubmenuToggle()
  }

  function onClickOutsideClose (event) {
    if (!$('body').hasClass('sidebar-minimized')) return
    // make sure .wp-nav__link or .wp-nav__menu is not an ancestor or
    // the target of the clicked element (.closest(), .is()).
    var target = $(event.target)
    if (!target.closest('.wp-nav__link, .wp-nav__menu').length &&
      !target.is('.wp-nav__link, .wp-nav__menu')) {
      menuToggle.each(function () {
        if ($(this).attr('aria-expanded') === 'true') {
          $(this).attr('aria-expanded', false).removeClass('wp-nav__item--open')
        }
      })
    }
  }

  /**
  * toggle Menu item tab indexes: -1 (inaccessible), 0 (accessible in default seq.)
  * To make navigation accessible with tab & enter
  * @parent .wp-nav__item
  * @show true->to set 0, false->to set -1
  */
  function toggleMenuTabindex (parent, show) {
    $('.wp-nav__sublink', parent).each(function () {
      var tabindex = -1
      if (show === true) tabindex = 0
      $(this).attr('tabindex', tabindex)
    })
  }

  /**
   * Open Sub-menus
   * Toggle classes / Aria attributes
   */
  function bindSubmenuToggle () {
    // console.log('AgentNavigation: bindingSubmenu', $('.wp-nav__link:not([aria-haspopup="false"])'))
    $('.wp-nav__link:not([aria-haspopup="false"])').bind('click', function () {
      // checking if this is already open
      if ($(this).parent().hasClass('wp-nav__item--open')) {
        // console.log($(this), $(this).parent(), $(this).parent)
        $(this).parent().removeClass('wp-nav__item--open').attr('aria-expanded', 'false')
        toggleMenuTabindex($(this).parent(), false)
        return
      }

      // otherwise
      // if menu open - close it
      $('.wp-nav__link').each(function () {
        var superior = $(this).parent()

        if ($(superior).hasClass('wp-nav__item--open')) {
          $(superior).removeClass('wp-nav__item--open').attr('aria-expanded', 'false')
          toggleMenuTabindex($(superior), false)
        }
      })
      // open this one.
      $(this).parent().toggleClass('wp-nav__item--open').attr('aria-expanded', 'true')
      toggleMenuTabindex($(this).parent(), true)
    })
  }

  /**
   * MODIFIED FROM Core.Agent.js
   * Make the navigation items sortable
   */
  function bindNavigationSorting (TargetNS) {
    // make the navigation items sortable (if enabled)
    // if (Core.Config.Get('MenuDragDropEnabled') === 1) {
    //     // console.info('Enabling: MenuDragDrop')
    //     Core.UI.DnD.Sortable($('.wp-nav__list'),{
    //         Items: '.wp-nav__item',
    //         Tolerance: 'pointer',
    //         Distance: 15,
    //         Opacity: 0.6,
    //         Helper: 'clone',
    //         Axis: 'y',
    //         Containment: $('.wp-nav__list'),
    //         Placeholder: 'wp-nav__placeholder',
    //         Update: function (e,ui) {
    //             // collect navigation bar items
    //             var Items = {}
    //             $.each($('.wp-nav__list').children('.wp-nav__item'), function(index, elem) {
    //                 // Saving the order (for saving in DB)
    //                 var id = $(this).attr('id').substring(4)
    //                 Items[id] = index+1
    //             })

    //             //console.log(Items)
    //             // save the new order to the users preferences
    //             TargetNS.PreferencesUpdate('UserNavBarItemsOrder', Core.JSON.Stringify(Items))

    //         }

    //     })

    // }
  }

  return {
    init: function () {
      if (!window.jQuery) {
        console.warn('Error: jQuery is not loaded')
        return
      }
      if (!typeof Modernizr === 'object') {
        console.warn('Error: Modernizr is not loaded')
        return
      }
      if (typeof $('.wp-nav')[0] === 'undefined') {
        console.warn('Warning: Navigation doesn\'t exist')
        return
      }
      bindUIActions()
    }
  }
})()

Navigation.init()


/*global $, Modernizr */

var Topbar = (function () {
  var largeScreenStartsFrom = 600 // px
  var sidebarToggle = $('.wp-topbar__toggle-menu') // toggle sidebar
  var topbar = $('.wp-topbar')
  var topbarLeft = $('.wp-topbar__left')
  var topbarMore = $('.wp-topbar__more')
  var dropdownMore = $('.dropdown--more')
  var hidePadding = 2 // when this free space remains -> hide
  var showPadding = 20 // when item.width + this space is available -> show
  var elements = []
  var lastActiveIndex = 0 // last active element in top bar

  function bindUIActions () {
    // Bind Toggle
	mobileToggleSidebar()
    mobileToggleNavigation()

    sidebarToggle.bind('click', function () {
      $('body').toggleClass('sidebar-minimized')
      // pseudo: on topbar resize
      var toggleSidebarInterval = setInterval(toggleMoreButton, 10)
      setTimeout(function () { clearInterval(toggleSidebarInterval) }, 1000)
    })

	if (typeof $('.dropdown--more')[0] === 'undefined') {
	  console.warn('Warning: Topbar More button doesn\'t exist')
	  return
	}
	// More button functionality
    $(document).ready(function () {
      var isDesktopMode = (Modernizr.mq('only all and (min-width: ' + largeScreenStartsFrom + 'px)'))
      // a) duplicate content to dropdown
      // b) save references to the elements
      // c) set resize function
	  var topbarElem = topbarLeft.children()
      topbarLeft.children().clone().appendTo(dropdownMore)
      saveElements()
      // check if it fits
      if (isDesktopMode) toggleMoreButton()
      $(window).bind('resize', function () {
        // More button should work **only** on tablet+
        if (Modernizr.mq('only all and (min-width: ' + largeScreenStartsFrom + 'px)')) {
          isDesktopMode = true
          toggleMoreButton()
        } else {
          // switching from desktop to mobile view
          if (isDesktopMode) {
            reset()
            isDesktopMode = false
          }
        }
      })
    })
  }

  //
  // Toggle Elements
  //
  function mobileToggleSidebar () {
    if (typeof $('.wp-topbarxs__sidebar')[0] === 'undefined') {
      console.warn('Warning: .wp-topbarxs__sidebar doesn\'t exist')
      return
    }
    $('.wp-topbarxs__sidebar').on('click', function () {
      var body = $('body')
      var hamburger = $('.wp-hamburger')
      if (body.hasClass('mobnav-open')) {
        if (body.hasClass('mobsidebar-open')) {
          hamburger.click()
          return
        } else {
          hamburger.click()
        }
      }
      $('body').toggleClass('mobsidebar-open')
    })
  }

  function mobileToggleNavigation () {
    if (typeof $('.wp-hamburger')[0] === 'undefined') {
      console.warn('Warning: .wp-hamburger doesn\'t exist')
      return
    }
    $('.wp-hamburger').on('click', function () {
      $('body').toggleClass('mobnav-open')
    })
  }

  //
  // MORE BUTTON
  //

  /**
   * Reset more button & show/hide states
   */
  function reset () {
    topbarLeft = $('.wp-topbar__left')
    topbarMore = $('.wp-topbar__more')
    dropdownMore = $('.dropdown--more')
    var leftbar = topbarLeft.children()
    var dropdown = dropdownMore.children()
    lastActiveIndex = 0

    topbarMore.removeClass('wp-topbar__more--active') // hide
    deactivateMoreButton() // deactivate dropdown

    leftbar.each(function () {
      $(this).show()
      $('.wp-topbar__item', this).each(function () {
        $(this).show()
      })
    })
    dropdown.each(function (index1) {
      $(this).hide()
      $('.wp-topbar__item', this).each(function () {
        $(this).hide() // initial state
      })
    })
  }

  /**
   * On page load save element references to array.
   * Both - reference to topbar & dropdown elements are saved
   * elements[0] - section index
   * elements[1] - leftbar item reference
   * elements[2] - dropdown item reference
   * elements[3] - leftbar section reference
   * elements[4] - dropdown section reference
   */
  function saveElements () {
    var leftbar = topbarLeft.children()
    var dropdown = dropdownMore.children()
    var leftbarElem = []
    var dropdownElem = []

    leftbar.each(function (index1) {
      var section = $(this)
      $('.wp-topbar__item', this).each(function (index2) {
        var item = [index1, index2, $(this), section]
        leftbarElem.push(item)
      })
    })
    dropdown.each(function (index1) {
      var section = $(this)
      $('.wp-topbar__item', this).each(function (index2) {
        var item = [index1, index2, $(this), section]
        dropdownElem.push(item)
        $(this).hide() // initial state
      })
      section.hide() // initial state
    })

    for (var i = leftbarElem.length - 1; i >= 0; i--) {
      var element = [leftbarElem[i][0], leftbarElem[i][2], dropdownElem[i][2], leftbarElem[i][3], dropdownElem[i][3]]
      elements.push(element)
    }
  }

  function toggleMoreButton () {
    var isMoreActive = topbarMore.hasClass('wp-topbar__more--active')
    if (isMoreActive) {
      if (moreButtonFits()) {
        whileSpace()
      } else {
        whileNoSpace()
      }
    } else {
      if (topbar.outerWidth() < topbarLeft.outerWidth() + hidePadding) {
        topbarMore.toggleClass('wp-topbar__more--active') // set active
        whileNoSpace()
      }
    }
  }

  /**
   * While more button doesn't fit
   * hide topbar & show dropdown elements
   */
  function whileNoSpace () { // no space - remove items
    while (!moreButtonFits()) {
      var nextSection = (typeof elements[lastActiveIndex + 1] === 'undefined') ? -1 : elements[lastActiveIndex + 1][0]
      var prevSection = (typeof elements[lastActiveIndex - 1] === 'undefined') ? -1 : elements[lastActiveIndex - 1][0]
      if (elements[lastActiveIndex][0] !== prevSection) {
        // before putting new element show section in dropdown
        elements[lastActiveIndex][4].show()
      }
      if (nextSection && elements[lastActiveIndex][0] !== nextSection) {
        // if next item has different section hide this section in topbar
        elements[lastActiveIndex][3].hide()
      }
      elements[lastActiveIndex][1].hide()
      elements[lastActiveIndex][2].show()
      lastActiveIndex++
    }
  }

  function whileSpace () {
    if (lastActiveIndex === 0) return
    var hiddenIndex = lastActiveIndex - 1
    var hiddenItem = elements[hiddenIndex][1]

    if (itemFits(hiddenItem)) {
      // if it's the first element (from left)
      if (lastActiveIndex === elements.length) {
        lastActiveIndex--
        elements[lastActiveIndex][3].show()
        elements[lastActiveIndex][1].show()
        elements[lastActiveIndex][2].hide()
        return
      }
      var prevSection = (typeof elements[lastActiveIndex - 1] === 'undefined') ? false : elements[lastActiveIndex - 1][0]
      var nextSection = (typeof elements[lastActiveIndex + 1] === 'undefined') ? false : elements[lastActiveIndex + 1][0]
      if (prevSection && elements[lastActiveIndex][0] !== prevSection) {
        // if next(prevSection) is different, hide section from dropdown
        elements[lastActiveIndex][4].hide()
      }
      if (nextSection && elements[lastActiveIndex][0] !== nextSection) {
        // if prev(nextSection) is different, show section on topbar
        elements[lastActiveIndex][3].show()
      }
      elements[lastActiveIndex][1].show()
      elements[lastActiveIndex][2].hide()

      lastActiveIndex--
      if (lastActiveIndex === 0) {
        elements[lastActiveIndex][1].show()
        elements[lastActiveIndex][2].hide()
        topbarMore.toggleClass('wp-topbar__more--active') // hide
        deactivateMoreButton()
        return
      }
    }
  }

  function moreButtonFits () {
    return (topbarLeft.outerWidth() + topbarMore.outerWidth() + hidePadding) <= topbar.outerWidth()
  }

  function itemFits (item) {
    // TODO: cannot detect item.outerWidth(). Element is display:none
    // http://stackoverflow.com/questions/1472303/jquery-get-width-of-element-when-not-visible-display-none
    var itemWidth = 36 // item.outerWidth()
    return (topbarLeft.outerWidth() + topbarMore.outerWidth() + showPadding + itemWidth) <= topbar.outerWidth()
  }

  function deactivateMoreButton () {
    if (topbarMore.attr('aria-pressed') === 'true') {
      topbarMore.attr('aria-pressed', false)
      topbarMore.next().attr('aria-expanded', false)
    }
  }

  return {
    init: function () {
      if (!window.jQuery) {
        console.warn('Error: jQuery is not loaded')
        return
      }
      if (!typeof Modernizr === 'object') {
        console.warn('Error: Modernizr is not loaded')
        return
      }
      if (typeof $('.wp-topbar')[0] === 'undefined') {
        console.warn('Warning: Topbar doesn\'t exist')
        return
      }
      bindUIActions()
    }
  }
})()

Topbar.init()

// /*global $*/
// var Topbarxs = (function () {
//   function bindUIActions () {
//     $('.wp-topbarxs__sidebar').on('click', function () {
//       $('body').toggleClass('mobsidebar-open')
//     })
//   }

//   return {
//     init: function () {
//       if (!window.jQuery) {
//         console.warn('Error: jQuery is not loaded')
//         return
//       }
//       if (typeof $('.wp-topbarxs')[0] === 'undefined') {
//         console.warn('Warning: topbarxs doesn\'t exist')
//         return
//       }
//       bindUIActions()
//     }
//   }
// })()

// Topbarxs.init()


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAwLWF0b21zLzA2LWJ1dHRvbnMvaGFtYnVyZ2VyL2hhbWJ1cmdlci5qcyIsIjAxLW1vbGVjdWxlcy8wNC1mb3Jtcy9kcm9wZG93bi9kcm9wZG93bi5qcyIsIjAxLW1vbGVjdWxlcy8wNS1uYXZpZ2F0aW9uL25hdmlnYXRpb24vbmF2aWdhdGlvbi0tbW9iaWxlLmpzIiwiMDEtbW9sZWN1bGVzLzA1LW5hdmlnYXRpb24vbmF2aWdhdGlvbi9uYXZpZ2F0aW9uLmpzIiwiMDItb3JnYW5pc21zLzAwLWdsb2JhbC90b3BiYXIvdG9wYmFyLmpzIiwiMDItb3JnYW5pc21zLzAwLWdsb2JhbC90b3BiYXJ4cy90b3BiYXJ4cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvbXBvbmVudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbCAkKi9cclxudmFyIEhhbWJ1cmdlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgZnVuY3Rpb24gYmluZFVJQWN0aW9ucyAoKSB7XHJcbiAgICAkKCcud3AtaGFtYnVyZ2VyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCcud3AtaGFtYnVyZ2VyX19iYXInKS50b2dnbGVDbGFzcygnd3AtaGFtYnVyZ2VyX19iYXItLWFuaW1hdGUnKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICghd2luZG93LmpRdWVyeSkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignRXJyb3I6IGpRdWVyeSBpcyBub3QgbG9hZGVkJylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mICQoJy53cC1oYW1idXJnZXInKVswXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IEhhbWJ1cmdlciBkb2VzblxcJ3QgZXhpc3QnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGJpbmRVSUFjdGlvbnMoKVxyXG4gICAgfVxyXG4gIH1cclxufSkoKVxyXG5cclxuSGFtYnVyZ2VyLmluaXQoKVxyXG5cclxuIiwiLy8gVE9ETzogcmVmYWN0b3IgaW4gdG9wYmFyLmpzIHN0eWxlXHJcbi8qZ2xvYmFsICQgKi9cclxudmFyIHNcclxudmFyIERyb3Bkb3duID0ge1xyXG5cclxuICBzZXR0aW5nczoge1xyXG4gICAgZHJvcGRvd25Ub2dnbGU6ICQoJypbZGF0YS1kcm9wZG93bl0nKSwgLy8gYWxsIGRyb3Bkb3duIHRvZ2dsZSBlbGVtZW50c1xyXG4gICAgZHJvcGRvd25NZW51OiAkKCcud3AtZHJvcGRvd24nKSAvLyBhbGwgZHJvcCBkb3duIG1lbnVzXHJcbiAgfSxcclxuLy8gW2FyaWEtaGFzcG9wdXBdW2FyaWEtcHJlc3NlZF1cclxuICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBzID0gdGhpcy5zZXR0aW5nc1xyXG4gICAgdGhpcy5iaW5kVUlBY3Rpb25zKClcclxuICB9LFxyXG5cclxuICBiaW5kVUlBY3Rpb25zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBzLmRyb3Bkb3duVG9nZ2xlLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICBEcm9wZG93bi50b2dnbGVEcm9wZG93bi5jYWxsKHRoaXMpXHJcbiAgICB9KVxyXG5cclxuICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICBEcm9wZG93bi5vbkNsaWNrT3V0c2lkZUNsb3NlKGV2ZW50KVxyXG4gICAgfSlcclxuICB9LFxyXG5cclxuICB0b2dnbGVEcm9wZG93bjogZnVuY3Rpb24gKCkge1xyXG4gICAgJCh0aGlzKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciBzdGF0ZSA9ICgkKHRoaXMpLmF0dHIoJ2FyaWEtcHJlc3NlZCcpID09PSAndHJ1ZScpXHJcbiAgICAgIHZhciBuZXh0ID0gJCh0aGlzKS5uZXh0KClcclxuICAgICAgJCh0aGlzKS5hdHRyKCdhcmlhLXByZXNzZWQnLCAhc3RhdGUpXHJcbiAgICAgIGlmIChuZXh0LmlzKCcud3AtZHJvcGRvd24nKSkge1xyXG4gICAgICAgIG5leHQuYXR0cignYXJpYS1leHBhbmRlZCcsICFzdGF0ZSlcclxuICAgICAgICB2YXIgbGlua3MgPSAkKCdbY2xhc3MkPVwiX19saW5rXCJdJywgbmV4dClcclxuICAgICAgICBpZiAobGlua3NbMF0pIHsgLy8gaWYgZXhpc3QgYWRkIHRhYmluZGV4IGZvciBhY2Nlc3NpYmlsaXR5XHJcbiAgICAgICAgICB2YXIgbmV4dFRhYmluZGV4ID0gKCQobGlua3NbMF0pLmF0dHIoJ3RhYmluZGV4JykgPT09ICctMScpID8gJzAnIDogJy0xJ1xyXG4gICAgICAgICAgbGlua3MuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICQodGhpcykuYXR0cigndGFiaW5kZXgnLCBuZXh0VGFiaW5kZXgpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9LFxyXG5cclxuICBvbkNsaWNrT3V0c2lkZUNsb3NlOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIC8vIG1ha2Ugc3VyZSAud3AtZHJvcGRvd24gb3IgW2RhdGEtZHJvcGRvd25dIGlzIG5vdCBhbiBhbmNlc3RvciBvclxyXG4gICAgLy8gdGhlIHRhcmdldCBvZiB0aGUgY2xpY2tlZCBlbGVtZW50ICguY2xvc2VzdCgpLCAuaXMoKSkuXHJcbiAgICB2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXHJcbiAgICBpZiAoIXRhcmdldC5jbG9zZXN0KCcud3AtZHJvcGRvd24sIFtkYXRhLWRyb3Bkb3duXScpLmxlbmd0aCAmJlxyXG4gICAgICAhdGFyZ2V0LmlzKCcud3AtZHJvcGRvd24sIFtkYXRhLWRyb3Bkb3duXScpKSB7XHJcbiAgICAgIHMuZHJvcGRvd25NZW51LmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICgkKHRoaXMpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnKSA9PT0gJ3RydWUnKSB7XHJcbiAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcclxuICAgICAgICAgICQodGhpcykucHJldigpLmF0dHIoJ2FyaWEtcHJlc3NlZCcsIGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbkRyb3Bkb3duLmluaXQoKVxyXG4iLCIvKmdsb2JhbCAkKi9cclxuXHJcbi8vIFRPRE86IGZpbmlzaCBpbXBsZW1lbnRhdGlvblxyXG4vLyBEZXNrdG9wIEJ1ZyAocHJldmVudCBzd2lwZSlcclxuLy8gT24gaW5pdCAtIGNoZWNrIGRlcGVuZGVuY2llcyAoYW5kIHdhcm4pXHJcblxyXG52YXIgbGVmdE9mZnNldCA9IDU2XHJcbnZhciBOQVZfV0lEVEggPSAkKHdpbmRvdykud2lkdGgoKSAtIGxlZnRPZmZzZXRcclxudmFyIHNwZWVkID0gMjAwXHJcbnZhciBuYXZcclxuXHJcbnZhciBzd2lwZU9wdGlvbnMgPSB7XHJcbiAgdHJpZ2dlck9uVG91Y2hFbmQ6IHRydWUsXHJcbiAgc3dpcGVTdGF0dXM6IHN3aXBlU3RhdHVzLFxyXG4gIGFsbG93UGFnZVNjcm9sbDogJ3ZlcnRpY2FsJyxcclxuICB0aHJlc2hvbGQ6IDEwMFxyXG59XHJcblxyXG4kKGZ1bmN0aW9uICgpIHtcclxuICBuYXYgPSAkKCcud3AtbmF2X19tZW51JylcclxuICBuYXYuc3dpcGUoc3dpcGVPcHRpb25zKVxyXG59KVxyXG5cclxuLyoqXHJcbiogQ2F0Y2ggZWFjaCBwaGFzZSBvZiB0aGUgc3dpcGUuXHJcbiogbW92ZSA6IHdlIGRyYWcgdGhlIGRpdlxyXG4qIGNhbmNlbCA6IHdlIGFuaW1hdGUgYmFjayB0byB3aGVyZSB3ZSB3ZXJlXHJcbiogZW5kIDogd2UgYW5pbWF0ZSB0byB0aGUgbmV4dCBpbWFnZVxyXG4qL1xyXG5mdW5jdGlvbiBzd2lwZVN0YXR1cyAoZXZlbnQsIHBoYXNlLCBkaXJlY3Rpb24sIGRpc3RhbmNlKSB7XHJcbiAgaWYgKHBoYXNlID09PSAnbW92ZScgJiYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JykpIHtcclxuICAgIHZhciBkdXJhdGlvbiA9IDBcclxuICAgIHNjcm9sbE5hdihkaXN0YW5jZSwgZHVyYXRpb24pXHJcbiAgfSBlbHNlIGlmIChwaGFzZSA9PT0gJ2NhbmNlbCcpIHtcclxuICAgIHNjcm9sbE5hdigwLCBzcGVlZClcclxuICB9IGVsc2UgaWYgKHBoYXNlID09PSAnZW5kJykge1xyXG4gICAgaGlkZU5hdigpXHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGhpZGVOYXYgKCkge1xyXG4gIHNjcm9sbE5hdihOQVZfV0lEVEgsIHNwZWVkKVxyXG59XHJcblxyXG4vKipcclxuKiBNYW51YWxseSB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIHRoZSBuYXYgb24gZHJhZ1xyXG4qL1xyXG5mdW5jdGlvbiBzY3JvbGxOYXYgKGRpc3RhbmNlLCBkdXJhdGlvbikge1xyXG4gIG5hdi5jc3MoJ3RyYW5zaXRpb24tZHVyYXRpb24nLCAoZHVyYXRpb24gLyAxMDAwKS50b0ZpeGVkKDEpICsgJ3MnKVxyXG4gIC8vIGludmVyc2UgdGhlIG51bWJlciB3ZSBzZXQgaW4gdGhlIGNzc1xyXG4gIHZhciB2YWx1ZSA9IE1hdGguYWJzKGRpc3RhbmNlKS50b1N0cmluZygpXHJcbiAgbmF2LmNzcygndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoJyArIHZhbHVlICsgJ3B4KScpXHJcblxyXG4gIGlmICh2YWx1ZSA8IDEpIG5hdi5yZW1vdmVBdHRyKCdzdHlsZScpXHJcbiAgY29uc29sZS5sb2coIHZhbHVlLCBOQVZfV0lEVEggLSA1IClcclxuICBpZiAodmFsdWUgPiBOQVZfV0lEVEggLSA1KSB7XHJcbiAgICBuYXYuY2xvc2VzdCgnLndwLW5hdl9faXRlbScpLnJlbW92ZUNsYXNzKCd3cC1uYXZfX2l0ZW0tLW9wZW4nKVxyXG4gICAgbmF2LnJlbW92ZUF0dHIoJ3N0eWxlJylcclxuICB9XHJcbn1cclxuXHJcbiIsIi8qZ2xvYmFsICQsIE1vZGVybml6ciAqL1xuXG52YXIgTmF2aWdhdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBsYXJnZVNjcmVlblN0YXJ0c0Zyb20gPSA2MDAgLy8gcHhcbiAgdmFyIGlzRGVza3RvcE1vZGUgPSAoTW9kZXJuaXpyLm1xKCdvbmx5IGFsbCBhbmQgKG1pbi13aWR0aDogJyArIGxhcmdlU2NyZWVuU3RhcnRzRnJvbSArICdweCknKSlcbiAgdmFyIG1lbnVUb2dnbGUgPSAkKCcud3AtbmF2X19pdGVtJykgLy8gYWxsIGRyb3Bkb3duIHRvZ2dsZSBlbGVtZW50c1xuXG4gIGZ1bmN0aW9uIGJpbmRVSUFjdGlvbnMgKCkge1xuICAgICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgb25DbGlja091dHNpZGVDbG9zZShldmVudClcbiAgICB9KVxuXG4gICAgYmluZFN1Ym1lbnVUb2dnbGUoKVxuICB9XG5cbiAgZnVuY3Rpb24gb25DbGlja091dHNpZGVDbG9zZSAoZXZlbnQpIHtcbiAgICBpZiAoISQoJ2JvZHknKS5oYXNDbGFzcygnc2lkZWJhci1taW5pbWl6ZWQnKSkgcmV0dXJuXG4gICAgLy8gbWFrZSBzdXJlIC53cC1uYXZfX2xpbmsgb3IgLndwLW5hdl9fbWVudSBpcyBub3QgYW4gYW5jZXN0b3Igb3JcbiAgICAvLyB0aGUgdGFyZ2V0IG9mIHRoZSBjbGlja2VkIGVsZW1lbnQgKC5jbG9zZXN0KCksIC5pcygpKS5cbiAgICB2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgaWYgKCF0YXJnZXQuY2xvc2VzdCgnLndwLW5hdl9fbGluaywgLndwLW5hdl9fbWVudScpLmxlbmd0aCAmJlxuICAgICAgIXRhcmdldC5pcygnLndwLW5hdl9fbGluaywgLndwLW5hdl9fbWVudScpKSB7XG4gICAgICBtZW51VG9nZ2xlLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJCh0aGlzKS5hdHRyKCdhcmlhLWV4cGFuZGVkJykgPT09ICd0cnVlJykge1xuICAgICAgICAgICQodGhpcykuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKS5yZW1vdmVDbGFzcygnd3AtbmF2X19pdGVtLS1vcGVuJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiB0b2dnbGUgTWVudSBpdGVtIHRhYiBpbmRleGVzOiAtMSAoaW5hY2Nlc3NpYmxlKSwgMCAoYWNjZXNzaWJsZSBpbiBkZWZhdWx0IHNlcS4pXG4gICogVG8gbWFrZSBuYXZpZ2F0aW9uIGFjY2Vzc2libGUgd2l0aCB0YWIgJiBlbnRlclxuICAqIEBwYXJlbnQgLndwLW5hdl9faXRlbVxuICAqIEBzaG93IHRydWUtPnRvIHNldCAwLCBmYWxzZS0+dG8gc2V0IC0xXG4gICovXG4gIGZ1bmN0aW9uIHRvZ2dsZU1lbnVUYWJpbmRleCAocGFyZW50LCBzaG93KSB7XG4gICAgJCgnLndwLW5hdl9fc3VibGluaycsIHBhcmVudCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGFiaW5kZXggPSAtMVxuICAgICAgaWYgKHNob3cgPT09IHRydWUpIHRhYmluZGV4ID0gMFxuICAgICAgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcsIHRhYmluZGV4KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogT3BlbiBTdWItbWVudXNcbiAgICogVG9nZ2xlIGNsYXNzZXMgLyBBcmlhIGF0dHJpYnV0ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGJpbmRTdWJtZW51VG9nZ2xlICgpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnQWdlbnROYXZpZ2F0aW9uOiBiaW5kaW5nU3VibWVudScsICQoJy53cC1uYXZfX2xpbms6bm90KFthcmlhLWhhc3BvcHVwPVwiZmFsc2VcIl0pJykpXG4gICAgJCgnLndwLW5hdl9fbGluazpub3QoW2FyaWEtaGFzcG9wdXA9XCJmYWxzZVwiXSknKS5iaW5kKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGNoZWNraW5nIGlmIHRoaXMgaXMgYWxyZWFkeSBvcGVuXG4gICAgICBpZiAoJCh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcygnd3AtbmF2X19pdGVtLS1vcGVuJykpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJCh0aGlzKSwgJCh0aGlzKS5wYXJlbnQoKSwgJCh0aGlzKS5wYXJlbnQpXG4gICAgICAgICQodGhpcykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ3dwLW5hdl9faXRlbS0tb3BlbicpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuICAgICAgICB0b2dnbGVNZW51VGFiaW5kZXgoJCh0aGlzKS5wYXJlbnQoKSwgZmFsc2UpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBvdGhlcndpc2VcbiAgICAgIC8vIGlmIG1lbnUgb3BlbiAtIGNsb3NlIGl0XG4gICAgICAkKCcud3AtbmF2X19saW5rJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdXBlcmlvciA9ICQodGhpcykucGFyZW50KClcblxuICAgICAgICBpZiAoJChzdXBlcmlvcikuaGFzQ2xhc3MoJ3dwLW5hdl9faXRlbS0tb3BlbicpKSB7XG4gICAgICAgICAgJChzdXBlcmlvcikucmVtb3ZlQ2xhc3MoJ3dwLW5hdl9faXRlbS0tb3BlbicpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxuICAgICAgICAgIHRvZ2dsZU1lbnVUYWJpbmRleCgkKHN1cGVyaW9yKSwgZmFsc2UpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAvLyBvcGVuIHRoaXMgb25lLlxuICAgICAgJCh0aGlzKS5wYXJlbnQoKS50b2dnbGVDbGFzcygnd3AtbmF2X19pdGVtLS1vcGVuJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJylcbiAgICAgIHRvZ2dsZU1lbnVUYWJpbmRleCgkKHRoaXMpLnBhcmVudCgpLCB0cnVlKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTU9ESUZJRUQgRlJPTSBDb3JlLkFnZW50LmpzXG4gICAqIE1ha2UgdGhlIG5hdmlnYXRpb24gaXRlbXMgc29ydGFibGVcbiAgICovXG4gIGZ1bmN0aW9uIGJpbmROYXZpZ2F0aW9uU29ydGluZyAoVGFyZ2V0TlMpIHtcbiAgICAvLyBtYWtlIHRoZSBuYXZpZ2F0aW9uIGl0ZW1zIHNvcnRhYmxlIChpZiBlbmFibGVkKVxuICAgIC8vIGlmIChDb3JlLkNvbmZpZy5HZXQoJ01lbnVEcmFnRHJvcEVuYWJsZWQnKSA9PT0gMSkge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmluZm8oJ0VuYWJsaW5nOiBNZW51RHJhZ0Ryb3AnKVxuICAgIC8vICAgICBDb3JlLlVJLkRuRC5Tb3J0YWJsZSgkKCcud3AtbmF2X19saXN0Jykse1xuICAgIC8vICAgICAgICAgSXRlbXM6ICcud3AtbmF2X19pdGVtJyxcbiAgICAvLyAgICAgICAgIFRvbGVyYW5jZTogJ3BvaW50ZXInLFxuICAgIC8vICAgICAgICAgRGlzdGFuY2U6IDE1LFxuICAgIC8vICAgICAgICAgT3BhY2l0eTogMC42LFxuICAgIC8vICAgICAgICAgSGVscGVyOiAnY2xvbmUnLFxuICAgIC8vICAgICAgICAgQXhpczogJ3knLFxuICAgIC8vICAgICAgICAgQ29udGFpbm1lbnQ6ICQoJy53cC1uYXZfX2xpc3QnKSxcbiAgICAvLyAgICAgICAgIFBsYWNlaG9sZGVyOiAnd3AtbmF2X19wbGFjZWhvbGRlcicsXG4gICAgLy8gICAgICAgICBVcGRhdGU6IGZ1bmN0aW9uIChlLHVpKSB7XG4gICAgLy8gICAgICAgICAgICAgLy8gY29sbGVjdCBuYXZpZ2F0aW9uIGJhciBpdGVtc1xuICAgIC8vICAgICAgICAgICAgIHZhciBJdGVtcyA9IHt9XG4gICAgLy8gICAgICAgICAgICAgJC5lYWNoKCQoJy53cC1uYXZfX2xpc3QnKS5jaGlsZHJlbignLndwLW5hdl9faXRlbScpLCBmdW5jdGlvbihpbmRleCwgZWxlbSkge1xuICAgIC8vICAgICAgICAgICAgICAgICAvLyBTYXZpbmcgdGhlIG9yZGVyIChmb3Igc2F2aW5nIGluIERCKVxuICAgIC8vICAgICAgICAgICAgICAgICB2YXIgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJykuc3Vic3RyaW5nKDQpXG4gICAgLy8gICAgICAgICAgICAgICAgIEl0ZW1zW2lkXSA9IGluZGV4KzFcbiAgICAvLyAgICAgICAgICAgICB9KVxuXG4gICAgLy8gICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhJdGVtcylcbiAgICAvLyAgICAgICAgICAgICAvLyBzYXZlIHRoZSBuZXcgb3JkZXIgdG8gdGhlIHVzZXJzIHByZWZlcmVuY2VzXG4gICAgLy8gICAgICAgICAgICAgVGFyZ2V0TlMuUHJlZmVyZW5jZXNVcGRhdGUoJ1VzZXJOYXZCYXJJdGVtc09yZGVyJywgQ29yZS5KU09OLlN0cmluZ2lmeShJdGVtcykpXG5cbiAgICAvLyAgICAgICAgIH1cblxuICAgIC8vICAgICB9KVxuXG4gICAgLy8gfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXdpbmRvdy5qUXVlcnkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdFcnJvcjogalF1ZXJ5IGlzIG5vdCBsb2FkZWQnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghdHlwZW9mIE1vZGVybml6ciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdFcnJvcjogTW9kZXJuaXpyIGlzIG5vdCBsb2FkZWQnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgJCgnLndwLW5hdicpWzBdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IE5hdmlnYXRpb24gZG9lc25cXCd0IGV4aXN0JylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBiaW5kVUlBY3Rpb25zKClcbiAgICB9XG4gIH1cbn0pKClcblxuTmF2aWdhdGlvbi5pbml0KClcblxuIiwiLypnbG9iYWwgJCwgTW9kZXJuaXpyICovXHJcblxyXG52YXIgVG9wYmFyID0gKGZ1bmN0aW9uICgpIHtcclxuICB2YXIgbGFyZ2VTY3JlZW5TdGFydHNGcm9tID0gNjAwIC8vIHB4XHJcbiAgdmFyIHNpZGViYXJUb2dnbGUgPSAkKCcud3AtdG9wYmFyX190b2dnbGUtbWVudScpIC8vIHRvZ2dsZSBzaWRlYmFyXHJcbiAgdmFyIHRvcGJhciA9ICQoJy53cC10b3BiYXInKVxyXG4gIHZhciB0b3BiYXJMZWZ0ID0gJCgnLndwLXRvcGJhcl9fbGVmdCcpXHJcbiAgdmFyIHRvcGJhck1vcmUgPSAkKCcud3AtdG9wYmFyX19tb3JlJylcclxuICB2YXIgZHJvcGRvd25Nb3JlID0gJCgnLmRyb3Bkb3duLS1tb3JlJylcclxuICB2YXIgaGlkZVBhZGRpbmcgPSAyIC8vIHdoZW4gdGhpcyBmcmVlIHNwYWNlIHJlbWFpbnMgLT4gaGlkZVxyXG4gIHZhciBzaG93UGFkZGluZyA9IDIwIC8vIHdoZW4gaXRlbS53aWR0aCArIHRoaXMgc3BhY2UgaXMgYXZhaWxhYmxlIC0+IHNob3dcclxuICB2YXIgZWxlbWVudHMgPSBbXVxyXG4gIHZhciBsYXN0QWN0aXZlSW5kZXggPSAwIC8vIGxhc3QgYWN0aXZlIGVsZW1lbnQgaW4gdG9wIGJhclxyXG5cclxuICBmdW5jdGlvbiBiaW5kVUlBY3Rpb25zICgpIHtcclxuICAgIC8vIEJpbmQgVG9nZ2xlXHJcblx0bW9iaWxlVG9nZ2xlU2lkZWJhcigpXHJcbiAgICBtb2JpbGVUb2dnbGVOYXZpZ2F0aW9uKClcclxuXHJcbiAgICBzaWRlYmFyVG9nZ2xlLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ3NpZGViYXItbWluaW1pemVkJylcclxuICAgICAgLy8gcHNldWRvOiBvbiB0b3BiYXIgcmVzaXplXHJcbiAgICAgIHZhciB0b2dnbGVTaWRlYmFySW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0b2dnbGVNb3JlQnV0dG9uLCAxMClcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNsZWFySW50ZXJ2YWwodG9nZ2xlU2lkZWJhckludGVydmFsKSB9LCAxMDAwKVxyXG4gICAgfSlcclxuXHJcblx0aWYgKHR5cGVvZiAkKCcuZHJvcGRvd24tLW1vcmUnKVswXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHQgIGNvbnNvbGUud2FybignV2FybmluZzogVG9wYmFyIE1vcmUgYnV0dG9uIGRvZXNuXFwndCBleGlzdCcpXHJcblx0ICByZXR1cm5cclxuXHR9XHJcblx0Ly8gTW9yZSBidXR0b24gZnVuY3Rpb25hbGl0eVxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgaXNEZXNrdG9wTW9kZSA9IChNb2Rlcm5penIubXEoJ29ubHkgYWxsIGFuZCAobWluLXdpZHRoOiAnICsgbGFyZ2VTY3JlZW5TdGFydHNGcm9tICsgJ3B4KScpKVxyXG4gICAgICAvLyBhKSBkdXBsaWNhdGUgY29udGVudCB0byBkcm9wZG93blxyXG4gICAgICAvLyBiKSBzYXZlIHJlZmVyZW5jZXMgdG8gdGhlIGVsZW1lbnRzXHJcbiAgICAgIC8vIGMpIHNldCByZXNpemUgZnVuY3Rpb25cclxuXHQgIHZhciB0b3BiYXJFbGVtID0gdG9wYmFyTGVmdC5jaGlsZHJlbigpXHJcbiAgICAgIHRvcGJhckxlZnQuY2hpbGRyZW4oKS5jbG9uZSgpLmFwcGVuZFRvKGRyb3Bkb3duTW9yZSlcclxuICAgICAgc2F2ZUVsZW1lbnRzKClcclxuICAgICAgLy8gY2hlY2sgaWYgaXQgZml0c1xyXG4gICAgICBpZiAoaXNEZXNrdG9wTW9kZSkgdG9nZ2xlTW9yZUJ1dHRvbigpXHJcbiAgICAgICQod2luZG93KS5iaW5kKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gTW9yZSBidXR0b24gc2hvdWxkIHdvcmsgKipvbmx5Kiogb24gdGFibGV0K1xyXG4gICAgICAgIGlmIChNb2Rlcm5penIubXEoJ29ubHkgYWxsIGFuZCAobWluLXdpZHRoOiAnICsgbGFyZ2VTY3JlZW5TdGFydHNGcm9tICsgJ3B4KScpKSB7XHJcbiAgICAgICAgICBpc0Rlc2t0b3BNb2RlID0gdHJ1ZVxyXG4gICAgICAgICAgdG9nZ2xlTW9yZUJ1dHRvbigpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHN3aXRjaGluZyBmcm9tIGRlc2t0b3AgdG8gbW9iaWxlIHZpZXdcclxuICAgICAgICAgIGlmIChpc0Rlc2t0b3BNb2RlKSB7XHJcbiAgICAgICAgICAgIHJlc2V0KClcclxuICAgICAgICAgICAgaXNEZXNrdG9wTW9kZSA9IGZhbHNlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vXHJcbiAgLy8gVG9nZ2xlIEVsZW1lbnRzXHJcbiAgLy9cclxuICBmdW5jdGlvbiBtb2JpbGVUb2dnbGVTaWRlYmFyICgpIHtcclxuICAgIGlmICh0eXBlb2YgJCgnLndwLXRvcGJhcnhzX19zaWRlYmFyJylbMF0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybignV2FybmluZzogLndwLXRvcGJhcnhzX19zaWRlYmFyIGRvZXNuXFwndCBleGlzdCcpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgJCgnLndwLXRvcGJhcnhzX19zaWRlYmFyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgYm9keSA9ICQoJ2JvZHknKVxyXG4gICAgICB2YXIgaGFtYnVyZ2VyID0gJCgnLndwLWhhbWJ1cmdlcicpXHJcbiAgICAgIGlmIChib2R5Lmhhc0NsYXNzKCdtb2JuYXYtb3BlbicpKSB7XHJcbiAgICAgICAgaWYgKGJvZHkuaGFzQ2xhc3MoJ21vYnNpZGViYXItb3BlbicpKSB7XHJcbiAgICAgICAgICBoYW1idXJnZXIuY2xpY2soKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGhhbWJ1cmdlci5jbGljaygpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbW9ic2lkZWJhci1vcGVuJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb2JpbGVUb2dnbGVOYXZpZ2F0aW9uICgpIHtcclxuICAgIGlmICh0eXBlb2YgJCgnLndwLWhhbWJ1cmdlcicpWzBdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IC53cC1oYW1idXJnZXIgZG9lc25cXCd0IGV4aXN0JylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICAkKCcud3AtaGFtYnVyZ2VyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21vYm5hdi1vcGVuJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIE1PUkUgQlVUVE9OXHJcbiAgLy9cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgbW9yZSBidXR0b24gJiBzaG93L2hpZGUgc3RhdGVzXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmVzZXQgKCkge1xyXG4gICAgdG9wYmFyTGVmdCA9ICQoJy53cC10b3BiYXJfX2xlZnQnKVxyXG4gICAgdG9wYmFyTW9yZSA9ICQoJy53cC10b3BiYXJfX21vcmUnKVxyXG4gICAgZHJvcGRvd25Nb3JlID0gJCgnLmRyb3Bkb3duLS1tb3JlJylcclxuICAgIHZhciBsZWZ0YmFyID0gdG9wYmFyTGVmdC5jaGlsZHJlbigpXHJcbiAgICB2YXIgZHJvcGRvd24gPSBkcm9wZG93bk1vcmUuY2hpbGRyZW4oKVxyXG4gICAgbGFzdEFjdGl2ZUluZGV4ID0gMFxyXG5cclxuICAgIHRvcGJhck1vcmUucmVtb3ZlQ2xhc3MoJ3dwLXRvcGJhcl9fbW9yZS0tYWN0aXZlJykgLy8gaGlkZVxyXG4gICAgZGVhY3RpdmF0ZU1vcmVCdXR0b24oKSAvLyBkZWFjdGl2YXRlIGRyb3Bkb3duXHJcblxyXG4gICAgbGVmdGJhci5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgJCh0aGlzKS5zaG93KClcclxuICAgICAgJCgnLndwLXRvcGJhcl9faXRlbScsIHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQodGhpcykuc2hvdygpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgZHJvcGRvd24uZWFjaChmdW5jdGlvbiAoaW5kZXgxKSB7XHJcbiAgICAgICQodGhpcykuaGlkZSgpXHJcbiAgICAgICQoJy53cC10b3BiYXJfX2l0ZW0nLCB0aGlzKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkKHRoaXMpLmhpZGUoKSAvLyBpbml0aWFsIHN0YXRlXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT24gcGFnZSBsb2FkIHNhdmUgZWxlbWVudCByZWZlcmVuY2VzIHRvIGFycmF5LlxyXG4gICAqIEJvdGggLSByZWZlcmVuY2UgdG8gdG9wYmFyICYgZHJvcGRvd24gZWxlbWVudHMgYXJlIHNhdmVkXHJcbiAgICogZWxlbWVudHNbMF0gLSBzZWN0aW9uIGluZGV4XHJcbiAgICogZWxlbWVudHNbMV0gLSBsZWZ0YmFyIGl0ZW0gcmVmZXJlbmNlXHJcbiAgICogZWxlbWVudHNbMl0gLSBkcm9wZG93biBpdGVtIHJlZmVyZW5jZVxyXG4gICAqIGVsZW1lbnRzWzNdIC0gbGVmdGJhciBzZWN0aW9uIHJlZmVyZW5jZVxyXG4gICAqIGVsZW1lbnRzWzRdIC0gZHJvcGRvd24gc2VjdGlvbiByZWZlcmVuY2VcclxuICAgKi9cclxuICBmdW5jdGlvbiBzYXZlRWxlbWVudHMgKCkge1xyXG4gICAgdmFyIGxlZnRiYXIgPSB0b3BiYXJMZWZ0LmNoaWxkcmVuKClcclxuICAgIHZhciBkcm9wZG93biA9IGRyb3Bkb3duTW9yZS5jaGlsZHJlbigpXHJcbiAgICB2YXIgbGVmdGJhckVsZW0gPSBbXVxyXG4gICAgdmFyIGRyb3Bkb3duRWxlbSA9IFtdXHJcblxyXG4gICAgbGVmdGJhci5lYWNoKGZ1bmN0aW9uIChpbmRleDEpIHtcclxuICAgICAgdmFyIHNlY3Rpb24gPSAkKHRoaXMpXHJcbiAgICAgICQoJy53cC10b3BiYXJfX2l0ZW0nLCB0aGlzKS5lYWNoKGZ1bmN0aW9uIChpbmRleDIpIHtcclxuICAgICAgICB2YXIgaXRlbSA9IFtpbmRleDEsIGluZGV4MiwgJCh0aGlzKSwgc2VjdGlvbl1cclxuICAgICAgICBsZWZ0YmFyRWxlbS5wdXNoKGl0ZW0pXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgZHJvcGRvd24uZWFjaChmdW5jdGlvbiAoaW5kZXgxKSB7XHJcbiAgICAgIHZhciBzZWN0aW9uID0gJCh0aGlzKVxyXG4gICAgICAkKCcud3AtdG9wYmFyX19pdGVtJywgdGhpcykuZWFjaChmdW5jdGlvbiAoaW5kZXgyKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBbaW5kZXgxLCBpbmRleDIsICQodGhpcyksIHNlY3Rpb25dXHJcbiAgICAgICAgZHJvcGRvd25FbGVtLnB1c2goaXRlbSlcclxuICAgICAgICAkKHRoaXMpLmhpZGUoKSAvLyBpbml0aWFsIHN0YXRlXHJcbiAgICAgIH0pXHJcbiAgICAgIHNlY3Rpb24uaGlkZSgpIC8vIGluaXRpYWwgc3RhdGVcclxuICAgIH0pXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IGxlZnRiYXJFbGVtLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHZhciBlbGVtZW50ID0gW2xlZnRiYXJFbGVtW2ldWzBdLCBsZWZ0YmFyRWxlbVtpXVsyXSwgZHJvcGRvd25FbGVtW2ldWzJdLCBsZWZ0YmFyRWxlbVtpXVszXSwgZHJvcGRvd25FbGVtW2ldWzNdXVxyXG4gICAgICBlbGVtZW50cy5wdXNoKGVsZW1lbnQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0b2dnbGVNb3JlQnV0dG9uICgpIHtcclxuICAgIHZhciBpc01vcmVBY3RpdmUgPSB0b3BiYXJNb3JlLmhhc0NsYXNzKCd3cC10b3BiYXJfX21vcmUtLWFjdGl2ZScpXHJcbiAgICBpZiAoaXNNb3JlQWN0aXZlKSB7XHJcbiAgICAgIGlmIChtb3JlQnV0dG9uRml0cygpKSB7XHJcbiAgICAgICAgd2hpbGVTcGFjZSgpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2hpbGVOb1NwYWNlKClcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRvcGJhci5vdXRlcldpZHRoKCkgPCB0b3BiYXJMZWZ0Lm91dGVyV2lkdGgoKSArIGhpZGVQYWRkaW5nKSB7XHJcbiAgICAgICAgdG9wYmFyTW9yZS50b2dnbGVDbGFzcygnd3AtdG9wYmFyX19tb3JlLS1hY3RpdmUnKSAvLyBzZXQgYWN0aXZlXHJcbiAgICAgICAgd2hpbGVOb1NwYWNlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hpbGUgbW9yZSBidXR0b24gZG9lc24ndCBmaXRcclxuICAgKiBoaWRlIHRvcGJhciAmIHNob3cgZHJvcGRvd24gZWxlbWVudHNcclxuICAgKi9cclxuICBmdW5jdGlvbiB3aGlsZU5vU3BhY2UgKCkgeyAvLyBubyBzcGFjZSAtIHJlbW92ZSBpdGVtc1xyXG4gICAgd2hpbGUgKCFtb3JlQnV0dG9uRml0cygpKSB7XHJcbiAgICAgIHZhciBuZXh0U2VjdGlvbiA9ICh0eXBlb2YgZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4ICsgMV0gPT09ICd1bmRlZmluZWQnKSA/IC0xIDogZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4ICsgMV1bMF1cclxuICAgICAgdmFyIHByZXZTZWN0aW9uID0gKHR5cGVvZiBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXggLSAxXSA9PT0gJ3VuZGVmaW5lZCcpID8gLTEgOiBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXggLSAxXVswXVxyXG4gICAgICBpZiAoZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4XVswXSAhPT0gcHJldlNlY3Rpb24pIHtcclxuICAgICAgICAvLyBiZWZvcmUgcHV0dGluZyBuZXcgZWxlbWVudCBzaG93IHNlY3Rpb24gaW4gZHJvcGRvd25cclxuICAgICAgICBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzRdLnNob3coKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChuZXh0U2VjdGlvbiAmJiBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzBdICE9PSBuZXh0U2VjdGlvbikge1xyXG4gICAgICAgIC8vIGlmIG5leHQgaXRlbSBoYXMgZGlmZmVyZW50IHNlY3Rpb24gaGlkZSB0aGlzIHNlY3Rpb24gaW4gdG9wYmFyXHJcbiAgICAgICAgZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4XVszXS5oaWRlKClcclxuICAgICAgfVxyXG4gICAgICBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzFdLmhpZGUoKVxyXG4gICAgICBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzJdLnNob3coKVxyXG4gICAgICBsYXN0QWN0aXZlSW5kZXgrK1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gd2hpbGVTcGFjZSAoKSB7XHJcbiAgICBpZiAobGFzdEFjdGl2ZUluZGV4ID09PSAwKSByZXR1cm5cclxuICAgIHZhciBoaWRkZW5JbmRleCA9IGxhc3RBY3RpdmVJbmRleCAtIDFcclxuICAgIHZhciBoaWRkZW5JdGVtID0gZWxlbWVudHNbaGlkZGVuSW5kZXhdWzFdXHJcblxyXG4gICAgaWYgKGl0ZW1GaXRzKGhpZGRlbkl0ZW0pKSB7XHJcbiAgICAgIC8vIGlmIGl0J3MgdGhlIGZpcnN0IGVsZW1lbnQgKGZyb20gbGVmdClcclxuICAgICAgaWYgKGxhc3RBY3RpdmVJbmRleCA9PT0gZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgICAgbGFzdEFjdGl2ZUluZGV4LS1cclxuICAgICAgICBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzNdLnNob3coKVxyXG4gICAgICAgIGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleF1bMV0uc2hvdygpXHJcbiAgICAgICAgZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4XVsyXS5oaWRlKClcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICB2YXIgcHJldlNlY3Rpb24gPSAodHlwZW9mIGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleCAtIDFdID09PSAndW5kZWZpbmVkJykgPyBmYWxzZSA6IGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleCAtIDFdWzBdXHJcbiAgICAgIHZhciBuZXh0U2VjdGlvbiA9ICh0eXBlb2YgZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4ICsgMV0gPT09ICd1bmRlZmluZWQnKSA/IGZhbHNlIDogZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4ICsgMV1bMF1cclxuICAgICAgaWYgKHByZXZTZWN0aW9uICYmIGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleF1bMF0gIT09IHByZXZTZWN0aW9uKSB7XHJcbiAgICAgICAgLy8gaWYgbmV4dChwcmV2U2VjdGlvbikgaXMgZGlmZmVyZW50LCBoaWRlIHNlY3Rpb24gZnJvbSBkcm9wZG93blxyXG4gICAgICAgIGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleF1bNF0uaGlkZSgpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKG5leHRTZWN0aW9uICYmIGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleF1bMF0gIT09IG5leHRTZWN0aW9uKSB7XHJcbiAgICAgICAgLy8gaWYgcHJldihuZXh0U2VjdGlvbikgaXMgZGlmZmVyZW50LCBzaG93IHNlY3Rpb24gb24gdG9wYmFyXHJcbiAgICAgICAgZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4XVszXS5zaG93KClcclxuICAgICAgfVxyXG4gICAgICBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzFdLnNob3coKVxyXG4gICAgICBlbGVtZW50c1tsYXN0QWN0aXZlSW5kZXhdWzJdLmhpZGUoKVxyXG5cclxuICAgICAgbGFzdEFjdGl2ZUluZGV4LS1cclxuICAgICAgaWYgKGxhc3RBY3RpdmVJbmRleCA9PT0gMCkge1xyXG4gICAgICAgIGVsZW1lbnRzW2xhc3RBY3RpdmVJbmRleF1bMV0uc2hvdygpXHJcbiAgICAgICAgZWxlbWVudHNbbGFzdEFjdGl2ZUluZGV4XVsyXS5oaWRlKClcclxuICAgICAgICB0b3BiYXJNb3JlLnRvZ2dsZUNsYXNzKCd3cC10b3BiYXJfX21vcmUtLWFjdGl2ZScpIC8vIGhpZGVcclxuICAgICAgICBkZWFjdGl2YXRlTW9yZUJ1dHRvbigpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG1vcmVCdXR0b25GaXRzICgpIHtcclxuICAgIHJldHVybiAodG9wYmFyTGVmdC5vdXRlcldpZHRoKCkgKyB0b3BiYXJNb3JlLm91dGVyV2lkdGgoKSArIGhpZGVQYWRkaW5nKSA8PSB0b3BiYXIub3V0ZXJXaWR0aCgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpdGVtRml0cyAoaXRlbSkge1xyXG4gICAgLy8gVE9ETzogY2Fubm90IGRldGVjdCBpdGVtLm91dGVyV2lkdGgoKS4gRWxlbWVudCBpcyBkaXNwbGF5Om5vbmVcclxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ3MjMwMy9qcXVlcnktZ2V0LXdpZHRoLW9mLWVsZW1lbnQtd2hlbi1ub3QtdmlzaWJsZS1kaXNwbGF5LW5vbmVcclxuICAgIHZhciBpdGVtV2lkdGggPSAzNiAvLyBpdGVtLm91dGVyV2lkdGgoKVxyXG4gICAgcmV0dXJuICh0b3BiYXJMZWZ0Lm91dGVyV2lkdGgoKSArIHRvcGJhck1vcmUub3V0ZXJXaWR0aCgpICsgc2hvd1BhZGRpbmcgKyBpdGVtV2lkdGgpIDw9IHRvcGJhci5vdXRlcldpZHRoKClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRlYWN0aXZhdGVNb3JlQnV0dG9uICgpIHtcclxuICAgIGlmICh0b3BiYXJNb3JlLmF0dHIoJ2FyaWEtcHJlc3NlZCcpID09PSAndHJ1ZScpIHtcclxuICAgICAgdG9wYmFyTW9yZS5hdHRyKCdhcmlhLXByZXNzZWQnLCBmYWxzZSlcclxuICAgICAgdG9wYmFyTW9yZS5uZXh0KCkuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCF3aW5kb3cualF1ZXJ5KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdFcnJvcjogalF1ZXJ5IGlzIG5vdCBsb2FkZWQnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGlmICghdHlwZW9mIE1vZGVybml6ciA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yOiBNb2Rlcm5penIgaXMgbm90IGxvYWRlZCcpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiAkKCcud3AtdG9wYmFyJylbMF0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdXYXJuaW5nOiBUb3BiYXIgZG9lc25cXCd0IGV4aXN0JylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBiaW5kVUlBY3Rpb25zKClcclxuICAgIH1cclxuICB9XHJcbn0pKClcclxuXHJcblRvcGJhci5pbml0KClcclxuIiwiLy8gLypnbG9iYWwgJCovXG4vLyB2YXIgVG9wYmFyeHMgPSAoZnVuY3Rpb24gKCkge1xuLy8gICBmdW5jdGlvbiBiaW5kVUlBY3Rpb25zICgpIHtcbi8vICAgICAkKCcud3AtdG9wYmFyeHNfX3NpZGViYXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAkKCdib2R5JykudG9nZ2xlQ2xhc3MoJ21vYnNpZGViYXItb3BlbicpXG4vLyAgICAgfSlcbi8vICAgfVxuXG4vLyAgIHJldHVybiB7XG4vLyAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuLy8gICAgICAgaWYgKCF3aW5kb3cualF1ZXJ5KSB7XG4vLyAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3I6IGpRdWVyeSBpcyBub3QgbG9hZGVkJylcbi8vICAgICAgICAgcmV0dXJuXG4vLyAgICAgICB9XG4vLyAgICAgICBpZiAodHlwZW9mICQoJy53cC10b3BiYXJ4cycpWzBdID09PSAndW5kZWZpbmVkJykge1xuLy8gICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IHRvcGJhcnhzIGRvZXNuXFwndCBleGlzdCcpXG4vLyAgICAgICAgIHJldHVyblxuLy8gICAgICAgfVxuLy8gICAgICAgYmluZFVJQWN0aW9ucygpXG4vLyAgICAgfVxuLy8gICB9XG4vLyB9KSgpXG5cbi8vIFRvcGJhcnhzLmluaXQoKVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
