var MAX_ROUNDS = 36;
var MAX_HAND_LIMIT = 12;
var characters;
var selectedCharacter;
var rounds;

initCharacters();
initRounds();
initChart();
updateRounds();

function Character(name, handLimit, revivingEtherAvailable) {
    this.name = name;
    this.handLimit = handLimit;
    this.revivingEtherAvailable = revivingEtherAvailable;
}

function initCharacters() {
    characters = [
        new Character("Brute", 10, false),
        new Character("Cragheart", 11, false),
        new Character("Mindthief", 10, false),
        new Character("Scoundrel", 9, false),
        new Character("Spellweaver", 8, true),
        new Character("Tinkerer", 12, false)
    ];
    selectedCharacter = characters[0];
    d3.select("select").selectAll("option").data(characters)
            .enter().append("option").attr("value",function(character){ return character;})
            .text(function(character){
                return character.name + " (" + character.handLimit + " cards)";
            });
}

function changeCharacter(t) {
    selectedCharacter = characters[t.selectedIndex];
    resetRounds();
    updateRounds();
}

function Round(number) {
    this.number = number;
    this.handCardSize = number;
    this.discardCardSize = 0;

    this.revivingEther = false;
    this.shortRest = false;
    this.longRest = false;
    this.playLostCardCount = 0;
    this.bleedHandCardCount = 0;
    this.bleedDiscardPairCount = 0;
}

function initRounds() {
    rounds = new Array(MAX_ROUNDS);
    for (var i = 0; i < rounds.length; i++) {
        rounds[i] = new Round(i + 1);
    }
}

function resetRounds() {
    for (var i = 0; i < rounds.length; i++) {
        var round = rounds[i];
        round.longRest = false;
        round.playLostCardCount = 0;
        round.bleedHandCardCount = 0;
        round.bleedDiscardPairCount = 0;
    }
}

function updateRounds() {
    var handCardSize = selectedCharacter.handLimit;
    var discardCardSize = 0;
    var revivingEtherAvailable = selectedCharacter.revivingEtherAvailable;
    for (var i = 0; i < rounds.length; i++) {
        var round = rounds[i];
        if (round.bleedHandCardCount > handCardSize) {
            round.bleedHandCardCount = handCardSize;
        }
        handCardSize -= round.bleedHandCardCount;
        if (round.bleedDiscardPairCount * 2 > discardCardSize) {
            round.bleedDiscardPairCount = Math.floor(discardCardSize / 2);
        }
        discardCardSize -= (round.bleedDiscardPairCount * 2);
        if (handCardSize < 2) {
            if (discardCardSize < 2 || (discardCardSize === 2 && handCardSize === 0)) { // Exhausted
                handCardSize = 0;
                discardCardSize = 0;
                round.shortRest = false;
                round.longRest = false;
                round.playLostCardCount = 0;
                round.bleedHandCardCount = 0;
                round.bleedDiscardPairCount = 0;
            } else if (round.longRest) { // Long rest announced
                round.shortRest = false;
                round.playLostCardCount = 0;
            } else { // Automatic short rest
                handCardSize += discardCardSize - 1;
                discardCardSize = 0;
                round.shortRest = true;
            }
        } else {
            round.shortRest = false;
        }
        round.handCardSize = handCardSize;
        round.discardCardSize = discardCardSize;
        round.revivingEther = false;
        if (round.longRest) { // Long rest
            handCardSize += discardCardSize - 1;
            discardCardSize = 0;
        } else if (handCardSize >= 2) { // Normal play
            handCardSize -= 2;
            discardCardSize += 2 - round.playLostCardCount;
            if (revivingEtherAvailable && handCardSize < 2
                    && (discardCardSize < 2 || (discardCardSize === 2 && handCardSize === 0))) {
                round.revivingEther = true;
                if (round.playLostCardCount == 0) {
                    round.playLostCardCount = discardCardSize;
                    discardCardSize = 0;
                }
                handCardSize += (selectedCharacter.handLimit - handCardSize - discardCardSize) - 1;
                revivingEtherAvailable = false;
            }
        }
    }
    updateChart();
}

