from flask import Blueprint, jsonify, request, session
from app.models import Player
from app.db import db
from flask_bcrypt import Bcrypt
import re

bcrypt = Bcrypt()
player_bp = Blueprint("player_bp", __name__)

@player_bp.route("/single/<int:player_id>", methods=["GET"])
def single_player(player_id):
    player = Player.query.get(player_id)
    if not player:
        return jsonify({"message": f"Player with id {player_id} does not exist"}), 404
    return player.to_dict(), 200

@player_bp.route("/edit/<int:player_id>", methods=["PUT"])
def edit_player(player_id):
    player = Player.query.get(player_id)
    if not player:
        return jsonify({"message": f"Player with id {player_id} does not exist"}), 404

    data = request.get_json()
    if "username" in data:
        player.username = data["username"]

    db.session.commit()
    return player.to_dict(), 200



@player_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    
    username = data.get("username")
    email = data.get("email")
    country = data.get("country")
    password = data.get("password")
    password_confirmation = data.get("password_confirmation")

    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not email or not password or not username or not password_confirmation or not country:
        return jsonify({"error": "All fields are required"}), 400

    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email address"}), 400

    if password != password_confirmation:
        return jsonify({"error": "Passwords do not match"}), 400
    if len(password) < 4:
        return jsonify({"error": ["Password must be at least 4 characters long"]}), 400

    
    exists = Player.query.filter_by(email=email).first()
    if exists:
        return jsonify({"error": "Email already in use"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_player = Player(
        username=username,
        email=email,
        country=country,
        password=hashed_password
    )
    db.session.add(new_player)
    db.session.commit()
    

    session["player_id"] = new_player.id
    return new_player.to_dict(), 201



@player_bp.route("/login", methods=["POST"])
def login_player():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    player = Player.query.filter_by(email=email).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404

    if not bcrypt.check_password_hash(player.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["player_id"] = player.id
    return player.to_dict(), 200



@player_bp.route("/logout", methods=["DELETE"])
def logout_player():
    session["player_id"] = None
    return {"message": "Player successfully logged out"}, 204



@player_bp.route("/check_loggedin", methods=["GET"])
def check_user():
    player_id = session.get("player_id")
    if not player_id:
        return jsonify({"error": "Not Authorized"}), 401

    player = Player.query.get(player_id)
    if not player:
        return jsonify({"error": "Player not found"}), 401

    return player.to_dict(), 200



@player_bp.route("/list", methods=["GET"])
def list_players():
    players = Player.query.all()
    player_list = []
    for player in players:
        player_list.append({
            "id": player.id,
            "username": player.username,
            "email": player.email,
            "country": player.country,
            "created_at": player.created_at
        })

    return jsonify({
        "players": player_list,
        "count": len(player_list)
    }), 200




@player_bp.route("/all_players_history", methods=["GET"])
def all_players_history():
    players = Player.query.all()
    all_history = []

    for player in players:
        completed_games = Game.query.filter_by(player_id=player.id, status="completed").all()
        games_list = []
        for g in completed_games:
            games_list.append({
                "game_id": g.id,
                "human_score": g.human_score,
                "computer_score": g.computer_score,
                "played_words": g.played_words or [],
                "created_at": g.created_at,
                "updated_at": g.updated_at
            })
        all_history.append({
            "id": player.id,
            "username": player.username,
            "email": player.email,
            "country": player.country,
            "games": games_list
        })

    return jsonify(all_history), 200