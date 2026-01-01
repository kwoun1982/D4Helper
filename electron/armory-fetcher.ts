import { net } from "electron";
import { ArmoryAccount, ArmoryCharacterDetails } from "../src/types";

// Base URL for the Armory API
// Note: d4armory.io is currently down/redirected.
// This URL is configurable via setBaseUrl.
let BASE_URL = "https://d4armory.io/api/armory";

export function setBaseUrl(url: string) {
  BASE_URL = url;
}

export async function getAccount(
  battleTag: string
): Promise<ArmoryAccount | null> {
  // BattleTag format: Player#1234 -> Player%231234 or just passed as is depending on API
  // Usually APIs expect URL encoding
  const encodedTag = encodeURIComponent(battleTag);
  const url = `${BASE_URL}/${encodedTag}.json`;

  console.log(`[ARMORY] Fetching account: ${url}`);

  try {
    const data = await fetchJson(url);
    if (!data) return null;

    // Transform data to match our interface
    // Note: This mapping depends on the actual API response structure.
    // Since we don't have a live API, we'll assume a structure based on the repo research.
    // The repo showed: data['d4_armory_profile'] or similar?
    // Actually the repo just saved the JSON.

    // Mocking response structure for now based on typical D4 APIs
    return {
      battleTag: data.battleTag || battleTag,
      characters: (data.characters || []).map((char: any) => ({
        id: char.id,
        name: char.name,
        class: char.class,
        level: char.level,
        hardcore: char.hardcore,
        seasonal: char.seasonal,
      })),
    };
  } catch (error) {
    console.error("[ARMORY] Error fetching account:", error);
    return null;
  }
}

export async function getCharacter(
  battleTag: string,
  heroId: string
): Promise<ArmoryCharacterDetails | null> {
  const encodedTag = encodeURIComponent(battleTag);
  const url = `${BASE_URL}/${encodedTag}/character/${heroId}.json`;

  console.log(`[ARMORY] Fetching character: ${url}`);

  try {
    const data = await fetchJson(url);
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      class: data.class,
      level: data.level,
      hardcore: data.hardcore,
      seasonal: data.seasonal,
      power: data.power || 0,
      life: data.life || 0,
      strength: data.stats?.strength || 0,
      intelligence: data.stats?.intelligence || 0,
      willpower: data.stats?.willpower || 0,
      dexterity: data.stats?.dexterity || 0,
      equipment: (data.equipment || []).map((item: any) => ({
        slot: item.slot,
        name: item.name,
        quality: item.quality,
        power: item.power,
      })),
      skills: (data.skills || []).map((skill: any) => ({
        name: skill.name,
        rank: skill.rank,
      })),
    };
  } catch (error) {
    console.error("[ARMORY] Error fetching character:", error);
    return null;
  }
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = net.request(url);

    request.on("response", (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${response.statusCode}`));
        return;
      }

      let data = "";
      response.on("data", (chunk) => {
        data += chunk.toString();
      });

      response.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}
