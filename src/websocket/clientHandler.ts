import WebSocket from 'ws';
import {getFavourites, saveFavourites} from '../redis/client.js';
import {fetchCoinList} from './pricePoller.js';

export async function handleWebSocket(ws: WebSocket){
   const userId = 'user1';
   const allSymbols = await fetchCoinList();
   const favourites = await getFavourites(userId);
   ws.send(JSON.stringify({type: 'init', data: {allSymbols, favourites}}));
   ws.on('message', async (msg)=>{
      try{
         const {type, data} = JSON.parse(msg.toString());
         if (type === 'setFavourites'){
            await saveFavourites(userId, data);
            ws.send(JSON.stringify({type: 'favouritesUpdated', data}))
         }
      } catch (err){
         console.error('Error processing message', err);
      }
   });
}