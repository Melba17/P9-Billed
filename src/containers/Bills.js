import { ROUTES_PATH } from '../constants/routes.js' 
// Importation des constantes de chemin de routage de l'application depuis le fichier 'routes.js' pour faciliter la navigation.
import { formatDate, formatStatus } from "../app/format.js" 
// Importation de fonctions utilitaires de formatage (formatDate et formatStatus) depuis 'format.js'. Elles servent à formater les dates et les statuts des factures.
import Logout from "./Logout.js" 
// Importation de la classe 'Logout', qui gère la déconnexion des utilisateurs.


// En résumé, ce code gère l'interface utilisateur pour la création, la visualisation et la récupération des factures dans l'application. Il interagit avec le backend pour récupérer les factures et les formate pour un affichage lisible

export default class { 
  // Déclaration d'une classe par défaut qui va gérer l'interface utilisateur liée aux factures.
  constructor({ document, onNavigate, store, localStorage }) { 
    // Le constructeur de la classe reçoit des objets (document, onNavigate, store, localStorage) nécessaires pour l'interface utilisateur, la navigation, et le stockage local.
    this.document = document 
    // Stocke l'objet document (référence au DOM) dans la classe pour un usage ultérieur.
    this.onNavigate = onNavigate 
    // Stocke la fonction de navigation, permettant de rediriger l'utilisateur vers une autre page.
    this.store = store 
    // Stocke l'objet store, permettant d'interagir avec les données (comme les factures).

    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`) 
    // Sélectionne le bouton "Nouvelle facture" dans le DOM via son attribut data-testid.
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill) 
    // Si le bouton est trouvé, on lui associe un événement 'click' qui déclenchera la méthode 'handleClickNewBill'.
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`) 
    // Sélectionne toutes les icônes "œil" (pour voir les factures) dans le DOM via leur attribut data-testid.
    if (iconEye) iconEye.forEach(icon => { 
      // Si ces icônes existent, on leur associe un événement 'click' qui déclenchera la méthode 'handleClickIconEye' pour chaque icône.
      icon.addEventListener('click', () => this.handleClickIconEye(icon)) 
      // À chaque clic sur une icône, l'utilisateur pourra voir une facture dans une modale.
    })

    new Logout({ document, localStorage, onNavigate }) 
    // Crée une nouvelle instance de la classe 'Logout' pour gérer la déconnexion de l'utilisateur (employé ou admin).
  }
  handleClickNewBill = () => { 
    // Méthode appelée lorsqu'on clique sur le bouton "Nouvelle facture".
    this.onNavigate(ROUTES_PATH['NewBill']) 
    // Utilise la fonction de navigation pour rediriger l'utilisateur vers la page de création d'une nouvelle facture.
  }

  handleClickIconEye = (icon) => { 
    // Méthode appelée lorsqu'on clique sur une icône "œil" pour voir une facture.
    const billUrl = icon.getAttribute("data-bill-url") 
    // Récupère l'URL de l'image de la facture à partir de l'attribut 'data-bill-url' de l'icône.
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5) 
    // Calcule la largeur de l'image à afficher dans la modale en fonction de la largeur de l'élément contenant l'image.

    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`) 
    // Injecte le code HTML nécessaire pour afficher l'image de la facture dans la modale.
    $('#modaleFile').modal('show') 
    // Affiche la modale contenant l'image de la facture.
  }

  getBills = () => {
    // Vérifie si l'objet `store` est défini avant d'essayer de récupérer les factures.
    // Si `store` n'existe pas, la méthode ne fait rien (elle ne tente pas de récupérer les données).
    if (this.store) {
      // Appel à `this.store.bills().list()` pour récupérer la liste des factures depuis le backend ou une source de données (comme une API ou une base de données).
      // `list()` renvoie une promesse qui, une fois résolue, contient un tableau de factures.
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          // Une fois que la promesse est résolue avec les factures, le `then` est exécuté avec `snapshot` (tableau contenant les factures) => données récupérées depuis le back-end.
          const bills = snapshot
            // Filtrage des factures pour ne conserver que celles qui ont un `name`, un `amount`, et un `status` définis.
            // Cela permet de s'assurer que seules les factures complètes sont manipulées.
            .filter(doc => doc.name && doc.amount && doc.status)
            
            // Utilisation de `map()` pour créer un nouveau tableau de factures formatées.
            // Chaque facture (`doc`) est transformée pour inclure des informations formatées comme la date et le statut.
            .map(doc => {
              try {
                // On renvoie un nouvel objet facture, en incluant toutes les propriétés originales de `doc` avec l'opérateur `...doc`.
                // La date est formatée via la fonction `formatDate`, et on stocke également la date brute sous `rawDate` pour le tri.
                // Le statut est formaté via la fonction `formatStatus`.
                return {
                  ...doc, // Récopie toutes les propriétés de `doc` dans le nouvel objet facture.Cela permet de conserver les valeurs originales de toutes les propriétés de doc dans le nouvel objet, sauf celles choisies pour modification explicite ci-après => date et status.
                  date: formatDate(doc.date), // La date est formatée pour être affichée de manière lisible dans l'UI.
                  rawDate: doc.date, // On conserve la date brute (non formatée) pour effectuer des opérations de tri.
                  status: formatStatus(doc.status) // Le statut de la facture est également formaté pour être affiché de manière plus lisible.
                };
              } catch (e) {
                // Gestion d'erreurs : Si une erreur survient lors du formatage (exemple : une date mal formée), on capture l'exception.
                console.log('Erreur lors du mapping de la facture:', e, 'for', doc);
                // En cas d'erreur, on renvoie l'objet `doc` sans formatage de la date (on garde la date brute) pour éviter que l'erreur ne bloque tout.
                return {
                  ...doc, // On recopie les propriétés d'origine de `doc`.
                  date: doc.date, // Si le formatage échoue, on conserve la date brute.
                  status: formatStatus(doc.status) // Le statut est formaté même en cas d'erreur sur la date.
                };
              }
            });
          // On trie les factures par date décroissante (de la plus récente à la plus ancienne) en utilisant la date brute (`rawDate`).
          // `new Date(b.rawDate) - new Date(a.rawDate)` compare les dates sous forme d'objets `Date`.
          return bills.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        });
    }
  };
  
}
  