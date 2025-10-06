from app.db import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone

class Player(db.Model, SerializerMixin):
    __tablename__ = "players"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    country = db.Column(db.String, nullable=False)
    password = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "country": self.country
        }

