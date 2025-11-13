"""
Adapts the Steam Review API reponse schema to this app's schema
"""

from datetime import datetime

from pydantic import BaseModel

# || Steam API Reponse Schema (https://partner.steamgames.com/doc/store/getreviews)


class AuthorResponse(BaseModel):
    steamid: str
    num_games_owned: int
    num_reviews: int
    playtime_forever: int  # Lifetime playtime through app
    playtime_last_two_weeks: int
    playtime_at_review: int  # Playtime when the review was written
    deck_playtime_at_review: int  # Playtime on Steam Deck when the review was written
    last_played: datetime


class ReviewResponse(BaseModel):
    recommendationid: str
    author: AuthorResponse
    language: str
    review: str  # Actual text content of review
    timestamp_created: datetime
    timestamp_updated: datetime
    voted_up: bool  # Whether it was a positive recommendation (according to Steam)
    votes_up: int  # Number of users finding this review helpful
    weighted_vote_score: float  # Helpfulness score
    comment_count: int  # number of comments on the review
    steam_purchase: bool  # Whether the user purchased the game on Steam
    received_for_free: bool  # Whether the user says they got the game for free
    written_during_early_access: (
        bool  # Whether the user posted this review during the game's Early Access
    )
    developer_response: str | None = None  # Text content of developer response to review, if any
    timestamp_dev_responded: datetime | None = None  # When the developer responded, if applicable
    primarily_steam_deck: bool  # Did the reviewer play this mainly on the Steam Deck at the time of writing
