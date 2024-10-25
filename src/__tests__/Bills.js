/**
 * @jest-environment jsdom
 */
// Ces tests utilisent Jest et Testing Library pour simuler l'interaction avec l'UI et garantir que l'application fonctionne comme prévu dans ce contexte
import Bills from "../containers/Bills.js";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"; // Ajout du mock de l'API
import router from "../app/Router.js";

// Ajout d'un Mock du store pour simuler la récupération des factures. Cela permet de contrôler les données retournées par l'API sans dépendre d'une vraie base de données
jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // TEST D'INTEGRATION : Simule l'affichage de la page des factures et vérifie que l'icône de la facture dans le menu vertical est mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Simule un utilisateur employé connecté en configurant localStorage pour stocker les informations de l'utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld', // Utilise l'email exact de l'utilisateur
        statut: 'connected' // Simule un utilisateur connecté
      }));
      // Un élément div est ajouté au document avec l'ID root, simulant le conteneur principal de l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Le routeur est initialisé, et la navigation vers la page des factures est simulée avec window.onNavigate
      router();  // TEST D'INTEGRATION (CAR ON UTILISE LE ROUTEUR)
      window.onNavigate(ROUTES_PATH.Bills);  // TEST D'INTEGRATION
      // Le test attend que l'icône de facture, identifiée par data-testid="icon-window", soit rendue dans le DOM
      await waitFor(() => screen.getByTestId('icon-window')); // TEST D'INTEGRATION
      const windowIcon = screen.getByTestId('icon-window');
      // Ajout de l'assertion pour vérifier que l'icône de la fenêtre facture (barre latérale de gauche) est mise en surbrillance avec la classe 'active-icon'
      expect(windowIcon.classList.contains('active-icon')).toBe(true);  // TEST D'INTEGRATION
    });


    // TEST D'INTEGRATION GET (getBills) : Vérifie que les factures sont triées dans l'ordre décroissant
