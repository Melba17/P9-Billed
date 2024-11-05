/**
 * @jest-environment jsdom
 */

// IMPORT DES OUTILS DE TEST
import { screen, fireEvent } from "@testing-library/dom"; // Outils pour simuler les interactions DOM
import NewBillUI from "../views/NewBillUI.js"; // Interface utilisateur de la page NewBill
import NewBill from "../containers/NewBill.js"; // Logique métier de NewBill
import { validateFileExtension } from '../containers/NewBill.js'; // Import de validateFileExtension en tant que fonction
import { ROUTES_PATH } from '../constants/routes.js'; // Import des chemins de navigation
import mockStore from "../__mocks__/store.js"; // Mock de la gestion du store pour simuler les appels API

jest.mock("../app/store", () => mockStore);  // Moquer le store avec mockStore

// TESTS UNITAIRES
// Définition du bloc principal de test : contexte dans lequel l'utilisateur télécharge un fichier
describe("Given the user uploads a file", () => {
  // Sous-bloc pour tester le cas où le fichier a une extension valide
  describe("When the file has a valid extension", () => {
    // Test unitaire vérifiant que la fonction retourne true pour des extensions valides
    test("Then validateFileExtension should return true", () => { 
      // Vérifie que validateFileExtension retourne true pour un fichier avec l'extension .jpg
      expect(validateFileExtension("photo.jpg")).toBe(true);
      // Vérifie que validateFileExtension retourne true pour un fichier avec l'extension .jpeg
      expect(validateFileExtension("photo.jpeg")).toBe(true);
      // Vérifie que validateFileExtension retourne true pour un fichier avec l'extension .png
      expect(validateFileExtension("photo.png")).toBe(true);
    });
  });

  // Sous-bloc pour tester le cas où le fichier a une extension invalide
  describe("When the file has an invalid extension", () => {
    // Test unitaire vérifiant que la fonction retourne false pour des extensions non autorisées
    test("Then validateFileExtension should return false", () => {
      // Vérifie que validateFileExtension retourne false pour un fichier avec l'extension .pdf
      expect(validateFileExtension("document.pdf")).toBe(false);
      // Vérifie que validateFileExtension retourne false pour un fichier avec l'extension .gif
      expect(validateFileExtension("image.gif")).toBe(false);
      // Vérifie que validateFileExtension retourne false pour un fichier avec l'extension .txt
      expect(validateFileExtension("file.txt")).toBe(false);
    });
  });
});

