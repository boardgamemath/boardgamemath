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
    var requiredLevel = 1;
    var topLostCardCount = 0;
    var bottomLostCardCount = 0;
    var initiatives = [];
    for (var i = 0; i < selectedCards.length; i++) {
        var selectedCard = selectedCards[i];
        if (selectedCard.topAction.lost) {
            topLostCardCount++;
        }
        if (selectedCard.bottomAction.lost) {
            bottomLostCardCount++;
        }
        if (selectedCard.level > requiredLevel) {
            requiredLevel = selectedCard.level;
        }
        initiatives.push(selectedCard.initiative);
    }
    initiatives.sort();
    var initiativesHalfLength = Math.floor((initiatives.length + 1) / 2);
    var lowerHalfAvgInitiative = 0;
    for (var j = 0; j < initiativesHalfLength; j++) {
        lowerHalfAvgInitiative += initiatives[j];
    }
    lowerHalfAvgInitiative /= initiativesHalfLength;
    var higherHalfAvgInitiative = 0;
    for (var k = Math.floor(initiatives.length / 2); k < initiatives.length; k++) {
        higherHalfAvgInitiative += initiatives[k];
    }
    higherHalfAvgInitiative /= initiativesHalfLength;


    d3.select("#requiredLevel").text(requiredLevel);
    d3.select("#topLostCardCount").text(topLostCardCount);
    d3.select("#bottomLostCardCount").text(bottomLostCardCount);
    d3.select("#lowerHalfAvgInitiative").text(lowerHalfAvgInitiative);
    d3.select("#higherHalfAvgInitiative").text(higherHalfAvgInitiative);
}

