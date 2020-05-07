var MAX_ROUNDS = 36;
var MAX_HAND_LIMIT = 12;
var characters;
var selectedCharacter;
var rounds;
var roundCount;

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
    this.minorStaminaPot = false;
    this.majorStaminaPot = false;
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
        round.minorStaminaPot = false;
        round.majorStaminaPot = false;
    }
}

function updateRounds() {
    roundCount = "";
    var handCardSize = selectedCharacter.handLimit;
    var discardCardSize = 0;
    var revivingEtherAvailable = selectedCharacter.revivingEtherAvailable;
    var exhausted = false;
    for (var i = 0; i < rounds.length; i++) {
        var round = rounds[i];
        if (exhausted) {
            round.handCardSize = 0;
            round.discardCardSize = 0;
            round.revivingEther = false;
            round.shortRest = false;
            round.longRest = false;
            round.playLostCardCount = 0;
            round.bleedHandCardCount = 0;
            round.bleedDiscardPairCount = 0;
            round.minorStaminaPot = false;
            round.majorStaminaPot = false;
            continue;
        }
        if (round.longRest && discardCardSize < 1) {
            // Illegal to do a long rest
            round.longRest = false;
            round.minorStaminaPot = false;
            round.majorStaminaPot = false;
        }
        var playCardSize;
        if (round.longRest) {
            round.shortRest = false;
            // No opportunity to play lost cards
            round.playLostCardCount = 0;
            playCardSize = 0;
        } else if (handCardSize < 2) {
            if (discardCardSize < 2 || (discardCardSize === 2 && handCardSize === 0)) {
                // Exhausted by inability to play 2 cards at start of round (not turn!)
                exhausted = true;
                roundCount = i.toString();
                round.handCardSize = 0;
                round.discardCardSize = 0;
                round.revivingEther = false;
                round.shortRest = false;
                round.longRest = false;
                round.playLostCardCount = 0;
                round.bleedHandCardCount = 0;
                round.bleedDiscardPairCount = 0;
                round.minorStaminaPot = false;
                round.majorStaminaPot = false;
                continue;
            } else {
                // Automatic short rest
                handCardSize += discardCardSize - 1;
                discardCardSize = 0;
                round.shortRest = true;
                playCardSize = 2;
            }
        } else {
            round.shortRest = false;
            playCardSize = 2;
        }
        // Cards played at the beginning of the round can't be bled
        if (round.bleedHandCardCount > (handCardSize - playCardSize)) {
            round.bleedHandCardCount = (handCardSize - playCardSize);
        }
        handCardSize -= round.bleedHandCardCount;
        if (round.bleedDiscardPairCount * 2 > discardCardSize) {
            round.bleedDiscardPairCount = Math.floor(discardCardSize / 2);
        }
        discardCardSize -= (round.bleedDiscardPairCount * 2);
        round.handCardSize = handCardSize;
        round.discardCardSize = discardCardSize;
        round.revivingEther = false;
        if (round.longRest) { // Long rest
            handCardSize += discardCardSize - 1;
            discardCardSize = 0;
        } else { // Normal play
            handCardSize -= playCardSize;
            discardCardSize += playCardSize - round.playLostCardCount;
            if (revivingEtherAvailable && handCardSize < 2
                    && (discardCardSize < 2 || (discardCardSize === 2 && handCardSize === 0))) {
                round.revivingEther = true;
                if (round.playLostCardCount === 0) {
                    round.playLostCardCount = discardCardSize;
                    discardCardSize = 0;
                }
                handCardSize += (selectedCharacter.handLimit - handCardSize - discardCardSize) - 1;
                revivingEtherAvailable = false;
            }
            if (round.discardCardSize + round.handCardSize > 0 && round.minorStaminaPot) {
                recoverCount = Math.min(2, discardCardSize)
                handCardSize += recoverCount
                discardCardSize -= recoverCount
            }
            if (round.discardCardSize + round.handCardSize > 0 && round.majorStaminaPot) {
                recoverCount = Math.min(3, discardCardSize)
                handCardSize += recoverCount
                discardCardSize -= recoverCount
            }
        }
    }
    if (!exhausted) {
        roundCount = "?"
    }
    updateChart();
}

