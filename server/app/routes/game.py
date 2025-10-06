from flask import Blueprint, request, jsonify, session
from app.models import Game, Player
from datetime import datetime
from app.db import db

game_bp = Blueprint("game_bp", __name__)

def get_current_player():
    player_id = session.get("player_id")
    if not player_id:
        return None
    return Player.query.get(player_id)


@game_bp.route("/save_game", methods=["POST"])
def save_game():
    player = get_current_player()
    if not player:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    board = data.get("board")
    is_player_turn = data.get("is_player_turn", True)
    player1_rack = data.get("player1_rack")
    player2_rack = data.get("player2_rack")
    new_words = data.get("played_words", [])
    human_score = data.get("human_score", 0)
    computer_score = data.get("computer_score", 0)
    status = data.get("status", "ongoing")

    if not board:
        return jsonify({"error": "Missing board state"}), 400


    game = Game.query.filter_by(player_id=player.id, status="ongoing").first()

    if game:
        
        existing_words = game.played_words or []

        
        updated_words = [w for w in existing_words if w and w.lower() != "no words"]
        for w in new_words:
            if w and w not in updated_words:
                updated_words.append(w)

        
        game.board = board
        game.is_player_turn = is_player_turn
        game.player1_rack = player1_rack
        game.player2_rack = player2_rack
        game.played_words = updated_words
        game.human_score = human_score
        game.computer_score = computer_score
        game.status = status
        game.updated_at = datetime.utcnow()

    else:
        
        cleaned_words = [w for w in new_words if w and w.lower() != "no words"]
        game = Game(
            player_id=player.id,
            board=board,
            is_player_turn=is_player_turn,
            player1_rack=player1_rack,
            player2_rack=player2_rack,
            played_words=cleaned_words,
            human_score=human_score,
            computer_score=computer_score,
            status=status,
        )
        db.session.add(game)

    db.session.commit()

    return jsonify({
        "message": "Game saved successfully",
        "game_id": game.id,
        "status": game.status
    }), 200



@game_bp.route("/load_game", methods=["GET"])
def load_game():
    player = get_current_player()
    if not player:
        return jsonify({"error": "Unauthorized"}), 401

    game = Game.query.filter_by(player_id=player.id, status="ongoing").first()
    if not game:
        return jsonify({"message": "No ongoing game found"}), 404

    return jsonify({
        "id": game.id,
        "board": game.board,
        "is_player_turn": game.is_player_turn,
        "player1_rack": game.player1_rack,
        "player2_rack": game.player2_rack,
        "played_words": game.played_words or [],
        "human_score": game.human_score,
        "computer_score": game.computer_score,
        "status": game.status,
        "created_at": game.created_at,
        "updated_at": game.updated_at
    }), 200



@game_bp.route("/complete_game", methods=["POST"])
def complete_game():
    player = get_current_player()
    if not player:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    game_id = data.get("game_id")
    if not game_id:
        return jsonify({"error": "Missing game ID"}), 400

    game = Game.query.get(game_id)
    if not game or game.player_id != player.id:
        return jsonify({"error": "Game not found or unauthorized"}), 404

    game.status = "completed"
    game.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Game marked as completed"}), 200



@game_bp.route("/history", methods=["GET"])
def game_history():
    player = get_current_player()
    if not player:
        return jsonify({"error": "Unauthorized"}), 401

    games = Game.query.filter_by(player_id=player.id, status="completed").all()

    history = []
    for g in games:
        played_words = [w for w in (g.played_words or []) if w and w.lower() != "no words"]
        history.append({
            "id": g.id,
            "username": player.username,
            "country": player.country,
            "human_score": g.human_score,
            "computer_score": g.computer_score,
            "played_words": played_words,
            "created_at": g.created_at,
            "updated_at": g.updated_at
        })

    return jsonify({
        "player": {
            "id": player.id,
            "username": player.username,
            "country": player.country,
            "email": player.email
        },
        "history": history,
        "count": len(history)
    }), 200



@game_bp.route("/all_players_history", methods=["GET"])
def all_players_history():
    players = Player.query.all()
    leaderboard = []

    for p in players:
        games = Game.query.filter_by(player_id=p.id, status="completed").all()
        total_score = sum(g.human_score + g.computer_score for g in games)

        games_data = [
            {
                "game_id": g.id,
                "human_score": g.human_score,
                "computer_score": g.computer_score,
                "played_words": [w for w in (g.played_words or []) if w and w.lower() != "no words"],
                "created_at": g.created_at
            }
            for g in games
        ]

        leaderboard.append({
            "player_id": p.id,
            "username": p.username,
            "email": p.email,
            "country": p.country,
            "total_score": total_score,
            "games": games_data
        })

    leaderboard.sort(key=lambda x: x["total_score"], reverse=True)
    return {"leaderboard": leaderboard}, 200
