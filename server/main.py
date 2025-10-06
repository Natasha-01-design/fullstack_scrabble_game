from app import create_app
import os
from dotenv import load_dotenv
from flask_cors import CORS 


load_dotenv()

app=create_app()
CORS(app) 
# @app.route('/')
# def home():
#     return "My api is working"
if __name__=='__main__':
    app.run(port=5555,debug=True)
