
import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = ''

// Fichier essentiel qui gère la connexion des employés et des administrateurs dans une application. 
// Il permet : De soumettre les formulaires de connexion et de gérer les erreurs en cas de mauvais identifiants. De créer un nouvel utilisateur si l'utilisateur n'existe pas dans le système.De stocker l'état de connexion dans le localStorage pour que l'utilisateur puisse rester authentifié au sein de l'application.De rediriger l'utilisateur vers la page appropriée après la connexion, en fonction de son rôle (employé ou administrateur)


// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.store = store
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }

  // EMPLOYEE
  handleSubmitEmployee = e => {
    e.preventDefault()
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }

    this.localStorage.setItem("user", JSON.stringify(user))
    this.login(user)
      .catch(
        () => this.createUser(user)
      )
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        this.document.body.style.backgroundColor="#fff"
      })

  }

  // ADMIN
  handleSubmitAdmin = e => {
    // La fonction est assignée à une variable et sera déclenchée lors de la soumission d'un formulaire d'admin. 
    e.preventDefault()
    // Empêche le comportement par défaut du formulaire (soumission de page).
    const user = {
      type: "Admin", // Définit un objet utilisateur avec le type "Admin" pour spécifier qu'il s'agit d'un administrateur.
      // Bug 2 : Valeurs de Login modifiées => admin au lieu d'employee
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      // Récupère la valeur de l'email depuis l'input correspondant à l'email de l'administrateur.  
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      // Récupère la valeur du mot de passe depuis l'input correspondant au mot de passe de l'administrateur.
      status: "connected"
      // Définit le statut de l'utilisateur comme "connected", indiquant que l'utilisateur est maintenant connecté.
    }

    // Vérif des valeurs stockées
    this.localStorage.setItem("user", JSON.stringify(user))
    // Stocke l'objet `user` dans le localStorage du navigateur, sous forme de chaîne JSON, afin de persister les informations de connexion.
    this.login(user)
      .catch(() => this.createUser(user)
      )
      // Appelle la méthode `login` avec l'objet utilisateur. Si cela échoue (par exemple, si l'utilisateur n'existe pas),
      // il attrape l'erreur et appelle `createUser` pour créer un nouvel utilisateur avec les mêmes informations.
      .then(() => {
        this.onNavigate(ROUTES_PATH['Dashboard'])
        // Une fois connecté ou l'utilisateur créé, redirige vers le tableau de bord ('Dashboard') via la méthode `onNavigate`.
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        // Met à jour la propriété `PREVIOUS_LOCATION` avec le chemin du tableau de bord, pour garder une trace de la dernière page visitée.
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        // Assigne la valeur de `this.PREVIOUS_LOCATION` à la variable globale `PREVIOUS_LOCATION` 
        document.body.style.backgroundColor = "#fff"
        // Change le fond de la page en blanc pour réinitialiser l'apparence après la connexion.
      })
  }
  

  // not need to cover this function by tests
  login = (user) => {
    // Verif valeurs soumises
    if (this.store) {
      return this.store
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      })).then(({jwt}) => {
        localStorage.setItem('jwt', jwt) // JWT (JSON Web Token) utilisé pour représenter des informations de manière compacte et sécurisée sous forme de JSON (JavaScript Object Notation) - Après une connexion réussie (en l'occurrence après avoir soumis un email et un mot de passe), le serveur génère un JWT et est ensuite renvoyé au client (ici l'application) et peut être stocké dans le localStorage
      })
    } else {
      return null
    }
  }

  // not need to cover this function by tests
  createUser = (user) => {
    if (this.store) {
      return this.store
      .users()
      .create({data:JSON.stringify({
        type: user.type,
        name: user.email.split('@')[0],
        email: user.email,
        password: user.password,
      })})
      .then(() => {
        console.log(`User with ${user.email} is created`)
        return this.login(user)
      })
    } else {
      return null
    }
  }
}
