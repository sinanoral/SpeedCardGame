namespace Server;

using System.Collections.Concurrent;
using System.Collections.Immutable;
using Engine;
using Engine.Models;

public class GameStateDto
{
    public List<PlayerDto> Players { get; }
    public List<CenterPile> CenterPiles { get; }
    public string LastMove { get; }
    public string? WinnerId { get; }
    public bool MustTopUp { get; }

    public GameStateDto(GameState gameState, List<GameParticipant> connections)
    {
        Players = gameState.Players
            .Select(p => new PlayerDto(p, GetPlayersId(p, connections)))
            .ToList();

        MustTopUp = Players.All(p => p.CanRequestTopUp || p.RequestingTopUp);

        // Only send the top 3
        CenterPiles = gameState.CenterPiles
            .Select(
                (pile, i) => new CenterPile { Cards = pile.Cards.TakeLast(3).ToImmutableList() }
            )
            .ToList();
        LastMove = gameState.LastMove;
        gameState.WinnerIndex WinnerId = gameEngine.Checks
            .TryGetWinner(gameState)
            .Map(
                x =>
                {
                    return connections.Single(c => c.PlayerIndex == x).PersistentPlayerId as Guid?;
                },
                _ => null
            )
            ?.ToString();
    }

    // todo: hash playerId
    private static string GetPlayersId(Player player, List<GameParticipant> connections) =>
        connections.SingleOrDefault(c => c.PlayerIndex == player.Id)?.PersistentPlayerId.ToString()
        ?? player.Id.ToString();
}
