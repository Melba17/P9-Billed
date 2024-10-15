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

////////// TESTS UNITAIRES EMPLOYEE //////////
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Test 1 : Simule l'affichage de la page des factures et vérifie que l'icône de la facture dans le menu vertical est mise en surbrillance
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
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      // Le test attend que l'icône de facture, identifiée par data-testid="icon-window", soit rendue dans le DOM
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      // Test 1 complété
      // Ajout de l'assertion pour vérifier que l'icône de la fenêtre facture (barre latérale de gauche) est mise en surbrillance avec la classe 'active-icon'
      expect(windowIcon.classList.contains('active-icon')).toBe(true); 
    });

    // Test 2 : Vérifie que les factures sont triées dans l'ordre anti-chronologique
    test("Then bills should be ordered from earliest to latest", async () => {
      // Simule l'affichage de la page des factures avec les données récupérées.
      // `billsInstance` est une instance de la classe `Bills` qui est initialisée avec des paramètres simulés
      const billsInstance = new Bills({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
      
      // Appelle la méthode `getBills` pour récupérer les données des factures et les stocke dans `bills`
      const bills = await billsInstance.getBills();
      
      // Met à jour le contenu de la page avec l'interface utilisateur générée par `BillsUI` en utilisant les données des factures
      document.body.innerHTML = BillsUI({ data: bills });
      
      // Récupère toutes les dates brutes (non formatées) des éléments HTML ayant l'attribut `data-raw-date` (par exemple, les cellules de tableau contenant les dates des factures)
      const dates = [...document.querySelectorAll('td[data-raw-date]')].map(a => a.getAttribute('data-raw-date'));
      
      // Fonction de tri pour ordonner les dates de manière décroissante (de la plus récente à la plus ancienne).
      // Elle retourne -1 si `a` vient après `b`, sinon elle retourne 1
      const antiChrono = (a, b) => (new Date(a) > new Date(b) ? -1 : 1);
      
      // Trie les dates extraites à l'aide de la fonction `antiChrono` pour obtenir l'ordre attendu.
      const datesSorted = [...dates].sort(antiChrono);
      
      // Affiche les dates triées attendues dans la console pour aider au débogage.
      console.log('Dates triées attendues:', datesSorted);
      
      // Vérifie si les dates affichées (`dates`) sont triées dans l'ordre décroissant en les comparant aux `datesSorted`
      // `expect` vérifie que les deux tableaux sont identiques, assurant que les dates sont correctement triées de la plus récente à la plus ancienne
      expect(dates).toEqual(datesSorted);
    });

    /////////// TEST D'INTEGRATION GET BILLS /////////////
    describe("When I am on the Bills Page", () => {
      // On simule la fonction de navigation
      const onNavigate = jest.fn();
    
      // Test pour le bouton "Nouvelle note de frais"
      test("When I click on the 'new bill' button", () => {
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
        userEvent.click(newBillButton);
      });
    
      test("Then it should navigate to NewBill page", () => {
        // On vérifie que la fonction de navigation a bien été appelée avec le bon chemin
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
      });
    
      // Test pour l'icône "œil"
      test("When I click on the 'eye' icon", () => {
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
        userEvent.click(iconEye);
      });
    
      test("Then the modal should open", () => {
        // On vérifie que la fonction modal a bien été appelée
        expect($.fn.modal).toHaveBeenCalled();
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
