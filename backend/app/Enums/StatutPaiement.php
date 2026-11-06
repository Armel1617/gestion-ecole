<?php

namespace App\Enums;

enum StatutPaiement: string
{
    case EN_ATTENTE = 'en_attente';
    case PARTIEL = 'partiel';
    case PAYE = 'paye';
    case ANNULE = 'annule';
}
