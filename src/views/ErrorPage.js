import VerticalLayout from './VerticalLayout.js'


// Cette fonction génère une page d'erreur standard pour l'application. Elle inclut une mise en page verticale (VerticalLayout) et affiche un message d'erreur passé en paramètre. Si aucune erreur n'est fournie, le message d'erreur reste vide. C'est une page simple mais essentielle pour informer l'utilisateur lorsqu'une erreur se produit dans l'application

export default (error) => {
  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Erreur </div>
        </div>
        <div data-testid="error-message">
          ${error ? error : ""}
        </div>
    </div>`
  )
}