/**
 * @jest-environment jsdom
 */

// IMPORT DES OUTILS DE TEST
import { screen, fireEvent } from "@testing-library/dom"; // Outils pour simuler les interactions DOM
import NewBillUI from "../views/NewBillUI.js"; // Interface utilisateur de la page NewBill
import NewBill from "../containers/NewBill.js"; // Logique métier de NewBill
import { ROUTES_PATH } from '../constants/routes.js'; // Import des chemins de navigation
import mockStore from "../__mocks__/store.js"; // Mock de la gestion du store pour simuler les appels API

jest.mock("../app/store", () => mockStore);  // Moquer le store avec mockStore

// DÉBUT DU BLOC "DESCRIBE" POUR LA CONNEXION EMPLOYÉ (GIVEN)
describe("Given I am connected as an employee", () => {
  let newBill; // Variable pour stocker l'instance de NewBill
  const userEmail = "employee@test.tld"; // Déclaration d'une adresse e-mail simulée
  const onNavigate = jest.fn(); // Mock pour simuler la navigation
  // BEFORE EACH : S'EXÉCUTE AVANT CHAQUE TEST (CONFIGURATION COMMUNE)
  beforeEach(() => {
    window.alert = jest.fn(); // Mock de la fonction alert pour éviter les vraies alertes dans les tests
    localStorage.setItem("user", JSON.stringify({ email: userEmail })); // Simulation d'une session utilisateur via localStorage
    const html = NewBillUI(); // Génère l'interface de la page NewBill
    document.body.innerHTML = html; // Injecte le HTML généré dans le body du DOM
    newBill = new NewBill({ // Instanciation de la classe NewBill
      document,
      onNavigate, // Navigation simulée
      store: mockStore, // Mock du store
      localStorage: window.localStorage, // Utilisation du localStorage mocké
    });
  });

  // DÉBUT DU BLOC "WHEN I AM ON NEWBILL PAGE" (WHEN)
  describe("When I am on NewBill Page", () => {
    // THEN : VÉRIFIER LA PRÉSENCE DU FORMULAIRE
    test("Then I should see the form for creating a new bill", () => {
      const form = screen.getByTestId("form-new-bill"); // Récupère le formulaire via son data-testid
      expect(form).toBeTruthy(); // Vérifie que le formulaire est présent dans le DOM
    });
    // TEST UNITAIRE : UPLOAD D'UN FICHIER VALIDE
    describe("When I upload a valid file", () => {
      test("Then it should be processed", async () => {
        // Récupère l'input pour le fichier  
        const fileInput = screen.getByTestId("file"); 
        // Création d'un fichier de test valide
        const validFile = new File(['This is a test file.'], 'photo.jpg', { type: 'image/jpeg' }); 
        // Simule l'upload du fichier dans l'input
        fireEvent.change(fileInput, { target: { files: [validFile] } });
        // Attente que la méthode handleChangeFile s'exécute entièrement avant que le test n'examine le résultat
        await new Promise((resolve) => setTimeout(resolve, 0));
        // Vérifie que les propriétés du fichier sont bien mises à jour
        expect(newBill.fileName).toBe('photo.jpg'); // Vérifie le nom du fichier
        expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg');  // Vérifie l'URL simulée
      });
    });

    // TEST D'INTEGRATION POST NEW BILL : SOUMISSION D'UN FORMULAIRE AVEC DES DONNÉES VALIDES
    describe("When I submit the form with valid data", () => {
      test("Then it should navigate to bills page", async () => {
        const fileInput = screen.getByTestId("file"); // Récupère l'input du fichier
        const validFile = new File(['This is a test file.'], 'photo.jpg', { type: 'image/jpeg' });  
        fireEvent.change(fileInput, { target: { files: [validFile] } }); // Simule l'upload du fichier
        // Attendre que handleChangeFile mette à jour les propriétés
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        // Remplissage des champs du formulaire
        fireEvent.change(screen.getByTestId("expense-type"), { target: { value: 'Transports' } });
        fireEvent.change(screen.getByTestId("expense-name"), { target: { value: 'Train' } });
        fireEvent.change(screen.getByTestId("amount"), { target: { value: 100 } });
        fireEvent.change(screen.getByTestId("datepicker"), { target: { value: '2024-01-01' } });
        fireEvent.change(screen.getByTestId("vat"), { target: { value: 20 } });
        fireEvent.change(screen.getByTestId("pct"), { target: { value: 20 } });
        fireEvent.change(screen.getByTestId("commentary"), { target: { value: 'Voyage d\'affaires' } });

        const form = screen.getByTestId("form-new-bill"); // Récupère le formulaire
        fireEvent.submit(form); // Simule la soumission du formulaire
        // Attente pour que la soumission soit traitée
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Vérifie que la navigation a bien été effectuée
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
      });
    });

    // TEST UNITAIRE : SOUMISSION SANS FICHIER
    describe("When I submit the form without a file", () => {
      test("Then an alert should be shown", () => {
        const form = screen.getByTestId("form-new-bill"); // Récupère le formulaire
        fireEvent.submit(form); // Simule la soumission du formulaire
        // Vérifie que l'alerte a été déclenchée
        expect(window.alert).toHaveBeenCalledWith('Veuillez télécharger un fichier valide avant de soumettre la note de frais.');
      });
    });

    // TEST UNITAIRE : UPLOAD D'UN FICHIER NON VALIDE
    describe("When I upload an invalid file", () => {
      test("Then an alert should be shown", () => {
        const fileInput = screen.getByTestId("file"); // Récupère l'input du fichier
        const invalidFile = new File(['This is a test file.'], 'photo.txt', { type: 'text/plain' });
        // Simule l'upload du fichier non valide
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
        // Vérifie que l'alerte d'extension non valide est affichée
        expect(window.alert).toHaveBeenCalledWith('Les fichiers .jpg, .jpeg et .png sont les seuls autorisés');
        expect(fileInput.value).toBe(''); // Vérifie que l'input a été réinitialisé
      });
    });
  });
});
