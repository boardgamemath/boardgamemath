var cards;

initCards();
initChart();
updateProbabilities();

function Card(name, additionModifier, multiplierModifier, initialCount) {
    this.name = name;
    this.additionModifier = additionModifier;
    this.multiplierModifier = multiplierModifier;
    this.initialCount = initialCount;
    this.count = initialCount;
    this.probability = 0.0;
}

function initCards() {
    cards = [
        new Card("Miss", 0, 0, 1),
        new Card("-2", -2, 1, 1),
        new Card("-1", -1, 1, 4),
        new Card("0", 0, 1, 5),
        new Card("+1", 1, 1, 4),
        new Card("+2", 2, 1, 1),
        new Card("Double", 0, 2, 1)
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
    var countTotal = 0;
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        countTotal += card.count;
    }
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        card.probability = card.count / countTotal;
    }
    updateChart();
}

function initChart() {
    outerSize = {width: 400, height: 300};
    margin = {top: 20, right: 30, bottom: 40, left: 40};
    barButtonCount = 3;
    barButtonSize = {width: 20, height: 20};
    innerSize = {width: outerSize.width - margin.left - margin.right,
        height: outerSize.height - margin.top - margin.bottom - (barButtonCount * barButtonSize.height)};

    chart = d3.select(".chart")
            .attr("width", outerSize.width)
            .attr("height", outerSize.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xRange = d3.scaleBand()
            // .domain(d3.range(0, cards.length))
            .domain(cards.map(function(card) { return card.name; }))
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
            .text("Card");

    yRange = d3.scaleLinear()
            .domain([0, 1])
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
            .text("Probability");

    var cardBar = chart.selectAll(".cardBar")
            .data(cards)
            .enter().append("g")
            .attr("class", "cardBar");

    drawProbabilityBar = cardBar.append("rect")
            .attr("class", "drawProbability")
            .attr("x", function (card) {
                return xRange(card.name);
            })
            .attr("width", xRange.bandwidth());
    drawProbabilityText = cardBar.append("text")
            .attr("class", "drawProbability")
            .attr("x", function (card) {
                return xRange(card.name) + xRange.bandwidth() / 2;
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("%");
    cardCountUp = createButton(cardBar, "../../website/custom/upChevron.svg",
            "Add a card",
            function (card) {
                return xRange(card.name);
            }, function (card) {
                return innerSize.height + margin.bottom;
            }, function(card) {
                card.count++;
                updateProbabilities();
            });
    cardCountText = cardBar.append("text")
            .attr("class", "barButton")
            .attr("x", function (card) {
                return xRange(card.name) + xRange.bandwidth() / 2;
            })
            .attr("y", function (card) {
                return innerSize.height + margin.bottom + barButtonSize.height;
            })
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("?");
    cardCountDown = createButton(cardBar, "../../website/custom/downChevron.svg",
            "Add a card",
            function (card) {
                return xRange(card.name);
            }, function (card) {
                return innerSize.height + margin.bottom + (2 * barButtonSize.height);
            }, function(card) {
                if (card.count > 0) {
                    card.count--;
                    updateProbabilities();
                }
            });
}

function updateChart() {
    drawProbabilityBar
            .attr("y", function (card) {
                return yRange(card.probability);
            })
            .attr("height", function (card) {
                return innerSize.height - yRange(card.probability);
            });
    drawProbabilityText
            .attr("y", function (card) {
                return yRange(card.probability + 0.1);
            })
            .text(function (card) {
                return Math.round(card.probability * 100.0) + "%";
            });
    cardCountText
            .text(function (card) {
                return card.count.toString();
            });
}

function createBooleanButton(cardBar, svgFile, toolTip, xFunction, yFunction, clickFunction) {
    cardBar.append("image")
            .attr("xlink:href", svgFile)
            .attr("class", "barButton")
            .attr("x", xFunction)
            .attr("width", xRange.bandwidth())
            .attr("y", yFunction)
            .attr("height", barButtonSize.height)
            .on("click", clickFunction)
            .append("title").text(toolTip);
    var button = cardBar
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

function createButton(cardBar, svgFile, toolTip, xFunction, yFunction, clickFunction) {
    var button = cardBar.append("image")
            .attr("xlink:href", svgFile)
            .attr("class", "barButton")
            .attr("x", xFunction)
            .attr("width", xRange.bandwidth())
            .attr("y", yFunction)
            .attr("height", barButtonSize.height)
            .on("click", clickFunction)
            .append("title").text(toolTip);
    return button;
}
