import { MongoClient, Db } from 'mongodb';
import { Request, Response } from "express";


// post api for data transfer from one db to another db
export const transferData =  async (req:Request, res:Response) => {
  const sourceUri = 'mongodb+srv://pattseheadshot:pattseheadshot5821@pattseheadshot.m6gtd0f.mongodb.net/?retryWrites=true&w=majority'; 
  const destinationUri = 'mongodb+srv://ESportsGaming:ESportsGaming5821@esportsgaming.m0fd2tn.mongodb.net/?retryWrites=true&w=majority'; 

  const sourceClient = new MongoClient(sourceUri);
  const destinationClient = new MongoClient(destinationUri);

  try {
    await sourceClient.connect();
    await destinationClient.connect();

    const sourceDb: Db = sourceClient.db();
    const destinationDb: Db = destinationClient.db();

    const sourceCollection = sourceDb.collection('users');
    const documents = await sourceCollection.find({}).toArray();

    const destinationCollection = destinationDb.collection('users');
    await destinationCollection.insertMany(documents);

    // Sending a response to the client
    res.status(200).json({ message: 'Data copied successfully' });
  } catch (error) {
    console.error('An error occurred:', error);
    // Sending an error response to the client
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    sourceClient.close();
    destinationClient.close();
  }
}


