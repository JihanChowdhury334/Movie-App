import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
console.log("ENV check:", {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  project: PROJECT_ID,
  database: DATABASE_ID,
  collection: COLLECTION_ID
});

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1') // <-- use your project region
  .setProject(PROJECT_ID);


    export const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie)=> {


    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm',searchTerm),])
        if(result.documents.length > 0){
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            })

        } else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
} catch(error){
    console.error("Appwrite error (raw):", error);
    if (error?.message) {
      console.error("Appwrite error message:", error.message);
    }
    if (error?.response) {
      console.error("Appwrite error response:", JSON.stringify(error.response, null, 2));
    }
}
    
}

export const getTrendingMovies = async () => {
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ]);
        return result.documents;
    } catch(error){
        console.error(error);
        return [];
    }
}