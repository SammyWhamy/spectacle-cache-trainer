import {deduplicate} from "@spectacle-client/dedupe.ts";
import {
    GatewayGuildMemberAddDispatchData,
    GatewayGuildMemberRemoveDispatchData,
    GatewayGuildMembersChunkDispatchData,
    GatewayGuildMemberUpdateDispatchData
} from "discord-api-types/v10";
import {writeFileSync} from "fs";
import {GatewayBroker} from "../Broker.js";
import {del, set, update} from "../util/redis/index.js";
import {CacheNames} from "../util/validateConfig.js";

const entity = CacheNames.Member;

export async function GuildMemberAdd(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data) as GatewayGuildMemberAddDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.user!.id}`;
    await set(broker, entity, key, data);

    await GuildMemberCascade(broker, parsed);

    await writeFileSync(`training_data/${CacheNames.Member}/${parsed.user!.id}`, JSON.stringify(deduplicate(CacheNames.Member, parsed)));
}

export async function GuildMemberUpdate(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data) as GatewayGuildMemberUpdateDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.user.id}`;
    await update(broker, entity, key, parsed);

    await GuildMemberCascade(broker, parsed);
}

export async function GuildMemberRemove(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data) as GatewayGuildMemberRemoveDispatchData;
    const key = `${entity}:${parsed.guild_id}:${parsed.user.id}`;
    await del(broker, entity, key);

    await GuildMemberCascade(broker, parsed);
}

export async function GuildMembersChunk(broker: GatewayBroker, data: string) {
    const parsed = JSON.parse(data) as GatewayGuildMembersChunkDispatchData;

    for (const member of parsed.members) {
        const key = `${entity}:${parsed.guild_id}:${member.user!.id}`;
        await set(broker, entity, key, JSON.stringify(member));

        const userKey = `${CacheNames.User}:${member.user!.id}`;
        await update(broker, CacheNames.User, userKey, member.user!);
    }

    if ("presences" in parsed) {
        for (const presence of parsed.presences) {
            const key = `${CacheNames.Presence}:${parsed.guild_id}:${presence.user!.id}`;
            await update(broker, CacheNames.Presence, key, presence);
        }
    }
}

export async function GuildMemberCascade(broker: GatewayBroker, data: GatewayGuildMemberAddDispatchData | GatewayGuildMemberUpdateDispatchData | GatewayGuildMemberRemoveDispatchData) {
    if (data.user) {
        const userKey = `${CacheNames.User}:${data.user.id}`;
        await update(broker, CacheNames.User, userKey, data.user);
    }
}
