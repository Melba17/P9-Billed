/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import VerticalLayout from "../views/VerticalLayout"
import { localStorageMock } from "../__mocks__/localStorage.js"

// Ce test valide que, lorsqu'un employé est connecté : Les icônes de l'interface utilisateur, telles que icon-window et icon-mail, sont bien affichées. Le test simule la connexion d'un employé en manipulant le localStorage pour ajouter un utilisateur de type "Employee" et en vérifiant ensuite que l'interface se comporte comme prévu. 
// Cela assure que l'interface utilisateur contient bien les éléments graphiques nécessaires pour l'utilisateur "Employé"

describe('Given I am connected as Employee', () => {
  test("Then Icons should be rendered", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({
      type: 'Employee'
    })
    window.localStorage.setItem('user', user)
    const html = VerticalLayout(120)
    document.body.innerHTML = html
    expect(screen.getByTestId('icon-window')).toBeTruthy()
    expect(screen.getByTestId('icon-mail')).toBeTruthy()
  })

})
