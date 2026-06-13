from flask import Flask
from flask_cors import CORS
from database.db import db
from config import Config


def create_app():
    app = Flask(__name__)

    # ✅ Load config
    app.config.from_object(Config)

    # ✅ Enable CORS — allows web browsers to call the API
    # Reads allowed origins from Config.CORS_ORIGINS (set via .env or defaults to *)
    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # ✅ Init database
    db.init_app(app)

    # ✅ Register blueprints
    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from routes.progress_routes import progress_bp
    app.register_blueprint(progress_bp, url_prefix='/api/progress')

    from routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')

    from routes.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    return app


app = create_app()

# ✅ Create all DB tables on startup
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )