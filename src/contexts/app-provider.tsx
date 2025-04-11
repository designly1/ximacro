import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';
import Loading from '@/components/loading';

import { ToastContainer, toast } from 'react-toastify';

type Screen = 'main' | 'settings' | 'add-character' | 'character';

export interface DialogProps {
	title: string;
	message: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
}

export interface MacroLine {
	offset: string;
	data: string;
}

export interface Macro {
	offset: string;
	lines: MacroLine[];
	name: string;
}

export interface MacroItem {
	fileName: string;
	fileSize: number;
	macros: Macro[];
}

interface AppContextType {
	screen: Screen;
	setScreen: React.Dispatch<React.SetStateAction<Screen>>;
	ffxiDirectory: string | null;
	setFfxiDirectory: React.Dispatch<React.SetStateAction<string | null>>;
	error: string | null;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	characters: string[] | null;
	loadCharacters: () => void;
	userFolders: string[] | null;
	loadUserFolders: () => void;
	clearStore: () => void;
	dialog: DialogProps | null;
	openDialog: (dialogProps: DialogProps) => void;
	closeDialog: () => void;
	userCharacters: Character[];
	addCharacter: (props: Character) => string | boolean;
	removeCharacter: (name: string) => void;
	selectedCharacter: Character | null;
	setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
	macros: MacroItem[];
	setMacros: React.Dispatch<React.SetStateAction<MacroItem[]>>;
	loadMacros: () => Promise<void>;
	backButtonCallback: (() => void) | undefined;
	setBackButtonCallback: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
	books: string[];
	loadBooks: () => Promise<void>;
	macroDrawerOpen: boolean;
	setMacroDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedMacro: MacroItem | null;
	setSelectedMacro: React.Dispatch<React.SetStateAction<MacroItem | null>>;
	selectedMacroIndex: number | null;
	setSelectedMacroIndex: React.Dispatch<React.SetStateAction<number | null>>;
	handleSaveMacro: () => void;
	selectedMacroItem: Macro | null;
	setSelectedMacroItem: React.Dispatch<React.SetStateAction<Macro | null>>;
	selectedMacroItemIndex: number | null;
	setSelectedMacroItemIndex: React.Dispatch<React.SetStateAction<number | null>>;
	copiedMacro: Macro | null;
	setCopiedMacro: React.Dispatch<React.SetStateAction<Macro | null>>;
	copiedMacroPage: number | null;
	setCopiedMacroPage: React.Dispatch<React.SetStateAction<number | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [screen, setScreen] = useState<Screen>('main');
	const [ffxiDirectory, setFfxiDirectory] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [characters, setCharacters] = useState<string[] | null>(null);
	const [userFolders, setUserFolders] = useState<string[] | null>(null);
	const [dialog, setDialog] = useState<DialogProps | null>(null);
	const [userCharacters, setUserCharacters] = useState<Character[]>([]);
	const [charactersLoaded, setCharactersLoaded] = useState(false);
	const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
	const [macros, setMacros] = useState<MacroItem[]>([]);
	const [backButtonCallback, setBackButtonCallback] = useState<
		(() => void) | undefined
	>(undefined);
	const [books, setBooks] = useState<string[]>([]);
	const [macroDrawerOpen, setMacroDrawerOpen] = useState(false);
	const [selectedMacro, setSelectedMacro] = useState<MacroItem | null>(null);
	const [selectedMacroIndex, setSelectedMacroIndex] = useState<number | null>(null);
	const [selectedMacroItem, setSelectedMacroItem] = useState<Macro | null>(null);
	const [selectedMacroItemIndex, setSelectedMacroItemIndex] = useState<number | null>(
		null,
	);
	const [copiedMacro, setCopiedMacro] = useState<Macro | null>(null);
	const [copiedMacroPage, setCopiedMacroPage] = useState<number | null>(null);

	const elec = window.electronAPI;

	useEffect(() => {
		loadStore();
	}, []);

	useEffect(() => {
		if (ffxiDirectory) {
			loadCharacters();
			loadUserFolders();
			loadBooks();
		}
	}, [ffxiDirectory]);

	useEffect(() => {
		if (userCharacters.length > 0 && charactersLoaded) {
			elec.setStore('userCharacters', userCharacters);
		}
	}, [userCharacters, charactersLoaded]);

	useEffect(() => {
		setError(null);
		setBackButtonCallback(undefined);
	}, [screen]);

