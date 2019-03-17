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
        // d3.select(".selectedCards").selectAll(".selectedCard")
        //         .data(selectedCards)
        //         .enter().append("div")
        //         .attr("class", "selectedCard")
        //         .append("img")
        //         .attr("src",  function (selectedCard) {
        //             return "deck/" + selectedCharacter.characterId + "/"
        //                     + selectedCharacter.characterId + "-" + selectedCard.cardId + ".png"
        //         });
        var characterQueryParam = urlSearchParams.get("character");
        for (var i = 0; i < characters.length; i++) {
            if (characterQueryParam === characters[i].characterId) {
                var cardsQueryParams = urlSearchParams.get("cards").split("_");
                for (var j = 0; j < cardsQueryParams.length; j++) {
                    var cardId = parseInt(cardsQueryParams[j]);
                    var availableCard = availableCards.find(function (card) {
                        return card.cardId === cardId;
                    });
                    availableCard.selected = true;
                    selectedCards.push(availableCard);
                }
                break;
            }
        }
        updateCards();
    });
}

function changeCharacter(t) {
    selectedCharacter = characters[t.selectedIndex];
    updateCards();
}

function updateCards() {
    urlSearchParams.set("character", selectedCharacter.characterId);
    var cardsQueryParam = "";
    for (var i = 0; i < selectedCards.length; i++) {
        if (i !== 0) {
            cardsQueryParam += "_";
        }
        cardsQueryParam += selectedCards[i].cardId;
    }
    urlSearchParams.set("cards", cardsQueryParam);

    window.history.pushState('', '', "?" + urlSearchParams.toString());
    availableCardDiv.classed("selectedAvailableCard", function (availableCard) {
        return availableCard.selected
    });
    d3.select("#cardCount").text(selectedCards.length);
    var topLostCardCount = 0;
    var bottomLostCardCount = 0;
    var noneOneLevels = [];
    var initiatives = [];
    for (var i = 0; i < selectedCards.length; i++) {
        var selectedCard = selectedCards[i];
        if (selectedCard.level > 1) {
            noneOneLevels.push(selectedCard.level);
        }
        if (selectedCard.topAction.lost) {
            topLostCardCount++;
        }
        if (selectedCard.bottomAction.lost) {
            bottomLostCardCount++;
        }
        initiatives.push(selectedCard.initiative);
    }
    noneOneLevels.sort();
    var requiredLevel = 1;
    for (var j = 0; j < noneOneLevels.length; j++) {
        var level = noneOneLevels[j];
        if (level > requiredLevel) {
            requiredLevel = level;
        } else {
            requiredLevel++;
        }
    }
    initiatives.sort();
    var initiativesHalfLength = Math.floor((initiatives.length + 1) / 2);
    var lowerHalfAvgInitiative = 0;
    var higherHalfAvgInitiative = 0;
    for (var i = 0; i < initiativesHalfLength; i++) {
        lowerHalfAvgInitiative += initiatives[i];
    }
    for (var i = Math.floor(initiatives.length / 2); i < initiatives.length; i++) {
        higherHalfAvgInitiative += initiatives[i];
    }
    if (selectedCards.length > 0) {
        lowerHalfAvgInitiative /= initiativesHalfLength;
        higherHalfAvgInitiative /= initiativesHalfLength;
    }


    d3.select("#requiredLevel").text(requiredLevel);
    d3.select("#topLostCardCount").text(topLostCardCount);
    d3.select("#bottomLostCardCount").text(bottomLostCardCount);
    d3.select("#lowerHalfAvgInitiative").text(lowerHalfAvgInitiative.toFixed(1));
    d3.select("#higherHalfAvgInitiative").text(higherHalfAvgInitiative.toFixed(1));
}

