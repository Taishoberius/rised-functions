import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

const collection = admin.firestore().collection('preferences');

export const getPreferences = functions.https.onRequest((req, res) => {
    collection.get()
    .then(snapshot => {
        const documents = getDocuments(snapshot);
        return res.send(documents);
    })
    .catch(err => res.status(500).send(err));
});

export const createPreference = functions.https.onRequest((req, res) => {
    collection.add({
        "deviceName" : req.body.deviceName,
        "humidity" : req.body.humidity,
        "itinerary" : req.body.itinerary,
        "name" : req.body.name,
        "temperature" : req.body.temperature,
        "transportType" : req.body.transportType,
        "weather" : req.body.weather,
        "workAddress" : req.body.workAddress,
        "address" : req.body.workAddress,
    })
    .then(doc => res.send(doc.id))
    .catch(err => res.status(500).send(err));
});

export const getPreference = functions.https.onRequest((req, res) => {
    const id = req.query.id;
    if (id == undefined) {
        return res.status(300).send("Missing parameter id");
    }
    return collection.doc(id).get()
    .then(snapshot => {
        return res.send(snapshot.data());
    })
    .catch(err => res.status(500).send(err));
});

export const updPreference = functions.https.onRequest((req, res) => {
    const id = req.query.id;
    if (id == undefined) {
        return res.status(300).send("Missing parameter id");
    }

    const doc = {
        "deviceName" : req.body.deviceName,
        "humidity" : req.body.humidity,
        "itinerary" : req.body.itinerary,
        "name" : req.body.name,
        "temperature" : req.body.temperature,
        "transportType" : req.body.transportType,
        "weather" : req.body.weather,
        "workAddress" : req.body.workAddress,
        "address" : req.body.address,
    }
    
    return collection.doc(id).update(doc)
    .then(() => res.send(doc))
    .catch(err => res.status(500).send(err));
});

// export const notification = functions.firestore.document('preferences/{id}').onWrite((change, context) => {

// });

const getDocuments = function(snap: FirebaseFirestore.QuerySnapshot) {
    const documents: any[] = [];
    snap.forEach(doc => {
        const document = doc.data();
        document.id = doc.id;
        documents.push(document);
    });
    return documents;
}