test("Then bills should be ordered from latest to earliest", async () => {
  // Création d'une nouvelle instance de la classe Bills, en simulant les dépendances (document, onNavigate, store et localStorage)
  // jest.fn() est utilisé pour simuler la fonction de navigation `onNavigate`, et `mockStore` simule le store utilisé pour récupérer les factures.
  const billsInstance = new Bills({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
  // Appel de la méthode asynchrone `getBills()` pour récupérer les factures. 
  // La méthode renvoie une promesse que l'on résout ici avec `await` pour s'assurer que les factures sont bien récupérées avant de continuer.
  const bills = await billsInstance.getBills(); // Les factures sont déjà triées ici
  // On extrait uniquement les dates brutes (rawDate) des factures récupérées.
  // `bills.map(bill => bill.rawDate)` crée un nouveau tableau qui ne contient que les dates brutes, sans le reste des informations des factures.
  const dates = bills.map(bill => bill.rawDate); // On récupère les dates brutes triées

  // Fonction de tri anti-chronologique ou manière de trier
  // Cette fonction compare deux dates converties en objets `Date`. Si `a` (la première date) est plus récente que `b`, on renvoie -1, sinon 1.
  // Cela permet de trier les dates dans l'ordre décroissant (du plus récent au plus ancien)
  const antiChrono = (a, b) => (new Date(a) > new Date(b) ? -1 : 1);

  // `...dates` crée une copie du tableau `dates` pour ne pas modifier l'original, puis on applique `sort(antiChrono)` pour trier effectivement les dates à l'aide d'antiChrono.
  const sortedDates = [...dates].sort(antiChrono);
  
  // // Le test vérifie lui-même que le tableau `dates` est bien trié dans l'ordre décroissant en le comparant au tableau trié `datesSorted`.
  // Si `dates` et `datesSorted` sont égaux, cela signifie que les dates étaient déjà dans le bon ordre (anti-chronologique).
  expect(dates).toEqual(sortedDates); 
});

    
    ///// TEST D'INTEGRATION GET : se concentre sur la récupération des factures pour un utilisateur employé depuis l'API simulée (mockStore). Cela permet de vérifier que les factures sont correctement récupérées et affichées pour un utilisateur employé connecté /////// 
    test("Then fetches bills from mock API GET", async () => {
      // Simule la connexion d'un utilisateur employé
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" })); 
      // Crée un conteneur div pour l'application et l'ajoute au DOM
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Initialise le routeur
      router();
      // Simule la navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills);
      // Attend que l'élément "Mes notes de frais" apparaisse dans le DOM
      await waitFor(() => screen.getByText("Mes notes de frais"));
  
      // Vérifie que les factures en attente sont bien affichées
      const contentPending = screen.getAllByText("En attente");
      expect(contentPending.length).toBeGreaterThan(0);
      // Vérifie que les factures validées sont bien affichées
      const contentAccepted = screen.getAllByText("Accepté");
      expect(contentAccepted.length).toBeGreaterThan(0);
      // Vérifie que les factures refusées sont bien affichées
      const contentRefused = screen.getAllByText("Refusé");
      expect(contentRefused.length).toBeGreaterThan(0);
      
    });
    
    /////////// TESTS D'INTEGRATION DE CLICS /////////////
    describe("When I click on the 'new bill' button", () => {
      // On simule la fonction de navigation
      const onNavigate = jest.fn();
      test("Then it should navigate to NewBill page", () => {
        // On injecte le HTML de BillsUI avec des données de factures
        document.body.innerHTML = BillsUI({ data: bills });
        // On crée une instance de Bills
        new Bills({
          document,
          onNavigate, // Utilise le mock défini en dehors
          store: null,
          localStorage: window.localStorage,
        });
        // On récupère le bouton "Nouvelle note de frais"
        const newBillButton = screen.getByTestId("btn-new-bill");
        // On simule le clic sur le bouton
        userEvent.click(newBillButton);  // TEST D'INTEGRATION (CAR ON SIMULE UNE INTERACTION UTILISATEUR)
        // On vérifie que la fonction de navigation a bien été appelée avec le bon chemin
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);  // TEST D'INTEGRATION
      });
    });

    describe("When I click on the 'eye' icon", () => {
      test("Then the modal should open", () => {
        // On injecte le HTML de BillsUI avec des données de factures
        document.body.innerHTML = BillsUI({ data: bills });
        // On crée une instance de Bills
        new Bills({
          document,
          onNavigate, // Utilise le même mock
          store: null,
          localStorage: window.localStorage,
        });
        // On mock la fonction modal de Bootstrap
        $.fn.modal = jest.fn();
        // On récupère la première icône "œil"
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        // On simule le clic sur l'icône "œil"
        userEvent.click(iconEye);  // TEST D'INTEGRATION (INTERACTION AVEC LE DOM)
        // On vérifie que la fonction modal a bien été appelée
        expect($.fn.modal).toHaveBeenCalled();  // TEST D'INTEGRATION
      });
    });

    /////////// TEST D'INTEGRATION D'ERREUR API /////////
    describe("When an error occurs on API", () => { // Définition d'un groupe de tests pour vérifier le comportement lorsque des erreurs se produisent lors de la récupération des données de l'API
      beforeEach(() => { // Fonction qui s'exécute avant chaque test dans ce groupe
        jest.spyOn(mockStore, "bills"); // Utilisation de Jest pour espionner la méthode 'bills' de mockStore, permettant de surveiller son utilisation
        Object.defineProperty(window, 'localStorage', { value: localStorageMock }); // Simulation de l'objet localStorage avec une version fictive pour les tests
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@test.tld' })); // Ajout d'un utilisateur fictif dans le localStorage pour simuler un utilisateur connecté
        const root = document.createElement("div"); // Création d'un nouvel élément div pour simuler le conteneur principal de l'application
        root.setAttribute("id", "root"); // Définition de l'attribut ID pour l'élément div
        document.body.appendChild(root); // Ajout de l'élément div au corps du document, l'intégrant dans le DOM
        router(); // Appel de la fonction router() pour initialiser la navigation dans l'application
      });

      describe("When fetching bills from an API and it fails with 404 error", () => { // Test qui vérifie que la récupération des factures échoue avec une erreur 404
        test("Then it should show a 404 message error", async () => { 
          mockStore.bills.mockImplementationOnce(() => { // Simulation de la méthode bills pour renvoyer une promesse rejetée avec une erreur 404
            return {
              list: () => Promise.reject(new Error("Erreur 404")) // Définition de la méthode list pour rejeter la promesse avec une erreur 404 (Ressource non trouvée : URL invalide ou ressource supprimée)
            };
          });
          window.onNavigate(ROUTES_PATH.Bills); // Simule la navigation vers la page des factures
          await new Promise(process.nextTick); // Attente que toutes les promesses en attente soient résolues, permettant au DOM de se mettre à jour
          const message = screen.getByText(/Erreur 404/); // Recherche dans le DOM le texte correspondant à "Erreur 404"
          expect(message).toBeTruthy(); // Vérification que le message d'erreur est présent dans le DOM, confirmant que l'erreur a été gérée correctement
        });
      });

      describe("When fetching bills from an API and it fails with 500 error", () => { // Test qui vérifie que la récupération des factures échoue avec une erreur 500
        test("Then it should show a 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => { // Simulation de la méthode bills pour renvoyer une promesse rejetée avec une erreur 500
            return {
              list: () => Promise.reject(new Error("Erreur 500")) // Définition de la méthode list pour rejeter la promesse avec une erreur 500 (Erreur interne du serveur : problème de traitement de la requête par le serveur)
            };
          });
          window.onNavigate(ROUTES_PATH.Bills); // Simule la navigation vers la page des factures
          await new Promise(process.nextTick); // Attente que toutes les promesses en attente soient résolues, permettant au DOM de se mettre à jour
          const message = screen.getByText(/Erreur 500/); // Recherche dans le DOM le texte correspondant à "Erreur 500"
          expect(message).toBeTruthy(); // Vérification que le message d'erreur est présent dans le DOM, confirmant que l'erreur a été gérée correctement
        });
      });
    });
  });
});
