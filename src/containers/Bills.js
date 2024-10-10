import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"


// Ce fichier gère l'interface utilisateur liée aux factures dans l'application :
// Création d'une nouvelle facture : redirige l'utilisateur vers la page appropriée lorsque le bouton "Nouvelle facture" est cliqué.
// Visualisation d'une facture : permet à l'utilisateur de visualiser une facture en affichant son image dans une modale.
// Récupération des factures : interroge le backend pour récupérer la liste des factures et les formate pour être affichées de manière lisible dans l'interface utilisateur.
// Ce fichier est essentiel pour employé ou admin qui doivent interagir avec les factures dans l'application
export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          const bills = snapshot.map(doc => {
            try {
              const rawDate = doc.date; // Date brute non formatée
              const formattedDate = formatDate(doc.date); // Date formatée pour l'affichage
  
              // Log pour vérifier les valeurs de `rawDate` et de `formattedDate`
              // console.log('Bill avec rawDate:', { rawDate: rawDate, formattedDate: formattedDate,});
  
              return {
                ...doc,
                rawDate: rawDate, // Conserver la date brute pour le tri
                date: formattedDate, // Utiliser la date formatée pour l'affichage
                status: formatStatus(doc.status),
              };
            } catch (e) {
              console.log('Erreur lors du mapping de la facture:', e, 'for', doc);
              return {
                ...doc,
                rawDate: doc.date, // Conserver la date brute même en cas d'erreur
                date: doc.date, // Utiliser la date non formatée si une erreur survient
                status: formatStatus(doc.status),
              };
            }
          });
  
          // Log pour vérifier la liste triée avant de la renvoyer
          const sortedBills = bills.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
          // console.log('Sorted bills:', sortedBills);
  
          return sortedBills;
        });
    }
  };
  
  
  
  
  
  
}
  