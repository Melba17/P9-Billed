import { ROUTES_PATH } from '../constants/routes.js'

// Ce fichier met en place une fonctionnalité de déconnexion pour l'application 
// Il permet à l'utilisateur d'effacer toutes les données de session stockées dans le localStorage et redirige l'utilisateur vers la page de connexion (Login) après la déconnexion

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    $('#layout-disconnect').click(this.handleClick)// le code utilise jQuery pour ajouter un écouteur d'événements "click" à l'élément HTML avec l'ID layout-disconnect
  }
  
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 