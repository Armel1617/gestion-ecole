<?php

namespace App\Enums;

enum RoleUtilisateur: string
{
    case ADMINISTRATEUR = 'administrateur';
    case DIRECTION = 'direction';
    case SECRETAIRE = 'secretaire';
    case ENSEIGNANT = 'enseignant';
    case ETUDIANT = 'etudiant';
}
