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
    // Méthode pour récupérer les factures depuis le backend.

    if (this.store) { 
      // Vérifie si l'objet store (base de données) est disponible.

      return this.store
        .bills()
        .list()
        .then(snapshot => { 
          // Récupère la liste des factures depuis le backend sous forme de snapshot (tableau de factures).

          const bills = snapshot
            .filter(doc => doc.name && doc.amount && doc.status) 
            // Filtre pour ne garder que les factures valides (qui ont un nom, un montant, et un statut).

            .map(doc => { 
              // Parcourt chaque facture filtrée pour la formater correctement.

              try {
                const rawDate = doc.date 
                // Stocke la date brute de la facture.

                const formattedDate = formatDate(doc.date) 
                // Formate la date avec la fonction utilitaire 'formatDate'.

                return { 
                  // Retourne un nouvel objet facture avec des propriétés formatées.

                  ...doc, 
                  // Recopie toutes les propriétés de la facture d'origine.

                  rawDate: rawDate, 
                  // Stocke la date brute pour des opérations comme le tri.

                  date: formattedDate, 
                  // Utilise la date formatée pour l'affichage.

                  status: formatStatus(doc.status), 
                  // Formate le statut de la facture avec la fonction utilitaire 'formatStatus'.
                }
              } catch (e) { 
                // En cas d'erreur lors du formatage, capture l'exception.

                console.log('Erreur lors du mapping de la facture:', e, 'for', doc) 
                // Affiche un message d'erreur dans la console avec les détails de l'exception et la facture concernée.

                return { 
                  // Retourne tout de même la facture d'origine, même en cas d'erreur de formatage.

                  ...doc, 
                  rawDate: doc.date, 
                  // Conserve la date brute, même si le formatage a échoué.

                  date: doc.date, 
                  // Utilise la date brute si le formatage échoue.

                  status: formatStatus(doc.status), 
                  // Utilise le formatage du statut (car il n'a pas échoué).
                }
              }
            })

          const sortedBills = bills.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)) 
          // Trie les factures par date décroissante (les plus récentes en premier).

          return sortedBills 
          // Retourne les factures triées.
        })
    }
  }
}
  