/**
 * @jest-environment jsdom
 */
// jsdom est une simulation de l'environnement de navigateur, qui permet (avec Node.js) d'interagir avec un DOM simulé. Cela signifie que même sans navigateur réel, Jest peut accéder aux éléments (document, window, localStorage = objets globaux du navigateur) et méthodes du DOM (document.createElement, appendChild, et querySelector ou méthodes d'interactions utilisateur) => indique à Jest d'utiliser jsdom comme environnement de test (comme si l'application tournait dans un navigateur, mais en réalité, tout se passe dans Node.js)

// Utilisation de Jest (framework de test) et Testing Library (biblio de sélecteurs/méthodes pour les noeuds du DOM = Queries et simulation d'évènements ou comportement utilisateur = Events) pour simuler l'interaction avec l'UI et garantir que l'application fonctionne comme prévu dans ce contexte
import Bills from "../containers/Bills.js";
import { screen, waitFor } from "@testing-library/dom"; // Sous-module de React Testing Library souvent utilisé avec jest
import userEvent from "@testing-library/user-event"; // Le module userEvent permet de simuler des actions réelles et complètes d'un utilisateur dans le DOM (click, typing caractère par caractère, clear, hover de souris, navigation clavier etc...)
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"; // Ajout du mock de l'API
import router from "../app/Router.js";