function initChart() {
    outerSize = {width: 960, height: 500};
    margin = {top: 20, right: 30, bottom: 40, left: 40};
    barButtonCount = 7;
    barButtonSize = {width: 20, height: 20};
    innerSize = {width: outerSize.width - margin.left - margin.right,
        height: outerSize.height - margin.top - margin.bottom - (barButtonCount * barButtonSize.height)};

    chart = d3.select(".chart")
            .attr("width", outerSize.width)
            .attr("height", outerSize.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xRange = d3.scaleBand()
            .domain(d3.range(1, MAX_ROUNDS + 1))
            .range([0, innerSize.width])
            .padding(0.1);
    chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerSize.height + ")")
            .call(d3.axisBottom().scale(xRange));
    chart.append("text")
            .attr("transform",
                    "translate(" + (innerSize.width / 2) + " ," + (innerSize.height + margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text("Round");

    yRange = d3.scaleLinear()
            .domain([0, MAX_HAND_LIMIT])
            .range([innerSize.height, 0]);
    chart.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft().scale(yRange));
    chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (innerSize.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Hand / Discarded cards");

    var roundBar = chart.selectAll(".roundBar")
            .data(rounds)
            .enter().append("g")
            .attr("class", "roundBar");

    handCardBar = roundBar.append("rect")
            .attr("class", "handCardBar")
            .attr("x", function (round) {
                return xRange(round.number);
            })
            .attr("width", xRange.bandwidth());
    discardCardBar = roundBar.append("rect")
            .attr("class", "discardCardBar")
            .attr("x", function (round) {
                return xRange(round.number);
            })
            .attr("width", xRange.bandwidth());
    revivingEtherLine = roundBar.append("rect")
            .attr("class", "revivingEther")
            .attr("x", function (round) {
                return xRange(round.number) + xRange.bandwidth() - 2;
            })
            .attr("width", 4);
    revivingEtherText = roundBar.append("text")
            .attr("class", "revivingEther")
            .attr("x", function (round) {
                return xRange(round.number + 1);
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("reviving ether");
    shortRestLine = roundBar.append("rect")
            .attr("class", "shortRest")
            .attr("x", function (round) {
                return xRange(round.number) - 2;
            })
            .attr("width", 4);
    shortRestText = roundBar.append("text")
            .attr("class", "shortRest")
            .attr("x", function (round) {
                return xRange(round.number);
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("short rest");
    longRestBar = roundBar.append("rect")
            .attr("class", "longRest")
            .attr("x", function (round) {
                return xRange(round.number);
            })
            .attr("width", xRange.bandwidth());
    longRestText = roundBar.append("text")
            .attr("class", "longRest")
            .attr("x", function (round) {
                return xRange(round.number) + (xRange.bandwidth() / 2);
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("long rest");
    longRestButton = createButton(roundBar, "longRestGloomhaven.svg",
            "Take a long rest in my turn",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom;
            }, function(round) {
                round.longRest = !round.longRest;
                updateRounds();
            });
    playLostCard1Button = createButton(roundBar, "lostCardGloomhaven.svg",
            "Play a lost card in my turn",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom + barButtonSize.height;
            }, function(round) {
                if (round.playLostCardCount < 1) {
                    round.playLostCardCount++;
                } else {
                    round.playLostCardCount--;
                }
                updateRounds();
            });
    playLostCard2Button = createButton(roundBar, "lostCardGloomhaven.svg",
            "Play a lost card in my turn",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom + (2 * barButtonSize.height);
            }, function(round) {
                if (round.playLostCardCount < 2) {
                    round.playLostCardCount++;
                } else {
                    round.playLostCardCount--;
                }
                updateRounds();
            });
    bleedHandCard1Button = createButton(roundBar, "bleedHandCardGloomhaven.svg",
            "Bleed a hand card (before my turn)",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom + (3 * barButtonSize.height);
            }, function(round) {
                if (round.bleedHandCardCount < 1) {
                    round.bleedHandCardCount++;
                } else {
                    round.bleedHandCardCount--;
                }
                updateRounds();
            });
    bleedHandCard2Button = createButton(roundBar, "bleedHandCardGloomhaven.svg",
            "Bleed a hand card (before my turn)",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom + (4 * barButtonSize.height);
            }, function(round) {
                if (round.bleedHandCardCount < 2) {
                    round.bleedHandCardCount++;
                } else {
                    round.bleedHandCardCount--;
                }
                updateRounds();
            });
    bleedDiscardPair1Button = createButton(roundBar, "bleedDiscardPairGloomhaven.svg",
            "Bleed 2 discard cards (before my turn)",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom + (5 * barButtonSize.height);
            }, function(round) {
                if (round.bleedDiscardPairCount < 1) {
                    round.bleedDiscardPairCount++;
                } else {
                    round.bleedDiscardPairCount--;
                }
                updateRounds();
            });
    bleedDiscardPair2Button = createButton(roundBar, "bleedDiscardPairGloomhaven.svg",
            "Bleed 2 discard cards (before my turn)",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom + (6 * barButtonSize.height);
            }, function(round) {
                if (round.bleedDiscardPairCount < 2) {
                    round.bleedDiscardPairCount++;
                } else {
                    round.bleedDiscardPairCount--;
                }
                updateRounds();
            });
}


function updateChart() {
    handCardBar
            .attr("y", function (round) {
                return yRange(round.handCardSize);
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(round.handCardSize);
            });
    discardCardBar
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize);
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(round.discardCardSize);
            });
    revivingEtherLine
            .attr("visibility", function (round) {
                return round.revivingEther ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(selectedCharacter.handLimit);
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(selectedCharacter.handLimit);
            });
    revivingEtherText
            .attr("visibility", function (round) {
                return round.revivingEther ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(selectedCharacter.handLimit + 1);
            });
    shortRestLine
            .attr("visibility", function (round) {
                return round.shortRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + 1);
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(round.discardCardSize + round.handCardSize + 1);
            });
    shortRestText
            .attr("visibility", function (round) {
                return round.shortRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + 2);
            });
    longRestBar
            .attr("visibility", function (round) {
                return round.longRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize);
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(round.discardCardSize + round.handCardSize);
            });
    longRestText
            .attr("visibility", function (round) {
                return round.longRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + 1);
            });
    longRestButton
            .attr("visibility", function (round) {
                return round.longRest ? "hidden" : "visible";
            });
    playLostCard1Button
            .attr("visibility", function (round) {
                return round.playLostCardCount >= 1 ? "hidden" : "visible";
            });
    playLostCard2Button
            .attr("visibility", function (round) {
                return round.playLostCardCount >= 2 ? "hidden" : "visible";
            });
    bleedHandCard1Button
            .attr("visibility", function (round) {
                return round.bleedHandCardCount >= 1 ? "hidden" : "visible";
            });
    bleedHandCard2Button
            .attr("visibility", function (round) {
                return round.bleedHandCardCount >= 2 ? "hidden" : "visible";
            });
    bleedDiscardPair1Button
            .attr("visibility", function (round) {
                return round.bleedDiscardPairCount >= 1 ? "hidden" : "visible";
            });
    bleedDiscardPair2Button
            .attr("visibility", function (round) {
                return round.bleedDiscardPairCount >= 2 ? "hidden" : "visible";
            });

}

function createButton(roundBar, svgFile, toolTip, xFunction, yFunction, clickFunction) {
    roundBar.append("image")
            .attr("xlink:href",svgFile)
            .attr("class", "barButton")
            .attr("x", xFunction)
            .attr("width", xRange.bandwidth())
            .attr("y", yFunction)
            .attr("height", barButtonSize.height)
            .on("click", clickFunction)
            .append("title").text(toolTip);
    var button = roundBar
            .append("rect")
            .attr("class", "barButtonGrayScaleHack")
            .attr("x", xFunction)
            .attr("width", xRange.bandwidth())
            .attr("y", yFunction)
            .attr("height", barButtonSize.height)
            .on("click", clickFunction);
    button.append("title").text(toolTip);
    return button;
}
