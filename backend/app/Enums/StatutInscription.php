<?php

namespace App\Enums;

enum StatutInscription: string
{
    case EN_COURS = 'en_cours';
    case TERMINEE = 'terminee';
    case ANNULEE = 'annulee';
}
