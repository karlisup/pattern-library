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

