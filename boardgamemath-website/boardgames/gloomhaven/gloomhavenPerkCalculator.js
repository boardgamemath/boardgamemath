var cards;
var cardCountTotal;
var nonRollingCountTotal;
var attacks;
var reliabilities;

initCards();
initAttacks();
initReliabilities();
initCardsChart();
initAttacksChart();
initReliabilitiesChart();
updateProbabilities();

function Card(name, additionModifier, multiplierModifier, rolling, initialCount) {
    this.name = name;
    this.additionModifier = additionModifier;
    this.multiplierModifier = multiplierModifier;
    this.rolling = rolling;
    this.initialCount = initialCount;
    this.count = initialCount;
    this.probability = 0.0;
}

function initCards() {
    // Keep in sync with updateReliabilities()
    cards = [
        new Card("×0", 0, 0, false, 1),
        new Card("-2", -2, 1, false, 1),
        new Card("-1", -1, 1, false, 5),
        new Card("0", 0, 1, false, 6),
        new Card("+1", 1, 1, false, 5),
        new Card("+2", 2, 1, false, 1),
        new Card("+3", 3, 1, false, 0),
        new Card("+4", 4, 1, false, 0),
        new Card("×2", 0, 2, false, 1),
        new Card("r+1", 1, 0, true, 0),
        new Card("r+2", 2, 0, true, 0)
    ];
}

function resetDeck() {
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        card.count = card.initialCount;
    }
    updateProbabilities();
}

function updateProbabilities() {
    cardCountTotal = 0;
    nonRollingCountTotal = 0;
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.rolling) {
            nonRollingCountTotal += card.count;
        }
        cardCountTotal += card.count;
    }
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.rolling) {
            // When drawing a rolling, keep drawing until we draw a non-rolling
            card.probability = card.count / nonRollingCountTotal;
        } else {
            // For every single rolling card, when drawing another rolling card of the same type, keep drawing.
            // So each single card has probability: 1 / (nonRollingCountTotal + 1)
            // So together their influence is that probability multiplied by count
            // Other proof, by example: given 4 rolling +1 cards and 10 non-rolling cards.
            // Probability 1th card: 4/14
            // Probability 2th card: 4/14 * 3/13
            // Probability 3th card: 4/14 * 3/13 * 2/12
            // Probability 4th card: 4/14 * 3/13 * 2/12 * 1/11
            // Sum probability: 4/11 which is count / (nonRollingCountTotal + 1)
            card.probability = card.count / (nonRollingCountTotal + 1);
        }
    }
    updateCardsChart();
    updateAttacks();
    updateReliabilities();
}

