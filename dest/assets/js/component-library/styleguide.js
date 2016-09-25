/*globals $ */
var Tabs = (function () {
  var tabs = $('.cl-tabs')

  function bindUIActions () {
    tabs.each(function () {
      bindToggle.call(this)
    })
  }

  function bindToggle () {
    var container = $(this)
    var tabs = $('.cl-tabs__item', container)
    var panels = $('.cl-tabs__panel', container)
    tabs.bind('click', function () {
      // reset every single tab & panel
      tabs.each(function () {
        $(this).attr('aria-selected', false)
      })
      panels.each(function () {
        $(this).attr('aria-hidden', true)
      })
      // set right one active
      $(this).attr('aria-selected', true)
      var panelId = $(this).attr('aria-controls')
      $('#' + panelId).attr('aria-hidden', false)
    })
  }

  return {
    init: function () {
      if (!window.jQuery) {
        console.warn('Error: jQuery is not loaded')
        return
      }
      if (typeof $('.cl-tabs')[0] === 'undefined') {
        console.warn('Warning: Tabs doesn\'t exist')
        return
      }
      bindUIActions()
    }
  }
})()
Tabs.init()

/*global $,iframify*/

var Iframe = (function () {
  var components = $('.st-folder__component')
  var theRoot = '/'
  // var theRoot = '/plugins/design-mockups/'

  return {
    init: function () {
      if (!window.jQuery) {
        console.warn('Error: jQuery is not loaded')
        return
      }
      components.each(function () {
        return iframify(this, {
          'headExtra': '<link rel="stylesheet" type="text/css" href="' + theRoot + 'assets/css/style.css">',
          'bodyExtra': '<script src="' + theRoot + 'assets/js/vendor/modernizr.js"></script> <script src="' + theRoot + 'assets/js/vendor/jquery-2.2.3.min.js"></script> <script src="' + theRoot + 'assets/js/components.js"></script>'
        })
      })
    }
  }
})()
Iframe.init()

/*global $, searchableItems */

var Search = (function () {
  var searchElem
  var resultElem
  var searchItems

  var inputTerms

  function bindUIActions () {
    searchElem.bind('keyup', function () {
      search()
    })
    searchElem.keyup()
  }

  var search = function () {
    inputTerms = searchElem.val().toLowerCase()
    var results = fuzzyMatch(searchItems, inputTerms)
    if (results.length < 1) {
      // show all
      results = returnAll(searchItems)
    }
    results = formatResults(results)
    resultElem.html(results)
  }

  function fuzzyMatch (searchSet, query) {
    var tokens = query.toLowerCase().split('')
    var matches = []
    $.each(searchSet, function (index, item) {
      var tokenIndex = 0
      var stringIndex = 0
      var matchWithHighlights = ''
      var matchedPositions = []
      var string = item[0].toLowerCase()
      while (stringIndex < string.length) {
        if (string[stringIndex] === tokens[tokenIndex]) {
          matchWithHighlights += highlight(string[stringIndex])
          matchedPositions.push(stringIndex)
          tokenIndex++
          if (tokenIndex >= tokens.length) {
            matches.push({
              match: string,
              highlighted: matchWithHighlights + string.slice(
                stringIndex + 1
              ),
              // Maybe use this to weight matches?
              // More consecutive numbers = higher score?
              positions: matchedPositions,
              src: item[2]
            })
            break
          }
        } else {
          matchWithHighlights += string[stringIndex]
        }
        stringIndex++
      }
    })
    return matches
  }
  function highlight (string) {
    return '<span class="cl-resultlist__highlighted">' + string + '</span>'
  }
  // TODO: make it more simple
  function returnAll (resuts) {
    var output = []
    $.each(resuts, function (index, item) {
      output.push({
        highlighted: item[0],
        src: item[2]
      })
    })
    return output
  }
  function formatResults (results) {
    var output = ''

    $.each(results, function (index, item) {
      output += '<li class="cl-resultlist__item"><a class="cl-resultlist__link" href="' + item.src + '">' +
                '<span class="cl-resultlist__text">' + item.highlighted +
                '</span></a></li>'
    })
    return output
  }

  return {
    init: function (searchId, resultsId, searchableItems) {
      if (!window.jQuery) {
        console.warn('Error: jQuery is not loaded')
        return
      }
      if (typeof $('#' + searchId) === 'undefined' || typeof $('#' + resultsId) === 'undefined') {
        console.warn('Warning: Search or SearchResult element doesn\'t exist')
        return
      }
      searchElem = $('#' + searchId)
      resultElem = $('#' + resultsId)
      searchItems = searchableItems
      bindUIActions()
    }
  }
})()

