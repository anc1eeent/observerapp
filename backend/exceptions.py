from fastapi import Request
from fastapi.responses import JSONResponse

class TokenExpiredException(Exception):
    pass

async def token_expire_handler(request: Request, exc: TokenExpiredException):
    return JSONResponse(
        status_code=401,
        content={"error": "Your token was expired.", "redirect_to_login": True}
    )
