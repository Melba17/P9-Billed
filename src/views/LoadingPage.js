import VerticalLayout from './VerticalLayout.js'


// Ce fichier génère une page de chargement simple qui s'affiche lorsque l'application attend des données ou des ressources. La page comprend : Une mise en page verticale standard (VerticalLayout). Un message "Loading..." pour informer l'utilisateur que le contenu est en cours de chargement. Elle est utilisée pour offrir une meilleure expérience utilisateur en montrant que l'application travaille en arrière-plan

export default () => {

  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content' id='loading'>
        Loading...
      </div>
    </div>`
  )
}