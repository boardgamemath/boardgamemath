package com.boardgamemath.calculations.gloomhaven.domain;

public enum CharacterClass {
    CRAGHEART("Cragheart", true,
            new Card("Opposing Strike", 1, 46),
            new Card("Crushing Grasp", 1, 35),
            new Card("Avalanche", 1, 75),
            new Card("Rumbling Advance", 1, 29),
            new Card("Massive Boulder", 1, 87),
            new Card("Backup Ammunition", 1, 77),
            new Card("Rock Tunnel", 1, 41),
            new Card("Unstable Upheaval", 1, 13),
            new Card("Crater", 1, 61),
            new Card("Dirt Tornado", 1, 82),
            new Card("Earthen Clod", 1, 38),
            new Card("Heaving Swing", 1, 57),
            new Card("Forceful Storm", 1, 53),
            new Card("Nature's Lift", 1, 64),
            new Card("Explosive Punch", 2, 28),
            new Card("Sentient Growth", 2, 78),
            new Card("Clear the Way", 3, 43),
            new Card("Blunt Force", 3, 21),
            new Card("Rock Slide", 4, 81),
            new Card("Kinetic Assault", 4, 19),
            new Card("Petrify", 5, 47),
            new Card("Stone Pummel", 5, 32),
            new Card("Dig Pit", 6, 78),
            new Card("Cataclysm", 6, 26),
            new Card("Meteor", 7, 23),
            new Card("Brutal Momentum", 7, 52),
            new Card("Rocky End", 8, 37),
            new Card("Lumbering Bash", 8, 85),
            new Card("Blind Destruction", 9, 74),
            new Card("Pulverize", 9, 31)
            ),
    MINDTHIEF("Mindthief", true,
            new Card("Submissive Affliction", 1, 48),
            new Card("Into the Night", 1, 14),
            new Card("Fearsome Blade", 1, 27),
            new Card("Feedback loop", 1, 79),
            new Card("Gnawing Horde", 1, 82),
            new Card("The Mind's Weakness", 1, 75),
            new Card("Parasitic Influence", 1, 71),
            new Card("Scurry", 1, 20),
            new Card("Perverse Edge", 1, 8),
            new Card("Empathic Assault", 1, 11),
            new Card("Withering Claw", 1, 77),
            new Card("Possession", 1, 51),
            new Card("Frigid Apparition", 1, 29),
            new Card("Wretched Creature", 2, 84),
            new Card("Hostile Takeover", 2, 9),
            new Card("Brain Leech", 3, 16),
            new Card("Silent Scream", 3, 73),
            new Card("Pilfer", 4, 68),
            new Card("Cranium Overload", 4, 5),
            new Card("Mass Hysteria", 5, 12),
            new Card("Frozen Mind", 5, 81),
            new Card("Corrupting Embrace", 6, 39),
            new Card("Dark Frenzy", 6, 10),
            new Card("Vicious Blood", 7, 83),
            new Card("Psychic Projection", 7, 92),
            new Card("Shared Nightmare", 8, 7),
            new Card("Domination", 8, 13),
            new Card("Many as One", 9, 91),
            new Card("Phantasmal Killer", 9, 67)
            );

    private final String name;
    private final boolean startingClass;
    private final Card[] cards;

    CharacterClass(String name, boolean startingClass, Card... cards) {
        this.name = name;
        this.startingClass = startingClass;
        this.cards = cards;
    }

}