Search.init('searchBox', 'searchResults', searchableItems)











// var searchIndex = ["404 Error","Address Bar","Ajax","Apache","Autoresponder","BitTorrent","Blog","Bookmark","Bot","Broadband","Captcha","Certificate","Client","Cloud","Cloud Computing","CMS","Cookie","CSS","Cyberspace","Denial of Service","DHCP","Dial-up","DNS Record","Domain Name","Download","E-mail","Facebook","FiOS","Firewall","FTP","Gateway","Google","Google Drive","Gopher","Hashtag","Hit","Home Page","HTML","HTTP","HTTPS","Hyperlink","Hypertext","ICANN","Inbox","Internet","InterNIC","IP","IP Address","IPv4","IPv6","IRC","iSCSI","ISDN","ISP","JavaScript","jQuery","Meta Search Engine","Meta Tag","Minisite","Mirror","Name Server","Packet","Page View","Payload","Phishing","POP3","Protocol","Scraping","Search Engine","Social Networking","Socket","Spam","Spider","Spoofing","SSH","SSL","Static Website","Twitter","XHTML"];

// var input = document.getElementById(searchBox)
// var ul = document.getElementById(searchResults)
// var inputTerms, termsArray, prefix, terms, results, sortedResults


// var search = function() {          
//   inputTerms = input.value.toLowerCase();
//   results = [];
//   termsArray = inputTerms.split(' ');
//   prefix = termsArray.length === 1 ? '' : termsArray.slice(0, -1).join(' ') + ' ';
//   terms = termsArray[termsArray.length -1].toLowerCase();
  
//   for (var i = 0; i < searchIndex.length; i++) {
//     var a = searchIndex[i].toLowerCase(),
//         t = a.indexOf(terms);
  
//     if (t > -1) {
//       results.push(a);
//     }
//   }
  
//   evaluateResults();
// };

// var evaluateResults = function() {
//   if (results.length > 0 && inputTerms.length > 0 && terms.length !== 0) {
//     sortedResults = results.sort(sortResults);
//     appendResults();
//   } 
//   else if (inputTerms.length > 0 && terms.length !== 0) {
//     ul.innerHTML = '<li>Whoah! <strong>' 
//       + inputTerms 
//       + '</strong> is not in the index. <br><small><a href="http://google.com/search?q=' 
//       + encodeURIComponent(inputTerms) + '">Try Google?</a></small></li>';
  
//   }
//   else if (inputTerms.length !== 0 && terms.length === 0) {
//     return;
//   }
//   else {
//     clearResults();
//   }
// };

// var sortResults = function (a,b) {
//   if (a.indexOf(terms) < b.indexOf(terms)) return -1;
//   if (a.indexOf(terms) > b.indexOf(terms)) return 1;
//   return 0;
// }

// var appendResults = function () {
//   clearResults();
  
//   for (var i=0; i < sortedResults.length && i < 5; i++) {
//     var li = document.createElement("li"),
//         result = prefix 
//           + sortedResults[i].toLowerCase().replace(terms, '<strong>' 
//           + terms 
//           +'</strong>')
  
//     li.innerHTML = result
//     ul.appendChild(li)
//   }
  
//   if ( ul.className !== 'term-list') {
//     ul.className = 'term-list'
//   }
// }

// var clearResults = function() {
//   ul.className = 'term-list hidden'
//   ul.innerHTML = ''
// }
  
