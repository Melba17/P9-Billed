// Simulation d'un localStorage => Un mock en mémoire est généralement plus rapide que les interactions avec le véritable localStorage. Cela accélère l'exécution des tests et améliore la performance globale 
// Disponibilité en environnement non-navigateur : lors de tests en environnement Node.js, par exemple, localStorage n'est pas disponible car il n'existe que dans les navigateurs 
export const localStorageMock = (function() {
  // Déclaration d'un objet `store` pour stocker les données en mémoire, imitant le comportement de localStorage
  let store = {};
  return {
    // Méthode pour récupérer un élément du store
    getItem: function(key) {
      // Renvoie l'élément sous forme de chaîne JSON, simulant le comportement de localStorage => Pour accéder à la valeur associée à la clé key dans l'objet store.
      return JSON.stringify(store[key]);
    },
    // Méthode pour ajouter un élément au store
    setItem: function(key, value) {
      // Convertit la valeur en chaîne de caractères et la stocke sous la clé spécifiée
      store[key] = value.toString();
    },
    // Méthode pour effacer tout le contenu du store
    clear: function() {
      // Réinitialise l'objet `store` pour qu'il soit vide, simulant un vidage du localStorage
      store = {};
    },
    // Méthode pour supprimer un élément spécifique du store
    removeItem: function(key) {
      // Supprime la clé spécifiée de l'objet `store`, simulant un retrait de localStorage
      delete store[key];
    }
  }
})();
