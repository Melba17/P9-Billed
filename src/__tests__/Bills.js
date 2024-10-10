/**
 * @jest-environment jsdom
 */
// Ces tests utilisent Jest et Testing Library pour simuler l'interaction avec l'UI et garantir que l'application fonctionne comme prévu dans ce contexte
import Bills from "../containers/Bills.js";
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// Bug 1 :Ajout Mock du store pour simuler la récupération des factures
const mockStore = {
  bills: jest.fn(() => ({
    list: jest.fn().mockResolvedValue(bills), // `bills` est la liste des factures de `fixtures/bills.js`
  })),
};

// Tests unitaires employé
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Test 1 : simule l'affichage de la page des factures et vérifie que l'icône de la facture dans le menu vertical est mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted", async () => {

      // Simule un utilisateur employé connecté en configurant localStorage pour stocker les informations de l'utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        // Bug 1 : ajout de ces 2 lignes pour amélioration
        email: 'employee@test.tld', // Utilise l'email exact de l'utilisateur
        statut: 'connected' // Simule un utilisateur connecté
      }));
      // Un élément div est ajouté au document avec l'ID root, simulant le conteneur principal de l'application
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Le routeur est initialisé, et la navigation vers la page des factures est simulée avec window.onNavigate
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // Le test attend que l'icône de facture, identifiée par data-testid="icon-window", soit rendue dans le DOM. Cependant, l'assertion (expect) pour vérifier que l'icône est bien mise en surbrillance (par exemple, en vérifiant une classe CSS appliquée à l'icône) n'est pas encore écrite et est marquée comme une to-do
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // to-do write expect expression

    })
    // Bug 1 / Test 2 : vérifie que les factures sont triées dans l'ordre anti-chronologique, c'est-à-dire de la plus récente à la plus ancienne
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
    
  })
})
