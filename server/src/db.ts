import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astroview'
const client = new MongoClient(uri)

let db: Db

export async function connectDB() {
    try {
        await client.connect()
        db = client.db()
        console.log('Connected to MongoDB')
    } catch (err) {
        console.error('Failed to connect to MongoDB', err)
        process.exit(1)
    }
}

export function getDB() {
    if (!db) {
        throw new Error('Database not initialized')
    }
    return db
}
