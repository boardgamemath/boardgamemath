var urlSearchParams = new URLSearchParams(window.location.search);

var characters;
var selectedCharacter;
var availableCards;
var selectedCards;

var availableCardDiv;

initCharacters();

function initCharacters() {
    d3.json("deck/deck.json").then(function(data) {
        characters = data.characters;
        console.log(characters);
        selectedCharacter = characters[0];
        d3.select("select").selectAll("option")
                .data(characters)
                .enter().append("option").attr("value",function(character){ return character;})
                .text(function(character){
                    return character.characterName;
                });
        availableCards = selectedCharacter.cards;
        selectedCards = [];
        availableCardDiv = d3.select(".availableCards").selectAll(".availableCard")
                .data(availableCards)
                .enter().append("div")
                .attr("class", "availableCard")
                .on("click", function (availableCard) {
                    if (availableCard.selected) {
                        availableCard.selected = false;
                        var index = selectedCards.indexOf(availableCard);
                        selectedCards.splice(index, 1);
                    } else {
                        availableCard.selected = true;
                        selectedCards.push(availableCard);
                    }
                    updateCards();
                });
        availableCardDiv.append("img")
                .attr("src",  function (availableCard) {
                    return "deck/" + selectedCharacter.characterId + "/"
                    + selectedCharacter.characterId + "-" + availableCard.cardId + ".png"
                });
        d3.select(".selectedCards").selectAll(".selectedCard")
                .data(selectedCards)
                .enter().append("div")
                .attr("class", "selectedCard")
                .append("img")
                .attr("src",  function (selectedCard) {
                    return "deck/" + selectedCharacter.characterId + "/"
                            + selectedCharacter.characterId + "-" + selectedCard.cardId + ".png"
                });
        updateCards();
    });
}

function changeCharacter(t) {
    selectedCharacter = characters[t.selectedIndex];
    updateCards();
}

function updateCards() {
    availableCardDiv.classed("selectedAvailableCard", function (availableCard) {
        return availableCard.selected
    });
    d3.select("#cardCount").text(selectedCards.length);
    var topLostCardCount = 0;
    var bottomLostCardCount = 0;
    for (var j = 0; j < selectedCards.length; j++) {
        var selectedCard = selectedCards[j];
        if (selectedCard.topAction.lost) {
            topLostCardCount++;
        }
        if (selectedCard.bottomAction.lost) {
            bottomLostCardCount++;
        }
    }
    d3.select("#topLostCardCount").text(topLostCardCount);
    d3.select("#bottomLostCardCount").text(bottomLostCardCount);
}

