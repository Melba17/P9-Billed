import WindowIcon from "../assets/svg/window.js"
import MailIcon from "../assets/svg/mail.js"
import DisconnectIcon from "../assets/svg/disconnect.js"


// Ce fichier génère une barre de navigation verticale pour l'application, avec un contenu qui s'adapte au type d'utilisateur connecté. Si l'utilisateur est un employé, il peut voir des icônes supplémentaires pour accéder à des fonctionnalités spécifiques comme la gestion des fenêtres et des e-mails. Si l'utilisateur n'est pas connecté ou est d'un autre type, seule l'option de déconnexion est affichée. Le style et la hauteur de la barre de navigation sont personnalisés en fonction de la taille de l'écran

export default (height) => {
    let user;
    user = JSON.parse(localStorage.getItem('user'))
    if (typeof user === 'string') {
      user = JSON.parse(user)
    }
    if (user && user.type === 'Employee') {
      return (
        `
        <div class='vertical-navbar' style='height: ${height}vh;'>
          <div class='layout-title'> Billed </div>
          <div id='layout-icon1' data-testid="icon-window">
            ${WindowIcon}
          </div>
          <div id='layout-icon2' data-testid="icon-mail">
            ${MailIcon}
          </div>
          <div id='layout-disconnect'>
            ${DisconnectIcon}
          </div>
      </div>
        `
      ) 
    } else {
      return (
        `
        <div class='vertical-navbar' style='height: ${height}vh;'>
          <div class='layout-title'> Billed </div>
            <div id='layout-disconnect' data-testid='layout-disconnect'>
              ${DisconnectIcon}
            </div>
          </div>
        `
      )
    }
}