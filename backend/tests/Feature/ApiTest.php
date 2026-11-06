<?php

namespace Tests\Feature;

use App\Models\AnneeAcademique;
use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use App\Models\User;
use App\Notifications\PaiementEnregistreNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ApiTest extends TestCase
{
    // Chaque test part d'une base vide et temporaire : tes vraies données ne sont pas touchées
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->create(['role' => 'administrateur']), 'sanctum');
    }

    // TEST 1 : ajouter un étudiant puis le retrouver dans la liste
    public function test_ajouter_et_lister_un_etudiant(): void
    {
        $this->postJson('/api/etudiants', [
            'nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com',
        ])->assertStatus(201); // 201 = créé

        $this->getJson('/api/etudiants')->assertOk()->assertJsonCount(1);
    }

    // TEST 2 : un email déjà utilisé doit être refusé
    public function test_email_deja_utilise_refuse(): void
    {
        Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);

        $this->postJson('/api/etudiants', [
            'nom' => 'Autre', 'prenom' => 'Test', 'email' => 'awa@mail.com',
        ])->assertStatus(422); // 422 = données refusées
    }

    // TEST 3 : modifier puis supprimer un étudiant
    public function test_modifier_et_supprimer_un_etudiant(): void
    {
        $e = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);

        $this->putJson("/api/etudiants/{$e->id}", [
            'nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com', 'telephone' => '97000000',
        ])->assertOk();
        $this->assertDatabaseHas('etudiants', ['id' => $e->id, 'telephone' => '97000000']);

        $this->deleteJson("/api/etudiants/{$e->id}")->assertNoContent();
        $this->assertDatabaseMissing('etudiants', ['id' => $e->id]);
    }

    // TEST 4 : ajouter une formation, et refuser une formation incomplète
    public function test_formations(): void
    {
        $this->postJson('/api/formations', [
            'intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000,
        ])->assertStatus(201);

        // Il manque l'intitulé et le prix : doit être refusé
        $this->postJson('/api/formations', ['duree' => 3])->assertStatus(422);
    }

    // TEST 5 : inscrire un étudiant, refuser le doublon, puis changer le statut
    public function test_inscriptions(): void
    {
        $e = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        $f = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        $donnees = ['etudiant_id' => $e->id, 'formation_id' => $f->id];

        // Première inscription : acceptée (et on récupère son id pour la suite)
        $id = $this->postJson('/api/inscriptions', $donnees)->assertStatus(201)->json('id');

        // Même inscription une deuxième fois : refusée
        $this->postJson('/api/inscriptions', $donnees)->assertStatus(422);

        // Étudiant qui n'existe pas : refusé
        $this->postJson('/api/inscriptions', ['etudiant_id' => 999, 'formation_id' => $f->id])
            ->assertStatus(422);

        // Changer le statut
        $this->putJson("/api/inscriptions/{$id}", ['statut' => 'terminee'])->assertOk();
        $this->assertDatabaseHas('inscriptions', ['id' => $id, 'statut' => 'terminee']);

        // Supprimer l'inscription
        $this->deleteJson("/api/inscriptions/{$id}")->assertNoContent();
    }

    // TEST 6 : la recherche et le filtre par formation
    public function test_recherche_et_filtre(): void
    {
        $awa = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        Etudiant::create(['nom' => 'Kpade', 'prenom' => 'Koffi', 'email' => 'koffi@mail.com']);
        $f = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        Inscription::create([
            'etudiant_id' => $awa->id, 'formation_id' => $f->id, 'date_inscription' => now()->toDateString(),
        ]);

        // Recherche "dos" : seulement Awa
        $this->getJson('/api/etudiants?search=dos')->assertOk()->assertJsonCount(1);

        // Filtre par formation : seulement Awa (la seule inscrite)
        $this->getJson("/api/etudiants?formation_id={$f->id}")->assertOk()->assertJsonCount(1);

        // Sans filtre : les 2 étudiants
        $this->getJson('/api/etudiants')->assertOk()->assertJsonCount(2);
    }

    public function test_api_v1_retourne_une_collection_paginee(): void
    {
        Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);

        $this->getJson('/api/v1/etudiants?per_page=1')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'nom', 'prenom', 'email']],
                'links',
                'meta',
            ]);
    }

    public function test_un_secretaire_ne_peut_pas_supprimer(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'secretaire']), 'sanctum');
        $etudiant = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);

        $this->deleteJson("/api/v1/etudiants/{$etudiant->id}")->assertForbidden();
    }

    public function test_annee_active_et_paiement_sur_inscription(): void
    {
        $annee = $this->postJson('/api/v1/annees-academiques', [
            'libelle' => '2026-2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-07-31',
            'active' => true,
        ])->assertCreated()->assertJsonPath('data.active', true);

        $etudiant = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        $formation = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        $inscription = $this->postJson('/api/v1/inscriptions', [
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
        ])->assertCreated()->assertJsonPath('data.annee_academique_id', $annee['data']['id']);

        $this->postJson('/api/v1/paiements', [
            'inscription_id' => $inscription['data']['id'],
            'montant' => 50000,
            'reference' => 'PAY-001',
        ])->assertCreated()->assertJsonPath('data.statut', 'paye');

        $this->assertDatabaseHas('paiements', ['reference' => 'PAY-001', 'montant' => 50000]);
    }

    public function test_annee_avec_inscriptions_ne_peut_pas_etre_supprimee(): void
    {
        $annee = AnneeAcademique::create([
            'libelle' => '2025-2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-07-31',
        ]);
        $etudiant = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        $formation = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'annee_academique_id' => $annee->id,
            'date_inscription' => '2025-09-01',
        ]);

        $this->deleteJson("/api/v1/annees-academiques/{$annee->id}")->assertStatus(422);
    }

    public function test_notes_presences_et_bulletin(): void
    {
        $etudiant = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        $formation = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        $inscription = Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => '2026-09-01',
        ]);

        $this->postJson('/api/v1/notes', [
            'inscription_id' => $inscription->id,
            'matiere' => 'PHP',
            'valeur' => 16,
            'bareme' => 20,
            'coefficient' => 2,
            'date_evaluation' => '2026-10-10',
        ])->assertCreated();

        $this->postJson('/api/v1/presences', [
            'inscription_id' => $inscription->id,
            'date_presence' => '2026-10-11',
            'statut' => 'present',
        ])->assertCreated();

        $this->getJson("/api/v1/inscriptions/{$inscription->id}/bulletin")
            ->assertOk()
            ->assertJsonPath('moyenne_sur_20', 16)
            ->assertJsonPath('presences.presentes', 1)
            ->assertJsonPath('total_notes', 1);
    }

    public function test_note_superieure_au_bareme_refusee(): void
    {
        $etudiant = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        $formation = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        $inscription = Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => '2026-09-01',
        ]);

        $this->postJson('/api/v1/notes', [
            'inscription_id' => $inscription->id,
            'matiere' => 'PHP',
            'valeur' => 21,
            'bareme' => 20,
            'coefficient' => 1,
            'date_evaluation' => '2026-10-10',
        ])->assertUnprocessable();
    }

    public function test_document_prive_et_notification_de_paiement(): void
    {
        Notification::fake();
        $etudiant = Etudiant::create(['nom' => 'Dossou', 'prenom' => 'Awa', 'email' => 'awa@mail.com']);
        $formation = Formation::create(['intitule' => 'Informatique', 'duree' => 6, 'prix' => 150000]);
        $inscription = Inscription::create([
            'etudiant_id' => $etudiant->id,
            'formation_id' => $formation->id,
            'date_inscription' => '2026-09-01',
        ]);

        $this->postJson('/api/v1/documents', [
            'etudiant_id' => $etudiant->id,
            'inscription_id' => $inscription->id,
            'document' => UploadedFile::fake()->create('attestation.pdf', 100, 'application/pdf'),
        ])->assertCreated()->assertJsonPath('data.nom_original', 'attestation.pdf');

        $this->postJson('/api/v1/paiements', [
            'inscription_id' => $inscription->id,
            'montant' => 25000,
            'reference' => 'PAY-NOTIF-001',
        ])->assertCreated();

        Notification::assertSentTo(User::where('role', 'administrateur')->first(), PaiementEnregistreNotification::class);
        $this->assertDatabaseHas('documents', ['nom_original' => 'attestation.pdf']);
    }

    public function test_audit_health_et_erreur_api_standardisee(): void
    {
        $this->postJson('/api/v1/formations', ['duree' => 3])
            ->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors']);

        $this->assertDatabaseHas('audit_logs', [
            'method' => 'POST',
            'route' => 'api/v1/formations',
            'status_code' => 422,
        ]);

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.database', 'ok');

        $this->getJson('/api/openapi.json')
            ->assertOk()
            ->assertJsonPath('openapi', '3.0.3')
            ->assertJsonStructure(['paths', 'components' => ['securitySchemes']]);
    }

    public function test_un_enseignant_ne_peut_pas_acceder_aux_paiements(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'enseignant']), 'sanctum');

        $this->getJson('/api/v1/paiements')->assertForbidden();
        $this->postJson('/api/v1/paiements', [
            'inscription_id' => 1,
            'montant' => 1000,
        ])->assertForbidden();
    }

    public function test_seule_la_direction_peut_creer_un_utilisateur_avec_un_role(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'direction']), 'sanctum');

        $this->postJson('/api/v1/utilisateurs', [
            'name' => 'Secretaire',
            'email' => 'secretaire@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'secretaire',
        ])->assertCreated()
            ->assertJsonPath('data.role', 'secretaire');

        $this->assertDatabaseHas('users', [
            'email' => 'secretaire@example.com',
            'role' => 'secretaire',
        ]);
    }

    public function test_inscription_publique_cree_un_compte_etudiant_et_son_dossier(): void
    {
        $response = $this->postJson('/api/creer-compte', [
            'nom' => 'Dossou',
            'prenom' => 'Awa',
            'email' => 'awa.student@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()
            ->assertJsonPath('user.role', 'etudiant');

        $this->assertDatabaseHas('users', ['email' => 'awa.student@example.com', 'role' => 'etudiant']);
        $this->assertDatabaseHas('etudiants', [
            'email' => 'awa.student@example.com',
            'nom' => 'Dossou',
            'prenom' => 'Awa',
        ]);
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_etudiant_accede_uniquement_a_son_espace(): void
    {
        $this->postJson('/api/creer-compte', [
            'nom' => 'Dossou',
            'prenom' => 'Awa',
            'email' => 'awa.only@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $student = User::where('email', 'awa.only@example.com')->firstOrFail();
        $this->actingAs($student, 'sanctum');

        $this->getJson('/api/v1/etudiant/profil')->assertOk();
        $this->getJson('/api/v1/formations')->assertForbidden();
        $this->getJson('/api/v1/paiements')->assertForbidden();
    }

    public function test_un_administrateur_ne_peut_pas_creer_un_utilisateur(): void
    {
        $this->postJson('/api/v1/utilisateurs', [
            'name' => 'Enseignant',
            'email' => 'enseignant@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'enseignant',
        ])->assertForbidden();
    }

    public function test_la_creation_de_compte_publique_est_desactivee(): void
    {
        $this->postJson('/api/creer-compte', [
            'name' => 'Compte interdit',
            'email' => 'interdit@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable();
    }
}
