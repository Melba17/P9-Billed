import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

// Ce fichier permet à l'utilisateur de créer une nouvelle facture dans l'application en remplissant un formulaire et en téléchargeant un fichier associé. Les données de la facture sont ensuite envoyées au backend pour être enregistrées, et l'utilisateur est redirigé vers la page des factures après la soumission

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;

    // Bug 3 Modifs : vérifie l'extension du fichier avant de procéder à l'envoi.
    // Si le fichier ne correspond pas aux extensions autorisées, un message d'alerte s'affiche, et le champ de fichier est réinitialisé.
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.test(fileName)) {
      alert('Seuls les fichiers JPG, JPEG, ou PNG sont acceptés');
      e.target.value = ''; // Réinitialiser le champ de fichier pour forcer l'utilisateur à choisir un fichier valide
      return;
    }

    formData.append('file', file);
    formData.append('email', email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then((response) => {
        // Afficher la réponse complète de l'API pour déboguer et comprendre la structure
        console.log('Réponse complète de l\'API:', response);
        
        this.billId = response.key;
        this.fileName = fileName;

        // Bug 3
        // Construire l'URL du fichier si `fileUrl` n'est pas fourni directement
        // Remplacer les backslashes par des slashes pour construire une URL valide
        const cleanedFilePath = response.filePath.replace(/\\/g, '/');
        this.fileUrl = response.fileUrl || `http://yourserver.com/${cleanedFilePath}/${response.fileName}`;

        console.log('fileUrl:', this.fileUrl, 'fileName:', this.fileName);
      })
      // Ajout Bug 3 :  amélioration de la gestion des erreurs et informe l'utilisateur si le téléchargement échoue pour une raison quelconque (par exemple, un problème de serveur)
      .catch(error => {
        console.error('Erreur lors de la création de la facture avec le fichier:', error);
        alert('Une erreur est survenue lors de l\'envoi du fichier. Veuillez réessayer.');
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value);
    
    const email = JSON.parse(localStorage.getItem("user")).email;
    
    // Bug 3 modifs : vérification qui assure que la soumission d'une note de frais ne se fait pas sans une fileUrl et un fileName valides
    // Si ces informations manquent, une alerte est affichée, et la soumission est annulée
    if (!this.fileUrl || !this.fileName) {
      alert('Veuillez télécharger un fichier valide avant de soumettre la note de frais.');
      return;
    }

    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e?.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // input TVA
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20, // % TVA
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    };

    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH['Bills']);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({data: JSON.stringify(bill), selector: this.billId})
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch(error => console.error(error));
    }
  };
}
