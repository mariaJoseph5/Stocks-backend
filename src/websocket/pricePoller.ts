import axios from 'axios';
import dotenv from 'dotenv';
import {WebSocketServer} from "ws";

dotenv.config();
const PRICE_THRESHHOLD = 0.0001;
let prices: Record<string, { USD: number }> = {};
const API_KEY = process.env.CRYPTCOMPARE_API_KEY;

export async function fetchCoinList() {
    const res = await axios.get<any>('https://min-api.cryptocompare.com/data/all/coinlist', {
        headers: {
            Authorization: `Apikey ${API_KEY}`
        }
    });
    return Object.keys(res.data.Data);
}

async function fetchPrices(symbols: string[]): Promise<Record<string, { USD: number }>> {
    const res = await axios.get('https://min-api.cryptocompare.com/data/pricemulti', {
        params: {fsyms: symbols.join(','), tsyms: 'USD'}
    });
    return res.data;
}

export function startPricePolling(wss: WebSocketServer) {
    (async function poll() {
        const allSymbols = await fetchCoinList();
        const filterPrices : Record<string, {USD:number}> = {};
        setInterval(async () => {
            try {
                const newPrices = await fetchPrices(allSymbols.slice(0, 50));
                const diffs: Record<string, 'up' | 'down' | 'same'> = {};
                for (const sym in newPrices) {
                    const old = prices[sym]?.USD || 0;
                    const curr = newPrices[sym]?.USD || 0;
                    if (curr >= PRICE_THRESHHOLD) {
                        filterPrices[sym] = newPrices[sym];
                        if (curr > old)
                            diffs[sym] = 'up';
                        else if (curr < old)
                            diffs[sym] = 'down';
                        else
                            diffs[sym] = 'same';
                    }
                }
                prices = filterPrices;
                wss.clients.forEach(client => {
                    if (client.readyState === 1){
                        client.send(JSON.stringify({type:'prices', data:{prices, diffs}}));
                    }
                });
            } catch (e) {
                console.error(`Polling error:`, e);
            }
        }, 5000);
    })();
}