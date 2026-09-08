import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.router import api_router

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("opportunity_dna")

def run_sqlite_migrations():
    import sqlite3
    db_url = settings.DATABASE_URL
    if "sqlite:///" in db_url:
        db_path = db_url.replace("sqlite:///", "")
        logger.info(f"Checking SQLite migrations for: {db_path}")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check candidates columns
            cursor.execute("PRAGMA table_info(candidates)")
            candidates_cols = [row[1] for row in cursor.fetchall()]
            
            cand_migrations = {
                "family_income": "REAL DEFAULT 0.0",
                "is_family_govt_employee": "INTEGER DEFAULT 0",
                "highest_degree": "TEXT",
                "institution_is_elite": "INTEGER DEFAULT 0",
                "qualification_stream": "TEXT",
                "preferred_sector": "TEXT",
                "preferred_location": "TEXT",
                "is_full_time_student": "INTEGER DEFAULT 0",
                "is_full_time_employed": "INTEGER DEFAULT 0",
                "has_prior_nats_naps": "INTEGER DEFAULT 0",
                "user_id": "INTEGER"
            }
            
            for col, col_type in cand_migrations.items():
                if col not in candidates_cols:
                    logger.info(f"Adding column '{col}' to candidates table")
                    cursor.execute(f"ALTER TABLE candidates ADD COLUMN {col} {col_type}")
                    
            # Check opportunities columns
            cursor.execute("PRAGMA table_info(opportunities)")
            opps_cols = [row[1] for row in cursor.fetchall()]
            
            opps_migrations = {
                "stipend": "REAL DEFAULT 0.0",
                "location": "TEXT",
                "sector": "TEXT",
                "allowed_streams": "TEXT",
                "type": "TEXT DEFAULT 'internship'",
                "duration_months": "INTEGER",
                "posted_by_user_id": "INTEGER"
            }
            
            for col, col_type in opps_migrations.items():
                if col not in opps_cols:
                    logger.info(f"Adding column '{col}' to opportunities table")
                    cursor.execute(f"ALTER TABLE opportunities ADD COLUMN {col} {col_type}")

            # Check users columns
            cursor.execute("PRAGMA table_info(users)")
            users_cols = [row[1] for row in cursor.fetchall()]
            
            users_migrations = {
                "account_status": "TEXT DEFAULT 'active'",
                "company": "TEXT",
                "institution": "TEXT",
                "website": "TEXT",
                "industry_sector": "TEXT",
                "organization_type": "TEXT",
                "designation": "TEXT",
                "institution_type": "TEXT",
                "official_domain": "TEXT",
                "institution_identifier": "TEXT",
                "graduation_year": "TEXT",
                "college_id_or_enrollment_number": "TEXT",
                "email_verified_at": "DATETIME",
                "verification_requested_at": "DATETIME",
                "verified_at": "DATETIME",
                "verified_by_user_id": "INTEGER",
                "rejection_reason": "TEXT",
                "suspended_at": "DATETIME"
            }
            
            for col, col_type in users_migrations.items():
                if col not in users_cols:
                    logger.info(f"Adding column '{col}' to users table")
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type}")
                    
            conn.commit()
            conn.close()
            logger.info("SQLite migrations completed successfully.")
        except Exception as me:
            logger.error(f"Error running sqlite migrations: {me}")

# Automatically initialize database schema (useful for local SQLite execution)
try:
    logger.info("Initializing database schema...")
    run_sqlite_migrations()
    Base.metadata.create_all(bind=engine, checkfirst=True)
    logger.info("Database schema initialized successfully.")
except Exception as e:
    logger.critical(f"Failed to initialize database schema: {e}")

app = FastAPI(
    title="Opportunity DNA API",
    description="Backend API for evidence-based candidate capability profiling and blind matching.",
    version="1.0.0"
)

# CORS configurations (Production origins loaded from settings)
cors_origins_raw = getattr(settings, "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )

# Register API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Opportunity DNA API Portal",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
