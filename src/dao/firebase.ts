import { deleteApp, initializeApp } from 'firebase/app'
import { getFirestore, terminate } from 'firebase/firestore'
import config from '../config'
import fs from 'fs'
import path from 'path'

const firebaseConfig = loadConfigurationFile(path.resolve(__dirname, 'firebase', config.firebase.filename));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;

export async function close() {
    await terminate(db);
    deleteApp(app);
}

function loadConfigurationFile(filepath: string) {
    try {
        const configuration = JSON.parse(fs.readFileSync(filepath).toString());
        return configuration;
    } catch (err: any) {
        console.error(err);
        throw err;
    }
}
