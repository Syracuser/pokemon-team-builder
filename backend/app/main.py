from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import teams, pokemon, pokeapi, analysis

app = FastAPI(title="Pokemon Team Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teams.router, prefix="/api")
app.include_router(pokemon.router, prefix="/api")
app.include_router(pokeapi.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Pokemon Team Builder API"}
