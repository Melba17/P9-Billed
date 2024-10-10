/**
 * @jest-environment jsdom
 */
// En-tête qui informe Jest d'exécuter ce fichier dans un environnement de type jsdom, qui est un environnement simulant le DOM dans Node.js. Cela permet de tester du code qui interagit avec le DOM (Document Object Model), sans avoir besoin d'un navigateur réel


// Différents imports
import { screen } from "@testing-library/dom"
import Actions from "../views/Actions.js"
import '@testing-library/jest-dom/extend-expect'



// Test unitaire avec Jest qui teste le comportement d'une page de factures (Bills) pour un utilisateur connecté en tant qu'employé. Les tests se concentrent principalement sur le rendu de certains éléments visuels et la présence d'attributs spécifiques sur un composant
describe('Given I am connected as an Employee', () => {
  // Vérifie la présence d'une icône icon-eye sur la page des factures
  describe('When I am on Bills page and there are bills', () => {
    test(('Then, it should render icon eye'), () => {
      const html = Actions()
      document.body.innerHTML = html
      expect(screen.getByTestId('icon-eye')).toBeTruthy()
    })
  })
  // Et que cette icône contient un attribut personnalisé data-bill-url avec la bonne URL associée aux fichiers
  describe('When I am on Bills page and there are bills with url for file', () => {
    test(('Then, it should save given url in data-bill-url custom attribute'), () => {
      const url = '/fake_url'
      const html = Actions(url)
      document.body.innerHTML = html
      expect(screen.getByTestId('icon-eye')).toHaveAttribute('data-bill-url', url)
    })
  })
})
