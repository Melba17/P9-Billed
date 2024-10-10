/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import Logout from "../containers/Logout.js"
import '@testing-library/jest-dom/extend-expect'
import { localStorageMock } from "../__mocks__/localStorage.js"
import DashboardUI from "../views/DashboardUI.js"
import userEvent from '@testing-library/user-event'
import { ROUTES } from "../constants/routes"


// Ce fichier teste le processus de déconnexion pour un utilisateur connecté en tant qu'administrateur. Il s'assure que lorsque l'utilisateur clique sur le bouton de déconnexion, l'application redirige correctement vers la page de connexion


// Déclare un tableau `bills` contenant une facture factice. Ce tableau est utilisé pour simuler un jeu de données dans le tableau de bord.
const bills = [{
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "pending",
  "type": "Hôtel et logement",
  "commentary": "séminaire billed",
  "name": "encore",
  "fileName": "preview-facture-free-201801-pdf-1.jpg",
  "date": "2004-04-04",
  "amount": 400,
  "commentAdmin": "ok",
  "email": "a@a",
  "pct": 20,
}]

describe('Given I am connected', () => {
  // Déclare un groupe de tests : "Étant donné que je suis connecté"

  describe('When I click on disconnect button', () => {
    // Déclare un sous-groupe de tests : "Quand je clique sur le bouton de déconnexion"

    test(('Then, I should be sent to login page'), () => {
      // Test : "Ensuite, je devrais être redirigé vers la page de connexion"
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Simule une fonction de navigation `onNavigate` qui change le contenu de `document.body` en fonction de la route demandée

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Mock `localStorage` en utilisant `localStorageMock` pour remplacer le vrai `localStorage` pendant le test
      
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      // Simule un utilisateur de type "Admin" en ajoutant une entrée dans `localStorage`
      
      document.body.innerHTML = DashboardUI({ bills })
      // Remplit le corps du document avec l'interface du tableau de bord (`DashboardUI`) en passant les factures comme argument

      const logout = new Logout({ document, onNavigate, localStorage })
      // Crée une instance de la classe `Logout` avec `document`, `onNavigate` et `localStorage` comme arguments, simulant le composant de déconnexion

      const handleClick = jest.fn(logout.handleClick)
      // Mock la méthode `handleClick` du composant `logout` pour suivre si elle est appelée

      const disco = screen.getByTestId('layout-disconnect')
      // Sélectionne l'élément du DOM avec l'attribut `data-testid` égal à `layout-disconnect` (le bouton de déconnexion)

      disco.addEventListener('click', handleClick)
      // Ajoute un écouteur d'événement pour détecter les clics sur le bouton de déconnexion

      userEvent.click(disco)
      // Simule un clic utilisateur sur le bouton de déconnexion

      expect(handleClick).toHaveBeenCalled()
      // Vérifie que la fonction `handleClick` a bien été appelée suite au clic

      expect(screen.getByText('Administration')).toBeTruthy()
      // Vérifie que le texte "Administration" est affiché, ce qui signifie que l'utilisateur a été redirigé vers la page de connexion après déconnexion
    })
  })
})