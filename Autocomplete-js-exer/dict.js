const countries = [
    {name: 'USA'},
    {name: 'India'},
    {name: 'Argentina'},
    {name: 'Armenia'}
];

const searchInput = document.querySelector('.search-input');
const suggestionPanel = document.querySelector(".suggestions");
var selectedSuggestionIndex = -1;

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
    suggestions = countries.filter(function(country){
        return country.name.toLowerCase().startsWith(input.toLowerCase())
    });
    suggestions.forEach(function(suggested){
        console.log(suggested);
        const div = document.createElement('div');
        div.innerHTML = suggested.name;
        div.setAttribute('class', 'suggestion');

        suggestionPanel.append(div);
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