	const loadStore = async () => {
		const path = await elec.getStore('ffxiPath');
		if (path) {
			setFfxiDirectory(path);
		} else {
			setScreen('settings');
		}

		// Load user characters
		const chars = await elec.getStore('userCharacters');
		if (Array.isArray(chars)) {
			setUserCharacters(chars);
		}
		setCharactersLoaded(true);
	};

	const loadCharacters = async () => {
		const tempDir = `${ffxiDirectory}\\TEMP`;
		const dirs = await elec.listDirectories(tempDir);
		if (Array.isArray(dirs) && dirs.length > 0) {
			setCharacters(dirs);
		} else {
			setCharacters([]);
		}
	};

	const loadUserFolders = async () => {
		const dir = `${ffxiDirectory}/USER`;
		const dirs = await elec.listDirectories(dir);
		if (Array.isArray(dirs)) {
			setUserFolders(dirs);
		} else {
			setError(dirs);
		}
	};

	const clearStore = async () => {
		await elec.clearStore();
		setFfxiDirectory(null);
		setCharacters(null);
		setUserFolders(null);
		setUserCharacters([]);
	};

	const openDialog = (dialogProps: DialogProps) => {
		setDialog(dialogProps);
	};

	const closeDialog = () => {
		setDialog(null);
	};

	const addCharacter = (props: Character): string | boolean => {
		// Check if character already exists
		if (userCharacters.find(char => char.name === props.name)) {
			return 'Character already exists.';
		}

		// Check if folder exists
		if (userCharacters.find(char => char.folder === props.folder)) {
			return `Folder already assigned to ${props.name}.`;
		}

		setUserCharacters([...userCharacters, props]);
		return true;
	};

	const removeCharacter = (name: string) => {
		setUserCharacters(prev => prev.filter(char => char.name !== name));
	};

	const loadMacros = async (): Promise<void> => {
		if (!selectedCharacter) {
			setError('No character selected.');
			return;
		}
		const path = `${ffxiDirectory}\\USER\\${selectedCharacter.folder}`;

		window.loadingMessage = 'Loading macros...';
		const data = await elec.readMacros(path);
		window.loadingMessage = undefined;

		try {
			const macros = JSON.parse(data);
			setMacros(macros);

			return;
		} catch {
			setError('Failed to parse macros.');
		}
	};

	const loadBooks = async (): Promise<void> => {
		if (!selectedCharacter) {
			setError('No character selected.');
			return;
		}
		window.loadingMessage = 'Loading books...';
		const books = await elec.readBooks(`${selectedCharacter.folder}`);
		window.loadingMessage = undefined;

		if (Array.isArray(books)) {
			setBooks(books);
		} else {
			setError(books);
		}
	};

	const handleSaveMacro = async () => {
		if (
			!selectedMacro ||
			typeof selectedMacroIndex !== 'number' ||
			!selectedMacroItem
		)
			return;

		const newMacro: MacroItem = {
			...selectedMacro,
		};

		const macroItemIndex = newMacro.macros.findIndex(
			macro => macro.offset === selectedMacroItem.offset,
		);

		newMacro.macros[macroItemIndex] = selectedMacroItem;

		setSelectedMacro(newMacro);

		const newMacros = [...macros];
		newMacros[selectedMacroIndex] = newMacro;

		setMacros(newMacros);

		window.loadingMessage = 'Saving macros...';
		await elec.writeMacros(newMacros);
		window.loadingMessage = undefined;

		toast.success('Macro saved!');
	};

	return (
		<AppContext.Provider
			value={{
				screen,
				setScreen,
				ffxiDirectory,
				setFfxiDirectory,
				error,
				setError,
				characters,
				loadCharacters,
				userFolders,
				loadUserFolders,
				clearStore,
				dialog,
				openDialog,
				closeDialog,
				userCharacters,
				addCharacter,
				removeCharacter,
				selectedCharacter,
				setSelectedCharacter,
				macros,
				setMacros,
				loadMacros,
				backButtonCallback,
				setBackButtonCallback,
				books,
				loadBooks,
				macroDrawerOpen,
				setMacroDrawerOpen,
				selectedMacro,
				setSelectedMacro,
				handleSaveMacro,
				selectedMacroIndex,
				setSelectedMacroIndex,
				selectedMacroItem,
				setSelectedMacroItem,
				selectedMacroItemIndex,
				setSelectedMacroItemIndex,
				copiedMacro,
				setCopiedMacro,
				copiedMacroPage,
				setCopiedMacroPage,
			}}
		>
			<>
				{children}
				<ToastContainer
					position="bottom-right"
					theme="dark"
					closeOnClick
				/>
				<Loading />
			</>
		</AppContext.Provider>
	);
};

export function useApp() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
}
