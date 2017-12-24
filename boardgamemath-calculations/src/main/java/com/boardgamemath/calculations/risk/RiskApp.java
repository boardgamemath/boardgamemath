package com.boardgamemath.calculations.risk;

import java.util.Random;

public class RiskApp {

    private static final int SIMULATION_COUNT = 100_000;

    public static void main(String[] args) {
        simulateAttacks(1, 10);
        simulateAttacks(10, 1);
        simulateAttacks(10, 10);
        simulateAttacks(20, 20);
        simulateAttacks(100, 100);
    }

    private static void simulateAttacks(int attackArmy, int defendArmy) {
        Random random = new Random();
        int attackWins = 0;
        int defendWins = 0;
        long totalAttackScore = 0L;
        for (int i = 0; i < SIMULATION_COUNT; i++) {
            RiskBattleSimulation simulation = new RiskBattleSimulation(attackArmy, defendArmy);
            while (!simulation.hasWinner()) {
                simulation.simulateBattle(random);
            }
            if (simulation.wonByAttacker()) {
                attackWins++;
            } else {
                defendWins++;
            }
            totalAttackScore += simulation.getAttackScore();
        }
        double averageAttackScore = ((double) totalAttackScore) / SIMULATION_COUNT;
        System.out.printf("%4d attackers vs %4d defenders: %d attacker wins, %d defender wins, %.2f average %s army leftover.\n",
                attackArmy, defendArmy, attackWins, defendWins, Math.abs(averageAttackScore),
                averageAttackScore > 0.0 ? "attacker" : "defender");
    }

}
