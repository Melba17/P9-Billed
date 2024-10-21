// Ce fichier contient des fonctions utilitaires pour formater des données spécifiques, comme des dates et des statuts, dans une interface utilisateur en français. Ces fonctions sont conçues pour convertir des valeurs brutes (comme une chaîne de date ou un statut) en une représentation lisible et formatée

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}
 
export const formatStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'accepted':
      return 'Accepté';
    case 'refused':
      return 'Refusé';
    default:
      return status; // En cas de statut non prévu, on retourne le statut brut
  }
};
