$(document).ready(function(){

  var title = null;
  var author = null;
  var company = null;
  var publisher = null;
  var url = null;
  var obj = ['A'];
  var search_symbol = null;

  const searchInput = document.querySelector('.search-input');
  const suggestionPanel = document.querySelector(".suggestions");
  var selectedSuggestionIndex = -1;
  // Main function
  init();

  // Function to empty out the articles
  function clear() {
    newSummaryObj = {};
    title = null;
    author = null;
    company = null;
    publisher = null;
    url = null;
    obj = [];
    $("#article-section").empty();
  }
  // Render auto-suggestion for displaying stock companies and symbols based on user entry in search bar
  function renderSelection(obj) {
    var suggestionList = 3;

    suggestionPanel.classList.add('show');

    // Display only top 6 companies for auto suggestions
    for (var i=0; i<obj.ResultSet.Result.length; i++) {
      var company = obj.ResultSet.Result[i].name;
      var company_ticker = obj.ResultSet.Result[i].symbol;

      const div = document.createElement('div');
      div.innerHTML = company +" ("+ company_ticker  +")";
      div.setAttribute('class', 'suggestion');
      suggestionPanel.append(div);
    }
  }
  // reset the selected suggestion list from auto-suggestion feature
  function resetSelectedSuggestion() {
    for (var i=0; i < suggestionPanel.children.length; i++) {
      suggestionPanel.children[i].classList.remove('selected');
    }
  }
  function renderNewsFeed(obj) {
    clear()
    // Loop through and build elements for the defined number of articles
    for (var i = 0; i < obj.length; i++) {

      // Create the  list group to contain the articles and add the article content for each
      var $articleList = $("<ul>");
      $articleList.addClass("list-group");

      // Add the newly created element to the DOM
      $("#article-section").append($articleList);

      // If the article has a title, log and append to $articleList
      var $articleListItem = $("<li class='list-group-item articleHeadline'>");

      if (obj[i].company) {
        $articleListItem.append(
          "<span class='label label-primary'>" +
            "<strong> " +
            obj[i].company +
            "</strong>"
        );
      }

      // If the article has a byline, log and append to $articleList
      if (obj[i].title) {
        $articleListItem.append("<h5>" + obj[i].title + "</h5>");
      }

      // Log section, and append to document if exists
      if (obj[i].author) {
        $articleListItem.append("<h5>Author: " + obj[i].author + "</h5>");
      }

      // Log published date, and append to document if exists
      if (obj[i].publisher) {
        $articleListItem.append("<h5>" + obj[i].publisher + "</h5>");
      }

      // Append news log url
      if (obj[i].url) {
        $articleListItem.append("<a href="+obj[i].url+ ">read more.."+"</a>");
      }

      // Append the article
      $articleList.append($articleListItem);
    }
  }
  // Update news feed article section
  function updatePage(stockObject) {
    // Get from the form the number of results to display
    var numArticles = 6;

    // Loop through and build elements for the defined number of articles
    for (var i = 0; i < numArticles; i++) {
      // Get specific article info for current index
      title = stockObject.items.result[i].title;
      author = stockObject.items.result[i].author;
      company = stockObject.items.result[i].entities[0].label;
      publisher = stockObject.items.result[i].publisher;
      url = stockObject.items.result[i].link;

      // Construct array with news feed objects
      obj.push({
        'id': i,
        'title': title,
        'author': author,
        'company': company,
        'publisher': publisher,
        'url': url
      });
    }

    // Add to news feed to browser local storage
    storeNews(obj);

    // Render in HTML news feed
    renderNewsFeed(obj)
  }
  // Function to store the news summary in local storage
  function storeNews(object) {
    localStorage.setItem('scs_news_feed', JSON.stringify(object));
  }
  // render the news from local storage
  function renderNews() {
    var newsFeed = JSON.parse(localStorage.getItem('scs_news_feed'));
    renderNewsFeed(newsFeed);
  }
  // Initializes main function
  function init() {
    renderNews();
    
    // Listener event on user key entry in search bar for auto-suggestion of stock company and symbol
    searchInput.addEventListener('keyup', function(e){
      suggestionPanel.innerHTML = '';

      const input = searchInput.value;

      if(input){
        // Make the AJAX request to the API - GETs the JSON data at the query = input
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/auto-complete?lang=en&region=US&query="+input,
          "method": "GET",
          "headers": {
              "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
              "x-rapidapi-key": "88d999ffd3msh5b7eb7230c1ef95p1ff909jsn76383fb30752"
          }
        }
        $.ajax(settings).done(function (response) {
            renderSelection(response);
        });
      }

      if (input === ''){
          suggestionPanel.innerHTML = '';
      }

      // Keyboard company suggestion selection
      if (e.key === 'ArrowDown'){
          resetSelectedSuggestion();
          selectedSuggestionIndex = (selectedSuggestionIndex < suggestionPanel.children.length - 1) ? selectedSuggestionIndex + 1 : selectedSuggestionIndex.children.length - 1;

          suggestionPanel.children[selectedSuggestionIndex].classList.add('selected');
          return;
      }
      if (e.key === 'ArrowUp'){
          resetSelectedSuggestion();
          selectedSuggestionIndex = (selectedSuggestionIndex > 0) ? selectedSuggestionIndex - 1 : 0;

          suggestionPanel.children[selectedSuggestionIndex].classList.add('selected');
          return;
      }
      if (e.key === 'Enter'){
          searchInput.value = suggestionPanel.children[selectedSuggestionIndex].innerHTML;
          suggestionPanel.classList.remove('show');
          selectedSuggestionIndex = -1;
          return;
      }
    })

    // Listener on click event to display the suggestion in search bar 
    document.addEventListener('click', function(e){
      if(e.target.className === 'suggestion') {
          // display selected company in search input value
          searchInput.value = e.target.innerHTML;

          // From selected stock company from auto suggestion extract Symbol. Ex: Apple Inc. (AAPL). Result is AAPL
          search_symbol = e.target.innerHTML;
          search_symbol = search_symbol.split(/[()]/)[1];
         
          // On selection, hide suggestion list
          suggestionPanel.classList.remove('show');
      }
    })

    // .on("click") function associated with the Search Button
    $("#run-search-01").click(function(event) {
      event.preventDefault();

      // Empty the region associated with the articles
      clear();

      // var region = $("#start-year").val().trim();
      var region = 'US'


      // Return from function early if submitted input is blank
      if (company === "") {
        return;
      }

      // Make the AJAX request to the API - GETs the JSON data at the queryURL.
      // The data then gets passed as an argument to the updatePage function
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-news?region="+region+"&category="+search_symbol,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
            "x-rapidapi-key": "88d999ffd3msh5b7eb7230c1ef95p1ff909jsn76383fb30752"
        }
      }

      $.ajax(settings).done(function (response) {
          // console.log(response);
          updatePage(response);
          $("#widget").attr("intrinio-widget-ticker", search_symbol);
      });
    });
  }
});