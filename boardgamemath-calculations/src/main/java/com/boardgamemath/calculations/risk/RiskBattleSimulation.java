package com.boardgamemath.calculations.risk;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Random;

public class RiskBattleSimulation {

    private static final int DICE_SIDE_COUNT = 6;
    private static final int SECOND_DICE_LIMIT = 4 - 1; // Dice 4 has index 3

    private int attackArmy;
    private int defendArmy;

    public RiskBattleSimulation(int attackArmy, int defendArmy) {
        this.attackArmy = attackArmy;
        this.defendArmy = defendArmy;
    }

    public void simulateBattle(Random random) {
        int attackDiceSize = 3;
        if (attackArmy < attackDiceSize) {
            // Attacker army size too small
            attackDiceSize = attackArmy;
        }
        Integer[] attackDice = new Integer[attackDiceSize];
        for (int i = 0; i < attackDiceSize; i++) {
            attackDice[i] = random.nextInt(DICE_SIDE_COUNT);
        }
        Arrays.sort(attackDice, Comparator.reverseOrder());
        int defendDiceSize;
        if (attackDice.length <= 1) {
            // Attack threw with 1 dice
            defendDiceSize = 2;
        } else {
            if (attackDice[1] >= SECOND_DICE_LIMIT) {
                // Defend chooses to only throw 1 dice to minimize losses
                defendDiceSize = 1;
            } else {
                defendDiceSize = 2;
            }
        }
        if (defendArmy < defendDiceSize) {
            // Defender army size too small
            defendDiceSize = defendArmy;
        }
        Integer[] defendDice = new Integer[defendDiceSize];
        for (int i = 0; i < defendDiceSize; i++) {
            defendDice[i] = random.nextInt(DICE_SIDE_COUNT);
        }
        Arrays.sort(defendDice, Comparator.reverseOrder());
        int fightSize = Math.min(attackDiceSize, defendDiceSize);
        for (int i = 0; i < fightSize; i++) {
            if (attackDice[i] > defendDice[i]) {
                defendArmy--;
            } else {
                attackArmy--;
            }
        }
    }

    public boolean hasWinner() {
        return attackArmy == 0 || defendArmy == 0;
    }

    public boolean wonByAttacker() {
        return attackArmy > 0 ;
    }

    public int getAttackScore() {
        return attackArmy - defendArmy;
    }

}
