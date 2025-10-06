from app.db import db
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

class Game(db.Model, SerializerMixin):
    __tablename__ = "games"

    id = db.Column(db.Integer, primary_key=True)
    is_player_turn = db.Column(db.Boolean, nullable=False, default=True)
    board = db.Column(JSONB, nullable=False)
    player1_rack = db.Column(JSONB, nullable=True)
    player2_rack = db.Column(JSONB, nullable=True)
    is_human_vs_human = db.Column(db.Boolean, nullable=False, default=False)
    human_score = db.Column(db.Integer, default=0)
    computer_score = db.Column(db.Integer, default=0)
    played_words = db.Column(JSONB, default=list)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    status = db.Column(db.String(20), default='ongoing')

    player_id = db.Column(db.Integer, db.ForeignKey("players.id"), nullable=False)
