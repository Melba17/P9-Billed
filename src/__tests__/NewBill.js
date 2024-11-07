/**
 * @jest-environment jsdom
 */

// IMPORT DES OUTILS DE TEST
import { screen, fireEvent, waitFor } from "@testing-library/dom"; // Outils pour simuler les interactions DOM
import NewBillUI from "../views/NewBillUI.js"; // Interface utilisateur de la page NewBill
import NewBill from "../containers/NewBill.js"; // Logique métier de NewBill
import { validateFileExtension } from '../containers/NewBill.js'; // Import de validateFileExtension en tant que fonction
import { ROUTES_PATH } from '../constants/routes.js'; // Import des chemins de navigation
import mockStore from "../__mocks__/store.js"; // Mock de la gestion du store pour simuler les appels API
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";


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
        const onNavigate = jest.fn(); // Mock pour simuler la navigation
    
        // Mock l'API POST pour simuler une réponse réussie avec un nouvel ID de facture
        jest.spyOn(mockStore.bills(), "create").mockImplementationOnce(() =>
          Promise.resolve({ key: "1234" }) // Simule une réponse réussie avec un ID "1234"
        );
    
        // Crée une instance de NewBill avec onNavigate mocké
        new NewBill({
          document, // Environnement de navigateur, qui permet d'interagir avec un DOM simulé pour pouvoir le manipuler => jsdom
          onNavigate, // appel de const onNavigate = jest.fn(); qui sert donc au test
          store: mockStore, // Mock du store
          localStorage: window.localStorage, // Passe le mock de localStorage (qui contient les informations de l’utilisateur simulé) comme dépendance à l'instance de NewBill 
        });
    
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
    
        // Utilise `waitFor` pour attendre que la navigation soit déclenchée
        await waitFor(() => expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']));
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

    // TESTS D'INTEGRATION POUR LES ERREURS API
  describe("When an error occurs on API", () => { // Décrit un groupe de tests pour les erreurs provenant de l'API
    beforeEach(() => { // Fonction exécutée avant chaque test de ce groupe
      jest.spyOn(mockStore, "bills"); // Utilise Jest pour surveiller (ou "espionner") la méthode `bills` de `mockStore` pour les appels dans les tests
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@test.tld' })); // Simule un utilisateur connecté en ajoutant ses informations dans le localStorage
      const root = document.createElement("div"); // Crée un nouvel élément `div` pour servir de conteneur de la page
      root.setAttribute("id", "root"); // Attribue l'identifiant `id="root"` au conteneur
      document.body.append(root); // Ajoute le conteneur `root` au `body` du document pour simuler la structure du DOM
      router(); // Appelle la fonction `router` pour initialiser le système de routage de l'application
    });

      // ERREUR 404 LORS DE LA CREATION DE FACTURE
      describe("When an error 404 occurs during the creation of a new bill", () => { 
      test("Then it should display a 404 error message", async () => { // Test vérifiant que le message d'erreur 404 est affiché
        mockStore.bills.mockImplementationOnce(() => { // Simule la méthode `bills` de `mockStore` pour retourner une erreur 404 lors de l'appel
          return {
            create: () => Promise.reject(new Error("Erreur 404")) // Modifie la méthode `create` pour qu'elle rejette une promesse avec une erreur 404
          };
        });

        const newBill = new NewBill({ // Crée une instance de `NewBill` pour tester la soumission
          document,
          onNavigate: jest.fn(), // Simule la fonction `onNavigate` pour ne pas effectuer de réelle navigation
          store: mockStore, // Utilise `mockStore` pour simuler les appels à l'API
          localStorage: window.localStorage // Utilise `localStorage` pour stocker les informations utilisateur simulées
        });

          try {
            await newBill.handleSubmit(new Event("submit")); // Appelle la méthode `handleSubmit` pour simuler la soumission du formulaire
          } catch (e) { // Gestion de l'erreur rejetée par la promesse
            const message = screen.getByText(/Erreur 404/); // Recherche un élément contenant le texte "Erreur 404" dans le DOM
            expect(message).toBeTruthy(); // Vérifie que le message d'erreur est présent dans le DOM
          }
        });
      });

      // ERREUR 500 LORS DE LA CREATION DE FACTURE
      describe("When an error 500 occurs during the creation of a new bill", () => { 
        test("Then it should display a 500 error message", async () => { // Test vérifiant que le message d'erreur 500 est affiché
          mockStore.bills.mockImplementationOnce(() => { // Simule la méthode `bills` de `mockStore` pour retourner une erreur 500 lors de l'appel
            return {
              create: () => Promise.reject(new Error("Erreur 500")) // Modifie la méthode `create` pour qu'elle rejette une promesse avec une erreur 500
            };
          });

          const newBill = new NewBill({ // Crée une instance de `NewBill` pour tester la soumission
            document,
            onNavigate: jest.fn(), // Simule la fonction `onNavigate` pour ne pas effectuer de réelle navigation
            store: mockStore, // Utilise `mockStore` pour simuler les appels à l'API
            localStorage: window.localStorage // Utilise `localStorage` pour stocker les informations utilisateur simulées
          });

          try {
            await newBill.handleSubmit(new Event("submit")); // Appelle la méthode `handleSubmit` pour simuler la soumission du formulaire
          } catch (e) { // Gestion de l'erreur rejetée par la promesse
            const message = screen.getByText(/Erreur 500/); // Recherche un élément contenant le texte "Erreur 500" dans le DOM
            expect(message).toBeTruthy(); // Vérifie que le message d'erreur est présent dans le DOM
          }
        });
      });
    });
  });
});
