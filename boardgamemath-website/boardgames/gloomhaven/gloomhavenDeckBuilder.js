var urlSearchParams = new URLSearchParams(window.location.search);

var characters;
var selectedCharacter;

initCharacters();

function initCharacters() {
    d3.json("deck/deck.json").then(function(data) {
        characters = data.characters;
        console.log(characters);
        selectedCharacter = characters[0];
        d3.select("select").selectAll("option").data(characters)
                .enter().append("option").attr("value",function(character){ return character;})
                .text(function(character){
                    return character.characterName;
                });
    });
}
