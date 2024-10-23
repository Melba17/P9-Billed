// Importe la mise en page verticale pour structurer la page
import VerticalLayout from './VerticalLayout.js'
// Importe une page d'erreur à afficher en cas de problème
import ErrorPage from "./ErrorPage.js"
// Importe une page de chargement à afficher pendant le chargement des données
import LoadingPage from "./LoadingPage.js"
// Importe les actions disponibles sur chaque ligne de facture (affichage du justificatif par exemple)
import Actions from './Actions.js'

// Ce fichier produit une page de gestion des notes de frais où l'utilisateur peut : Voir une liste de ses factures sous forme de tableau. Visualiser un justificatif (document associé à la facture) en cliquant sur une icône d'action, via une modale. Ajouter une nouvelle facture en cliquant sur le bouton "Nouvelle note de frais". Le fichier gère également les états de chargement et d'erreur pour offrir une expérience utilisateur fluide

// Fonction pour créer une ligne de tableau représentant une facture
const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
  `);
};

// Fonction qui génère les lignes du tableau à partir des données
const rows = (data) => {
  // Si `data` existe et contient des éléments, utilise `map` pour appliquer la fonction `row` à chaque facture, puis `join("")` pour fusionner les lignes sans séparateur (sans espace entre les lignes)
  // Mais si `data` est vide ou nul, retourne une chaîne vide.
  return (data && data.length) ? data.map(bill => row(bill)).join("") : "";
};
// Fonction principale qui exporte l'interface utilisateur des factures
export default ({ data: bills, loading, error }) => {
 // Fonction pour créer une modale (fenêtre pop-up) qui affichera un justificatif
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)
  // Si les données sont en train de charger, affiche la page de chargement
  if (loading) {
    return LoadingPage();
    // Si une erreur survient, affiche la page d'erreur avec le message d'erreur
  } else if (error) {
    return ErrorPage(error);
  }
  // Retourne le code HTML principal de la page des factures
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
          <!-- Remplit le corps du tableau avec les lignes générées par rows(bills), en utilisant les données des factures. -->
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      <!-- Insère la modale pour afficher les justificatifs. -->
      ${modal()}
    </div>`
  );
};