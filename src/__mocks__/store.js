// Simulation d'une interface pour la gestion de factures 
const mockedBills = {
  list() {
    // Cette méthode retourne une promesse résolue qui contient une liste d'objets représentant des factures. Chaque objet facture contient des informations telles que id, vat, fileUrl, status, etc. Cela imite un appel à une API qui récupérerait une liste de factures
    return Promise.resolve([{
      "id": "47qAXb6fIm2zOKkLzMro",
      "vat": "80",
      "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "pending",
      "type": "Hôtel et logement",
      "commentary": "séminaire billed",
      "name": "encore",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "2004-04-04",
      "amount": 400,
      "commentAdmin": "ok",
      "email": "a@a",
      "pct": 20
    },
      {
        "id": "BeKy5Mo4jkmdfPGYpTxZ",
        "vat": "",
        "amount": 100,
        "name": "test1",
        "fileName": "1592770761.jpeg",
        "commentary": "plop",
        "pct": 20,
        "type": "Transports",
        "email": "a@a",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
        "date": "2001-01-01",
        "status": "refused",
        "commentAdmin": "en fait non"
      },
      {
        "id": "UIUZtnPQvnbFnB0ozvJh",
        "name": "test3",
        "email": "a@a",
        "type": "Services en ligne",
        "vat": "60",
        "pct": 20,
        "commentAdmin": "bon bah d'accord",
        "amount": 300,
        "status": "accepted",
        "date": "2003-03-03",
        "commentary": "",
        "fileName": "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3"
      },
      {
        "id": "qcCK3SzECmaZAGRrHjaC",
        "status": "refused",
        "pct": 20,
        "amount": 200,
        "email": "a@a",
        "name": "test2",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-02",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }])

  },
  
  create(bill) {
    // Récupère le fichier depuis l'objet FormData
    const file = bill.data.get('file');  
    
    // Retourne une promesse résolue simulant la création d'une nouvelle facture
    return Promise.resolve({
      // URL du fichier après sa création (simulée)
      fileUrl: 'https://localhost:3456/images/test.jpg',
      // Clé unique générée pour la facture
      key: '1234',
      // Utilise le nom du fichier si disponible, sinon attribue 'photo.jpg' par défaut
      fileName: file ? file.name : 'photo.jpg'  
    });
  },

update(bill) {
    // Retourne une promesse résolue simulant la mise à jour d'une facture existante
    return Promise.resolve({
      // Fusionne les données de la facture avec les nouvelles données (spread operator)
      ...bill,  
      // Garde l'ID de la facture, nécessaire pour identifier la facture dans le backend
      id: "47qAXb6fIm2zOKkLzMro",  
      // Utilise l'URL du fichier si elle est déjà présente, sinon fournit une URL par défaut
      fileUrl: bill.fileUrl || "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg",  
      // Utilise le statut de la facture si présent, sinon définit le statut par défaut à "pending"
      status: bill.status || "pending",  
      // Conserve l'email de l'utilisateur ou définit une valeur par défaut
      email: bill.email || "a@a",  
    });
  }
}

export default {
  // Méthode pour accéder aux factures simulées
  bills() {
    return mockedBills
  },
}


