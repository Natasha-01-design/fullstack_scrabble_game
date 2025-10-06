import os
from dotenv import load_dotenv

#loading enviromental vairables

load_dotenv()

# print("ENV DB URL")
# print(os.getenv("DATABASE_URL"))


class Config:
    SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    SECRET_KEY= os.getenv("SECRET_KEY", "dev_secret_key") 
    #JWT_SECRET_KEY="paulssecret"