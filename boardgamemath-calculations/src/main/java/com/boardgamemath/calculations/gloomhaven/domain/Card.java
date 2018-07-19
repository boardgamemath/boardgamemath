package com.boardgamemath.calculations.gloomhaven.domain;

public class Card {

    private String name;
    private int level;
    private int initiative;

    public Card(String name, int level, int initiative) {
        this.name = name;
        this.level = level;
        if (level < 1 || level > 9) {
            throw new IllegalStateException("Illegal level (" + level + ").");
        }
        this.initiative = initiative;
        if (initiative < 1 || initiative > 99) {
            throw new IllegalStateException("Illegal initiative (" + initiative + ").");
        }
    }

    public String getName() {
        return name;
    }

    public int getLevel() {
        return level;
    }

    public int getInitiative() {
        return initiative;
    }

}
