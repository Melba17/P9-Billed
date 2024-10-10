import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

// Ce fichier produit une page de gestion des notes de frais où l'utilisateur peut : Voir une liste de ses factures sous forme de table. Visualiser un justificatif (document associé à la facture) en cliquant sur une icône d'action, via une modale. Ajouter une nouvelle facture en cliquant sur le bouton "Nouvelle note de frais". Le fichier gère également les états de chargement et d'erreur pour offrir une expérience utilisateur fluide

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td data-raw-date="${bill.rawDate}">${bill.date}</td> 
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
  `);
};

const rows = (data) => {
  return (data && data.length) ? data.map(bill => row(bill)).join("") : "";
};

export default ({ data: bills, loading, error }) => {
 
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
  
  if (loading) {
    return LoadingPage();
  } else if (error) {
    return ErrorPage(error);
  }
  
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
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  );
};