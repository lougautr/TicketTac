from fastapi import FastAPI
from app.controllers import user_controller, event_controller, ticket_controller
from app.database.database import engine
from app.database.base import Base  # ← base commune pour tous les modèles
from app.entities import *  # ← force l'import de tous les modèles pour éviter les erreurs de mapping
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.http import HTTPBearer
from fastapi.openapi.utils import get_openapi


app = FastAPI(
    title="Ticketing System API",
    description="API for handling concerts and events tickets.",
    version="1.0.0"
)
# Define allowed origins (CORS policy)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add JWT Bearer security
security = HTTPBearer()

# Routers
app.include_router(user_controller.router)
app.include_router(event_controller.router)
app.include_router(ticket_controller.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Ticketing System API"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="FastAPI 4WEBD",
        version="1.0.0",
        description="API for ticket reservation",
        routes=app.routes,
    )

    # Define JWT Bearer authentication scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerToken": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    # Apply security globally to all endpoints
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerToken": []}]

    app.openapi_schema = openapi_schema
    return openapi_schema

# Override default OpenAPI schema
app.openapi = custom_openapi

# Initialisation de la base de données au démarrage
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)



if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)