import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

// Ce fichier définit une classe JS qui est principalement responsable de la gestion des factures dans le tableau de bord administratif de l'application. Il permet à un administrateur de visualiser, filtrer, éditer et mettre à jour les factures soumises par les employés, et il inclut la gestion des événements liés à l'interface utilisateur pour accomplir ces tâches
// Outil complet pour un administrateur, lui permettant de gérer les factures soumises par les employés et de prendre des décisions concernant leur validation ou leur rejet

// Fonction qui filtre les factures en fonction de leur statut 
export const filteredBills = (data, status) => {
  // Si les données sont définies et que la liste de factures n'est pas vide, filtre les factures.
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition
      // Vérifie si le code s'exécute dans un environnement de test (Jest est une bibliothèque de tests).
      if (typeof jest !== 'undefined') {
        // Si oui, filtre les factures dont le statut correspond au statut demandé.
        selectCondition = (bill.status === status)
      }
      // istanbul ignore next : utilisé pour indiquer à Istanbul, un outil de couverture de code JS, d'ignorer la ligne de code ou le bloc de code qui suit ce commentaire lors du calcul de la couverture des tests
      else {
        // Sinon, on est en environnement de production.
        // Récupère l'email de l'utilisateur connecté depuis le localStorage pour l'exclure du filtrage.
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        // Définit une condition pour sélectionner les factures :
        // - Le statut de la facture doit correspondre au statut souhaité.
        // - L'email de la facture ne doit pas être celui d'un utilisateur de test ni celui de l'utilisateur connecté.
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }
      // Retourne la condition pour filtrer la facture.
      return selectCondition
    }) : []
    // Si les données sont nulles ou vides, retourne une liste vide.
}

// Fonction qui génère une carte HTML pour représenter une facture dans le tableau de bord.
export const card = (bill) => {
  // Récupère le nom et le prénom à partir de l'email avant le symbole '@'.
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  // Retourne une chaîne de caractères HTML pour afficher les informations de la facture :
  // - Le nom de l'employé (prénom et nom).
  // - Le montant de la facture.
  // - La date formatée de la facture.
  // - Le type de la facture (exemple : "Transport", "Hébergement").
  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

// Fonction qui génère plusieurs cartes HTML pour une liste de factures.
export const cards = (bills) => {
  // Vérifie si la liste de factures est définie et non vide,
  // génère les cartes de chaque facture en utilisant la fonction `card`.
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

// Fonction qui retourne le statut de la facture sous forme de chaîne de caractères
// en fonction de l'index passé en paramètre.
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending" // Statut "en attente"
    case 2:
      return "accepted" // Statut "accepté"
    case 3:
      return "refused" // Statut "refusé"
  }
}

