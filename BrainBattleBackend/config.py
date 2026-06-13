import os
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Database — can be overridden via env var for production
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(BASE_DIR, 'database', 'db.sqlite3')
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secret key — override via env var in production
    SECRET_KEY = os.environ.get('SECRET_KEY', 'brainbattle-dev-secret-key')

    # CORS — comma-separated list of allowed origins (or * for all)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

    # Flask environment
    DEBUG = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    HOST  = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT  = int(os.environ.get('FLASK_PORT', 5000))