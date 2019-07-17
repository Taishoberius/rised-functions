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
        "token" : req.body.token
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
        return res.send(getDocument(snapshot, id));
    })
    .catch(err => res.status(500).send(err));
});

export const updPreference = functions.https.onRequest((req, res) => {
    const id = req.query.id;
    if (id == undefined) {
        return res.status(300).send("Missing parameter id");
    }

    const docUpd = {
        "deviceName" : req.body.deviceName,
        "humidity" : req.body.humidity,
        "itinerary" : req.body.itinerary,
        "name" : req.body.name,
        "temperature" : req.body.temperature,
        "transportType" : req.body.transportType,
        "weather" : req.body.weather,
        "workAddress" : req.body.workAddress,
        "address" : req.body.address,
        "token" : req.body.token
    }

    const docSend = {
        "deviceName" : req.body.deviceName,
        "humidity" : req.body.humidity,
        "itinerary" : req.body.itinerary,
        "name" : req.body.name,
        "temperature" : req.body.temperature,
        "transportType" : req.body.transportType,
        "weather" : req.body.weather,
        "workAddress" : req.body.workAddress,
        "address" : req.body.address,
        "token" : req.body.token,
        "id": id
    }

    return collection.doc(id).update(docUpd)
    .then(() => {
        if (docUpd.token != undefined && docUpd.token != "") {
            sendUserNotification(docUpd.token, id, "user preference updated")
            .then()
            .catch()
        }

        return Promise.resolve
    })
    .then(() => res.send(docSend))
    .catch(err => res.status(500).send(err));
});

// export const notification = functions.firestore.document('preferences/{id}').onWrite((change, context) => {

// });

export const sendToothBrushNotification = functions.https.onRequest((req, res) => {
    const id = req.query.id
    if (id == undefined) {
        return res.status(400).send("Missing parameter id");
    }

    return collection.doc(id).get()
        .then(doc => {
            const data = doc.data();
            if (data == undefined) return res.status(404).send("Document not found");

            return sendUserNotification(data.token, id, "toothbrush")
            .then(() => res.send())
            .catch(err => res.status(500).send(err))
        })
});

const sendUserNotification = (token: string, docId: string, message: string) => {
    const payload = {
        data: {
            title: docId,
            body: message
        }
    };

    return admin.messaging().sendToDevice(token, payload)
}

const getDocuments = function(snap: FirebaseFirestore.QuerySnapshot) {
    const documents: any[] = [];
    snap.forEach(doc => {
        const document = doc.data();
        document.id = doc.id;
        documents.push(document);
    });
    return documents;
}

const getDocument = (document: FirebaseFirestore.DocumentSnapshot, id: string) => {
    let data = document.data();
    if (data == undefined) return;
    data.id = id;

    return data;
}