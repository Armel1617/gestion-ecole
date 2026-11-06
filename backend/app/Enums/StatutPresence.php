<?php

namespace App\Enums;

enum StatutPresence: string
{
    case PRESENT = 'present';
    case ABSENT = 'absent';
    case RETARD = 'retard';
    case EXCUSE = 'excuse';
}
