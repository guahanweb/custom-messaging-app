import { collection, getDocs } from 'firebase/firestore'
import { default as store, close } from './firebase'

getRestaurants()
    .then(res => {
        console.log(res);
        close();
    });

async function getRestaurants() {
    const col = collection(store, 'restaurants');
    const snapshot = await getDocs(col);
    const results = snapshot.docs.map(doc => doc.data());
    return results;
}
