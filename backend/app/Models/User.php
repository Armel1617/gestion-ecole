<?php

namespace App\Models;

use App\Enums\RoleUtilisateur;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // NOUVEAU : permet de créer des jetons

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // NOUVEAU : HasApiTokens

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed', // le mot de passe est chiffré automatiquement
            'role' => RoleUtilisateur::class,
        ];
    }

    public function hasAnyRole(string ...$roles): bool
    {
        return in_array($this->role->value, $roles, true);
    }

    public function etudiant()
    {
        return $this->hasOne(Etudiant::class);
    }
}
