/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import ErrorPage from "../views/ErrorPage.js"


// Tests unitaires dont l'objectif est de s'assurer que l'interface utilisateur affiche ou non le message d'erreur en fonction des données passées, aussi bien pour un employé que pour un administrateur 
describe('Given I am connected on app (as an Employee or an HR admin)', () => {
  describe('When ErrorPage is called without and error in its signature', () => {
    test(('Then, it should render ErrorPage with no error message'), () => {
      const html = ErrorPage()
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
      expect(screen.getByTestId('error-message').innerHTML.trim().length).toBe(0)
    })
  })
  describe('When ErrorPage is called with error message in its signature', () => {
    test(('Then, it should render ErrorPage with its error message'), () => {
      const error = 'Erreur de connexion internet'
      const html = ErrorPage(error)
      document.body.innerHTML = html
      expect(screen.getAllByText(error)).toBeTruthy()
    })
  })
})
