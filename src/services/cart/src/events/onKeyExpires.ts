import { createClient } from "redis";

const redis = createClient();
redis.connect().catch(console.error);

const CHANNEL_KEY = "__keyevent@0__:expired";
redis.config('SET', 'notify-keyspace-events', 'Ex');
redis.subscribe;

redis.on('message', async (ch, message) => {
    if(ch === CHANNEL_KEY) {
        console.log('Key expired: ', message);
    }
});