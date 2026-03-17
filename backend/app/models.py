from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class PokemonCreate(BaseModel):
    name: str
    types: list[str] = Field(..., min_length=1, max_length=2)
    ability: str
    item: str
    moves: list[str] = Field(..., min_length=1, max_length=4)


class PokemonInDB(PokemonCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class PokemonUpdate(BaseModel):
    name: Optional[str] = None
    types: Optional[list[str]] = Field(None, min_length=1, max_length=2)
    ability: Optional[str] = None
    item: Optional[str] = None
    moves: Optional[list[str]] = Field(None, min_length=1, max_length=4)


class TeamCreate(BaseModel):
    team_name: str


class TeamUpdate(BaseModel):
    team_name: str


class TeamInDB(BaseModel):
    id: str = Field(alias="_id")
    team_name: str
    created_at: datetime
    updated_at: datetime
    pokemon: list[PokemonInDB] = []

    model_config = {"populate_by_name": True}