// DÉBUT DU BLOC "DESCRIBE" POUR LA CONNEXION EMPLOYÉ (GIVEN)
describe("Given I am connected as an employee", () => {
  let newBill; // Variable pour stocker l'instance de NewBill
  const userEmail = "employee@test.tld"; // Déclaration d'une adresse e-mail simulée
  const onNavigate = jest.fn(); // Mock pour simuler la navigation

  // BEFORE EACH : S'EXÉCUTE AVANT CHAQUE TEST DE CE BLOC (CONFIGURATION COMMUNE)
  beforeEach(() => {
    window.alert = jest.fn(); // Mock de la fonction alert pour éviter d'afficher les vraies alertes (boîte de dialogue) dans les tests et donc interrompre les tests en cours et devoir cliquer sur "ok" - Permet aussi de vérifier que l'alerte a bien été déclenchée avec le bon message (voir plus bas)
    Object.defineProperty(window, 'localStorage', { value: localStorageMock }); // Ajoute un mock de localStorage pour chaque test - remplace le localStorage intégré de JSDOM par un mock contrôlé (localStorageMock) => personnalisé
    localStorage.setItem("user", JSON.stringify({ email: userEmail })); // Initialise et simule une session utilisateur active via localStorage
    const html = NewBillUI(); // Génère l'interface de la page NewBill
    document.body.innerHTML = html; // Injecte le HTML généré dans le body du DOM
    newBill = new NewBill({ // Instanciation de la classe NewBill
      /////////// DEPENDANCES ///////////
      document, // Environnement de navigateur, qui permet d'interagir avec un DOM simulé pour pouvoir le manipuler => jsdom
      onNavigate, // Navigation simulée
      store: mockStore, // Mock du store
      localStorage: window.localStorage, // Passe le mock de localStorage (qui contient les informations de l’utilisateur simulé) comme dépendance à l'instance de NewBill 
    });
  });

  // DÉBUT DU BLOC "WHEN I AM ON NEWBILL PAGE" (WHEN)
  describe("When I am on NewBill Page", () => {
    // THEN : VÉRIFIER LA PRÉSENCE DU FORMULAIRE
    test("Then I should see the form for creating a new bill", () => {
      // Récupère le formulaire via son data-testid
      const form = screen.getByTestId("form-new-bill");
      // Vérifie que le formulaire est présent dans le DOM faisant référence à l'instance newBill créée dans le bloc beforeEach 
      expect(form).toBeTruthy(); 
    });

    // TEST D'INTEGRATION POST NEWBILL : SOUMISSION D'UN FORMULAIRE AVEC DES DONNÉES VALIDES
    describe("When I submit the form with valid data", () => {
      test("Then it should navigate to bills page", async () => {
        // Récupère l'input du fichier en utilisant son data-testid="file"
        const fileInput = screen.getByTestId("file");
        // new File(...) crée un fichier simulé pour le test -  l'argument ['This is a test file.'] représente le contenu du fichier - 'photo.jpg' est le nom du fichier - { type: 'image/jpeg' } spécifie le type fichier selon les extensions autorisées
        const validFile = new File(['This is a test file.'], 'photo.jpg', { type: 'image/jpeg' }); 
        // Simule l'upload du fichier en ajoutant validFile à la liste de fichiers de l’input
        fireEvent.change(fileInput, { target: { files: [validFile] } }); 
        // On attend qu'handleChangeFile mette à jour les propriétés => le but est de lui donner le temps de traiter l’upload et de mettre à jour les propriétés associées (comme fileUrl et fileName) de l'instance newBill => résolution d'opération asynchrone
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Ces lignes de code simulent le remplissage du formulaire par l’utilisateur en modifiant chaque champ de manière appropriée - fireEvent.change est utilisé pour chaque champ afin de définir une nouvelle valeur, comme si l'utilisateur remplissait le formulaire dans une interface réelle
        fireEvent.change(screen.getByTestId("expense-type"), { target: { value: 'Transports' } });
        fireEvent.change(screen.getByTestId("expense-name"), { target: { value: 'Train' } });
        fireEvent.change(screen.getByTestId("amount"), { target: { value: 100 } });
        fireEvent.change(screen.getByTestId("datepicker"), { target: { value: '2024-01-01' } });
        fireEvent.change(screen.getByTestId("vat"), { target: { value: 20 } });
        fireEvent.change(screen.getByTestId("pct"), { target: { value: 20 } });
        fireEvent.change(screen.getByTestId("commentary"), { target: { value: 'Voyage d\'affaires' } });

        // Récupère le formulaire au complet (fichier chargé et tous les inputs remplis)
        const form = screen.getByTestId("form-new-bill"); 
        // Simule la soumission du formulaire
        fireEvent.submit(form);
        // Préparation pour éviter que la redirection ne se produise avant que toutes les infos soient enregistrées
        // Attente pour que la soumission soit traitée donc que les propriétés de l'instance NewBill (fileUrl, fileName, et billId) soient mises à jour pour le fichier chargé et que l'enregistrement de l'ensemble des données dans le backend soit effectif avant de...
        await new Promise((resolve) => setTimeout(resolve, 100));
        // ...Vérifier que la navigation a bien été effectuée, c'est à dire que l'application redirige bien l'utilisateur vers Bills
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
      });
    });

    // Flux d'interactions de plusieurs éléments (le formulaire complet dont la gestion d'erreurs (comme l'absence de fichier chargé ou invalide) et la logique de soumission de création de nouvelle note de frais et le déclenchement de l'alerte => Cela montre comment différentes parties de l’application s’intègrent pour créer une expérience utilisateur cohérente

    // TEST D'INTEGRATION : SOUMISSION SANS FICHIER
    describe("When I submit the form without a file", () => {
      test("Then an alert should be shown", () => {
        // Récupère le formulaire via son data-testid
        const form = screen.getByTestId("form-new-bill"); 
        // Simule la soumission du formulaire
        fireEvent.submit(form); 
        // Vérifie que l'alerte a bien été déclenchée
        expect(window.alert).toHaveBeenCalledWith('Veuillez télécharger un fichier valide avant de soumettre la note de frais.');
      });
    });

    // TEST D'INTEGRATION : UPLOAD D'UN FICHIER NON VALIDE
    describe("When I upload an invalid file", () => {
      test("Then an alert should be shown", () => {
        // Récupère l'input du fichier
        const fileInput = screen.getByTestId("file"); 
        // new File(...) crée un fichier simulé pour le test -  l'argument ['This is a test file.'] représente le contenu du fichier - 'photo.txt' est le nom du fichier -   { type: 'text/plain' } spécifie le type fichier selon une  extension non prise en charge par l'application - 'text/plain'= texte brut non formaté
        const invalidFile = new File(['This is a test file.'], 'photo.txt', { type: 'text/plain' });
        // Simule l'upload du fichier non valide
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
        // Vérifie que l'alerte d'extension non valide est affichée
        expect(window.alert).toHaveBeenCalledWith('Les fichiers .jpg, .jpeg et .png sont les seuls autorisés');
        // Vérifie que l'input a été réinitialisé
        expect(fileInput.value).toBe(''); 
      });
    });
  });
});