function initChart() {
    outerSize = {width: 800, height: 400};
    margin = {top: 20, right: 30, bottom: 40, left: 40};
    barButtonCount = 9;
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
            .style("text-anchor", "middle");
    revivingEtherText.append("tspan")
            .attr("dy", -20)
            .attr("x", function (round) {
                return xRange(round.number + 1);
            }).text("reviving");
    revivingEtherText.append("tspan")
            .attr("dy", 15)
            .attr("x", function (round) {
                return xRange(round.number + 1);
            }).text("ether");
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
            .style("text-anchor", "middle");
    shortRestText.append("tspan")
            .attr("dy", -20)
            .attr("x", function (round) {
                return xRange(round.number);
            }).text("short");
    shortRestText.append("tspan")
            .attr("dy", 15)
            .attr("x", function (round) {
                return xRange(round.number);
            }).text("rest");
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
            .style("text-anchor", "middle");
    longRestText.append("tspan")
            .attr("dy", -20)
            .attr("x", function (round) {
                return xRange(round.number) + (xRange.bandwidth() / 2);
            }).text("long");
    longRestText.append("tspan")
            .attr("dy", 15)
            .attr("x", function (round) {
                return xRange(round.number) + (xRange.bandwidth() / 2);
            }).text("rest");
    longRestButton = createBooleanButton(roundBar, "longRestGloomhaven.svg",
            "Take a long rest in my turn",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + margin.bottom;
            }, function(round) {
                round.longRest = !round.longRest;
                updateRounds();
            });
    playLostCard1Button = createBooleanButton(roundBar, "lostCardGloomhaven.svg",
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
    playLostCard2Button = createBooleanButton(roundBar, "lostCardGloomhaven.svg",
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
    bleedHandCard1Button = createBooleanButton(roundBar, "bleedHandCardGloomhaven.svg",
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
    bleedHandCard2Button = createBooleanButton(roundBar, "bleedHandCardGloomhaven.svg",
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
    bleedDiscardPair1Button = createBooleanButton(roundBar, "bleedDiscardPairGloomhaven.svg",
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
    bleedDiscardPair2Button = createBooleanButton(roundBar, "bleedDiscardPairGloomhaven.svg",
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
    minorStaminaButton = createBooleanButton(roundBar, "minorStaminaGloomhaven.svg",
            "Use a minor stamina potion",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + (9 * barButtonSize.height);
            }, function(round) {
                round.minorStaminaPot = !round.minorStaminaPot;
                updateRounds();
            });
    majorStaminaButton = createBooleanButton(roundBar, "majorStaminaGloomhaven.svg",
            "Use a major stamina potion",
            function (round) {
                return xRange(round.number);
            }, function (round) {
                return innerSize.height + (10 * barButtonSize.height);
            }, function(round) {
                round.majorStaminaPot = !round.majorStaminaPot;
                updateRounds();
            });
    roundCountText = chart.append("text")
            .attr("class", "roundCount")
            .attr("transform",
                    "translate(" + (innerSize.width / 2) + " ,10)")
            .style("text-anchor", "middle");
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
                return yRange(selectedCharacter.handLimit);
            });
    shortRestLine
            .attr("visibility", function (round) {
                return round.shortRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + round.bleedHandCardCount + (round.bleedDiscardPairCount * 2) + 1);
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(round.discardCardSize + round.handCardSize + round.bleedHandCardCount + (round.bleedDiscardPairCount * 2) + 1);
            });
    shortRestText
            .attr("visibility", function (round) {
                return round.shortRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + round.bleedHandCardCount + (round.bleedDiscardPairCount * 2) + 1);
            });
    longRestBar
            .attr("visibility", function (round) {
                return round.longRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + round.bleedHandCardCount + (round.bleedDiscardPairCount * 2));
            })
            .attr("height", function (round) {
                return innerSize.height - yRange(round.discardCardSize + round.handCardSize + round.bleedHandCardCount + (round.bleedDiscardPairCount * 2));
            });
    longRestText
            .attr("visibility", function (round) {
                return round.longRest ? "visible" : "hidden";
            })
            .attr("y", function (round) {
                return yRange(round.discardCardSize + round.handCardSize + round.bleedHandCardCount + (round.bleedDiscardPairCount * 2));
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
    minorStaminaButton
            .attr("visibility", function (round) {
                return round.minorStaminaPot ? "hidden" : "visible";
            });
    majorStaminaButton
            .attr("visibility", function (round) {
                return round.majorStaminaPot ? "hidden" : "visible";
            });
    roundCountText.text(roundCount + " rounds before exhaustion");
}

function createBooleanButton(roundBar, svgFile, toolTip, xFunction, yFunction, clickFunction) {
    roundBar.append("image")
            .attr("xlink:href", svgFile)
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
