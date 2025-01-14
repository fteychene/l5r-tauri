use std::{error::Error, fs};

use itertools::Itertools;
use rand::{rngs::ThreadRng, Rng};
use serde::{Deserialize, Serialize};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn roll(skill: Option<String>, dice: usize, keep: usize, specialized: bool) -> RollResult {
    let rolled = roll_skill(dice, keep, specialized).collect::<Vec<u8>>();
    RollResult {
        skill,
        dice,
        keep,
        result: rolled.clone().into_iter().map(|x| x as usize).sum(),
        rolls: rolled
    }
}

#[derive(Serialize)]
struct RollResult {
    skill: Option<String>,
    dice: usize,
    keep: usize,
    result: usize,
    rolls: Vec<u8>
}

#[derive(Serialize, Deserialize)]
struct Skill {
    name: String,
    roll: u8,
    keep: u8,
}

fn dice_roll(rng: &ThreadRng) -> Vec<u8> {
    match rng.clone().gen_range(1..=10) {
        10 => [10].into_iter().chain(dice_roll(rng)).collect(),
        rolled => vec![rolled],
    }
}

fn roll_skill(roll: usize, keep: usize, specialized: bool) -> impl Iterator<Item = u8> {
    let rng = rand::thread_rng();
    (0..roll)
        .map(|__| dice_roll(&rng).into_iter().sum())
        .map(|rolled| match rolled {
            1 if specialized => rng.clone().gen_range(1..=10),
            v => v
        } )
        .sorted()
        .rev()
        .take(keep as usize)
}

fn load_skills() -> Result<Vec<Skill>, Box<dyn Error>> {
    let data = fs::read_to_string("/home/laptop/projects/l5r-tauri/src-tauri/skill.json")?;

    let result: Vec<Skill> = serde_json::from_str(&data)?;
    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![roll])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
