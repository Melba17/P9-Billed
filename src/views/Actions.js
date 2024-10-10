import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

// Ce fichier génère une structure HTML qui affiche une icône "œil" permettant de visualiser une facture. L'URL du document de la facture est passée via billUrl et est stockée dans un attribut data-bill-url, ce qui permet à l'interface utilisateur d'utiliser cette URL pour des actions spécifiques, comme l'ouverture du document
export default (billUrl) => {
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url=${billUrl}>
      ${eyeBlueIcon}
      </div>
    </div>`
  )
}