use std::{env, error::Error, fs};

use itertools::Itertools;
use rand::{rngs::ThreadRng, Rng};
use serde::{Deserialize, Serialize};

#[tauri::command]
fn roll(skill: Option<String>, dice: usize, keep: usize, specialized: bool) -> RollResult {
    let rolled = roll_skill(dice, keep, specialized).collect::<Vec<u8>>();
    RollResult {
        skill,
        dice,
        keep,
        result: rolled.clone().into_iter().map(|x| x as usize).sum(),
        rolls: rolled,
    }
}

#[tauri::command]
async fn load_skills_command(path: String) -> Vec<Skill> {
    load_skill_file(path)
        // .map_err(|err| println!("Error : {:?}", err))
        .unwrap_or(vec![])
}

#[derive(Serialize)]
struct RollResult {
    skill: Option<String>,
    dice: usize,
    keep: usize,
    result: usize,
    rolls: Vec<u8>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Skill {
    name: String,
    roll: u8,
    keep: u8,
    specialized: bool,
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
            v => v,
        })
        .sorted()
        .rev()
        .take(keep)
}

fn load_skill_file(path: String) -> Result<Vec<Skill>, Box<dyn Error>> {
    let data = fs::read_to_string(path)?;
    let result: Vec<Skill> = serde_json::from_str(&data)?;
    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let path = env::current_dir().unwrap();
    println!("The current directory is {}", path.display());
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![roll, load_skills_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
