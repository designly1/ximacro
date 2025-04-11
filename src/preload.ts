import { contextBridge, ipcRenderer } from 'electron';

import type { MacroItem } from '@/contexts/app-provider';

contextBridge.exposeInMainWorld('electronAPI', {
	setStore: <K extends keyof StoreValues>(
		key: K,
		value: StoreValues[K],
	): Promise<boolean> => ipcRenderer.invoke('store:set', key, value),

	getStore: <T, K extends keyof StoreValues>(key: K): Promise<T> =>
		ipcRenderer.invoke('store:get', key),

	clearStore: (): Promise<void> => ipcRenderer.invoke('store:clear'),

	selectFolder: (): Promise<string | null> => ipcRenderer.invoke('select-folder'),

	readMacros: (path: string): Promise<string> =>
		ipcRenderer.invoke('read-macros', { path }),

	writeMacros: (macros: MacroItem[]): Promise<string> =>
		ipcRenderer.invoke('write-macros', { macros }),

	readBooks: (dataFolder: string): Promise<string | string[]> =>
		ipcRenderer.invoke('read-books', { dataFolder }) as Promise<string | string[]>,

	listDirectories: (dirPath: string): Promise<string | string[]> =>
		ipcRenderer.invoke('list-directories', dirPath) as Promise<string | string[]>,
});
