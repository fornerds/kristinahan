from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Author
from schemas.author_schema import AuthorResponse, AuthorCreate, AuthorUpdate

router = APIRouter()

# 작성자 리스트 조회 API
@router.get("/authors", response_model=list[AuthorResponse], summary="작성자 리스트 조회", tags=["작성자 API"])
async def get_authors(db: Session = Depends(get_db)):
    """
    작성자 리스트를 조회하는 API
    """
    authors = db.query(Author).all()
    return authors

# 작성자 생성 API
@router.post("/authors", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED, summary="작성자 생성", tags=["작성자 API"])
async def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    """
    새로운 작성자를 생성하는 API
    """
    new_author = Author(**author.model_dump())
    db.add(new_author)
    db.commit()
    db.refresh(new_author)
    return new_author

# 작성자 업데이트 API
@router.put("/authors/{authorID}", response_model=AuthorResponse, summary="작성자 정보 수정", tags=["작성자 API"])
async def update_author(authorID: int, author: AuthorUpdate, db: Session = Depends(get_db)):
    """
    작성자 정보를 수정하는 API
    """
    db_author = db.query(Author).filter(Author.id == authorID).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")
    db_author.name = author.name
    db.commit()
    db.refresh(db_author)
    return db_author

# 작성자 삭제 API
@router.delete("/authors/{authorID}", status_code=status.HTTP_204_NO_CONTENT, summary="작성자 삭제", tags=["작성자 API"])
async def delete_author(authorID: int, db: Session = Depends(get_db)):
    """
    작성자를 삭제하는 API
    """
    db_author = db.query(Author).filter(Author.id == authorID).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")
    db.delete(db_author)
    db.commit()
    return {"detail": "Author deleted"}
