$(document).ready(function(){

  var title = null;
  var author = null;
  var company = null;
  var publisher = null;
  var url = null;
  var obj = [];
  var search_symbol = null;
  var newSummaryObj = [];

  const searchInput = document.querySelector('.search-input');
  const suggestionPanel = document.querySelector(".suggestions");
  var selectedSuggestionIndex = -1;
  // Main function
  init();

  // Function to empty out the articles
  function clear() {
    title = null;
    author = null;
    company = null;
    publisher = null;
    url = null;
    obj = [];
    newSummaryObj = [];
    $(".stats").empty();
    $("#article-section").empty();
  }
  // Render auto-suggestion for displaying stock companies and symbols based on user entry in search bar
  function renderSelection(resultObj) {
    var suggestionList = 3;

    suggestionPanel.classList.add('show');

    // Display only top 6 companies for auto suggestions
    for (var i=0; i<resultObj.ResultSet.Result.length; i++) {
      var company = resultObj.ResultSet.Result[i].name;
      var company_ticker = resultObj.ResultSet.Result[i].symbol;

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
  function renderNewsFeed(resultObj) {
    clear();
    // Loop through and build elements for the defined number of articles
    if (resultObj){
      for (var i = 0; i < resultObj.length; i++) {

        // Create the  list group to contain the articles and add the article content for each
        var $articleList = $("<ul>");
        $articleList.addClass("list-group");
  
        // Add the newly created element to the DOM
        $("#article-section").append($articleList);
  
        // If the article has a title, log and append to $articleList
        var $articleListItem = $("<li class='list-group-item articleHeadline'>");
  
        if (resultObj[i].company) {
          $articleListItem.append(
            "<span class='label label-primary' style='background: #522399; color: #fff; padding: 0.2rem;'>" +
              "<strong> " +
              resultObj[i].company +
              "</strong>"
          );
        }
  
        // If the article has a byline, log and append to $articleList
        if (resultObj[i].title) {
          $articleListItem.append("<h5 class='newsHeadline'>" + resultObj[i].title + "</h5>");
        }
  
        // Log section, and append to document if exists
        if (resultObj[i].author) {
          $articleListItem.append("<h5 class='author'>Author: " + resultObj[i].author + "</h5>");
        }
  
        // Log published date, and append to document if exists
        if (resultObj[i].publisher) {
          $articleListItem.append("<h5 class='author'>" + resultObj[i].publisher + "</h5>");
        }
  
        // Append news log url
        if (resultObj[i].url) {
          $articleListItem.append("<a href=" + resultObj[i].url + " target='_blank' >" + "read more.." + "</a>");
        }
  
        // Append the article
        $articleList.append($articleListItem);
      }
    }
  }
  // Update news feed article section
  function updatePage(stockObject) {
    
    var numArticles = 6;
    // Get from the form the number of results to display
    if(stockObject.items.result.length < 6){
      numArticles = stockObject.items.result.length;
    }
    
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

  // Function to read the stock stats from local storage
  function renderStockStats(){
    
    newSummaryObj = JSON.parse(localStorage.getItem('scs_stock_summary'));
    console.log('Rendering from local storage', newSummaryObj);

    // var ulEl = $("<ul>");
    // ulEl.addClass('stockStats')

    // for (var i=0; i<4; i++){
    //   var liEl = $("<li>");
    //   ulEl.append(liEl);
    //   ulEl.addClass('stockStats__list'+i);
    //   ulEl.text('Sample'+i);
    // }

    // $(".statistics").append(ulEl);

    $(".statistics").append($("<p>").addClass('stats').text("Name: "+ newSummaryObj[0].Name))
    $(".statistics").append($("<p>").addClass('stats').text("Price: "+ newSummaryObj[0].Price))
    $(".statistics").append($("<p>").addClass('stats').text("Financial Currency: "+ newSummaryObj[0].financialCurrency))
    $(".statistics").append($("<p>").addClass('stats').text("Sector: "+ newSummaryObj[0].sector))
    $(".statistics").append($("<p>").addClass('stats').text("Business Summary: "+ newSummaryObj[0].longBusinessSummary))
    
  }

  // Function to fetch attributes from API response and add to localStorage
  function getStockStats(stockStatsObj){

    newSummaryObj.push({
      'Name': stockStatsObj.quoteType.shortName,
      'Price': stockStatsObj.price.regularMarketOpen.raw,
      'financialCurrency': stockStatsObj.earnings.financialCurrency,
      'Sector': stockStatsObj.summaryProfile.sector,
      'longBusinessSummary': stockStatsObj.summaryProfile.longBusinessSummary
    });

    localStorage.setItem('scs_stock_summary', JSON.stringify(newSummaryObj));

    // $(".statistics").append($("<p>").text("Name: "+ stockStatsObj.quoteType.shortName))
    // $(".statistics").append($("<p>").text("Price: "+ stockStatsObj.price.regularMarketOpen.raw))
    // $(".statistics").append($("<p>").text("Financial Currency: "+ stockStatsObj.earnings.financialCurrency))
    // $(".statistics").append($("<p>").text("Sector: "+ stockStatsObj.summaryProfile.sector))
    // $(".statistics").append($("<p>").text("Business Summary: "+ stockStatsObj.summaryProfile.longBusinessSummary))
  
  }

  // Initializes main function
  function init() {
    renderNews();
    renderStockStats();
    
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
      });
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?"+region+"&symbol="+search_symbol,
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
          "x-rapidapi-key": "88d999ffd3msh5b7eb7230c1ef95p1ff909jsn76383fb30752"
        }
      }
      
      $.ajax(settings).done(function (response1) {
        var stockStatsObj = response1;
        getStockStats(response1);
        renderStockStats();

      });

      // Get the stock charts
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=1d&region=US&lang=en&range=1mo&symbol="+search_symbol,
        "method": "GET",
        "headers": {
          "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
          "x-rapidapi-key": "88d999ffd3msh5b7eb7230c1ef95p1ff909jsn76383fb30752"
        }
      }
      
      $.ajax(settings).done(function (response3) {
        // console.log(response3.chart.result[0]);
        if(response3.chart.result[0]){
          localStorage.setItem('scs_stock_chart', JSON.stringify(response3.chart.result[0]));
        }
      });
    });
  }
});