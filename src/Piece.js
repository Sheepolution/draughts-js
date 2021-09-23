class Piece {

    static State = {
        piece: 0,
        king: 1,
    }

    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.player = player;
        this.state = Piece.State.piece;
        this.selected = false
        this.taken = false
        this.moves = [];
        this.attacks = [];
    }

    GetPlayer() {
        return this.player;
    }

    GetX() {
        return this.x;
    }

    GetY() {
        return this.y;
    }

    SetPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    IsKing() {
        return this.state == Piece.State.king;
    }

    BecomeKing() {
        this.state = Piece.State.king;
    }

    IsTaken() {
        return this.taken;
    }

    Take() {
        this.taken = true;
    }

    IsSelected() {
        return this.selected;
    }

    Select() {
        this.selected = true;
    }

    Deselect() {
        this.selected = false;
    }

    CanMoveInDirection(direction) {
        if (this.IsKing()) {
            return true;
        }

        return direction == (this.player == Game.Player.white ? -1 : 1);
    }

    SetMoves(moves, attacks) {
        this.moves = moves;
        this.attacks = attacks;
    }

    GetMoves(attacks) {
        return attacks ? this.attacks : this.moves;
    }

    HasAttack() {
        return this.attacks.length > 0;
    }
}