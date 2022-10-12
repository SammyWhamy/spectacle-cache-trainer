import {GatewayStageInstanceCreateDispatchData} from "discord-api-types/v10";
import {GatewayBroker} from "../Broker.js";
import {update} from "../util/redis/update.js";
import {CacheNames} from "../util/validateConfig.js";

const entity = CacheNames.Stage;

export async function StageInstanceCreate(broker: GatewayBroker, data: any) {
    const parsed = JSON.parse(data) as GatewayStageInstanceCreateDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.id}`;
    const ttl = broker.entityConfigMap.get(entity)!.ttl;

    if (ttl !== -1) await broker.cache!.set(key, data, "EX", ttl);
    else await broker.cache!.set(key, data);

    console.log(`Cached ${key} (ttl: ${ttl})`);
}

export async function StageInstanceUpdate(broker: GatewayBroker, data: any) {
    const parsed = JSON.parse(data) as GatewayStageInstanceCreateDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.id}`;
    const ttl = broker.entityConfigMap.get(entity)!.ttl;

    await update(broker.cache!, key, parsed, ttl);

    console.log(`Updated ${key} (ttl: ${ttl})`);
}

export async function StageInstanceDelete(broker: GatewayBroker, data: any) {
    const parsed = JSON.parse(data) as GatewayStageInstanceCreateDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.id}`;

    await broker.cache!.del(key);
    console.log(`Deleted ${key}`);
}