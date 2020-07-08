
  function updatePage(stockObject) {
    // Get from the form the number of results to display
    // API doesn't have a "limit" parameter, so we have to do this ourselves
    var numArticles = $("#article-count").val();
  
    // Log the stockObject to console, where it will show up as an object
    console.log(stockObject);
    console.log("------------------------------------");
  
    // Loop through and build elements for the defined number of articles
    for (var i = 0; i < numArticles; i++) {
      // Get specific article info for current index
      var title = stockObject.items.result[i].title;
      var author = stockObject.items.result[i].author;
      var company = stockObject.items.result[i].entities[0].label;
      var publisher = stockObject.items.result[i].publisher;
  
      // Increase the articleCount (track article # - starting at 1)
      var articleCount = i + 1;
  
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
            articleCount +
            "</span>" +
            "<strong> " +
            company +
            "</strong>"
        );
      }
  
      // If the article has a byline, log and append to $articleList
      if (summary) {
        $articleListItem.append("<h5>" + summary + "</h5>");
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
  }
  
  // Function to empty out the articles
  function clear() {
    $("#article-section").empty();
  }
  
  // CLICK HANDLERS
  // ==========================================================
  
  // .on("click") function associated with the Search Button
  $("#run-search").click(function(event) {
      console.log("Search initiated!");
    // This line allows us to take advantage of the HTML "submit" property
    // This way we can hit enter on the keyboard and it registers the search
    // (in addition to clicks). Prevents the page from reloading on form submit.
    event.preventDefault();

    // Empty the region associated with the articles
    clear();

    // Build the query URL for the ajax request to the NYT API
    var company = $("#search-term").val().trim();
    var region = $("#start-year").val().trim();

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
  
  //  .on("click") function associated with the clear button
  $("#clear-all").on("click", clear);
  