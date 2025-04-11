declare global {
	interface StoreValues {
		ffxiPath: string;
		userCharacters: Character[];
	}

	interface Character {
		name: string;
		folder: string;
	}

	interface LogAPI {
		onLogMessage(callback: (msg: string) => void): void;
	}
}

export interface ElectronAPI {
	setStore: <K extends keyof StoreValues>(
		key: K,
		value: StoreValues[K],
	) => Promise<boolean>;
	getStore: <K extends keyof StoreValues>(
		key: K,
	) => Promise<StoreValues[K] | undefined>;
	clearStore: () => Promise<void>;
	selectFolder: () => Promise<string | null>;
	readMacros: (path: string) => Promise<string>;
	writeMacros: (macros: MacroItem[]) => Promise<string>;
	readBooks: (dataFolder: string) => Promise<string | string[]>;
	listDirectories: (dirPath: string) => Promise<string | string[]>;
	readBooks: (dataFolder: string) => Promise<string | string[]>;
}

declare global {
	interface Window {
		electronAPI: ElectronAPI;
		logAPI: LogAPI;
		loadingMessage: string | undefined;
	}
}

export {};
