from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from pydantic import ConfigDict

class UserLogin(BaseModel):
    """Schéma pour la connexion utilisateur"""
    email: EmailStr = Field(..., description="Adresse email de l'utilisateur")
    password: str = Field(..., min_length=6, description="Mot de passe de l'utilisateur")

class UserResponse(BaseModel):
    """Schéma de réponse pour un utilisateur"""
    id: int
    email: str
    username: str
    role: str = Field(..., pattern="^(admin|user)$")
    is_active: bool = True
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TokenData(BaseModel):
    """Données contenues dans un token"""
    user_id: int

class Token(BaseModel):
    """Schéma de réponse pour les tokens d'authentification"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    """Schéma pour la requête de rafraîchissement de token"""
    refresh_token: str = Field(..., description="Token de rafraîchissement")

class UserCreate(BaseModel):
    """Schéma pour la création d'un utilisateur"""
    email: EmailStr = Field(..., description="Adresse email de l'utilisateur")
    username: str = Field(..., min_length=3, max_length=50, description="Nom d'utilisateur")
    password: str = Field(..., min_length=6, description="Mot de passe de l'utilisateur")
    role: str = Field("user", pattern="^(admin|user)$", description="Rôle de l'utilisateur")

class UserUpdate(BaseModel):
    """Schéma pour la mise à jour d'un utilisateur"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    role: Optional[str] = Field(None, pattern="^(admin|user)$")
    is_active: Optional[bool] = None

class PasswordChange(BaseModel):
    """Schéma pour le changement de mot de passe"""
    current_password: str = Field(..., description="Mot de passe actuel")
    new_password: str = Field(..., min_length=6, description="Nouveau mot de passe")
    confirm_password: str = Field(..., description="Confirmation du nouveau mot de passe")

    def validate_passwords_match(self):
        """Valider que les mots de passe correspondent"""
        if self.new_password != self.confirm_password:
            raise ValueError("Les mots de passe ne correspondent pas")
        return self

class PasswordReset(BaseModel):
    """Schéma pour la réinitialisation de mot de passe"""
    email: EmailStr = Field(..., description="Adresse email pour la réinitialisation")

class PasswordResetConfirm(BaseModel):
    """Schéma pour confirmer la réinitialisation de mot de passe"""
    token: str = Field(..., description="Token de réinitialisation")
    new_password: str = Field(..., min_length=6, description="Nouveau mot de passe")
    confirm_password: str = Field(..., description="Confirmation du nouveau mot de passe")

    def validate_passwords_match(self):
        """Valider que les mots de passe correspondent"""
        if self.new_password != self.confirm_password:
            raise ValueError("Les mots de passe ne correspondent pas")
        return self
