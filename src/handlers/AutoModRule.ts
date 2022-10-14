import {deduplicate} from "@spectacle-client/dedupe.ts";
import {writeFileSync} from "fs";
import {GatewayBroker} from "../Broker.js";
import {del, set, update} from "../util/redis/index.js";
import {CacheNames} from "../util/validateConfig.js";

const entity = CacheNames.AutoModRule;

export async function AutoModRuleCreate(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data);
    const key = `${entity}:${parsed.guild_id}:${parsed.id}`;
    await set(broker, entity, key, data);
    await writeFileSync(`training_data/${CacheNames.AutoModRule}/${parsed.id}`, JSON.stringify(deduplicate(CacheNames.AutoModRule, parsed)));
}

export async function AutoModRuleUpdate(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data);
    const key = `${entity}:${parsed.guild_id}:${parsed.id}`;
    await update(broker, entity, key, parsed);
}

export async function AutoModRuleDelete(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data);
    const key = `${entity}:${parsed.guild_id}:${parsed.id}`;
    await del(broker, entity, key);
}
