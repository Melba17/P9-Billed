/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import LoadingPage from "../views/LoadingPage.js"


// Test unitaire qui se concentre uniquement sur la fonction LoadingPage pour vérifier si elle fonctionne comme prévu. Il ne teste pas d'autres fonctionnalités de l'application ou d'interactions complexes, mais seulement le rendu d'une page en cours de chargement (pour admin ou employé)
// Vérifie que la page de chargement est bien affichée avec le texte "Loading..." et génère le HTML de la page à partir de LoadingPage(), l'injecte dans document.body, puis utilise screen.getAllByText pour s'assurer que le texte "Loading..." est bien rendu dans le DOM
describe('Given I am connected on app (as an Employee or an HR admin)', () => {
  describe('When LoadingPage is called', () => {
    test(('Then, it should render Loading...'), () => {
      const html = LoadingPage()
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
})
