from flask import Flask
from .config import Config
from .db import db,migrate
from .models import *
from .routes import game_bp,player_bp
from flask_bcrypt import Bcrypt
#from flask_jwt_extended import JWTManager

bcrypt=Bcrypt()
#jwt = JWTManager()

def create_app():
    app=Flask(__name__)
    app.config.from_object(Config)

    #initialize db
    db.init_app(app)
    migrate.init_app(app,db)
    bcrypt.init_app(app)
    #jwt.init_app(app)

    #register blueprint
    app.register_blueprint(game_bp,url_prefix="/game")
    app.register_blueprint(player_bp,url_prefix="/player")

    return app