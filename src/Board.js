class Board {

    constructor() {
        const w = Game.Player.white;
        const b = Game.Player.black;
        const _ = null;

        this.startLayout = [
            [_, b, _, b, _, b, _, b, _, b],
            [b, _, b, _, b, _, b, _, b, _],
            [_, b, _, b, _, b, _, b, _, b],
            [b, _, b, _, b, _, b, _, b, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, w, _, w, _, w, _, w, _, w],
            [w, _, w, _, w, _, w, _, w, _],
            [_, w, _, w, _, w, _, w, _, w],
            [w, _, w, _, w, _, w, _, w, _],
        ]

        this.squareSize = 70;
        this.boardData = [];
        this.pieces = [];
        this.selectedPiece = null;
        this.pieceWithAttackExists = false;
    }

    async Init() {
        this.images = {
            board: await Canvas.LoadImage('board.png'),
            pieces: {
                white: {
                    piece: await Canvas.LoadImage('pieces/white.png'),
                    king: await Canvas.LoadImage('pieces/white_king.png'),
                },
                black: {
                    piece: await Canvas.LoadImage('pieces/black.png'),
                    king: await Canvas.LoadImage('pieces/black_king.png'),
                }
            }
        }
    }

    Reset() {
        const layout = this.startLayout;
        this.boardSize = layout.length;

        this.boardData = [];
        this.pieces = [];

        for (let i = 0; i < layout.length; i++) {
            this.boardData.push([]);
            for (let j = 0; j < layout[i].length; j++) {
                const square = layout[i][j];
                const piece = square ? new Piece(j, i, square) : null;

                this.boardData[i].push(piece);

                if (piece) {
                    this.pieces.push(piece);
                }
            }
        }

        this.SetPossibleMovesForPieces()
    }

    OnClick(e) {
        const square = this.GetSquareOnRealPosition(e.offsetX, e.offsetY)

        if (this.selectedPiece) {
            const moves = this.selectedPiece.GetMoves(this.pieceWithAttackExists);
            for (const move of moves) {
                if (move.x == square.x && move.y == square.y) {
                    this.MovePiece(this.selectedPiece, move);
                    this.SetPossibleMovesForPiece(this.selectedPiece);

                    if (!move.piece || !this.selectedPiece.HasAttack()) {
                        // If this was no attack or if there are no attacks left go to the next turn
                        this.RemoveTakenPieces();
                        Game.GetInstance().ToNextTurn();
                    }

                    // A move was made, no need to handle the click any further.
                    return;
                }
            }

            this.DeselectCurrentlySelectedPiece();
        }

        const clickedPiece = this.GetPieceOnPosition(square.x, square.y);
        if (clickedPiece != null) {
            if (this.IsPieceSelectable(clickedPiece)) {
                clickedPiece.Select();
                this.selectedPiece = clickedPiece;
            }
        }
    }

    IsPieceSelectable(piece) {
        return piece.GetPlayer() == Game.GetInstance().GetCurrentPlayer()
            && (!this.pieceWithAttackExists || piece.HasAttack());
    }

    DeselectCurrentlySelectedPiece() {
        if (this.selectedPiece) {
            this.selectedPiece.Deselect();
            this.selectedPiece = null;
        }
    }

    OnNextTurn() {
        this.DeselectCurrentlySelectedPiece();
        this.SetPossibleMovesForPieces();
    }

    GetSquareOnRealPosition(x, y) {
        return { x: Math.floor(x / this.squareSize), y: Math.floor(y / this.squareSize) };
    }

    GetPieceOnPosition(x, y) {
        if (!this.IsPositionInsideBoard(x, y)) {
            return null;
        }

        return this.boardData[y][x];
    }

    IsPositionInsideBoard(x, y) {
        return x >= 0 && y >= 0 && x < this.boardSize && y < this.boardSize;
    }

    SetPossibleMovesForPieces() {
        this.pieceWithAttackExists = false;

        for (const piece of this.pieces) {
            this.SetPossibleMovesForPiece(piece);
        }
    }

    SetPossibleMovesForPiece(piece) {
        const currentPlayer = Game.GetInstance().GetCurrentPlayer();
        if (piece.GetPlayer() != currentPlayer) {
            return;
        }

        const moves = [];
        const attacks = [];

        const pieceX = piece.GetX();
        const pieceY = piece.GetY();

        const directions = [-1, 1];

        for (const directionY of directions) {
            for (const directionX of directions) {
                let toX = pieceX + directionX;
                let toY = pieceY + directionY;

                let attackingPiece;

                // We use a while-loop for the king pieces.
                while (this.IsPositionInsideBoard(toX, toY)) {

                    const targetPiece = this.GetPieceOnPosition(toX, toY);

                    if (!targetPiece) {
                        if (piece.CanMoveInDirection(directionY)) {
                            if (attackingPiece) {
                                // This is a possible position for a king to land in an attack.
                                attacks.push({ x: toX, y: toY, piece: attackingPiece });
                            } else {
                                // There is no piece here, and we can move in this direction.
                                moves.push({ x: toX, y: toY });
                            }
                        }
                    } else if (this.IsPieceAttackable(piece, targetPiece)) {
                        if (attackingPiece) {
                            // A piece is already under attack, and a king can only attack the first piece in its line.
                            break;
                        }

                        // Check the square further diagonally.
                        toX += directionX;
                        toY += directionY;

                        if (this.IsPositionInsideBoard(toX, toY) && !this.GetPieceOnPosition(toX, toY)) {
                            // No piece to be found there, an attack is possible.
                            attacks.push({ x: toX, y: toY, piece: targetPiece });
                            this.pieceWithAttackExists = true;
                            attackingPiece = targetPiece;
                        } else {
                            // With multiple pieces in a row an attack is not possible.
                            break;
                        }
                    } else {
                        // It's not possible to jump over a taken piece, or a piece of your own.
                        break;
                    }

                    if (!piece.IsKing()) {
                        // Only a king can move over multiple squares.
                        break;
                    }

                    toX += directionX;
                    toY += directionY;
                }
            }
        }

        piece.SetMoves(moves, attacks);
    }

    IsPieceAttackable(piece, targetPiece) {
        return targetPiece.GetPlayer() != piece.GetPlayer() && !targetPiece.IsTaken();
    }

    MovePiece(piece, move) {
        this.boardData[piece.GetY()][piece.GetX()] = null;
        this.boardData[move.y][move.x] = piece;
        piece.SetPosition(move.x, move.y);

        move.piece?.Take();

        if (!piece.IsKing()) {
            if (this.IsPieceAtBottom(piece)) {
                piece.BecomeKing();
            }
        }
    }

    IsPieceAtBottom(piece) {
        const y = piece.GetY();
        const player = piece.GetPlayer();

        return (y == 0 && player == Game.Player.white)
            || (y == this.boardSize - 1 && player == Game.Player.black);
    }

    RemoveTakenPieces() {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i];
            if (piece.IsTaken()) {
                this.boardData[piece.GetY()][piece.GetX()] = null;
                this.pieces.splice(i, 1)
            }
        }
    }

    GetWinningPlayer() {
        const white = this.pieces.find(p => p.GetPlayer() == Game.Player.white);
        const black = this.pieces.find(p => p.GetPlayer() == Game.Player.black);

        if (white && black) {
            return null;
        }

        return white ? Game.Player.white : Game.Player.black;

    }

    Draw(canvas) {
        canvas.DrawImage(this.images.board, 0, 0);
        const currentPlayer = Game.GetInstance().GetCurrentPlayer();

        for (const piece of this.pieces) {
            const x = piece.GetX();
            const y = piece.GetY();

            if (this.IsPieceSelectable(piece) || (currentPlayer != piece.GetPlayer() && !piece.IsTaken())) {
                canvas.SetAlpha(1);
            } else {
                canvas.SetAlpha(.4);
            }

            if (piece.IsSelected()) {
                canvas.SetColor('#fcd977');
                canvas.DrawRectangle(x * this.squareSize, y * this.squareSize, this.squareSize, this.squareSize, true);

                const moves = piece.GetMoves(this.pieceWithAttackExists);
                for (const move of moves) {
                    canvas.SetColor('#7dbd60');
                    canvas.DrawRectangle(move.x * this.squareSize, move.y * this.squareSize, this.squareSize, this.squareSize, true);
                }
            }

            let image;

            if (piece.GetPlayer() == Game.Player.white) {
                image = piece.IsKing() ? this.images.pieces.white.king : this.images.pieces.white.piece;
            } else {
                image = piece.IsKing() ? this.images.pieces.black.king : this.images.pieces.black.piece;
            }

            const offsetX = (this.squareSize - image.width) / 2;
            const offsetY = this.squareSize * .9 - image.height;
            canvas.DrawImage(image, x * this.squareSize + offsetX, y * this.squareSize + offsetY);
        }
    }
}