// Ajout d'un Mock du store pour simuler la récupération des factures. Cela permet de contrôler les données retournées par l'API sans dépendre d'une vraie base de données
// "jest.mock" => est une fonction de Jest qui remplace temporairement un module par un "mock" ou une version simulée de ce module
// "../app/store" => représente le chemin relatif vers le module store
// "() => mockStore" => remplace tout le contenu de store par l'objet mockStore uniquement pendant l’exécution des tests - ce qui signifie que toutes les fonctions, propriétés, ou valeurs exportées par le module "../app/store" seront remplacées par celles définies dans mockStore
jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Simule l'affichage de la page des factures et vérifie que l'icône de la facture dans le menu vertical est mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Simule un utilisateur employé connecté en configurant localStorage pour stocker les informations de l'utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld', 
        statut: 'connected' 
      }));
      // Un élément div est ajouté au document avec l'ID root, simulant le conteneur principal de l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Le routeur est initialisé, et la navigation vers la page des factures est simulée avec window.onNavigate
      router();  // initialise le système de routage de l'application. Cela garantit que la gestion des routes est correctement configurée avant de tester la navigation.
      window.onNavigate(ROUTES_PATH.Bills); // Simule la navigation vers la page Bills pour être certain que tous les effets associés à l'affichage de cette page (ici le rendu des factures) sont déclenchés => on recrée l'expérience utilisateur réelle 

      await waitFor(() => screen.getByTestId('icon-window')); // Le test attend que l'icône de facture, identifiée par data-testid="icon-window", soit rendue dans le DOM donc visible avec screen
      const windowIcon = screen.getByTestId('icon-window');
      // Ajout de l'assertion pour vérifier que l'icône de la fenêtre facture (barre latérale de gauche) est mise en surbrillance avec la classe 'active-icon'
      expect(windowIcon.classList.contains('active-icon')).toBe(true);  
    });


    // TEST D'INTEGRATION GET (getBills) : Vérifie que les factures sont triées dans l'ordre décroissant
      test("Then bills should be ordered from latest to earliest", async () => {
      // Création d'une nouvelle instance de la classe Bills, en simulant les dépendances (document, onNavigate, store et localStorage) nécessaire pour que la page fonctionne correctement
      // document = DOM simulé par jest avec JSDOM
      // jest.fn() est utilisé pour simuler la fonction de navigation `onNavigate` => elle n'est pas rééllement utilisée ici, elle simule simplement la capacité de navigation entre les pages, comme en condition réelle
      // `mockStore` simule le store (BDD ou API) utilisé pour récupérer les factures
      // window.localStorage = localStorage basique simulé fourni par JSDOM dans l'environnement de test car il n’y a pas besoin de contrôler précisément les données puisqu'on met l'accent sur la récupération des factures, donc suffisant pour permettre au test de fonctionner
      const billsInstance = new Bills({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
      // Appel de la méthode asynchrone `getBills()` pour récupérer les factures. 
      // La méthode renvoie une promesse que l'on résout ici avec `await` pour s'assurer que les factures sont bien récupérées avant de continuer.
      const bills = await billsInstance.getBills(); // Les factures sont déjà triées ici
      // On extrait uniquement les dates brutes (rawDate) des factures récupérées.
      // `bills.map(bill => bill.rawDate)` crée un nouveau tableau qui ne contient que les dates brutes, sans le reste des informations des factures.
      const dates = bills.map(bill => bill.rawDate); // On récupère les dates brutes triées
      // Fonction de tri anti-chronologique ou manière de trier
      // Cette fonction compare deux dates converties en objets `Date`. Si `a` est plus récente que `b`, on renvoie -1, sinon 1.
      // Cela permet de trier les dates dans l'ordre décroissant (du plus récent au plus ancien)
      const antiChrono = (a, b) => (new Date(a) > new Date(b) ? -1 : 1);
      // `...dates` crée une copie du tableau `dates` pour ne pas modifier l'original, puis on applique `sort(antiChrono)` pour trier effectivement les dates à l'aide d'antiChrono.
      const sortedDates = [...dates].sort(antiChrono);
      // // Le test vérifie lui-même que le tableau `dates` est bien trié dans l'ordre décroissant en le comparant au tableau trié `datesSorted`.
      // Si `dates` et `datesSorted` sont égaux, cela signifie que les dates étaient déjà dans le bon ordre (anti-chronologique).
      expect(dates).toEqual(sortedDates);
    });

    ///// TEST D'INTEGRATION GET : Ce test d'intégration vérifie que les factures sont correctement récupérées via l'API simulée pour un utilisateur connecté (donc moyen de communication pour obtenir les données grace au mockStore qui est une version factice de l'API). Cela permet de vérifier que les factures sont correctement récupérées et affichées /////// 
    test("Then fetches bills from mock API GET", async () => {
      // Stocke les informations de l'utilisateur dans le localStorage simulé
      localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'employee@test.tld',
      statut: 'connected'
      }));

      // initialise le système de routage/de navigation de l'application. Cela garantit que la gestion des routes est correctement configurée avant de tester la navigation
      router();
      // Simule la navigation vers la page Bills pour être certain que tous les effets associés à l'affichage de cette page (ici le rendu des factures) sont déclenchés => on recrée l'expérience utilisateur réelle 
      window.onNavigate(ROUTES_PATH.Bills);
        
      // Crée un conteneur div pour l'application et l'ajoute au DOM
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Attend que l'élément "Mes notes de frais" apparaisse dans le DOM => attente de l'affichage du tableau de bord employé
      // waitFor() utile pour tester des éléments qui apparaissent ou se mettent à jour de façon asynchrone avant de poursuivre l'exécution du code
      await waitFor(() => screen.getByText("Mes notes de frais"));
  
      // Vérifie que les factures en attente sont bien affichées
      // screen.getByText => Recherche un élément avec un texte spécifique présent dans le DOM, donc pour trouver celui qui affiche exactement "En attente ou Accepté ou Refusé", sans avoir à cibler l’élément précisément via un sélecteur CSS. 
      const contentPending = screen.getAllByText("En attente");
      expect(contentPending.length).toBeGreaterThan(0);
      // Vérifie que les factures validées sont bien affichées
      const contentAccepted = screen.getAllByText("Accepté");
      expect(contentAccepted.length).toBeGreaterThan(0);
      // Vérifie que les factures refusées sont bien affichées
      const contentRefused = screen.getAllByText("Refusé");
      expect(contentRefused.length).toBeGreaterThan(0);
      
    });
    
    /////////// TESTS D'INTEGRATION DES DIFFERENTS CLICS /////////////
    describe("When I click on the 'new bill' button", () => {
      // On simule la fonction de navigation
      const onNavigate = jest.fn();
      test("Then it should navigate to NewBill page", () => {
        // On injecte le HTML de BillsUI avec des données de factures => représente la page de départ (tableau de bord) avant de naviguer vers la page NewBill
        document.body.innerHTML = BillsUI({ data: bills });
        // On crée une instance de Bills représentant toute l'architecture simulée de l'appli, nécessaire à la page de départ pour fonctionner correctement
        new Bills({
          document,
          onNavigate, // appel de const onNavigate = jest.fn(); qui sert donc au test
          store: null, // le test n'a pas besoin d'accéder au store dans le test, car aucune donnée n'est récupérée de l'API à ce stade de l'expérience utilisateur
          localStorage: window.localStorage,
        });
        // On récupère le bouton "Nouvelle note de frais"
        const newBillButton = screen.getByTestId("btn-new-bill");
        // On simule le clic sur le bouton => l'interaction utilisateur dans le DOM
        userEvent.click(newBillButton);  
        // On vérifie que la fonction de navigation a bien été appelée avec le bon chemin
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);  
      });
    });

    describe("When I click on the 'eye' icon", () => {
      test("Then the modal should open", () => {
        // Même principes que le test au-dessus
        document.body.innerHTML = BillsUI({ data: bills });
        new Bills({
          document,
          onNavigate, 
          store: null,
          localStorage: window.localStorage,
        });
        // On mock la fonction modal de Bootstrap pour ouvrir la modale 
        $.fn.modal = jest.fn();
        // On récupère la première icône "œil"
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        // On simule le clic sur l'icône "œil"
        userEvent.click(iconEye);  
        // On vérifie que la fonction modal a bien été appelée
        expect($.fn.modal).toHaveBeenCalled();  
      });
    });

    /////////// TEST D'INTEGRATION D'ERREURS API /////////
    describe("When an error occurs on API", () => { 
      // Fonction qui s'exécute avant chaque test dans ce groupe, donc prépare une configuration de base, commune à chacun des tests
      beforeEach(() => { 
        jest.spyOn(mockStore, "bills"); // Utilisation de Jest pour espionner la méthode 'bills' de mockStore, permettant de surveiller son utilisation
        Object.defineProperty(window, 'localStorage', { value: localStorageMock }); // Simulation de l'objet localStorage avec une version fictive pour les tests
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@test.tld' })); // Ajout d'un utilisateur fictif dans le localStorage pour simuler un utilisateur connecté
        const root = document.createElement("div"); // Création d'un nouvel élément div pour simuler le conteneur principal de l'application
        root.setAttribute("id", "root"); // Définition de l'attribut ID pour l'élément div
        document.body.appendChild(root); // Ajout de l'élément div au corps du document, l'intégrant dans le DOM
        router(); // Appel de la fonction router() pour initialiser la navigation dans l'application
      });

      // TEST QUI VÉRIFIE QUE LA RÉCUPÉRATION DES FACTURES ÉCHOUE AVEC UNE ERREUR 404
      describe("When fetching bills from an API and it fails with 404 error", () => { 
        test("Then it should show a 404 message error", async () => { 
          // Simulation de la méthode bills pour que la méthode 'mockImplementationOnce' remplace temporairement l’implémentation de la méthode list() du store, afin que celle-ci simule une erreur 404 lors de son exécution
          mockStore.bills.mockImplementationOnce(() => { 
            return {
              list: () => Promise.reject(new Error("Erreur 404")) // Définition le temps du test d'une autre méthode list pour rejeter la promesse avec une erreur 404 (requête client (l’utilisateur ou l'application) qui échoue car l'URL ou la ressource n’existe pas ou plus sur le serveur, ou est invalide => Ressource non trouvée 
            };
          });
          window.onNavigate(ROUTES_PATH.Bills); // Simule la navigation vers la page des factures
          await new Promise(process.nextTick); // Attente que la promesse rejetée par mockStore.bills.list() soit complètement gérée par l'application et que le message d’erreur "Erreur 404" soit effectivement affiché dans le DOM => assure que le DOM est à jour
          // process.nextTick reporte l'exécution de const message = screen.getByText(/Erreur 404/); => sorte de file d'attente
          const message = screen.getByText(/Erreur 404/); // screen.getByText recherche dans le DOM le texte correspondant à "Erreur 404" et retourne cet élément (si il le trouve)
          expect(message).toBeTruthy(); // Vérification que le message d'erreur est présent dans le DOM => confirmation que l'erreur a été gérée correctement
        });
      });

      // TEST QUI VÉRIFIE QUE LA RÉCUPÉRATION DES FACTURES ÉCHOUE AVEC UNE ERREUR 500
      describe("When fetching bills from an API and it fails with 500 error", () => { 
        test("Then it should show a 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => { // Simulation de la méthode bills pour renvoyer une promesse rejetée avec une erreur 500
            return {
              list: () => Promise.reject(new Error("Erreur 500")) // Définition de la méthode list pour rejeter la promesse avec une erreur 500 (Erreur interne du serveur : problème de traitement de la requête par le serveur/ correspond à un problème  interne à l'API)
            };
          });
          window.onNavigate(ROUTES_PATH.Bills); // Simule la navigation vers la page des factures
          await new Promise(process.nextTick); // Attente que toutes les promesses en attente soient résolues ou rejetée, permettant au DOM de se mettre à jour
          const message = screen.getByText(/Erreur 500/); // Recherche dans le DOM le texte correspondant à "Erreur 500"
          expect(message).toBeTruthy(); // Vérification que le message d'erreur est présent dans le DOM, confirmant que l'erreur a été gérée correctement
        });
      });
    });
  });
});
