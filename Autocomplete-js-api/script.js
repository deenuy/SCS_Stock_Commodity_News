const countries = [
    {name: 'USA'},
    {name: 'India'},
    {name: 'Argentina'},
    {name: 'Armenia'}
];

var obj = null;

const searchInput = document.querySelector('.search-input');
const suggestionPanel = document.querySelector(".suggestions");
var selectedSuggestionIndex = -1;

function renderSelection(obj) {
    console.log('render selection', obj);
    var suggestionList = 6;

    for (var i=0; i<obj.ResultSet.Result.length; i++) {
        var company = obj.ResultSet.Result[i].name;
        var company_ticker = obj.ResultSet.Result[i].symbol;

        const div = document.createElement('div');
        div.innerHTML = company +"("+ company_ticker  +")";
        div.setAttribute('class', 'suggestion');
        suggestionPanel.append(div);
    }
}

function resetSelectedSuggestion() {
    for (var i=0; i < suggestionPanel.children.length; i++) {
        suggestionPanel.children[i].classList.remove('selected');
    }
}

searchInput.addEventListener('keyup', function(e){
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
    const input = searchInput.value;
    suggestionPanel.innerHTML = '';

    // Make the AJAX request to the API - GETs the JSON data at the queryURL.
    // The data then gets passed as an argument to the updatePage function
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
})

document.addEventListener('click', function(e){
    if(e.target.className === 'suggestion') {
        searchInput.value = e.target.innerHTML;
        suggestionPanel.classList.remove('show');
    }
})
