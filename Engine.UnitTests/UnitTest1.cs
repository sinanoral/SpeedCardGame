using System.Linq;
using Xunit;

namespace Engine.UnitTests;

public class UnitTest1
{
    [Theory]
    [InlineData(0, 1, true)]
    [InlineData(1, 0, true)]
    [InlineData(11, 12, true)]
    [InlineData(0, 12, true)]
    [InlineData(12, 0, true)]
    [InlineData(1, 3, false)]
    [InlineData(3, 1, false)]
    [InlineData(12, 1, false)]
    [InlineData(1, 12, false)]
    [InlineData(11, 0, false)]
    [InlineData(0, 11, false)]
    [InlineData(-1, 0, false)]
    [InlineData(0, -1, false)]
    public void PlayCard_Theory(int centerCard, int player1Card, bool expectedCanPlay)
    {
        // Arrange
        GameState gameState = ScenarioHelper.CreateGameBasic(centerCard, player1Card: player1Card);


        // Act
        // See if we have a play
        (bool canPlay, Card? card, int? centerPile) = GameEngine.PlayerHasPlay(gameState, gameState.Players[0]);

        // Try to play it
        (GameState? updatedGameState, string? errorMessage) tryPlay =
            GameEngine.TryPlayCard(gameState, gameState.Players[0].HandCards[0], 0);


        // Assertion
        Assert.Equal(expectedCanPlay, canPlay);
        Assert.Equal(expectedCanPlay, tryPlay.errorMessage == null);
        Assert.Equal(expectedCanPlay, tryPlay.updatedGameState != null);
        Assert.Equal(expectedCanPlay ? player1Card : null, tryPlay.updatedGameState?.CenterPiles[0].Last().Value);
    }

    [Theory]
    [InlineData(0, 1, true)]
    public void PickupCard_Theory(int centerCard, int player1Card, bool expectedCanPlay)
    {
        // Arrange
        GameState gameState = ScenarioHelper.CreateGameBasic(centerCard, player1Card: player1Card);


        // Act


        // Assertion
        // Assert.Equal(expectedCanPlay, canPlay);
    }
}