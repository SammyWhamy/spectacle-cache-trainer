import {deduplicate} from "@spectacle-client/dedupe.ts";
import {GatewayVoiceStateUpdateDispatchData} from "discord-api-types/v10";
import {writeFileSync} from "fs";
import {GatewayBroker} from "../Broker.js";
import {update} from "../util/redis/index.js";
import {CacheNames} from "../util/validateConfig.js";

const entity = CacheNames.VoiceState;

export async function VoiceStateUpdate(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data) as GatewayVoiceStateUpdateDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.user_id}`;
    await update(broker, entity, key, parsed);
    await writeFileSync(`training_data/${CacheNames.VoiceState}/${parsed.user_id}`, JSON.stringify(deduplicate(CacheNames.VoiceState, parsed)));

    if ("member" in parsed && parsed.member) {
        const memberKey = `${CacheNames.Member}:${parsed.guild_id}:${parsed.user_id}`;
        await update(broker, CacheNames.Member, memberKey, parsed.member);

        const userKey = `${CacheNames.User}:${parsed.user_id}`;
        await update(broker, CacheNames.User, userKey, parsed.member.user!);
    }
}
