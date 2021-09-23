class Game {

    static Player = {
        white: 1,
        black: 2,
    }

    static Canvas;
    static Instance;

    static GetInstance() {
        return Game.Instance;
    }

    static GetPlayerName(player) {
        return player == Game.Player.white ? 'Wit' : 'Zwart';
    }

    constructor() {
        Game.Instance = this;
        this.board = new Board();
        this.canvas = new Canvas();
        this.canvas.AddEventListener('click', (e) => this.OnClick(e))
    }

    async Init() {
        await this.board.Init();
        this.Start();
    }

    Start() {
        this.currentPlayer = Game.Player.white;
        this.winner = null;
        this.board.Reset();
        this.Draw();
    }

    OnClick(e) {
        if (!this.winner) {
            this.board.OnClick(e);
            this.winner = this.board.GetWinningPlayer();
        }

        this.Draw();
    }

    GetCurrentPlayer() {
        return this.currentPlayer;
    }

    ToNextTurn() {
        this.currentPlayer = this.currentPlayer == Game.Player.white ? Game.Player.black : Game.Player.white;
        this.board.OnNextTurn();
    }

    Draw() {
        this.canvas.Clear();

        this.board.Draw(this.canvas);

        this.canvas.SetFont("arial", 20)
        this.canvas.SetColor("#fff")
        this.canvas.SetAlpha(1)

        let text;

        if (this.winner) {
            text = `${Game.GetPlayerName(this.winner)} heeft gewonnen!`;
        } else {
            text = `${Game.GetPlayerName(this.currentPlayer)} aan zet`;
        }

        this.canvas.DrawText(text, 720, 700 / 2)
    }

}