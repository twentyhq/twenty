# Gamification

Sales gamification with leaderboards, badges, points, challenges, and streak tracking to drive team performance.

## Entities
- `LeaderboardEntryEntity` — userId, period, dealsWon, revenue, activitiesCompleted, points, rank
- Badge entities with types: deals_won, revenue_milestone, streak, speed, team_player, custom

## Service Methods
- `GamificationService` — calculates leaderboard rankings by period, awards badges on milestones, tracks activity streaks, manages point systems, runs sales challenges

## Feature Flag
`IS_MODULE_GAMIFICATION_ENABLED`

## Dependencies
- None
