import Dexie from 'dexie'

const DB_NAME = 'interviewforge-study-deck'
const SNAPSHOT_KEY = 'deck-snapshot'
const CSV_BACKUP_KEY = 'csv-backup'

const db = new Dexie(DB_NAME)
db.version(1).stores({
  appState: '&key',
})

export async function readAppState() {
  const snapshot = await db.table('appState').get(SNAPSHOT_KEY)
  if (snapshot?.value && Array.isArray(snapshot.value.cards)) {
    return {
      cards: snapshot.value.cards,
      deckName: snapshot.value.deckName || 'Senior Engineer Study',
      source: 'indexeddb',
    }
  }

  return null
}

export async function writeAppState({ cards, deckName }) {
  await db.table('appState').put({
    key: SNAPSHOT_KEY,
    value: { cards, deckName },
    updatedAt: Date.now(),
  })
}

export async function clearAppState() {
  await db.table('appState').delete(SNAPSHOT_KEY)
}

export async function saveCsvBackupToLocalStorage(csvText) {
  await db.table('appState').put({
    key: CSV_BACKUP_KEY,
    value: { csv: String(csvText ?? '') },
    updatedAt: Date.now(),
  })
}

export async function readCsvBackupFromLocalStorage() {
  const backup = await db.table('appState').get(CSV_BACKUP_KEY)
  return String(backup?.value?.csv || '')
}

export async function getCsvBackupInfo() {
  const csv = await readCsvBackupFromLocalStorage()
  if (!csv) return null
  const lines = csv.split('\n')
  const cardCount = Math.max(lines.length - 1, 0)
  return {
    cardCount,
    bytes: csv.length,
  }
}
