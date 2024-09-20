from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Affiliation
from schemas.affiliation_schema import AffiliationResponse, AffiliationCreate, AffiliationUpdate

router = APIRouter()

# 소속 리스트 조회 API
@router.get("/affiliations", response_model=list[AffiliationResponse], summary="소속 리스트 조회", tags=["소속 API"])
async def get_affiliations(db: Session = Depends(get_db)):
    """
    소속 리스트를 조회합니다.
    """
    return db.query(Affiliation).all()

# 소속 생성 API
@router.post("/affiliations", response_model=AffiliationResponse, status_code=status.HTTP_201_CREATED, summary="소속 생성", tags=["소속 API"])
async def create_affiliation(affiliation: AffiliationCreate, db: Session = Depends(get_db)):
    """
    새로운 소속을 생성합니다.
    """
    new_affiliation = Affiliation(**affiliation.model_dump())
    db.add(new_affiliation)
    db.commit()
    db.refresh(new_affiliation)
    return new_affiliation

# 소속 수정 API
@router.put("/affiliations/{affiliationID}", response_model=AffiliationResponse, summary="소속 수정", tags=["소속 API"])
async def update_affiliation(affiliationID: int, affiliation: AffiliationUpdate, db: Session = Depends(get_db)):
    """
    기존 소속 정보를 수정합니다.
    """
    db_affiliation = db.query(Affiliation).filter(Affiliation.id == affiliationID).first()
    if not db_affiliation:
        raise HTTPException(status_code=404, detail="Affiliation not found")
    db_affiliation.name = affiliation.name
    db.commit()
    db.refresh(db_affiliation)
    return db_affiliation

# 소속 삭제 API
@router.delete("/affiliations/{affiliationID}", status_code=status.HTTP_204_NO_CONTENT, summary="소속 삭제", tags=["소속 API"])
async def delete_affiliation(affiliationID: int, db: Session = Depends(get_db)):
    """
    소속 정보를 삭제합니다.
    """
    db_affiliation = db.query(Affiliation).filter(Affiliation.id == affiliationID).first()
    if not db_affiliation:
        raise HTTPException(status_code=404, detail="Affiliation not found")
    db.delete(db_affiliation)
    db.commit()
    return {"detail": "Affiliation deleted"}
