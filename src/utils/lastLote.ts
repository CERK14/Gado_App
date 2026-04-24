import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gadoapp:last_lote_id';

export async function getLastLoteId(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function setLastLoteId(id: string | null): Promise<void> {
  if (id == null) {
    await AsyncStorage.removeItem(KEY);
  } else {
    await AsyncStorage.setItem(KEY, id);
  }
}
