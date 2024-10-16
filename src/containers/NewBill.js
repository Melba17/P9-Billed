import { ROUTES_PATH } from '../constants/routes.js'; // Import des chemins de navigation (par exemple pour rediriger l'utilisateur après soumission)
import Logout from "./Logout.js"; // Import de la classe Logout pour gérer la déconnexion utilisateur

export default class NewBill { // Définition de la classe NewBill qui gère la création d'une nouvelle facture
  constructor({ document, onNavigate, store, localStorage }) { // Constructeur de la classe, initialisant les paramètres nécessaires
    this.document = document; // Référence à l'objet document pour manipuler le DOM
    this.onNavigate = onNavigate; // Fonction de navigation pour rediriger l'utilisateur (par exemple vers la page des factures)
    this.store = store; // Référence au store pour gérer les appels API liés aux factures
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`); // Sélection du formulaire de soumission de facture via son data-testid
    formNewBill.addEventListener("submit", this.handleSubmit.bind(this)); // Ajout d'un listener pour soumettre le formulaire et déclencher la méthode handleSubmit

    const file = this.document.querySelector(`input[data-testid="file"]`); // Sélection de l'input de fichier via son data-testid
    file.addEventListener("change", this.handleChangeFile); // Ajout d'un listener pour traiter le changement de fichier avec handleChangeFile
    this.fileUrl = null; // Initialisation de l'URL du fichier comme null
    this.fileName = null; // Initialisation du nom du fichier comme null
    this.billId = null; // Initialisation de l'ID de la facture comme null
    new Logout({ document, localStorage, onNavigate }); // Instanciation de la classe Logout pour gérer la déconnexion
  }

  handleChangeFile = async (e) => { // Méthode asynchrone pour gérer le changement de fichier
    e.preventDefault(); // Empêche le comportement par défaut du navigateur lors du changement de fichier
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]; // Récupération du premier fichier sélectionné dans l'input
    const fileName = file.name; // Récupération du nom du fichier
    const formData = new FormData(); // Création d'un objet FormData pour envoyer le fichier avec d'autres données
    const email = JSON.parse(localStorage.getItem("user")).email; // Récupération de l'email de l'utilisateur à partir du localStorage

    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i; // Définition des extensions de fichiers autorisées (images)
    // /.../ entourent l'expression régulière ; Le backslash \. pour signifier "un point littéral"; jpg|jpeg|png pour les extensions autorisées avec  l'opérateur "OU" => | ; $ signifie "fin de la chaîne" ; i pour signifier que la recherche est insensible à la casse Maj ou min
    if (!allowedExtensions.test(fileName)) { // Vérification que l'extension du fichier est valide
      alert('Les fichiers .jpg, .jpeg et .png sont les seuls autorisés'); // Affichage d'une alerte si le fichier a une extension non autorisée
      e.target.value = ''; // Réinitialisation de l'input fichier
      return; // Sortie de la fonction si l'extension n'est pas valide
    }

    formData.append('file', file); // Ajout du fichier à l'objet FormData
    formData.append('email', email); // Ajout de l'email de l'utilisateur à l'objet FormData

    try {
      const response = await this.store.bills().create({ // Envoi du fichier au backend via la méthode create du store
        data: formData, // Envoi de formData contenant le fichier et l'email
        headers: {
          noContentType: true // Spécifie de ne pas ajouter de type de contenu, FormData le gère automatiquement
        }
      });

      this.billId = response.key; // Récupération de l'ID de la facture à partir de la réponse de l'API
      this.fileName = response.fileName; // Récupération du nom du fichier à partir de la réponse
      const cleanedFilePath = response.filePath ? response.filePath.replace(/\\/g, '/') : ''; // Nettoyage du chemin de fichier (remplacement des backslashes par des slashes)
      // /\\/g = 1er arg => \\ échappement du backslash ; g signifie "global", ce qui indique que nous voulons remplacer tous les backslashes dans la chaîne, pas seulement le premier trouvé
      // '/' (le second argument de replace) => C'est la chaîne (slash) par laquelle nous voulons remplacer les backslashes
      this.fileUrl = response.fileUrl || `http://yourserver.com/${cleanedFilePath}/${response.fileName}`; // Construction de l'URL du fichier

    } catch (error) {
      console.error('Erreur lors de la création de la facture avec le fichier:', error); // Affichage d'une erreur dans la console en cas d'échec
      alert('Une erreur est survenue lors de l\'envoi du fichier. Veuillez réessayer.'); // Affichage d'une alerte si l'upload échoue
    }
  };

  handleSubmit = async (e) => { // Méthode asynchrone pour gérer la soumission du formulaire
    e.preventDefault(); // Empêche le comportement par défaut lors de la soumission du formulaire

    const email = JSON.parse(localStorage.getItem("user")).email; // Récupération de l'email de l'utilisateur à partir du localStorage

    if (!this.fileUrl || !this.fileName) { // Vérifie si un fichier a été correctement sélectionné
      alert('Veuillez télécharger un fichier valide avant de soumettre la note de frais.'); // Affiche une alerte si aucun fichier n'a été sélectionné
      return; // Sortie de la fonction si les fichiers ne sont pas valides
    }

    const bill = { // Création d'un objet facture avec les informations du formulaire
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Récupération du type de dépense
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value, // Récupération du nom de la dépense
      amount: parseInt(e?.target.querySelector(`input[data-testid="amount"]`).value), // Récupération du montant et conversion en nombre
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value, // Récupération de la date
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // Récupération de la TVA
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // Récupération du pourcentage ou valeur par défaut 20
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value, // Récupération du commentaire
      fileUrl: this.fileUrl, // URL du fichier
      fileName: this.fileName, // Nom du fichier
      status: 'pending' // Statut par défaut de la facture (en attente)
    };

    try {
      await this.updateBill(bill); // Appelle la méthode updateBill pour envoyer la facture au backend
      this.onNavigate(ROUTES_PATH['Bills']); // Redirige vers la page des factures après soumission réussie
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la facture:', error); // Affichage d'une erreur dans la console en cas d'échec
      alert('Une erreur est survenue lors de la mise à jour de la facture. Veuillez réessayer.'); // Affichage d'une alerte si la soumission échoue
    }
  };

  updateBill = async (bill) => { // Méthode asynchrone pour mettre à jour une facture via le store
    if (this.store) { // Vérifie si le store est disponible
      try {
        await this.store
          .bills()
          .update({ data: JSON.stringify(bill), selector: this.billId }); // Envoie la facture mise à jour au backend
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture:', error); // Affichage d'une erreur en cas d'échec de mise à jour
      }
    }
  };
}
