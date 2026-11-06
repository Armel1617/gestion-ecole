<?php

namespace App\Notifications;

use App\Models\Paiement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaiementEnregistreNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Paiement $paiement) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'paiement_enregistre',
            'paiement_id' => $this->paiement->id,
            'montant' => $this->paiement->montant,
            'reference' => $this->paiement->reference,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouveau paiement enregistré')
            ->line('Un nouveau paiement a été enregistré.')
            ->line('Montant : '.$this->paiement->montant)
            ->line('Référence : '.($this->paiement->reference ?? 'Non renseignée'));
    }
}