// input.addEventListener('keyup', search, false)


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYnMvdGFicy5qcyIsImlmcmFtZS9pZnJhbWUuanMiLCIwMC1hdG9tcy9zZWFyY2gvc2VhcmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzdHlsZWd1aWRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypnbG9iYWxzICQgKi9cbnZhciBUYWJzID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRhYnMgPSAkKCcuY2wtdGFicycpXG5cbiAgZnVuY3Rpb24gYmluZFVJQWN0aW9ucyAoKSB7XG4gICAgdGFicy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGJpbmRUb2dnbGUuY2FsbCh0aGlzKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBiaW5kVG9nZ2xlICgpIHtcbiAgICB2YXIgY29udGFpbmVyID0gJCh0aGlzKVxuICAgIHZhciB0YWJzID0gJCgnLmNsLXRhYnNfX2l0ZW0nLCBjb250YWluZXIpXG4gICAgdmFyIHBhbmVscyA9ICQoJy5jbC10YWJzX19wYW5lbCcsIGNvbnRhaW5lcilcbiAgICB0YWJzLmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gcmVzZXQgZXZlcnkgc2luZ2xlIHRhYiAmIHBhbmVsXG4gICAgICB0YWJzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLmF0dHIoJ2FyaWEtc2VsZWN0ZWQnLCBmYWxzZSlcbiAgICAgIH0pXG4gICAgICBwYW5lbHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgfSlcbiAgICAgIC8vIHNldCByaWdodCBvbmUgYWN0aXZlXG4gICAgICAkKHRoaXMpLmF0dHIoJ2FyaWEtc2VsZWN0ZWQnLCB0cnVlKVxuICAgICAgdmFyIHBhbmVsSWQgPSAkKHRoaXMpLmF0dHIoJ2FyaWEtY29udHJvbHMnKVxuICAgICAgJCgnIycgKyBwYW5lbElkKS5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghd2luZG93LmpRdWVyeSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ0Vycm9yOiBqUXVlcnkgaXMgbm90IGxvYWRlZCcpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiAkKCcuY2wtdGFicycpWzBdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IFRhYnMgZG9lc25cXCd0IGV4aXN0JylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBiaW5kVUlBY3Rpb25zKClcbiAgICB9XG4gIH1cbn0pKClcblRhYnMuaW5pdCgpXG4iLCIvKmdsb2JhbCAkLGlmcmFtaWZ5Ki9cclxuXHJcbnZhciBJZnJhbWUgPSAoZnVuY3Rpb24gKCkge1xyXG4gIHZhciBjb21wb25lbnRzID0gJCgnLnN0LWZvbGRlcl9fY29tcG9uZW50JylcclxuICB2YXIgdGhlUm9vdCA9ICcvJ1xyXG4gIC8vIHZhciB0aGVSb290ID0gJy9wbHVnaW5zL2Rlc2lnbi1tb2NrdXBzLydcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCF3aW5kb3cualF1ZXJ5KSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdFcnJvcjogalF1ZXJ5IGlzIG5vdCBsb2FkZWQnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGNvbXBvbmVudHMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGlmcmFtaWZ5KHRoaXMsIHtcclxuICAgICAgICAgICdoZWFkRXh0cmEnOiAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIHR5cGU9XCJ0ZXh0L2Nzc1wiIGhyZWY9XCInICsgdGhlUm9vdCArICdhc3NldHMvY3NzL3N0eWxlLmNzc1wiPicsXHJcbiAgICAgICAgICAnYm9keUV4dHJhJzogJzxzY3JpcHQgc3JjPVwiJyArIHRoZVJvb3QgKyAnYXNzZXRzL2pzL3ZlbmRvci9tb2Rlcm5penIuanNcIj48L3NjcmlwdD4gPHNjcmlwdCBzcmM9XCInICsgdGhlUm9vdCArICdhc3NldHMvanMvdmVuZG9yL2pxdWVyeS0yLjIuMy5taW4uanNcIj48L3NjcmlwdD4gPHNjcmlwdCBzcmM9XCInICsgdGhlUm9vdCArICdhc3NldHMvanMvY29tcG9uZW50cy5qc1wiPjwvc2NyaXB0PidcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufSkoKVxyXG5JZnJhbWUuaW5pdCgpXHJcbiIsIi8qZ2xvYmFsICQsIHNlYXJjaGFibGVJdGVtcyAqL1xuY29uc29sZS5sb2coc2VhcmNoYWJsZUl0ZW1zLCAnYXNkYXNkJylcblxudmFyIFNlYXJjaCA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWFyY2hFbGVtXG4gIHZhciByZXN1bHRFbGVtXG4gIHZhciBzZWFyY2hJdGVtc1xuXG4gIHZhciBpbnB1dFRlcm1zXG5cbiAgZnVuY3Rpb24gYmluZFVJQWN0aW9ucyAoKSB7XG4gICAgc2VhcmNoRWxlbS5iaW5kKCdrZXl1cCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlYXJjaCgpXG4gICAgfSlcbiAgICBzZWFyY2hFbGVtLmtleXVwKClcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgaW5wdXRUZXJtcyA9IHNlYXJjaEVsZW0udmFsKCkudG9Mb3dlckNhc2UoKVxuICAgIHZhciByZXN1bHRzID0gZnV6enlNYXRjaChzZWFyY2hJdGVtcywgaW5wdXRUZXJtcylcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPCAxKSB7XG4gICAgICAvLyBzaG93IGFsbFxuICAgICAgcmVzdWx0cyA9IHJldHVybkFsbChzZWFyY2hJdGVtcylcbiAgICB9XG4gICAgcmVzdWx0cyA9IGZvcm1hdFJlc3VsdHMocmVzdWx0cylcbiAgICByZXN1bHRFbGVtLmh0bWwocmVzdWx0cylcbiAgfVxuXG4gIGZ1bmN0aW9uIGZ1enp5TWF0Y2ggKHNlYXJjaFNldCwgcXVlcnkpIHtcbiAgICB2YXIgdG9rZW5zID0gcXVlcnkudG9Mb3dlckNhc2UoKS5zcGxpdCgnJylcbiAgICB2YXIgbWF0Y2hlcyA9IFtdXG4gICAgJC5lYWNoKHNlYXJjaFNldCwgZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XG4gICAgICB2YXIgdG9rZW5JbmRleCA9IDBcbiAgICAgIHZhciBzdHJpbmdJbmRleCA9IDBcbiAgICAgIHZhciBtYXRjaFdpdGhIaWdobGlnaHRzID0gJydcbiAgICAgIHZhciBtYXRjaGVkUG9zaXRpb25zID0gW11cbiAgICAgIHZhciBzdHJpbmcgPSBpdGVtWzBdLnRvTG93ZXJDYXNlKClcbiAgICAgIHdoaWxlIChzdHJpbmdJbmRleCA8IHN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHN0cmluZ1tzdHJpbmdJbmRleF0gPT09IHRva2Vuc1t0b2tlbkluZGV4XSkge1xuICAgICAgICAgIG1hdGNoV2l0aEhpZ2hsaWdodHMgKz0gaGlnaGxpZ2h0KHN0cmluZ1tzdHJpbmdJbmRleF0pXG4gICAgICAgICAgbWF0Y2hlZFBvc2l0aW9ucy5wdXNoKHN0cmluZ0luZGV4KVxuICAgICAgICAgIHRva2VuSW5kZXgrK1xuICAgICAgICAgIGlmICh0b2tlbkluZGV4ID49IHRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaCh7XG4gICAgICAgICAgICAgIG1hdGNoOiBzdHJpbmcsXG4gICAgICAgICAgICAgIGhpZ2hsaWdodGVkOiBtYXRjaFdpdGhIaWdobGlnaHRzICsgc3RyaW5nLnNsaWNlKFxuICAgICAgICAgICAgICAgIHN0cmluZ0luZGV4ICsgMVxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAvLyBNYXliZSB1c2UgdGhpcyB0byB3ZWlnaHQgbWF0Y2hlcz9cbiAgICAgICAgICAgICAgLy8gTW9yZSBjb25zZWN1dGl2ZSBudW1iZXJzID0gaGlnaGVyIHNjb3JlP1xuICAgICAgICAgICAgICBwb3NpdGlvbnM6IG1hdGNoZWRQb3NpdGlvbnMsXG4gICAgICAgICAgICAgIHNyYzogaXRlbVsyXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdGNoV2l0aEhpZ2hsaWdodHMgKz0gc3RyaW5nW3N0cmluZ0luZGV4XVxuICAgICAgICB9XG4gICAgICAgIHN0cmluZ0luZGV4KytcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBtYXRjaGVzXG4gIH1cbiAgZnVuY3Rpb24gaGlnaGxpZ2h0IChzdHJpbmcpIHtcbiAgICByZXR1cm4gJzxzcGFuIGNsYXNzPVwiY2wtcmVzdWx0bGlzdF9faGlnaGxpZ2h0ZWRcIj4nICsgc3RyaW5nICsgJzwvc3Bhbj4nXG4gIH1cbiAgLy8gVE9ETzogbWFrZSBpdCBtb3JlIHNpbXBsZVxuICBmdW5jdGlvbiByZXR1cm5BbGwgKHJlc3V0cykge1xuICAgIHZhciBvdXRwdXQgPSBbXVxuICAgICQuZWFjaChyZXN1dHMsIGZ1bmN0aW9uIChpbmRleCwgaXRlbSkge1xuICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICBoaWdobGlnaHRlZDogaXRlbVswXSxcbiAgICAgICAgc3JjOiBpdGVtWzJdXG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuIG91dHB1dFxuICB9XG4gIGZ1bmN0aW9uIGZvcm1hdFJlc3VsdHMgKHJlc3VsdHMpIHtcbiAgICB2YXIgb3V0cHV0ID0gJydcblxuICAgICQuZWFjaChyZXN1bHRzLCBmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICAgIG91dHB1dCArPSAnPGxpIGNsYXNzPVwiY2wtcmVzdWx0bGlzdF9faXRlbVwiPjxhIGNsYXNzPVwiY2wtcmVzdWx0bGlzdF9fbGlua1wiIGhyZWY9XCInICsgaXRlbS5zcmMgKyAnXCI+JyArXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiY2wtcmVzdWx0bGlzdF9fdGV4dFwiPicgKyBpdGVtLmhpZ2hsaWdodGVkICtcbiAgICAgICAgICAgICAgICAnPC9zcGFuPjwvYT48L2xpPidcbiAgICB9KVxuICAgIHJldHVybiBvdXRwdXRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdDogZnVuY3Rpb24gKHNlYXJjaElkLCByZXN1bHRzSWQsIHNlYXJjaGFibGVJdGVtcykge1xuICAgICAgaWYgKCF3aW5kb3cualF1ZXJ5KSB7XG4gICAgICAgIGNvbnNvbGUud2FybignRXJyb3I6IGpRdWVyeSBpcyBub3QgbG9hZGVkJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mICQoJyMnICsgc2VhcmNoSWQpID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgJCgnIycgKyByZXN1bHRzSWQpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1dhcm5pbmc6IFNlYXJjaCBvciBTZWFyY2hSZXN1bHQgZWxlbWVudCBkb2VzblxcJ3QgZXhpc3QnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHNlYXJjaEVsZW0gPSAkKCcjJyArIHNlYXJjaElkKVxuICAgICAgcmVzdWx0RWxlbSA9ICQoJyMnICsgcmVzdWx0c0lkKVxuICAgICAgc2VhcmNoSXRlbXMgPSBzZWFyY2hhYmxlSXRlbXNcbiAgICAgIGJpbmRVSUFjdGlvbnMoKVxuICAgIH1cbiAgfVxufSkoKVxuXG5TZWFyY2guaW5pdCgnc2VhcmNoQm94JywgJ3NlYXJjaFJlc3VsdHMnLCBzZWFyY2hhYmxlSXRlbXMpXG5cblxuXG5cblxuXG5cblxuXG5cblxuLy8gdmFyIHNlYXJjaEluZGV4ID0gW1wiNDA0IEVycm9yXCIsXCJBZGRyZXNzIEJhclwiLFwiQWpheFwiLFwiQXBhY2hlXCIsXCJBdXRvcmVzcG9uZGVyXCIsXCJCaXRUb3JyZW50XCIsXCJCbG9nXCIsXCJCb29rbWFya1wiLFwiQm90XCIsXCJCcm9hZGJhbmRcIixcIkNhcHRjaGFcIixcIkNlcnRpZmljYXRlXCIsXCJDbGllbnRcIixcIkNsb3VkXCIsXCJDbG91ZCBDb21wdXRpbmdcIixcIkNNU1wiLFwiQ29va2llXCIsXCJDU1NcIixcIkN5YmVyc3BhY2VcIixcIkRlbmlhbCBvZiBTZXJ2aWNlXCIsXCJESENQXCIsXCJEaWFsLXVwXCIsXCJETlMgUmVjb3JkXCIsXCJEb21haW4gTmFtZVwiLFwiRG93bmxvYWRcIixcIkUtbWFpbFwiLFwiRmFjZWJvb2tcIixcIkZpT1NcIixcIkZpcmV3YWxsXCIsXCJGVFBcIixcIkdhdGV3YXlcIixcIkdvb2dsZVwiLFwiR29vZ2xlIERyaXZlXCIsXCJHb3BoZXJcIixcIkhhc2h0YWdcIixcIkhpdFwiLFwiSG9tZSBQYWdlXCIsXCJIVE1MXCIsXCJIVFRQXCIsXCJIVFRQU1wiLFwiSHlwZXJsaW5rXCIsXCJIeXBlcnRleHRcIixcIklDQU5OXCIsXCJJbmJveFwiLFwiSW50ZXJuZXRcIixcIkludGVyTklDXCIsXCJJUFwiLFwiSVAgQWRkcmVzc1wiLFwiSVB2NFwiLFwiSVB2NlwiLFwiSVJDXCIsXCJpU0NTSVwiLFwiSVNETlwiLFwiSVNQXCIsXCJKYXZhU2NyaXB0XCIsXCJqUXVlcnlcIixcIk1ldGEgU2VhcmNoIEVuZ2luZVwiLFwiTWV0YSBUYWdcIixcIk1pbmlzaXRlXCIsXCJNaXJyb3JcIixcIk5hbWUgU2VydmVyXCIsXCJQYWNrZXRcIixcIlBhZ2UgVmlld1wiLFwiUGF5bG9hZFwiLFwiUGhpc2hpbmdcIixcIlBPUDNcIixcIlByb3RvY29sXCIsXCJTY3JhcGluZ1wiLFwiU2VhcmNoIEVuZ2luZVwiLFwiU29jaWFsIE5ldHdvcmtpbmdcIixcIlNvY2tldFwiLFwiU3BhbVwiLFwiU3BpZGVyXCIsXCJTcG9vZmluZ1wiLFwiU1NIXCIsXCJTU0xcIixcIlN0YXRpYyBXZWJzaXRlXCIsXCJUd2l0dGVyXCIsXCJYSFRNTFwiXTtcblxuLy8gdmFyIGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VhcmNoQm94KVxuLy8gdmFyIHVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VhcmNoUmVzdWx0cylcbi8vIHZhciBpbnB1dFRlcm1zLCB0ZXJtc0FycmF5LCBwcmVmaXgsIHRlcm1zLCByZXN1bHRzLCBzb3J0ZWRSZXN1bHRzXG5cblxuLy8gdmFyIHNlYXJjaCA9IGZ1bmN0aW9uKCkgeyAgICAgICAgICBcbi8vICAgaW5wdXRUZXJtcyA9IGlucHV0LnZhbHVlLnRvTG93ZXJDYXNlKCk7XG4vLyAgIHJlc3VsdHMgPSBbXTtcbi8vICAgdGVybXNBcnJheSA9IGlucHV0VGVybXMuc3BsaXQoJyAnKTtcbi8vICAgcHJlZml4ID0gdGVybXNBcnJheS5sZW5ndGggPT09IDEgPyAnJyA6IHRlcm1zQXJyYXkuc2xpY2UoMCwgLTEpLmpvaW4oJyAnKSArICcgJztcbi8vICAgdGVybXMgPSB0ZXJtc0FycmF5W3Rlcm1zQXJyYXkubGVuZ3RoIC0xXS50b0xvd2VyQ2FzZSgpO1xuICBcbi8vICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hJbmRleC5sZW5ndGg7IGkrKykge1xuLy8gICAgIHZhciBhID0gc2VhcmNoSW5kZXhbaV0udG9Mb3dlckNhc2UoKSxcbi8vICAgICAgICAgdCA9IGEuaW5kZXhPZih0ZXJtcyk7XG4gIFxuLy8gICAgIGlmICh0ID4gLTEpIHtcbi8vICAgICAgIHJlc3VsdHMucHVzaChhKTtcbi8vICAgICB9XG4vLyAgIH1cbiAgXG4vLyAgIGV2YWx1YXRlUmVzdWx0cygpO1xuLy8gfTtcblxuLy8gdmFyIGV2YWx1YXRlUmVzdWx0cyA9IGZ1bmN0aW9uKCkge1xuLy8gICBpZiAocmVzdWx0cy5sZW5ndGggPiAwICYmIGlucHV0VGVybXMubGVuZ3RoID4gMCAmJiB0ZXJtcy5sZW5ndGggIT09IDApIHtcbi8vICAgICBzb3J0ZWRSZXN1bHRzID0gcmVzdWx0cy5zb3J0KHNvcnRSZXN1bHRzKTtcbi8vICAgICBhcHBlbmRSZXN1bHRzKCk7XG4vLyAgIH0gXG4vLyAgIGVsc2UgaWYgKGlucHV0VGVybXMubGVuZ3RoID4gMCAmJiB0ZXJtcy5sZW5ndGggIT09IDApIHtcbi8vICAgICB1bC5pbm5lckhUTUwgPSAnPGxpPldob2FoISA8c3Ryb25nPicgXG4vLyAgICAgICArIGlucHV0VGVybXMgXG4vLyAgICAgICArICc8L3N0cm9uZz4gaXMgbm90IGluIHRoZSBpbmRleC4gPGJyPjxzbWFsbD48YSBocmVmPVwiaHR0cDovL2dvb2dsZS5jb20vc2VhcmNoP3E9JyBcbi8vICAgICAgICsgZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0VGVybXMpICsgJ1wiPlRyeSBHb29nbGU/PC9hPjwvc21hbGw+PC9saT4nO1xuICBcbi8vICAgfVxuLy8gICBlbHNlIGlmIChpbnB1dFRlcm1zLmxlbmd0aCAhPT0gMCAmJiB0ZXJtcy5sZW5ndGggPT09IDApIHtcbi8vICAgICByZXR1cm47XG4vLyAgIH1cbi8vICAgZWxzZSB7XG4vLyAgICAgY2xlYXJSZXN1bHRzKCk7XG4vLyAgIH1cbi8vIH07XG5cbi8vIHZhciBzb3J0UmVzdWx0cyA9IGZ1bmN0aW9uIChhLGIpIHtcbi8vICAgaWYgKGEuaW5kZXhPZih0ZXJtcykgPCBiLmluZGV4T2YodGVybXMpKSByZXR1cm4gLTE7XG4vLyAgIGlmIChhLmluZGV4T2YodGVybXMpID4gYi5pbmRleE9mKHRlcm1zKSkgcmV0dXJuIDE7XG4vLyAgIHJldHVybiAwO1xuLy8gfVxuXG4vLyB2YXIgYXBwZW5kUmVzdWx0cyA9IGZ1bmN0aW9uICgpIHtcbi8vICAgY2xlYXJSZXN1bHRzKCk7XG4gIFxuLy8gICBmb3IgKHZhciBpPTA7IGkgPCBzb3J0ZWRSZXN1bHRzLmxlbmd0aCAmJiBpIDwgNTsgaSsrKSB7XG4vLyAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpLFxuLy8gICAgICAgICByZXN1bHQgPSBwcmVmaXggXG4vLyAgICAgICAgICAgKyBzb3J0ZWRSZXN1bHRzW2ldLnRvTG93ZXJDYXNlKCkucmVwbGFjZSh0ZXJtcywgJzxzdHJvbmc+JyBcbi8vICAgICAgICAgICArIHRlcm1zIFxuLy8gICAgICAgICAgICsnPC9zdHJvbmc+JylcbiAgXG4vLyAgICAgbGkuaW5uZXJIVE1MID0gcmVzdWx0XG4vLyAgICAgdWwuYXBwZW5kQ2hpbGQobGkpXG4vLyAgIH1cbiAgXG4vLyAgIGlmICggdWwuY2xhc3NOYW1lICE9PSAndGVybS1saXN0Jykge1xuLy8gICAgIHVsLmNsYXNzTmFtZSA9ICd0ZXJtLWxpc3QnXG4vLyAgIH1cbi8vIH1cblxuLy8gdmFyIGNsZWFyUmVzdWx0cyA9IGZ1bmN0aW9uKCkge1xuLy8gICB1bC5jbGFzc05hbWUgPSAndGVybS1saXN0IGhpZGRlbidcbi8vICAgdWwuaW5uZXJIVE1MID0gJydcbi8vIH1cbiAgXG4vLyBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHNlYXJjaCwgZmFsc2UpXG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
