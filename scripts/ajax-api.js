$(document).ready(function(){

  var newSummaryObj = {};
  var title = null;
  var author = null;
  var company = null;
  var publisher = null;

  // Main function
  init();

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
      console.log(company);
      $articleListItem.append(
        "<span class='label label-primary'>" +
          "</span>" +
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
    console.log(publisher);
    if (publisher) {
      $articleListItem.append("<h5>" + publisher + "</h5>");
    }

    //   // Append and log url
    //   $articleListItem.append("<a href='" + article.web_url + "'>" + article.web_url + "</a>");
    //   console.log(article.web_url);

    // Append the article
    $articleList.append($articleListItem);
    }
    storeNews(newSummaryObj);
  }
  // Function to store the news summary in local storage
  function storeNews(object) {
    localStorage.setItem('newsSummary', JSON.stringify(object));
  }

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
    $("#article-section").empty();
  }

  function init() {
    renderNews();
    // CLICK HANDLERS
    // ==========================================================

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
      });
    });

    // Auto-suggestion function
    $("#auto-suggestion").change(function(){
      console.log('Auto suggestion input')
    })
  }
});