// Classe qui gère l'affichage et l'interaction avec les factures dans le tableau de bord des administrateurs.
export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document // Référence au document pour manipuler le DOM.
    this.onNavigate = onNavigate // Fonction pour naviguer entre les routes de l'application.
    this.store = store // Référence au store pour accéder aux données des factures.
    // Ajoute un événement de clic pour chaque icône de statut pour afficher les factures correspondantes.
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    new Logout({ localStorage, onNavigate }) // Initialise la gestion de la déconnexion de l'utilisateur.
  }

  // Méthode pour afficher l'image d'une facture dans une modal.
  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url") // Récupère l'URL de l'image de la facture.
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8) // Calcule la largeur de l'image pour l'affichage.
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    // Affiche la modal si la méthode `modal` est disponible (vérification pour éviter les erreurs).
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  // Méthode pour gérer l'édition d'une facture lorsqu'un administrateur clique dessus
  handleEditTicket(e, bill, bills) {
    e.preventDefault();
    e.stopPropagation();
    // Si l'objet "counters" n'est pas encore défini, on le crée pour stocker un compteur pour chaque facture.
    if (this.counters === undefined) {
      this.counters = {}; // Crée un objet pour stocker les compteurs spécifiques à chaque facture.
    }
    // Si le compteur pour la facture sélectionnée n'est pas encore initialisé, on le met à 0.
    if (this.counters[bill.id] === undefined) {
      this.counters[bill.id] = 0; // Initialise le compteur spécifique à la facture sélectionnée.
    }
    
    // Si le compteur pour cette facture est un multiple de 2 (premier clic ou après chaque deuxième clic).
    if (this.counters[bill.id] % 2 === 0) {
        // Permet de "désélectionner" visuellement toutes les factures avant de se concentrer sur celle que l'utilisateur souhaite éditer et garantit qu'il n'y a pas de conflit visuel si plusieurs factures ont été sélectionnées précédemment. Le fond bleu indique que ces factures ne sont plus en cours d'édition => réinitialisation globale
        bills.forEach(b => {
            $(`#open-bill${b.id}`).css({ background: '#0D5AE5' });
        });

        // Mise en évidence de la facture sélectionnée par l'utilisateur: on change la couleur de fond (noir) pour indiquer qu'elle est en cours d'édition. Cela assure que seule la facture sélectionnée est visuellement différenciée des autres
        $(`#open-bill${bill.id}`).css({ background: '#2A2B35' });
        // On affiche le formulaire de détails de la facture dans la partie droite du tableau de bord.
        $('.dashboard-right-container div').html(DashboardFormUI(bill));
        // On ajuste la hauteur de la barre de navigation verticale pour correspondre à l'affichage de la facture.
        $('.vertical-navbar').css({ height: '150vh' });
        // On incrémente le compteur spécifique à cette facture.
        this.counters[bill.id]++;
    } else {
        // Si le compteur n'est pas un multiple de 2 (deuxième clic), on réinitialise l'arrière-plan à la couleur bleue.
        $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' });
        // On affiche une grande icône à la place du formulaire, indiquant qu'aucune facture n'est en cours d'édition.
        $('.dashboard-right-container div').html(`
            <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
        `);
        // On ajuste la hauteur de la barre de navigation verticale à 120vh pour correspondre à l'affichage par défaut.
        $('.vertical-navbar').css({ height: '120vh' });
        // On incrémente à nouveau le compteur pour cette facture.
        this.counters[bill.id]++;
    }

    // Attache un événement "click" à l'icône pour afficher la facture en grand format (en modal).
    $('#icon-eye-d').click(this.handleClickIconEye);
    // Attache un événement "click" au bouton d'acceptation pour accepter la facture sélectionnée.
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill));
    // Attache un événement "click" au bouton de refus pour refuser la facture sélectionnée.
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill));
  }


  // Méthode pour gérer la soumission d'une facture acceptée par l'administrateur.
  handleAcceptSubmit = (e, bill) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire ou du bouton.
    e.stopPropagation(); // Empêche la propagation de l'événement à d'autres éléments.
    const newBill = {
      ...bill, // Copie toutes les propriétés de la facture actuelle.
      status: 'accepted', // Change le statut de la facture à "accepté".
      commentAdmin: $('#commentary2').val() // Récupère le commentaire de l'administrateur.
    }
    this.updateBill(newBill) // Met à jour la facture dans la base de données.
    this.onNavigate(ROUTES_PATH['Dashboard']) // Redirige vers le tableau de bord.
  }

  // Méthode pour gérer la soumission d'une facture refusée par l'administrateur.
  handleRefuseSubmit = (e, bill) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire ou du bouton.
    e.stopPropagation(); // Empêche la propagation de l'événement à d'autres éléments.
    const newBill = {
      ...bill,
      status: 'refused', // Change le statut de la facture à "refusé".
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  // BUG 4
  // Méthode pour afficher ou masquer les factures selon leur statut quand l'icône est cliquée.
  handleShowTickets(e, bills, index) {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire ou du bouton.
    e.stopPropagation(); // Empêche la propagation de l'événement à d'autres éléments.
    // Initialisation du compteur spécifique à la liste sélectionnée.
    if (this.counters === undefined) {
      this.counters = {}; // Crée un objet pour stocker les compteurs de chaque liste.
    }
    if (this.counters[index] === undefined) {
      this.counters[index] = 0; // Initialise le compteur de la liste actuelle.
    }
    // Filtrer les factures par statut avant de les afficher donc n'affiche que les factures pertinentes pour chaque statut
    const filteredBillsList = filteredBills(bills, getStatus(index));
    // Si c'est un clic pair, affiche les factures pour le statut spécifique
    if (this.counters[index] % 2 === 0) {
      $(`#arrow-icon${index}`).css({ transform: 'rotate(0deg)' });
      $(`#status-bills-container${index}`).html(cards(filteredBillsList)); // Affiche les cartes des factures filtrées
      this.counters[index]++;
    } else {
      // Sinon, cache les factures pour ce statut
      $(`#arrow-icon${index}`).css({ transform: 'rotate(90deg)' });
      $(`#status-bills-container${index}`).html("");
      this.counters[index]++;
    }
    // Pour chaque facture filtrée, on s'assure de nettoyer et de réassigner les événements de clic correctement
    filteredBillsList.forEach(bill => {
      // Réaffecte les événements click uniquement aux factures filtrées. Utilise .off('click') pour s'assurer qu'aucun événement de clic précédemment défini n'interfère, puis ajoute .on('click') pour réassigner correctement l'événement au clic sur une facture spécifique
      $(`#open-bill${bill.id}`).off('click').on('click', (e) => {
        e.stopPropagation(); // Empêche la propagation de l'événement de clic à d'autres éléments
        this.handleEditTicket(e, bill, filteredBillsList); // Passe seulement les factures filtrées ici
      });
    });
    return filteredBillsList; // Retourne la liste filtrée des factures qui correspond au statut actuel
}

  // Méthode pour récupérer toutes les factures de tous les utilisateurs depuis le store.
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list() // Récupère la liste des factures depuis la base de données.
      .then(snapshot => {
        // Transforme chaque document récupéré en objet facture.
        const bills = snapshot
        .map(doc => ({
          id: doc.id, // Ajoute l'identifiant de la facture.
          ...doc, // Ajoute toutes les autres propriétés de la facture.
          date: doc.date, // Conserve la date de la facture.
          status: doc.status // Conserve le statut de la facture.
        }))
        return bills // Retourne la liste des factures.
      })
      .catch(error => {
        throw error; // Lève une exception en cas d'erreur.
      })
    }
  }

  // Méthode pour mettre à jour une facture existante dans la base de données.
  // Ce commentaire `/* istanbul ignore next */` est utilisé pour indiquer à l'outil de couverture de code
  // Istanbul de ne pas inclure cette fonction dans le calcul de la couverture des tests.
  // Cela est fait parce que cette fonction fait des interactions réseau ou des manipulations de données
  // qui sont difficiles à tester ou qui ne sont pas pertinentes pour la couverture.
  /* istanbul ignore next */
  updateBill = async (bill) => { // Méthode asynchrone pour mettre à jour une facture via le store
    if (this.store) { // Vérifie si le store est disponible
      try {
        // Utilisation de await pour attendre la réponse de l'API de mise à jour
        await this.store
          .bills()
          .update({ data: JSON.stringify(bill), selector: bill.id }); // Met à jour la facture avec l'ID approprié
      } catch (error) {
        // Capture et affiche toute erreur survenue lors de la mise à jour
        console.error('Erreur lors de la mise à jour de la facture:', error); 
      }
    }
  };
}