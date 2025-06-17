import {createClient} from 'redis';

const client = createClient();
await client.connect();

export async function getFavourites(userId: string):Promise<string>{
    const data =await client.get(`favourites:${userId}`);
    return data ? JSON.parse(data): '';
}

export async function saveFavourites(userId: string, symbols:string[]):Promise<void>{
    await client.set(`favourites:${userId}`, JSON.stringify(symbols));
}