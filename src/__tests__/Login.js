/**
 * @jest-environment jsdom
 */
// Indique que l'environnement de test doit utiliser jsdom pour simuler le DOM dans Jest

import LoginUI from "../views/LoginUI";
// Import de la fonction LoginUI, responsable du rendu de l'interface de connexion
import Login from "../containers/Login.js";
// Import de la classe Login qui contient la logique de gestion des soumissions de formulaire
import { ROUTES } from "../constants/routes";
// Import des routes de l'application (par exemple, pour la navigation après la connexion)
import { fireEvent, screen } from "@testing-library/dom";
// Import des utilitaires fireEvent et screen de @testing-library/dom pour simuler des événements et interagir avec le DOM

// Tests unitaires (employé / admin)
// Tests qui permettent de s'assurer que le formulaire de connexion fonctionne correctement dans différents cas :En l'absence de saisie ou en présence de données mal formatées. Lorsque les données sont correctement formatées, avec vérification du stockage des informations dans localStorage et de la redirection appropriée vers la page suivante (soit les notes de frais pour un employé, soit le tableau de bord pour un administrateur).


// Début d'un ensemble de tests pour un utilisateur (Employé) sur la page de connexion
describe("Given that I am a user on login page", () => {
  // Sous-groupe de tests pour le cas où l'utilisateur ne remplit pas les champs
  describe("When I do not fill fields and I click on employee button Login In", () => {
    // Début du test pour vérifier ce qui se passe quand l'utilisateur ne remplit pas les champs et tente de se connecter
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();
      // On injecte l'interface de la page de connexion dans le DOM
      const inputEmailUser = screen.getByTestId("employee-email-input");
      // Sélectionne le champ d'email de l'employé via l'attribut 'data-testid'
      expect(inputEmailUser.value).toBe("");
      // Vérifie que le champ email est vide
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      // Sélectionne le champ de mot de passe de l'employé
      expect(inputPasswordUser.value).toBe("");
      // Vérifie que le champ de mot de passe est vide
      const form = screen.getByTestId("form-employee");
      // Sélectionne le formulaire de connexion de l'employé
      const handleSubmit = jest.fn((e) => e.preventDefault());
      // Mock (simule) la fonction handleSubmit, ici on empêche simplement le comportement par défaut du formulaire
      form.addEventListener("submit", handleSubmit);
      // Ajoute l'événement de soumission au formulaire
      fireEvent.submit(form);
      // Simule la soumission du formulaire
      expect(screen.getByTestId("form-employee")).toBeTruthy();
      // Vérifie que le formulaire est toujours affiché, car aucune donnée n'a été soumise
    });
  });
  // Sous-groupe de tests pour le cas où l'utilisateur remplit des champs au mauvais format
  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    // Début du test pour vérifier le comportement avec un mauvais format d'email
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();
      // Charge l'interface de connexion
      const inputEmailUser = screen.getByTestId("employee-email-input");
      // Sélectionne le champ d'email de l'employé
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      // Simule la saisie d'un email incorrect ("pasunemail")
      expect(inputEmailUser.value).toBe("pasunemail");
      // Vérifie que la valeur du champ email est bien "pasunemail"

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      // Sélectionne le champ de mot de passe de l'employé
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      // Simule la saisie du mot de passe "azerty"
      expect(inputPasswordUser.value).toBe("azerty");
      // Vérifie que la valeur du champ mot de passe est bien "azerty"

      const form = screen.getByTestId("form-employee");
      // Sélectionne le formulaire de connexion de l'employé
      const handleSubmit = jest.fn((e) => e.preventDefault());
      // Simule (mock) la fonction handleSubmit pour empêcher la soumission réelle du formulaire
      form.addEventListener("submit", handleSubmit);
      // Ajoute un événement de soumission au formulaire
      fireEvent.submit(form);
      // Simule la soumission du formulaire
      expect(screen.getByTestId("form-employee")).toBeTruthy();
      // Vérifie que la page de connexion reste affichée après la soumission (car le format d'email est incorrect)
    });
  });

  // Sous-groupe de tests pour le cas où l'utilisateur remplit correctement les champs
  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    // Test pour vérifier qu'un utilisateur employé est identifié correctement
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      // Charge l'interface de connexion
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };
      // Déclare un objet contenant des données valides pour l'email et le mot de passe

      const inputEmailUser = screen.getByTestId("employee-email-input");
      // Sélectionne le champ d'email de l'employé
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      // Simule la saisie d'un email valide dans le champ
      expect(inputEmailUser.value).toBe(inputData.email);
      // Vérifie que la valeur saisie correspond à l'email fourni

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      // Sélectionne le champ de mot de passe de l'employé
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });
      // Simule la saisie d'un mot de passe valide dans le champ
      expect(inputPasswordUser.value).toBe(inputData.password);
      // Vérifie que la valeur saisie correspond au mot de passe fourni

      const form = screen.getByTestId("form-employee");
      // Sélectionne le formulaire de connexion de l'employé

      // Mock le localStorage pour pouvoir tester son comportement
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });
      // Simule le localStorage pour qu'il puisse être utilisé dans les tests

      // Mock la fonction de navigation pour simuler le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";
      // Simule une variable de localisation précédente (par défaut vide)

      const store = jest.fn();
      // Mock l'objet store (probablement utilisé pour gérer des données ou des requêtes côté serveur)

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
      // Crée une instance de la classe Login avec les paramètres nécessaires

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      // Simule la fonction handleSubmitEmployee du login
      login.login = jest.fn().mockResolvedValue({});
      // Simule une promesse résolue pour la méthode login
      form.addEventListener("submit", handleSubmit);
      // Ajoute l'événement de soumission au formulaire
      fireEvent.submit(form);
      // Simule la soumission du formulaire

      expect(handleSubmit).toHaveBeenCalled();
      // Vérifie que la fonction handleSubmit a bien été appelée
      expect(window.localStorage.setItem).toHaveBeenCalled();
      // Vérifie que localStorage.setItem a bien été appelée pour enregistrer les informations de l'utilisateur
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
      // Vérifie que localStorage stocke les informations de l'utilisateur (type, email, mot de passe, et statut "connected")
    });

    // Test pour vérifier que la redirection vers la page des notes de frais se fait correctement
    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      // Vérifie que la page "Mes notes de frais" est affichée après la connexion
    });
  });
});




