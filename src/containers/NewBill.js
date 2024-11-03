import { ROUTES_PATH } from '../constants/routes.js'; // Import des chemins de navigation (par exemple pour rediriger l'utilisateur après soumission)
import Logout from "./Logout.js"; // Import de la classe Logout pour gérer la déconnexion utilisateur

// Export de validateFileExtension pour permettre son utilisation dans les tests unitaires - Fonction qui valide les extensions de fichiers en vérifiant si elles correspondent aux extensions autorisées (.jpg, .jpeg, .png)
export function validateFileExtension(fileName) {
  const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
  return allowedExtensions.test(fileName);
}

export default class NewBill { // Définition de la classe NewBill qui gère la création d'une nouvelle facture
  constructor({ document, onNavigate, store, localStorage }) { // Constructeur de la classe, initialisant les paramètres nécessaires
    this.document = document; // Référence à l'objet document pour manipuler le DOM
    this.onNavigate = onNavigate; // Fonction de navigation pour rediriger l'utilisateur (vers la page des Notes de frais)
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


// Méthode asynchrone pour gérer le chargement de fichier => gère le processus complet de sélection et de validation du fichier, en vérifiant l’extension, en préparant et en envoyant les données au backend, puis en traitant la réponse pour sauvegarder les informations nécessaires de la facture
handleChangeFile = async (e) => { 
  e.preventDefault(); // Empêche le comportement par défaut lors de la sélection d'un fichier pour éviter le rechargement de la page lors de l'upload du fichier
  const file = this.document.querySelector(`input[data-testid="file"]`).files[0]; // Récupère le premier fichier sélectionné - le fichier sélectionné dans l'input ayant l’attribut data-testid="file"
  const fileName = file.name; // Récupère le nom du fichier sélectionné

  // Vérifie si l'extension du fichier est valide en appelant la fonction validateFileExtension
  if (!validateFileExtension(fileName)) { 
      alert('Les fichiers .jpg, .jpeg et .png sont les seuls autorisés'); // Alerte si l'extension est non valide
      e.target.value = ''; // Réinitialise l'input pour forcer la sélection d'un fichier valide
      return; // Stoppe l'exécution si l'extension est invalide
  }

  const formData = new FormData(); // Crée un objet FormData pour pouvoir transmettre le fichier et les données au serveur via une requête
  const email = JSON.parse(localStorage.getItem("user")).email; // Récupère l'email de l'utilisateur depuis localStorage et l'analyse en JSON pour pouvoir l'utiliser
  formData.append('file', file); // Ajoute le fichier à formData
  formData.append('email', email); // Ajoute l'email de l'utilisateur à formData

  try {
      // Envoie les données via une requête API asynchrone
      const response = await this.store.bills().create({ 
          data: formData, // Envoie le FormData qui contient le fichier et l'email
          headers: {
              noContentType: true // Indique au navigateur que FormData gère lui-même le Content-Type (ici formData gère des données de type formulaire + email). En fait, on laisse l'application configurer l'envoi des données de manière appropriée (la structure de données), tandis que le navigateur exécute simplement la demande sans imposer de configuration supplémentaire
          }
      }); 

      // Stocke l'ID de la facture renvoyé par le backend
      this.billId = response.key;
      // Stocke le nom du fichier renvoyé par le backend 
      this.fileName = response.fileName; 
      // Remplace les backslashes par des slashes: /\\/g remplace tous les backslashes \\ par des slashes / dans le chemin de fichier (pour compatibilité entre navigateurs)
      const cleanedFilePath = response.filePath ? response.filePath.replace(/\\/g, '/') : ''; 
      // Stocke l'URL du fichier renvoyée par le serveur ou construite localement. Cela garantit que l'interface a toujours une URL utilisable pour afficher le fichier, même si le backend ne renvoie pas l’URL complète
      this.fileUrl = response.fileUrl || `http://yourserver.com/${cleanedFilePath}/${response.fileName}`; 

  } catch (error) {
      console.error('Erreur lors de la création de la facture avec le fichier:', error); // Affiche une erreur en cas d'échec
      alert('Une erreur est survenue lors de l\'envoi du fichier. Veuillez réessayer.'); // Affiche une alerte si l'upload échoue
  }
};

  // Méthode asynchrone pour gérer la soumission du formulaire
  handleSubmit = async (e) => { 
    e.preventDefault(); // Empêche le comportement par défaut lors de la soumission du formulaire
    const email = JSON.parse(localStorage.getItem("user")).email; // Récupération de l'email de l'utilisateur à partir du localStorage
    if (!this.fileUrl || !this.fileName) { // Vérifie si un fichier a été correctement sélectionné
      alert('Veuillez télécharger un fichier valide avant de soumettre la note de frais.'); // Affiche une alerte si aucun fichier n'a été sélectionné
      return; // Sortie de la fonction si les fichiers ne sont pas valides
    }

    const bill = { // Création d'un objet facture avec les informations du formulaire
      // Au moment de la soumission du formulaire, e.target permet d'accéder à chaque champ du formulaire pour récupérer leurs valeurs actuelles
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

  // Mise à jour du backend avec la note de frais nouvellement créée  
  updateBill = async (bill) => { 
    if (this.store) { // Vérifie si le store est disponible
      try {
        await this.store
          .bills()
          .update({ data: JSON.stringify(bill), selector: this.billId }); // Envoie la facture mise à jour au backend selon son id
          this.onNavigate(ROUTES_PATH['Bills']); // Redirige vers la page des factures après une mise à jour réussie
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture:', error); // Affichage d'une erreur en cas d'échec de mise à jour
      }
    }
  };
}
