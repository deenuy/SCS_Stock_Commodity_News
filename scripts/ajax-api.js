$(document).ready(function(){

  var newSummaryObj = {};
  var title = null;
  var author = null;
  var company = null;
  var publisher = null;
  var url = null;
  var obj = null;

  const searchInput = document.querySelector('#search-term');
  const suggestionPanel = document.querySelector(".suggestions");
  var selectedSuggestionIndex = -1;
  // Main function
  init();

  // Render auto-suggestion for displaying stock companies and symbols based on user entry in search bar
  function renderSelection(obj) {
    var suggestionList = 6;

    // Display only top 6 companies for auto suggestions
    for (var i=0; i<obj.ResultSet.Result.length; i++) {
      var company = obj.ResultSet.Result[i].name;
      var company_ticker = obj.ResultSet.Result[i].symbol;

      const div = document.createElement('div');
      div.innerHTML = company +"("+ company_ticker  +")";
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
  // Update news feed article section
  function updatePage(stockObject) {
    clear()
    // Get from the form the number of results to display
    // API doesn't have a "limit" parameter, so we have to do this ourselves
    var numArticles = 6;

    // Log the stockObject to console, where it will show up as an object
    console.log(stockObject);
    console.log("------------------------------------");

    // Loop through and build elements for the defined number of articles
    for (var i = 0; i < numArticles; i++) {
      // Get specific article info for current index
      title = stockObject.items.result[i].title;
      author = stockObject.items.result[i].author;
      company = stockObject.items.result[i].entities[0].label;
      publisher = stockObject.items.result[i].publisher;
      url = stockObject.items.result[i].link;

      var tmpObj = [];

      tmpObj[i] = {
        'id': i,
        'title': title,
        'author': author,
        'company': company,
        'publisher': publisher,
        'url': ''
      }
      newSummaryObj.push = tmpObj[i];

      // Create the  list group to contain the articles and add the article content for each
      var $articleList = $("<ul>");
      $articleList.addClass("list-group");

      // Add the newly created element to the DOM
      $("#article-section").append($articleList);

      // If the article has a title, log and append to $articleList
      var $articleListItem = $("<li class='list-group-item articleHeadline'>");

      if (company) {
        $articleListItem.append(
          "<span class='label label-primary'>" +
            "<strong> " +
            company +
            "</strong>"
        );
      }

      // If the article has a byline, log and append to $articleList
      if (title) {
        $articleListItem.append("<h5>" + title + "</h5>");
      }

      // Log section, and append to document if exists
      if (author) {
        $articleListItem.append("<h5>Author: " + author + "</h5>");
      }

      // Log published date, and append to document if exists
      if (publisher) {
        $articleListItem.append("<h5>" + publisher + "</h5>");
      }

      // Append news log url
      if (url) {
        $articleListItem.append("<a href="+url+ ">read more.."+"</a>");
      }

      // Append the article
      $articleList.append($articleListItem);
    }
    storeNews(newSummaryObj);
  }
  // Function to store the news summary in local storage
  function storeNews(object) {
    localStorage.setItem('newsSummary', JSON.stringify(object));
  }
  // render the news from local storage
  function renderNews() {
    var obj = JSON.parse(localStorage.getItem('newsSummary'));
    console.log('Render news')
    console.log(obj);
  }
  // Function to empty out the articles
  function clear() {
    newSummaryObj = {};
    title = null;
    author = null;
    company = null;
    publisher = null;
    url = null;
    $("#article-section").empty();
  }
  // Initializes main function
  function init() {
    renderNews();
    
    // Listener event on user key entry in search bar for auto-suggestion of stock company and symbol
    searchInput.addEventListener('keyup', function(e){
      const input = searchInput.value;

      suggestionPanel.innerHTML = '';

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

      if (input == ''){
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
      suggestionPanel.classList.add('show');
    })

    document.addEventListener('click', function(e){
      if(e.target.className === 'suggestion') {
          searchInput.value = e.target.innerHTML;
          suggestionPanel.classList.remove('show');
      }
    })

    // .on("click") function associated with the Search Button
    $("#run-search-01").click(function(event) {
      event.preventDefault();
      console.log("Search initiated!");
      // This line allows us to take advantage of the HTML "submit" property
      // This way we can hit enter on the keyboard and it registers the search
      // (in addition to clicks). Prevents the page from reloading on form submit.
      event.preventDefault();

      // Empty the region associated with the articles
      clear();

      // Build the query URL for the ajax request to the NYT API
      var company = $("#search-term").val().trim();
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
        "url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-news?region="+region+"&category="+company,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
            "x-rapidapi-key": "88d999ffd3msh5b7eb7230c1ef95p1ff909jsn76383fb30752"
        }
      }

      $.ajax(settings).done(function (response) {
          console.log(response);
          updatePage(response);

          document.getElementById("widget").setAttribute("intrinio-widget-ticker", company);
      });
    });
  }
});