// Deuxième groupe de tests : connexion en tant qu'Administrateur
describe("Given that I am a user on login page", () => {
  // Cas où les champs de connexion ne sont pas remplis pour l'administrateur
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();
      // Charge l'interface de connexion

      // Bug 2 => Ajustement des sélecteurs/attributs
      const inputEmailUser = screen.getByTestId("admin-email-input");
      // Sélectionne le champ d'email de l'administrateur
      expect(inputEmailUser.value).toBe("");
      // Vérifie que le champ email est vide

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      // Sélectionne le champ de mot de passe de l'administrateur
      expect(inputPasswordUser.value).toBe("");
      // Vérifie que le champ de mot de passe est vide

      const form = screen.getByTestId("form-admin");
      // Sélectionne le formulaire de connexion pour l'administrateur

      const handleSubmit = jest.fn((e) => e.preventDefault());
      // Simule une soumission de formulaire sans envoi
      form.addEventListener("submit", handleSubmit);
      // Ajoute l'événement de soumission au formulaire
      fireEvent.submit(form);
      // Simule la soumission du formulaire
      expect(screen.getByTestId("form-admin")).toBeTruthy();
      // Vérifie que la page de connexion reste affichée après la soumission (car aucun champ n'est rempli)
    });
  });

  // Cas où les champs sont remplis de manière incorrecte pour l'administrateur
  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();
      // Charge l'interface de connexion

      const inputEmailUser = screen.getByTestId("admin-email-input");
      // Sélectionne le champ d'email de l'administrateur
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      // Simule la saisie d'un email mal formaté ("pasunemail")
      expect(inputEmailUser.value).toBe("pasunemail");
      // Vérifie que la valeur du champ email est "pasunemail"

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      // Sélectionne le champ de mot de passe de l'administrateur
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      // Simule la saisie d'un mot de passe "azerty"
      expect(inputPasswordUser.value).toBe("azerty");
      // Vérifie que le mot de passe est "azerty"

      const form = screen.getByTestId("form-admin");
      // Sélectionne le formulaire de connexion pour l'administrateur
      const handleSubmit = jest.fn((e) => e.preventDefault());
      // Simule une soumission de formulaire sans envoi
      form.addEventListener("submit", handleSubmit);
      // Ajoute l'événement de soumission au formulaire
      fireEvent.submit(form);
      // Simule la soumission du formulaire
      expect(screen.getByTestId("form-admin")).toBeTruthy();
      // Vérifie que la page de connexion reste affichée après soumission (car l'email est incorrect)
    });
  });

  // Cas où les champs sont remplis correctement pour l'administrateur
  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      // Charge l'interface de connexion

      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      }; // Crée un objet contenant un exemple des informations à remplir par l'administrateur

      const inputEmailUser = screen.getByTestId("admin-email-input");
      // Sélectionne le champ d'email de l'administrateur
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      // Simule la saisie de l'email valide
      expect(inputEmailUser.value).toBe(inputData.email);
      // Vérifie que l'email correspond à celui de l'administrateur

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      // Sélectionne le champ de mot de passe de l'administrateur
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });
      // Simule la saisie du mot de passe valide
      expect(inputPasswordUser.value).toBe(inputData.password);
      // Vérifie que le mot de passe correspond à celui de l'administrateur

      const form = screen.getByTestId("form-admin");
      // Sélectionne le formulaire de connexion pour l'administrateur

      // Simule l'utilisation de localStorage pour stocker les informations de l'utilisateur
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // Mock la navigation pour simuler le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";
      // Variable pour stocker la localisation précédente

      const store = jest.fn();
      // Simule l'objet store
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });
      // Crée une instance de la classe Login avec les paramètres nécessaires

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      // Simule la soumission du formulaire pour l'administrateur
      login.login = jest.fn().mockResolvedValue({});
      // Simule une promesse résolue pour la méthode login
      form.addEventListener("submit", handleSubmit);
      // Ajoute l'événement de soumission au formulaire
      fireEvent.submit(form);
      // Simule la soumission du formulaire - fireEvent permet de simuler des actions utilisateur sur le DOM afin de tester les réactions des composants à ces interactions, ce qui aide à valider le comportement du code dans les tests
      expect(handleSubmit).toHaveBeenCalled();
      // Vérifie que la fonction handleSubmit a bien été appelée
      expect(window.localStorage.setItem).toHaveBeenCalled();
      // Vérifie que localStorage.setItem a bien été appelée pour enregistrer les informations de l'utilisateur
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
      // Vérifie que les informations correctes sont stockées dans localStorage pour l'administrateur
    });

    // Test pour vérifier que la page du tableau de bord RH est affichée après connexion
    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
      // Vérifie que la page du tableau de bord RH ("Validations") est affichée
    });
  });
});