function initCardsChart() {
    outerSize = {width: 400, height: 300};
    margin = {top: 20, right: 30, bottom: 40, left: 50};
    barButtonCount = 3;
    barButtonSize = {width: 20, height: 20};
    innerSize = {width: outerSize.width - margin.left - margin.right,
        height: outerSize.height - margin.top - margin.bottom - (barButtonCount * barButtonSize.height)};

    cardsChart = d3.select(".cardsChart")
            .attr("width", outerSize.width)
            .attr("height", outerSize.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    cardsX = d3.scaleBand()
            .domain(cards.map(function(card) { return card.name; }))
            .range([0, innerSize.width])
            .padding(0.1);
    cardsChart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerSize.height + ")")
            .call(d3.axisBottom().scale(cardsX));
    cardsChart.append("text")
            .attr("transform",
                    "translate(" + (innerSize.width / 2) + " ," + (innerSize.height + margin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text("Card");

    cardsY = d3.scaleLinear()
            .domain([0, 1])
            .range([innerSize.height, 0]);
    cardsChart.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft().scale(cardsY));
    cardsChart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (innerSize.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Probability (sum per attack)");

    var cardBar = cardsChart.selectAll(".cardBar")
            .data(cards)
            .enter().append("g")
            .attr("class", "cardBar");

    drawProbabilityBar = cardBar.append("rect")
            .attr("class", "drawProbability")
            .attr("x", function (card) {
                return cardsX(card.name);
            })
            .attr("width", cardsX.bandwidth());
    drawProbabilityText = cardBar.append("text")
            .attr("class", "drawProbability")
            .attr("x", function (card) {
                return cardsX(card.name) + cardsX.bandwidth() / 2;
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("%");
    cardCountUp = createButton(cardBar, "../../website/custom/upChevron.svg",
            "Add a card",
            function (card) {
                return cardsX(card.name);
            }, function (card) {
                return innerSize.height + margin.bottom;
            }, function(card) {
                if (card.count < 20) {
                    card.count++;
                }
                updateProbabilities();
            });
    cardCountText = cardBar.append("text")
            .attr("class", "barButton")
            .attr("x", function (card) {
                return cardsX(card.name) + cardsX.bandwidth() / 2;
            })
            .attr("y", function (card) {
                return innerSize.height + margin.bottom + barButtonSize.height;
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("?");
    cardCountDown = createButton(cardBar, "../../website/custom/downChevron.svg",
            "Remove a card",
            function (card) {
                return cardsX(card.name);
            }, function (card) {
                return innerSize.height + margin.bottom + (2 * barButtonSize.height);
            }, function(card) {
                if (card.count > 0) {
                    card.count--;
                    updateProbabilities();
                }
            });
}

function updateCardsChart() {
    drawProbabilityBar
            .attr("y", function (card) {
                return cardsY(card.probability);
            })
            .attr("height", function (card) {
                return innerSize.height - cardsY(card.probability);
            });
    drawProbabilityText
            .attr("y", function (card) {
                return cardsY(card.probability) - 20;
            })
            .text(function (card) {
                return Math.round(card.probability * 100.0) + "%";
            });
    cardCountText
            .text(function (card) {
                return card.count.toString();
            });
}

function createButton(cardBar, svgFile, toolTip, xFunction, yFunction, clickFunction) {
    var button = cardBar.append("image")
            .attr("xlink:href", svgFile)
            .attr("class", "barButton")
            .attr("x", xFunction)
            .attr("width", cardsX.bandwidth())
            .attr("y", yFunction)
            .attr("height", barButtonSize.height)
            .on("click", clickFunction)
            .append("title").text(toolTip);
    return button;
}

function Reliability(name, minimumAddition, maximumAddition) {
    this.name = name;
    this.minimumAddition = minimumAddition;
    this.maximumAddition = maximumAddition;
    this.probability = 0.0;
}

function initReliabilities() {
    reliabilities = [
        new Reliability("≤ -1", Number.MIN_SAFE_INTEGER, -1),
        new Reliability("= 0", 0, 0),
        new Reliability("≥ +1", 1, Number.MAX_SAFE_INTEGER)
    ];
}

function updateReliabilities() {
    var reliabilityNegative = reliabilities[0];
    var reliabilityNeutral = reliabilities[1];
    var reliabilityPositive = reliabilities[2];
    var rollingOneCard = cards[9];
    var rollingTwoCard = cards[10];

    reliabilityNegative.probability = 0.0;
    reliabilityNeutral.probability = 0.0;
    reliabilityPositive.probability = 0.0;

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.rolling && card.count > 0) {
            if (card.multiplierModifier !== 1) {
                if (card.multiplierModifier < 1) {
                    reliabilityNegative.probability += card.probability;
                } else {
                    reliabilityPositive.probability += card.probability;
                }
            } else {
                // Using rollingCard.probability here would be wrong because it is a sum per attack
                var rollingOneOrHigherProbability
                        = (rollingOneCard.count + rollingTwoCard.count) / cardCountTotal;
                var rollingTwoOrHigherProbability
                        // First card is rolling two
                        = (rollingTwoCard.count / cardCountTotal)
                        // First card is rolling one
                        + (rollingOneCard.count / cardCountTotal)
                                // Second card is rolling one or two
                                * ((Math.max(0, rollingOneCard.count - 1) + rollingTwoCard.count) / Math.max(1, cardCountTotal - 1));
                var rollingThreeOrHigherProbability
                        // First card is rolling two
                        = (rollingTwoCard.count / cardCountTotal)
                            // Second card is rolling one or two
                            * ((rollingOneCard.count + Math.max(0, rollingTwoCard.count - 1)) / Math.max(1, cardCountTotal - 1))
                        // First card is rolling one
                        + (rollingOneCard.count / cardCountTotal)
                            // Second card is rolling two
                            * (rollingTwoCard.count / Math.max(1, cardCountTotal - 1))
                        // First card is rolling one
                        + (rollingOneCard.count / cardCountTotal)
                            // Second card is rolling one
                            * (Math.max(0, rollingOneCard.count - 1) / Math.max(1, cardCountTotal - 1))
                            // Third card is rolling one or two
                            * ((Math.max(0, rollingOneCard.count - 2) + rollingTwoCard.count) / Math.max(1, cardCountTotal - 2));
                if (card.additionModifier > 0) {
                    reliabilityPositive.probability += card.probability;
                } else if (card.additionModifier === 0) {
                    reliabilityNeutral.probability += card.probability * (1.0 - rollingOneOrHigherProbability);
                    reliabilityPositive.probability += card.probability * rollingOneOrHigherProbability;
                } else if (card.additionModifier === -1) {
                    reliabilityNegative.probability += card.probability * (1.0 - rollingOneOrHigherProbability);
                    reliabilityNeutral.probability += card.probability * (rollingOneOrHigherProbability - rollingTwoOrHigherProbability);
                    reliabilityPositive.probability += card.probability * rollingTwoOrHigherProbability;
                } else if (card.additionModifier === -2) {
                    reliabilityNegative.probability += card.probability * (1.0 - rollingTwoOrHigherProbability);
                    reliabilityNeutral.probability += card.probability * (rollingTwoOrHigherProbability - rollingThreeOrHigherProbability);
                    reliabilityPositive.probability += card.probability * rollingThreeOrHigherProbability;
                }
            }
        }
    }
    updateReliabilitiesChart();
}

function initReliabilitiesChart() {
    reliabilitiesOutersize = {width: 200, height: 300};
    reliabilitiesMargin = {top: 20, right: 30, bottom: 40, left: 50};
    reliabilitiesInnerSize = {width: reliabilitiesOutersize.width - reliabilitiesMargin.left - reliabilitiesMargin.right,
        height: reliabilitiesOutersize.height - reliabilitiesMargin.top - reliabilitiesMargin.bottom};

    reliabilitiesChart = d3.select(".reliabilitiesChart")
            .attr("width", reliabilitiesOutersize.width)
            .attr("height", reliabilitiesOutersize.height)
            .append("g")
            .attr("transform", "translate(" + reliabilitiesMargin.left + "," + reliabilitiesMargin.top + ")");

    reliabilitiesX = d3.scaleBand()
            .domain(reliabilities.map(function(reliability) { return reliability.name; }))
            .range([0, reliabilitiesInnerSize.width])
            .padding(0.1);
    reliabilitiesChart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + reliabilitiesInnerSize.height + ")")
            .call(d3.axisBottom().scale(reliabilitiesX));
    reliabilitiesChart.append("text")
            .attr("transform",
                    "translate(" + (reliabilitiesInnerSize.width / 2) + " ," + (reliabilitiesInnerSize.height + reliabilitiesMargin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text("Modification");

    reliabilitiesY = d3.scaleLinear()
            .domain([0, 1])
            .range([reliabilitiesInnerSize.height, 0]);
    reliabilitiesChart.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft().scale(reliabilitiesY));
    reliabilitiesChart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - reliabilitiesMargin.left)
            .attr("x",0 - (reliabilitiesInnerSize.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Reliability");

    var reliabilityBar = reliabilitiesChart.selectAll(".reliabilityBar")
            .data(reliabilities)
            .enter().append("g")
            .attr("class", "reliabilityBar");

    reliabilityProbabilityBar = reliabilityBar.append("rect")
            .attr("class", "reliabilityProbability")
            .attr("x", function (reliability) {
                return reliabilitiesX(reliability.name);
            })
            .attr("width", reliabilitiesX.bandwidth());
    reliabilityProbabilityText = reliabilityBar.append("text")
            .attr("class", "reliabilityProbability")
            .attr("x", function (reliability) {
                return reliabilitiesX(reliability.name) + reliabilitiesX.bandwidth() / 2;
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("%");
}

function updateReliabilitiesChart() {
    reliabilityProbabilityBar
            .attr("y", function (reliability) {
                return reliabilitiesY(reliability.probability);
            })
            .attr("height", function (reliability) {
                return reliabilitiesInnerSize.height - reliabilitiesY(reliability.probability);
            });
    reliabilityProbabilityText
            .attr("y", function (reliability) {
                return reliabilitiesY(reliability.probability) - 20;
            })
            .text(function (reliability) {
                return Math.round(reliability.probability * 100.0) + "%";
            });

}

function Attack(baseDamage) {
    this.baseDamage = baseDamage;
    this.averageDamage = baseDamage;
}

function initAttacks() {
    attacks = [
        new Attack(0),
        new Attack(1),
        new Attack(2),
        new Attack(3),
        new Attack(4),
        new Attack(5),
        new Attack(6),
        new Attack(7),
        new Attack(8),
        new Attack(9)
    ];
}

function updateAttacks() {
    var averageRollingAddition = calculateAverageRollingAddition();
    for (var i = 0; i < attacks.length; i++) {
        var attack = attacks[i];
        attack.averageDamage = averageRollingAddition;
        for (var j = 0; j < cards.length; j++) {
            var card = cards[j];
            if (!card.rolling) {
                var damage = (attack.baseDamage + card.additionModifier) * card.multiplierModifier;
                if (damage < 0) {
                    damage = 0;
                }
                attack.averageDamage += damage * card.probability;
            }
        }
    }
    updateAttacksChart();
}

function calculateAverageRollingAddition() {
    var averageRollingAddition = 0.0;
    for (var j = 0; j < cards.length; j++) {
        var card = cards[j];
        if (card.rolling) {
            averageRollingAddition += card.additionModifier * card.probability;
        }
    }
    // Multipliers (miss, critical hit) affect rolling card additions too
    return averageRollingAddition * calculateAverageMultiplier();
}

function calculateAverageMultiplier() {
    var multiplierSum = 0.0;
    var totalCardCount = 0;
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (!card.rolling) {
            multiplierSum += card.count * card.multiplierModifier;
            totalCardCount += card.count;
        }
    }
    if (totalCardCount === 0) {
        return 1.0;
    }
    return multiplierSum / totalCardCount;
}

function initAttacksChart() {
    attacksOutersize = {width: 400, height: 300};
    attacksMargin = {top: 20, right: 30, bottom: 40, left: 50};
    attacksInnerSize = {width: attacksOutersize.width - attacksMargin.left - attacksMargin.right,
        height: attacksOutersize.height - attacksMargin.top - attacksMargin.bottom};

    attacksChart = d3.select(".attacksChart")
            .attr("width", attacksOutersize.width)
            .attr("height", attacksOutersize.height)
            .append("g")
            .attr("transform", "translate(" + attacksMargin.left + "," + attacksMargin.top + ")");

    attacksX = d3.scaleBand()
            .domain(attacks.map(function(attack) { return attack.baseDamage; }))
            .range([0, attacksInnerSize.width])
            .padding(0.1);
    attacksChart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + attacksInnerSize.height + ")")
            .call(d3.axisBottom().scale(attacksX));
    attacksChart.append("text")
            .attr("transform",
                    "translate(" + (attacksInnerSize.width / 2) + " ," + (attacksInnerSize.height + attacksMargin.top + 15) + ")")
            .style("text-anchor", "middle")
            .text("Base damage");

    attacksY = d3.scaleLinear()
            .domain([0, 20])
            .range([attacksInnerSize.height, 0]);
    attacksChart.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft().scale(attacksY));
    attacksChart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - attacksMargin.left)
            .attr("x",0 - (attacksInnerSize.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Average damage");

    var attackBar = attacksChart.selectAll(".attackBar")
            .data(attacks)
            .enter().append("g")
            .attr("class", "attackBar");

    averageDamageBar = attackBar.append("rect")
            .attr("class", "averageDamage")
            .attr("x", function (attack) {
                return attacksX(attack.baseDamage);
            })
            .attr("width", attacksX.bandwidth());
    averageDamageText = attackBar.append("text")
            .attr("class", "averageDamage")
            .attr("x", function (attack) {
                return attacksX(attack.baseDamage) + attacksX.bandwidth() / 2;
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("%");
}

function updateAttacksChart() {
    averageDamageBar
            .attr("y", function (attack) {
                return attacksY(attack.averageDamage);
            })
            .attr("height", function (attack) {
                return attacksInnerSize.height - attacksY(attack.averageDamage);
            });
    averageDamageText
            .attr("y", function (attack) {
                return attacksY(attack.averageDamage) - 20;
            })
            .text(function (attack) {
                return attack.averageDamage.toFixed(2);
            });
}
